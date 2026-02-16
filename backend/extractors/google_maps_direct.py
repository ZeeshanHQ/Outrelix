
import logging
import asyncio
import urllib.parse
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
                    url = f"https://www.google.com/maps/search/{urllib.parse.quote(search_term)}"
                    logger.info(f"Direct Scraping: {url}")
                    
                    try:
                        await page.goto(url, timeout=60000, wait_until="domcontentloaded")
                        
                        # Handle "Accept Cookies" if it appears (common in EU, less so in US/headless)
                        try:
                            # Generic consent button selector
                            await page.click('button[aria-label="Accept all"]', timeout=2000)
                        except:
                            pass

                        # Determine if we have a list or a single result
                        # Selector for the scrollable list of results
                        feed_selector = 'div[role="feed"]'
                        
                        try:
                            await page.wait_for_selector(feed_selector, timeout=10000)
                        except:
                            logger.info("No result feed found. Checking for single result or empty.")
                            # TODO: Handle single result case redirect
                            continue

                        # Infinite Scroll Loop
                        no_new_results_count = 0
                        previous_count = 0
                        
                        while len(results) < limit and no_new_results_count < 5:
                            # 1. Scrape current visible items
                            elements = await page.query_selector_all('div[role="article"]')
                            
                            for el in elements:
                                try:
                                    # Extract basic info from the card
                                    link_el = await el.query_selector('a[href^="https://www.google.com/maps/place"]')
                                    if not link_el:
                                        continue
                                        
                                    href = await link_el.get_attribute('href')
                                    if not href:
                                        continue
                                        
                                    # Simple ID extraction from URL
                                    # Format: .../place/Name+Details/@lat,lng,...
                                    # Use href as comprehensive ID
                                    if href in unique_ids:
                                        continue
                                    
                                    # Extract Name (aria-label often has it)
                                    name = await link_el.get_attribute('aria-label')
                                    if not name:
                                        continue

                                    # Attempt to get rating and reviews
                                    text_content = await el.inner_text()
                                    lines = text_content.split('\n')
                                    
                                    # Very naive parsing - can be improved with specific selectors
                                    # Usually contained in spans with specific classes, but classes are obfuscated.
                                    # Aria labels are more reliable.
                                    
                                    unique_ids.add(href)
                                    
                                    # For "Direct" mode, we might not get phone/website without clicking details.
                                    # Strategy: Collect URLs now, enrich/click later OR just return basic list.
                                    # Optimization: Just return what is visible on the list card for speed.
                                    
                                    # Extract phone (sometimes visible, sometimes not)
                                    # Extract industry (often visible)
                                    
                                    record = {
                                        "company_id": href, # temporary ID
                                        "company_name": name,
                                        "domain": None, # Enriched later
                                        "website_url": None, # Enriched later
                                        "phone_raw": None, # Enriched later
                                        "address": None,
                                        "source_tags": ["gmaps_direct"],
                                        "gmaps_url": href
                                    }
                                    
                                    results.append(record)
                                    
                                    if len(results) >= limit:
                                        break
                                except Exception as e:
                                    # Skip bad element
                                    continue

                            if len(results) >= limit:
                                break

                            # 2. Check overlap
                            if len(unique_ids) == previous_count:
                                no_new_results_count += 1
                            else:
                                no_new_results_count = 0
                                previous_count = len(unique_ids)

                            # 3. Scroll
                            # Scroll the feed div
                            await page.evaluate(f'document.querySelector("{feed_selector}").scrollBy(0, 5000)')
                            await page.wait_for_timeout(2000) # Wait for network
                            
                            # Check if "You've reached the end of the list" exists
                            content = await page.content()
                            if "You've reached the end of the list" in content:
                                break

                    except Exception as e:
                        logger.error(f"Error scraping query {query}: {e}")

                await browser.close()
                
            except Exception as e:
                logger.error(f"Failed to launch browser: {e}")
                
        return results

    def _normalize(self, raw: Dict) -> Dict:
        """Compatibility method if needed."""
        return raw
