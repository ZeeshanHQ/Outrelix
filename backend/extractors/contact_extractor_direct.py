
import logging
import asyncio
import random
import re
import time
import os
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

logger = logging.getLogger(__name__)

# --- Elite Regex Patterns ---
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?|\d{3})[\s.-]?\d{3}[\s.-]?\d{4})")

# Social media domains
SOCIAL_PLATFORMS = {
    "linkedin": "linkedin.com",
    "twitter": "twitter.com",
    "instagram": "instagram.com",
    "facebook": "facebook.com",
    "youtube": "youtube.com",
    "tiktok": "tiktok.com"
}

# --- Elite User-Agent Pool (rotated per request) ---
_UA_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
]

def _get_proxy() -> Optional[str]:
    """Returns a residential proxy URL from the env if configured."""
    # Support comma-separated pool: RESIDENTIAL_PROXY_URL=http://user:pass@ip1:port,http://user:pass@ip2:port
    pool_str = os.getenv("RESIDENTIAL_PROXY_URL") or os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
    if not pool_str:
        return None
    pool = [p.strip() for p in pool_str.split(",") if p.strip()]
    return random.choice(pool) if pool else None


async def _fetch_html_fast(url: str, timeout: float = 20.0) -> str:
    """Try a fast httpx fetch first (non-JS sites). Returns empty string on failure."""
    try:
        import httpx
        from tenacity import retry, stop_after_attempt, wait_exponential
        proxy = _get_proxy()
        headers = {
            "User-Agent": random.choice(_UA_POOL),
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }
        proxies = {"http://": proxy, "https://": proxy} if proxy else None
        async with httpx.AsyncClient(timeout=timeout, headers=headers, proxies=proxies, follow_redirects=True) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            html = resp.text
            # Thin/JS-heavy page detection
            if len(html) < 512 or ("noscript" in html and "<script" in html):
                return ""  # Signal caller to use JS fallback
            return html
    except Exception as e:
        logger.warning(f"Fast fetch failed for {url}: {e}")
        return ""


async def _fetch_html_js(url: str, timeout_ms: int = 25000) -> str:
    """Playwright JS-rendered fetch (elite fallback for bot-protected sites)."""
    try:
        from playwright.async_api import async_playwright
        proxy = _get_proxy()
        launch_args: Dict = {"headless": True}
        if proxy:
            launch_args["proxy"] = {"server": proxy}
            logger.info(f"[ELITE] Routing Playwright through residential proxy: {proxy.split('@')[-1] if '@' in proxy else proxy}")

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(**launch_args)
            ctx = await browser.new_context(user_agent=random.choice(_UA_POOL))
            page = await ctx.new_page()

            # Smart Jitter: human-like randomized wait before navigation
            await asyncio.sleep(random.uniform(0.3, 1.2))

            await page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
            try:
                await page.wait_for_load_state("networkidle", timeout=8000)
            except Exception:
                pass

            content = await page.content()
            await ctx.close()
            await browser.close()
            return content
    except Exception as e:
        logger.warning(f"JS fetch failed for {url}: {e}")
        return ""


def _parse_contacts(html: str, url: str) -> Dict:
    """Parse emails, phones, and social links from raw HTML."""
    from bs4 import BeautifulSoup  # type: ignore
    try:
        soup = BeautifulSoup(html, "lxml")
        text = soup.get_text(" ", strip=True)
    except Exception:
        text = html  # fallback: raw text

    emails = set(EMAIL_RE.findall(text))
    phones = set(PHONE_RE.findall(text))
    socials = {k: [] for k in SOCIAL_PLATFORMS}

    # Also extract from <a> tags
    try:
        from bs4 import BeautifulSoup as BS
        soup2 = BS(html, "lxml")
        for a in soup2.find_all("a", href=True):
            href = a["href"]
            hl = href.lower()
            if hl.startswith("mailto:"):
                email = hl.replace("mailto:", "").split("?")[0].strip()
                if "@" in email:
                    emails.add(email)
            if hl.startswith("tel:"):
                phones.add(hl.replace("tel:", "").strip())
            for platform, domain in SOCIAL_PLATFORMS.items():
                if domain in hl:
                    socials[platform].append(href)
    except Exception:
        pass

    # Dedupe socials
    for k in socials:
        socials[k] = list(set(socials[k]))[:5]  # cap at 5 per platform

    return {
        "website": url,
        "emails": list(emails)[:20],
        "phones": list(phones)[:10],
        "social_links": socials,
        "extraction_success": bool(emails or phones),
    }


