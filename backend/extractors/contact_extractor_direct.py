
import logging
import asyncio
import re
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse

from playwright.async_api import async_playwright, Page

logger = logging.getLogger(__name__)

# Basic regex for emails and phones
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?|\d{3})[\s.-]?\d{3}[\s.-]?\d{4})")

# Social media domains to look for
SOCIAL_PLATFORMS = {
    "linkedin": "linkedin.com",
    "twitter": "twitter.com",
    "instagram": "instagram.com",
    "facebook": "facebook.com",
    "youtube": "youtube.com",
    "tiktok": "tiktok.com"
}

class ContactExtractorDirect:
    """
    Directly scrapes company websites using Playwright to extract contact info.
    Simulates "Elite" behavior by visiting pages like a human.
    """
    def __init__(self, dry_run: bool = False, headless: bool = True):
        self.dry_run = dry_run
        self.headless = headless
        # Limit concurrency to avoid crashing system
        self.semaphore = asyncio.Semaphore(3)

    async def extract_contacts(self, website_url: str, max_pages: int = 2) -> Dict:
        if self.dry_run:
            logger.info(f"DRY_RUN: Mock extraction for {website_url}")
            return self._mock_response(website_url)

        if not website_url:
            return self._empty_response(website_url)

        # Correct URL prefix
        if not website_url.startswith("http"):
            website_url = "https://" + website_url

        async with self.semaphore:
            async with async_playwright() as p:
                browser = None
                try:
                    browser = await p.chromium.launch(headless=self.headless)
                    context = await browser.new_context(
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
                    )
                    page = await context.new_page()
                    
                    # 1. Scrape Homepage
                    data = await self._process_page(page, website_url)
                    
                    # 2. Smart Navigation (if no email found, try "Contact" or "About" pages)
                    if not data["emails"] and max_pages > 1:
                        contact_link = await self._find_contact_link(page, website_url)
                        if contact_link:
                            logger.info(f"Navigating to Contact page: {contact_link}")
                            contact_data = await self._process_page(page, contact_link)
                            self._merge_data(data, contact_data)
                    
                    await browser.close()
                    return data
                    
                except Exception as e:
                    logger.error(f"Failed direct extraction for {website_url}: {e}")
                    if browser:
                        await browser.close()
                    return self._empty_response(website_url)

    async def _process_page(self, page: Page, url: str) -> Dict:
        try:
            await page.goto(url, timeout=30000, wait_until="domcontentloaded")
            content = await page.content()
            
            # Simple Text Extraction
            text = await page.evaluate("document.body.innerText")
            
            emails = set(EMAIL_RE.findall(text))
            phones = set(PHONE_RE.findall(text))
            
            # Extract Links (mailto, tel, social)
            links = await page.evaluate("""
                Array.from(document.querySelectorAll('a')).map(a => a.href)
            """)
            
            socials = {k: [] for k in SOCIAL_PLATFORMS.keys()}
            
            for link in links:
                if not link: continue
                link_lower = link.lower()
                
                if link_lower.startswith("mailto:"):
                    email = link_lower.replace("mailto:", "").split("?")[0]
                    if "@" in email:
                        emails.add(email)
                
                if link_lower.startswith("tel:"):
                    phone = link_lower.replace("tel:", "")
                    phones.add(phone)
                    
                for platform, domain in SOCIAL_PLATFORMS.items():
                    if domain in link_lower:
                        socials[platform].append(link)

            # Dedupe socials
            for k in socials:
                socials[k] = list(set(socials[k]))

            return {
                "website": url,
                "emails": list(emails),
                "phones": list(phones),
                "social_links": socials,
                "extraction_success": True
            }
        except Exception:
            return self._empty_response(url)

    async def _find_contact_link(self, page: Page, base_url: str) -> Optional[str]:
        try:
            # Find links with "Contact", "About", "Get in touch"
            # We'll use a lenient selector
            elements = await page.query_selector_all('a')
            for el in elements:
                text = await el.inner_text()
                href = await el.get_attribute('href')
                if not href or not text: continue
                
                text_lower = text.lower()
                if any(x in text_lower for x in ["contact", "about", "team", "get in touch"]):
                    # Normalize URL
                    return urljoin(base_url, href)
            return None
        except:
            return None

    def _merge_data(self, target: Dict, source: Dict):
        target["emails"] = list(set(target["emails"] + source["emails"]))
        target["phones"] = list(set(target["phones"] + source["phones"]))
        for k in target["social_links"]:
            if k in source["social_links"]:
                target["social_links"][k] = list(set(target["social_links"][k] + source["social_links"][k]))

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
