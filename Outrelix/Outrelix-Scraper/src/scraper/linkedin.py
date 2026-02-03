import logging
import os
import random
import re
import sqlite3
import time
from typing import Any, Dict, List, Optional

from src.ai.nlp import SimpleNlpExtractor

logger = logging.getLogger(__name__)


UA_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
]


async def _new_context(pw, proxy: Optional[str] = None, headless: bool = True):
    browser = await pw.chromium.launch(headless=headless, proxy={"server": proxy} if proxy else None)
    ctx = await browser.new_context(user_agent=random.choice(UA_POOL))
    page = await ctx.new_page()
    return browser, ctx, page


def _score_role_text(text: str) -> float:
    text_l = text.lower()
    weights = {
        "founder": 1.0,
        "co-founder": 0.95,
        "ceo": 0.95,
        "owner": 0.9,
        "president": 0.85,
        "director": 0.75,
        "principal": 0.75,
        "head": 0.7,
    }
    return max([w for k, w in weights.items() if k in text_l] + [0.0])


async def search_company_people(company: str, limit: int = 5, proxy: Optional[str] = None, headless: bool = True) -> List[Dict[str, Any]]:
    """Search LinkedIn public for people related to a company and return top roles.

    Note: Public scraping may be rate-limited; proxy is recommended.
    """
    try:
        from playwright.async_api import async_playwright  # type: ignore
    except Exception as e:  # pragma: no cover
        logger.debug("Playwright not available: %s", e)
        return []

    url = f"https://www.linkedin.com/search/results/people/?keywords={company.replace(' ', '%20')}"  # public search
    results: List[Dict[str, Any]] = []
    nlp = SimpleNlpExtractor(enable_models=False)
    # cache by URL
    cached = _cache_get(url)
    if cached:
        return cached
    try:
        async with async_playwright() as pw:
            browser, ctx, page = await _new_context(pw, proxy=proxy or os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY"), headless=headless)
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=10000)
                except Exception:
                    pass
                html = await page.content()
                text = await page.inner_text("body")
                # Heuristic extraction: find blocks with name + title
                blocks = re.split(r"\n{2,}", text)
                candidates: List[Dict[str, Any]] = []
                for b in blocks:
                    if len(b) < 20:
                        continue
                    role_score = _score_role_text(b)
                    if role_score <= 0:
                        continue
                    people = nlp.extract_people_and_roles(b)
                    full_name = ""
                    for name, _ in people:
                        if len(name.split()) >= 2 and len(name) <= 60:
                            full_name = name
                            break
                    if full_name or role_score > 0:
                        candidates.append({
                            "name": full_name,
                            "role_text": b[:200],
                            "score": role_score,
                        })
                # Sort by score then name presence
                candidates.sort(key=lambda x: (x["score"], 1 if x.get("name") else 0), reverse=True)
                for c in candidates[: max(1, limit * 2)]:
                    # Attempt to refine role text into a shorter title via heuristic
                    role = None
                    titles = ["Founder", "Co-Founder", "CEO", "Owner", "Director", "President", "Principal", "Head"]
                    for t in titles:
                        if t.lower() in c["role_text"].lower():
                            role = t
                            break
                    results.append({"full_name": c.get("name", ""), "role": role or "", "confidence": c.get("score", 0.5)})
            finally:
                await ctx.close()
                await browser.close()
    except Exception as e:  # noqa: BLE001
        logger.debug("LinkedIn search failed for %s: %s", company, e)
        return []
    # Deduplicate and take top N
    uniq: List[Dict[str, Any]] = []
    seen = set()
    for r in results:
        key = (r.get("full_name", "").lower(), r.get("role", "").lower())
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)
    uniq = uniq[: limit]
    _cache_put(url, uniq)
    return uniq


async def fetch_profile(profile_url: str, proxy: Optional[str] = None, headless: bool = True) -> Dict[str, Any]:
    """Fetch a LinkedIn public profile page and extract name + headline role."""
    try:
        from playwright.async_api import async_playwright  # type: ignore
    except Exception as e:  # pragma: no cover
        logger.debug("Playwright not available: %s", e)
        return {}

    nlp = SimpleNlpExtractor(enable_models=False)
    cached = _cache_get(profile_url)
    if cached:
        if isinstance(cached, list) and cached:
            return cached[0]
        if isinstance(cached, dict):
            return cached
    try:
        async with async_playwright() as pw:
            browser, ctx, page = await _new_context(pw, proxy=proxy or os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY"), headless=headless)
            try:
                await page.goto(profile_url, wait_until="domcontentloaded", timeout=25000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=10000)
                except Exception:
                    pass
                body = await page.inner_text("body")
                # Attempt to pick name via NER and title via heuristic keywords
                name = ""
                for cand, _ in nlp.extract_people_and_roles(body):
                    if len(cand.split()) >= 2 and len(cand) <= 60:
                        name = cand
                        break
                role = None
                titles = ["Founder", "Co-Founder", "CEO", "Owner", "Director", "President", "Principal", "Head"]
                lower = body.lower()
                for t in titles:
                    if t.lower() in lower:
                        role = t
                        break
                res = {"full_name": name, "role": role or ""}
                _cache_put(profile_url, res)
                return res
            finally:
                await ctx.close()
                await browser.close()
    except Exception as e:  # noqa: BLE001
        logger.debug("LinkedIn profile fetch failed for %s: %s", profile_url, e)
        return {}


# Simple SQLite cache for LinkedIn HTML/parsed results
_DB = os.path.join("data", "linkedin_cache.sqlite")
_TTL = int(os.getenv("LINKEDIN_CACHE_TTL_SECONDS", "86400"))


def _cache_get(key: str):
    try:
        os.makedirs(os.path.dirname(_DB), exist_ok=True)
        with sqlite3.connect(_DB) as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, ts INTEGER, blob TEXT)")
            cur = conn.execute("SELECT ts, blob FROM cache WHERE key=?", (key,))
            row = cur.fetchone()
            if not row:
                return None
            ts, blob = int(row[0]), row[1]
            if time.time() - ts > _TTL:
                return None
            import json
            return json.loads(blob)
    except Exception:
        return None


def _cache_put(key: str, obj) -> None:
    try:
        os.makedirs(os.path.dirname(_DB), exist_ok=True)
        with sqlite3.connect(_DB) as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, ts INTEGER, blob TEXT)")
            import json
            conn.execute("INSERT OR REPLACE INTO cache (key, ts, blob) VALUES (?, ?, ?)", (key, int(time.time()), json.dumps(obj)))
            conn.commit()
    except Exception:
        pass


