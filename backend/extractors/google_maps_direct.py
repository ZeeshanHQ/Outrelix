import logging
import asyncio
import random
from urllib.parse import urlparse, quote
from typing import List, Dict, Any, Optional
import os
import time
import httpx
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

class GoogleMapsDirectExtractor:
    """
    Elite Google Maps Extractor.
    Supports direct Playwright scraping with residential proxy rotation 
    and RapidAPI fallback for maximum reliability.
    """
    def __init__(self, dry_run: bool = False, headless: bool = True):
        self.dry_run = dry_run
        self.headless = headless
        self.proxies = self._load_proxies()
        self.rapidapi_key = os.getenv("RAPIDAPI_KEY")
        self.rapidapi_host = os.getenv("RAPIDAPI_HOST", "google-maps28.p.rapidapi.com")
        
    def _load_proxies(self) -> List[Dict[str, str]]:
        """Load proxies from backend/residencyproxies.txt"""
        proxies = []
        proxy_file = os.path.join(os.path.dirname(__file__), "..", "residencyproxies.txt")
        if os.path.exists(proxy_file):
            try:
                with open(proxy_file, "r") as f:
                    for line in f:
                        if ":" in line:
                            parts = line.strip().split(":")
                            if len(parts) >= 4:
                                # format: host:port:user:pass
                                proxies.append({
                                    "server": f"http://{parts[0]}:{parts[1]}",
                                    "username": parts[2],
                                    "password": parts[3]
                                })
                logger.info(f"Loaded {len(proxies)} residential proxies for rotation")
            except Exception as e:
                logger.error(f"Failed to load proxies: {e}")
        return proxies

    def _get_random_proxy(self) -> Optional[Dict[str, str]]:
        return random.choice(self.proxies) if self.proxies else None

    async def _get_rapidapi_results(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        """Fetch results via RapidAPI for maximum stability and speed."""
        if not self.rapidapi_key:
            return []
            
        logger.info(f"Using Elite RapidAPI Search mode for queries: {queries}")
        results = []
        headers = {
            "X-RapidAPI-Key": self.rapidapi_key,
            "X-RapidAPI-Host": self.rapidapi_host
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for query in queries:
                try:
                    params = {
                        "query": f"{query} in {geo}",
                        "limit": limit,
                        "lang": "en"
                    }
                    # Adaptive endpoint check (based on Outrelix-Scraper)
                    url = f"https://{self.rapidapi_host}/searchmaps.php"
                    response = await client.get(url, headers=headers, params=params)
                    
                    if response.status_code == 200:
                        data = response.json()
                        raw_items = data.get("results") or data.get("data") or []
                        for item in raw_items:
                            # Normalize to internal format
                            results.append({
                                "company_name": item.get("title") or item.get("name"),
                                "website_url": item.get("website") or item.get("site"),
                                "phone_number": item.get("phone") or item.get("phone_number"),
                                "address": item.get("full_address") or item.get("address"),
                                "rating": item.get("rating"),
                                "review_count": item.get("reviews_count"),
                                "latitude": item.get("latitude"),
                                "longitude": item.get("longitude"),
                                "google_id": item.get("place_id"),
                                "source": "rapidapi-gmaps"
                            })
                    else:
                        logger.warning(f"RapidAPI search failed: {response.status_code}")
                except Exception as e:
                    logger.error(f"RapidAPI error: {e}")
                    
        return results[:limit]

    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        """
        Search Google Maps for the given queries and location.
        Tries RapidAPI first, falls back to Proxy-rotated Playwright.
        """
        if self.dry_run:
            logger.info("DRY_RUN: Mocking Direct Google Maps Search")
            return []

        # 1. Try "Elite" RapidAPI mode first if configured
        rapid_results = await self._get_rapidapi_results(queries, geo, limit)
        if rapid_results:
            logger.info(f"Elite RapidAPI Search found {len(rapid_results)} results")
            return rapid_results

        # 2. Fallback to Proxy-rotated Playwright Scraping
        logger.info("Falling back to Playwright Scraper with Residential Proxy Rotation")
        results = []
        unique_ids = set()
        
        # Pick a fresh proxy for this session
        proxy = self._get_random_proxy()
        launch_args = {"headless": self.headless}
        if proxy:
            launch_args["proxy"] = proxy
            logger.info(f"Using residential proxy: {proxy['server']}")
        else:
            # System proxy fallback
            proxy_server = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
            if proxy_server:
                launch_args["proxy"] = {"server": proxy_server}

        async with async_playwright() as p:
            try:
                browser = await p.chromium.launch(**launch_args)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
                )
                page = await context.new_page()

                for query in queries:
                    if len(results) >= limit:
                        break
                    
                    # Smart geo: only append if query doesn't already mention a location  
                    location_hints = [geo.lower(), 'uae', 'dubai', 'uk', 'london', 'usa', 'new york', 
                                        'australia', 'canada', 'india', 'pakistan', 'germany', 'france']
                    query_lower = query.lower()
                    geo_already_in_query = any(hint in query_lower for hint in [geo.lower(), 'uae', 'dubai', 
                                                                                   'abu dhabi', 'uk', 'london',
                                                                                   'australia', 'canada', 'india'])
                    if geo_already_in_query:
                        search_term = query
                    else:
                        search_term = f"{query} {geo}"
                    
                    # Use the proper Google Maps search endpoint (more stable than /search/)
                    url = f"https://www.google.com/maps/search/{quote(search_term)}"
                    logger.info(f"Direct Scraping: {url}")
                    
                    try:
                        await page.goto(url, timeout=60000, wait_until="domcontentloaded")
                        
                        # Handle "Accept Cookies"
                        try:
                            await page.click('button[aria-label="Accept all"]', timeout=2000)
                        except:
                            pass

                        # Determine if we have a list or a single result
                        feed_selector = 'div[role="feed"]'
                        # Backups for different GMaps UI versions
                        feed_fallbacks = [
                            'div.m6QErb.DxyBCb.kA9KIf.dS8AEf',
                            'div[aria-label^="Results for"]',
                            'div.X79p9b'
                        ]
                        
                        feed_found = False
                        try:
                            # Increase timeout to 20s as Maps can be slow to render the feed
                            await page.wait_for_selector(feed_selector, timeout=12000)
                            feed_found = True
                        except:
                            for fallback in feed_fallbacks:
                                try:
                                    logger.info(f"Trying fallback feed selector: {fallback}")
                                    await page.wait_for_selector(fallback, timeout=4000)
                                    feed_selector = fallback
                                    feed_found = True
                                    break
                                except:
                                    continue
                        
                        if not feed_found:
                            logger.info("No result feed found. Checking for single result redirect or no-results state.")
                            
                            # Check for "No results found" text
                            content = await page.content()
                            if "Google Maps can't find" in content or "No results found" in content or "suggested results" in content.lower():
                                logger.warning(f"Google Maps returned no results for: {query}")
                                continue

                            # Check if we landed on a place page directly
                            if "/maps/place/" in page.url:
                                logger.info(f"Detected single result redirect: {page.url}")
                                # Scrape this single item
                                record = await self._scrape_current_details(page, page.url)
                                if record:
                                    # Attempt to get name from URL or title
                                    title = await page.title()
                                    record["company_name"] = title.split(" - ")[0] if " - " in title else title
                                    results.append(record)
                                continue
                            else:
                                logger.warning(f"No list, no single result. Page URL: {page.url}")
                                # Take a screenshot for debugging if headless
                                if self.headless:
                                    try:
                                        os.makedirs("debug", exist_ok=True)
                                        await page.screenshot(path=f"debug/no_results_{int(time.time())}.png")
                                    except:
                                        pass
                                continue

                        # ── PHASE 1: Collect all place URLs from the feed ──────────────
                        collected_urls = {}  # href -> name
                        no_new_count = 0
                        
                        item_selectors = [
                            'a.hfpxzc',
                            'div[role="article"] a[href*="/maps/place"]',
                            'div.Nv2Ybe a[href*="/maps/place"]',
                        ]
                        
                        logger.info(f"[PHASE 1] Collecting place URLs from feed for: {search_term}")
                        
                        for scroll_attempt in range(30):  # max 30 scrolls
                            # Extract URLs from current view
                            new_found = False
                            for selector in item_selectors:
                                try:
                                    items_data = await page.evaluate(f'''() => {{
                                        const els = Array.from(document.querySelectorAll('{selector}'));
                                        return els.map(el => {{
                                            const href = el.href || el.getAttribute('href') || '';
                                            const name = el.getAttribute('aria-label') || el.innerText?.trim() || '';
                                            return href.includes('/maps/place/') ? {{href, name}} : null;
                                        }}).filter(Boolean);
                                    }}''')
                                    if items_data:
                                        for item in items_data:
                                            h = item.get("href", "")
                                            if h and h not in collected_urls:
                                                collected_urls[h] = item.get("name", "")
                                                new_found = True
                                        break
                                except:
                                    continue
                            
                            if new_found:
                                no_new_count = 0
                            else:
                                no_new_count += 1
                            
                            if no_new_count >= 4:
                                logger.info(f"[PHASE 1] No new results after {no_new_count} scrolls. Stopping. Total: {len(collected_urls)}")
                                break
                            
                            if len(collected_urls) >= limit:
                                break
                            
                            # Check for end of list
                            try:
                                page_content = await page.content()
                                if "end of the list" in page_content.lower() or "you've reached the end" in page_content.lower():
                                    logger.info("[PHASE 1] Reached end of list")
                                    break
                            except:
                                pass
                            
                            # Scroll the feed
                            try:
                                await page.evaluate('''() => {
                                    const selectors = ['div[role="feed"]', 'div.m6QErb', 'div[aria-label^="Results"]'];
                                    for (const sel of selectors) {
                                        const el = document.querySelector(sel);
                                        if (el && el.scrollHeight > el.clientHeight) {
                                            el.scrollBy(0, 2000);
                                            return true;
                                        }
                                    }
                                    window.scrollBy(0, 2000);
                                }''')
                                await page.wait_for_timeout(2000)
                            except Exception as scroll_err:
                                logger.warning(f"Scroll error (non-fatal): {scroll_err}")
                        
                        logger.info(f"[PHASE 1] Collected {len(collected_urls)} place URLs")
                        
                        # ── PHASE 2: Visit each URL and extract details ──────────────
                        for href, name in list(collected_urls.items())[:limit]:
                            if len(results) >= limit:
                                break
                            if href in unique_ids:
                                continue
                            unique_ids.add(href)
                            
                            try:
                                await page.goto(href, wait_until="domcontentloaded", timeout=30000)
                                await page.wait_for_timeout(1500)
                                
                                record = await self._scrape_current_details(page, href)
                                if record:
                                    record["company_name"] = name or record.get("company_name", "")
                                    if not record["company_name"]:
                                        try:
                                            title_el = await page.query_selector('h1.DUwDvf, h1')
                                            if title_el:
                                                record["company_name"] = await title_el.inner_text()
                                        except:
                                            pass
                                    results.append(record)
                                    logger.info(f"Extracted ({len(results)}/{limit}): {record.get('company_name')} | web={record.get('website_url')}")
                            except Exception as e:
                                logger.debug(f"Failed to scrape {href}: {e}")
                                continue

                    except Exception as e:
                        logger.error(f"Error scraping query {query}: {e}")

                await browser.close()
            except Exception as e:
                logger.error(f"Failed to launch browser: {e}")
                
        return results

    async def _scrape_current_details(self, page, href: str) -> Optional[Dict]:
        """Helper to scrape details from the currently open side panel or page."""
        try:
            # 1. Scrape from side panel
            website_url = phone_raw = address = category = rating = None
            
            # Website
            website_el = await page.query_selector('a[data-item-id="authority"]')
            if website_el:
                website_url = await website_el.get_attribute('href')
            else:
                website_el = await page.query_selector('a[aria-label*="website"], a[aria-label*="Website"]')
                if website_el:
                    website_url = await website_el.get_attribute('href')

            # Phone
            phone_el = await page.query_selector('button[data-item-id^="phone:tel:"]')
            if phone_el:
                phone_raw = await phone_el.get_attribute('data-item-id')
                if phone_raw:
                    phone_raw = phone_raw.replace('phone:tel:', '')
            else:
                phone_el = await page.query_selector('button[aria-label*="Phone"], button[aria-label*="phone"]')
                if phone_el:
                    phone_aria = await phone_el.get_attribute('aria-label')
                    if phone_aria:
                        phone_raw = "".join(filter(str.isdigit, phone_aria.replace('Phone: ', '')))

            # Address
            address_el = await page.query_selector('button[data-item-id="address"]')
            address = await address_el.get_attribute('aria-label') if address_el else None
            if address:
                address = address.replace('Address: ', '')
                
            # Category
            category_el = await page.query_selector('button[jsaction*="pane.rating.category"]')
            category = await category_el.inner_text() if category_el else None
            
            # Rating
            try:
                rating_el = await page.query_selector('div.fontDisplayLarge')
                if rating_el:
                    rating_text = await rating_el.inner_text()
                    rating = float(rating_text.strip())
            except:
                pass

            return {
                "company_id": href,
                "domain": urlparse(website_url).netloc if website_url else None,
                "website_url": website_url,
                "website": website_url,
                "phone_raw": phone_raw,
                "address": address,
                "category": category,
                "rating": rating,
                "source_tags": ["gmaps_direct"],
                "gmaps_url": href
            }
        except Exception as e:
            logger.warning(f"Detail scraping failed: {e}")
            return None

    def _normalize(self, raw: Dict) -> Dict:
        return raw
