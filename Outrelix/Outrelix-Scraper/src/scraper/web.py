import logging
import os
import random
import time
import re
from typing import Dict, List

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from bs4 import BeautifulSoup  # type: ignore
from src.scraper.js_fetcher import fetch_html_js
from src.utils.config import load_config_from_env_and_args

logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?|\d{3})[\s.-]?\d{3}[\s.-]?\d{4})")


_UA_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
]

_FETCH_CACHE: Dict[str, tuple[float, str]] = {}
_CACHE_TTL_SECONDS = None  # set lazily from config
_CACHE_DB_PATH = os.path.join("data", "fetch_cache.sqlite")

# Proxy pool rotation
_PROXY_POOL: List[str] = []
_PROXY_IDX: int = 0
_TOR_PROXY_ADDR = os.getenv("TOR_SOCKS_ADDR", "socks5://127.0.0.1:9050")


def _tor_enabled() -> bool:
    return (os.getenv("USE_TOR") or "").strip().lower() in {"1", "true", "yes", "y"}


def _get_proxies(force_tor: bool = False) -> Dict[str, str]:
    proxies: Dict[str, str] = {}
    if force_tor or _tor_enabled():
        # Route all traffic via local Tor SOCKS5
        logger.info("[TOR] Routing request through %s", _TOR_PROXY_ADDR)
        return {"http://": _TOR_PROXY_ADDR, "https://": _TOR_PROXY_ADDR}
    global _PROXY_POOL
    if not _PROXY_POOL:
        pool = (os.getenv("PROXY_POOL") or "").strip()
        if pool:
            _PROXY_POOL = [p.strip() for p in pool.split(",") if p.strip()]
    if _PROXY_POOL:
        # round-robin
        global _PROXY_IDX
        proxy = _PROXY_POOL[_PROXY_IDX % len(_PROXY_POOL)]
        _PROXY_IDX += 1
        return {"http://": proxy, "https://": proxy}
    http_proxy = os.getenv("HTTP_PROXY") or os.getenv("PROXY_HTTP")
    https_proxy = os.getenv("HTTPS_PROXY") or os.getenv("PROXY_HTTPS")
    if http_proxy:
        proxies["http://"] = http_proxy
    if https_proxy:
        proxies["https://"] = https_proxy
    return proxies


def _ensure_cache_ttl() -> int:
    global _CACHE_TTL_SECONDS
    if _CACHE_TTL_SECONDS is None:
        class Args:
            queries = []
            geo = ""
            category = ""
            limit = 0
            enable_yelp = False
            enable_yellowpages = False
            enable_clearbit = False
            push_to_gsheets = False
            dry_run = True
        cfg = load_config_from_env_and_args(Args)
        _CACHE_TTL_SECONDS = cfg.fetch_cache_ttl_seconds
    return int(_CACHE_TTL_SECONDS or 300)


def _cached_get(url: str) -> str | None:
    ttl = _ensure_cache_ttl()
    hit = _FETCH_CACHE.get(url)
    if not hit:
        # try persistent cache
        try:
            import sqlite3
            os.makedirs(os.path.dirname(_CACHE_DB_PATH), exist_ok=True)
            with sqlite3.connect(_CACHE_DB_PATH) as conn:
                conn.execute("CREATE TABLE IF NOT EXISTS cache (url TEXT PRIMARY KEY, ts INTEGER, html TEXT)")
                cur = conn.execute("SELECT ts, html FROM cache WHERE url=?", (url,))
                row = cur.fetchone()
                if row:
                    ts, html = int(row[0]), row[1]
                    if time.time() - ts <= ttl:
                        _FETCH_CACHE[url] = (float(ts), html)
                        return html
        except Exception:
            pass
        return None
    ts, html = hit
    if time.time() - ts <= ttl:
        return html
    return None


def _cache_put(url: str, html: str) -> None:
    ts = time.time()
    _FETCH_CACHE[url] = (ts, html)
    # persist
    try:
        import sqlite3
        os.makedirs(os.path.dirname(_CACHE_DB_PATH), exist_ok=True)
        with sqlite3.connect(_CACHE_DB_PATH) as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS cache (url TEXT PRIMARY KEY, ts INTEGER, html TEXT)")
            conn.execute("INSERT OR REPLACE INTO cache (url, ts, html) VALUES (?, ?, ?)", (url, int(ts), html))
            conn.commit()
    except Exception:
        pass


def _source_policy(url: str) -> Dict[str, float]:
    u = url.lower()
    if "linkedin.com" in u:
        return {"jitter_lo": 0.8, "jitter_hi": 1.8, "timeout": 30.0}
    if "yelp.com" in u:
        return {"jitter_lo": 0.2, "jitter_hi": 0.6, "timeout": 20.0}
    return {"jitter_lo": 0.1, "jitter_hi": 0.4, "timeout": timeout_default()}


def timeout_default() -> float:
    return float(os.getenv("SCRAPER_DEFAULT_TIMEOUT", "20.0"))


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.7, min=0.5, max=4), retry=retry_if_exception_type(httpx.HTTPError))
async def fetch_html(url: str, timeout: float = None) -> str:
    cached = _cached_get(url)
    if cached is not None:
        return cached
    headers = {
        "User-Agent": random.choice(_UA_POOL),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close",
    }
    pol = _source_policy(url)
    eff_timeout = float(timeout if timeout is not None else pol["timeout"])
    jitter = random.uniform(pol["jitter_lo"], pol["jitter_hi"])
    await asyncio_sleep(jitter)
    # First attempt: either Tor (if enabled) or proxy pool/env proxies
    primary_use_tor = _tor_enabled()
    try:
        async with httpx.AsyncClient(timeout=eff_timeout, headers=headers, proxies=_get_proxies(force_tor=primary_use_tor), follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
            if len(html) < 512 or ("<script" in html and "</script>" in html and "noscript" in html):
                # Try JS-rendered fallback when content seems thin/JS-heavy
                rendered = await fetch_html_js(url)
                if rendered:
                    html = rendered
            _cache_put(url, html)
            return html
    except Exception as e:  # noqa: BLE001
        logger.debug("fetch_html primary path failed for %s: %s", url, e)
        # Retry once via the opposite path (pool <-> tor)
        try_mode_use_tor = not primary_use_tor
        try:
            async with httpx.AsyncClient(timeout=eff_timeout, headers=headers, proxies=_get_proxies(force_tor=try_mode_use_tor), follow_redirects=True) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                html = resp.text
                if len(html) < 512 or ("<script" in html and "</script>" in html and "noscript" in html):
                    rendered = await fetch_html_js(url)
                    if rendered:
                        html = rendered
                _cache_put(url, html)
                return html
        except Exception as e2:  # noqa: BLE001
            logger.debug("fetch_html secondary path failed for %s: %s", url, e2)
        # final fallback to JS rendering
        rendered = await fetch_html_js(url)
        if rendered:
            _cache_put(url, rendered)
            return rendered
        return ""


async def asyncio_sleep(delay: float) -> None:
    try:
        import asyncio
        await asyncio.sleep(delay)
    except Exception:
        pass


def parse_contacts_from_html(html: str) -> Dict[str, List[str]]:
    if not html:
        return {"emails": [], "phones": []}
    soup = BeautifulSoup(html, "lxml")
    text = soup.get_text(" ", strip=True)
    emails = sorted(set(EMAIL_RE.findall(text)))
    phones = sorted(set(PHONE_RE.findall(text)))
    return {"emails": emails[:50], "phones": phones[:50]}


async def scrape_website(url: str) -> Dict[str, List[str]]:
    html = await fetch_html(url)
    return parse_contacts_from_html(html)