class ContactExtractorDirect:
    """
    Elite Contact Extractor with:
    - Fast httpx fetch (primary)
    - JS-rendered Playwright fallback (for bot-protected sites)
    - Residential Proxy rotation (via RESIDENTIAL_PROXY_URL env var)
    - Smart User-Agent rotation
    - Human-like jitter
    """

    def __init__(self, dry_run: bool = False, headless: bool = True):
        self.dry_run = dry_run
        self.headless = headless
        # Limit concurrency to avoid crashing system
        self.semaphore = asyncio.Semaphore(5)

    async def extract_contacts(self, website_url: str, max_pages: int = 2) -> Dict:
        if self.dry_run:
            logger.info(f"DRY_RUN: Mock extraction for {website_url}")
            return self._mock_response(website_url)

        if not website_url:
            return self._empty_response(website_url)

        # Normalize URL
        if not website_url.startswith("http"):
            website_url = "https://" + website_url

        async with self.semaphore:
            try:
                # STEP 1: Try fast httpx fetch
                logger.info(f"[ELITE] Fast fetch: {website_url}")
                html = await _fetch_html_fast(website_url)

                # STEP 2: Fallback to JS render if fast fetch fails or returns thin content
                if not html:
                    logger.info(f"[ELITE] JS Fallback activated for: {website_url}")
                    html = await _fetch_html_js(website_url)

                if not html:
                    return self._empty_response(website_url)

                data = _parse_contacts(html, website_url)

                # STEP 3: Smart Navigation — if no email found, try Contact/About page
                if not data["emails"] and max_pages > 1:
                    contact_link = self._find_contact_link_from_html(html, website_url)
                    if contact_link and contact_link != website_url:
                        logger.info(f"[ELITE] Navigating to Contact page: {contact_link}")
                        # Smart jitter before second request
                        await asyncio.sleep(random.uniform(0.5, 1.5))
                        html2 = await _fetch_html_fast(contact_link)
                        if not html2:
                            html2 = await _fetch_html_js(contact_link)
                        if html2:
                            contact_data = _parse_contacts(html2, contact_link)
                            self._merge_data(data, contact_data)

                # Filter out common false-positive emails
                data["emails"] = [
                    e for e in data["emails"]
                    if not any(bad in e.lower() for bad in [
                        "example.com", "domain.com", "sentry.io", "wixpress.com",
                        "png", "jpg", "gif", "svg", "webp"
                    ])
                ]

                logger.info(f"[ELITE] Extraction complete for {website_url}: {len(data['emails'])} emails, {len(data['phones'])} phones")
                return data

            except Exception as e:
                logger.error(f"Elite extraction failed for {website_url}: {e}")
                return self._empty_response(website_url)

    def _find_contact_link_from_html(self, html: str, base_url: str) -> Optional[str]:
        """Find contact/about page link from raw HTML."""
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "lxml")
            for a in soup.find_all("a", href=True):
                text = (a.get_text() or "").lower().strip()
                href = a["href"]
                if any(x in text for x in ["contact", "about", "team", "get in touch", "reach us"]):
                    return urljoin(base_url, href)
        except Exception:
            pass
        return None

    def _merge_data(self, target: Dict, source: Dict):
        target["emails"] = list(set(target["emails"] + source["emails"]))
        target["phones"] = list(set(target["phones"] + source["phones"]))
        for k in target["social_links"]:
            if k in source["social_links"]:
                target["social_links"][k] = list(set(target["social_links"][k] + source["social_links"][k]))
        if source.get("extraction_success"):
            target["extraction_success"] = True

    def _empty_response(self, url):
        return {
            "website": url,
            "emails": [],
            "phones": [],
            "social_links": {k: [] for k in SOCIAL_PLATFORMS},
            "extraction_success": False
        }

    def _mock_response(self, url):
        return {
            "website": url,
            "emails": ["mock@example.com"],
            "phones": ["555-0123"],
            "social_links": {"linkedin": ["https://linkedin.com/company/mock"]},
            "extraction_success": True
        }
