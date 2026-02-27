
import logging
import asyncio
from urllib.parse import urlparse, quote
from typing import List, Dict, Optional
import os
from playwright.async_api import async_playwright

logger = logging.getLogger(__name__)

class GoogleMapsDirectExtractor:
    """
    Directly scrapes Google Maps using Playwright to avoid paid APIs.
    Handlers scrolling, parsing, and data extraction from the DOM.
    """
    def __init__(self, dry_run: bool = False, headless: bool = True):
        self.dry_run = dry_run
        self.headless = headless
        
    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        """
        Search Google Maps for the given queries and location.
        """
        if self.dry_run:
            logger.info("DRY_RUN: Mocking Direct Google Maps Search")
            return []

        results = []
        unique_ids = set()
        
        # Use existing proxy configuration from env if available
        proxy_server = os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY")
        launch_args = {"headless": self.headless}
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
                        
                    search_term = f"{query} in {geo}"
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
                        feed_fallback = 'div.m6QErb.DxyBCb.kA9KIf.dS8AEf'
                        
                        try:
                            # Increase timeout to 20s as Maps can be slow to render the feed
                            await page.wait_for_selector(feed_selector, timeout=20000)
                        except:
                            try:
                                logger.info("Primary feed selector failed, trying fallback...")
                                await page.wait_for_selector(feed_fallback, timeout=5000)
                                feed_selector = feed_fallback
                            except:
                                logger.info("No result feed found. Checking for single result redirect or no-results state.")
                                
                                # Check for "No results found" text
                                content = await page.content()
                                if "Google Maps can't find" in content or "No results found" in content:
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
                                    logger.warning(f"No list, no single result, and no clear 'no results' message detected. Page URL: {page.url}")
                                    continue

                        # Infinite Scroll Loop for list results
                        no_new_results_count = 0
                        previous_count = 0
                        
                        while len(results) < limit and no_new_results_count < 5:
                            elements = await page.query_selector_all('div[role="article"]')
                            
                            for el in elements:
                                try:
                                    link_el = await el.query_selector('a[href^="https://www.google.com/maps/place"]')
                                    if not link_el:
                                        continue
                                        
                                    href = await link_el.get_attribute('href')
                                    if not href or href in unique_ids:
                                        continue
                                        
                                    name = await link_el.get_attribute('aria-label')
                                    if not name:
                                        continue
                                    
                                    unique_ids.add(href)
                                    
                                    # Click to open details
                                    await el.click()
                                    await page.wait_for_timeout(1500) 
                                    
                                    record = await self._scrape_current_details(page, href)
                                    if record:
                                        record["company_name"] = name
                                        results.append(record)
                                        logger.info(f"Extracted: {name} | web={record.get('website_url')} | phone={record.get('phone_raw')}")
                                    
                                    # Navigate back to list
                                    try:
                                        back_btn = await page.query_selector('button[aria-label="Back"]')
                                        if back_btn:
                                            await back_btn.click()
                                        else:
                                            await page.go_back()
                                        await page.wait_for_selector(feed_selector, timeout=8000)
                                        await page.wait_for_timeout(500)
                                    except Exception as nav_err:
                                        logger.warning(f"Back navigation failed, re-navigating: {nav_err}")
                                        await page.goto(url, timeout=60000, wait_until="domcontentloaded")
                                        await page.wait_for_selector(feed_selector, timeout=10000)

                                    if len(results) >= limit:
                                        break
                                except Exception as e:
                                    logger.debug(f"Skipping element: {e}")
                                    continue

                            if len(results) >= limit:
                                break

                            if len(unique_ids) == previous_count:
                                no_new_results_count += 1
                            else:
                                no_new_results_count = 0
                                previous_count = len(unique_ids)

                            # Scroll the feed div - FIXED SyntaxError (nested quotes)
                            try:
                                await page.evaluate(f"document.querySelector('{feed_selector}').scrollBy(0, 10000)")
                                await page.wait_for_timeout(2500)
                            except Exception as scroll_err:
                                logger.error(f"Scroll failed: {scroll_err}")
                                break
                            
                            if "You've reached the end of the list" in await page.content():
                                break

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
