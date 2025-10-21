import requests
from bs4 import BeautifulSoup
import pandas as pd
from typing import List, Dict, Optional
import logging
import re
import time
from urllib.parse import urljoin
import httpx
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Scraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = httpx.AsyncClient(headers=self.headers, timeout=30.0)

    async def scrape_industry(self, industry: str, max_results: int = 100) -> List[Dict]:
        """
        Main method to scrape industry data from multiple sources
        """
        try:
            logger.info(f"Starting to scrape {industry} industry")
            all_results = []
            
            # Scrape from multiple sources concurrently
            tasks = [
                self.scrape_linkedin(industry, max_results),
                self.scrape_company_websites(industry, max_results),
                self.scrape_business_directories(industry, max_results)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine results from all sources
            for result in results:
                if isinstance(result, list):
                    all_results.extend(result)
                elif isinstance(result, Exception):
                    logger.error(f"Error in one of the scraping tasks: {str(result)}")
            
            # Remove duplicates and limit results
            unique_results = self._remove_duplicates(all_results)
            return unique_results[:max_results]
            
        except Exception as e:
            logger.error(f"Error scraping {industry}: {str(e)}")
            raise
        finally:
            await self.session.aclose()

    async def scrape_linkedin(self, industry: str, max_results: int) -> List[Dict]:
        """
        Scrape company data from LinkedIn
        """
        try:
            # Note: This is a placeholder. LinkedIn scraping requires authentication
            # and proper handling of their terms of service
            logger.info(f"Scraping LinkedIn for {industry}")
            return []
        except Exception as e:
            logger.error(f"Error scraping LinkedIn: {str(e)}")
            return []

    async def scrape_company_websites(self, industry: str, max_results: int) -> List[Dict]:
        """
        Scrape company websites for contact information
        """
        try:
            # Search for company websites in the industry
            search_query = f"{industry} companies contact information"
            search_url = f"https://www.google.com/search?q={search_query}"
            
            response = await self.session.get(search_url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            for result in soup.select('div.g')[:max_results]:
                try:
                    company_name = result.select_one('h3').text
                    website_url = result.select_one('a')['href']
                    
                    if website_url.startswith('/url?'):
                        website_url = re.search(r'q=([^&]+)', website_url).group(1)
                    
                    # Scrape the company website for contact information
                    company_data = await self._scrape_company_website(website_url, company_name)
                    if company_data:
                        results.append(company_data)
                        
                except Exception as e:
                    logger.error(f"Error processing search result: {str(e)}")
                    continue
                    
            return results
            
        except Exception as e:
            logger.error(f"Error scraping company websites: {str(e)}")
            return []

    async def scrape_business_directories(self, industry: str, max_results: int) -> List[Dict]:
        """
        Scrape business directories for company information
        """
        try:
            # Example: Scrape from Yellow Pages or similar directories
            directory_url = f"https://www.yellowpages.com/search?search_terms={industry}"
            
            response = await self.session.get(directory_url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            results = []
            for listing in soup.select('.result')[:max_results]:
                try:
                    company_data = {
                        "name": listing.select_one('.business-name').text.strip(),
                        "email": self._extract_email(listing.text),
                        "industry": industry,
                        "source": "business_directory"
                    }
                    results.append(company_data)
                except Exception as e:
                    logger.error(f"Error processing directory listing: {str(e)}")
                    continue
                    
            return results
            
        except Exception as e:
            logger.error(f"Error scraping business directories: {str(e)}")
            return []

    async def _scrape_company_website(self, url: str, company_name: str) -> Optional[Dict]:
        """
        Scrape a specific company website for contact information
        """
        try:
            response = await self.session.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for contact information in common locations
            email = self._extract_email(soup.text)
            phone = self._extract_phone(soup.text)
            
            if email or phone:
                return {
                    "name": company_name,
                    "email": email,
                    "phone": phone,
                    "website": url,
                    "source": "company_website"
                }
            return None
            
        except Exception as e:
            logger.error(f"Error scraping company website {url}: {str(e)}")
            return None

    def _extract_email(self, text: str) -> Optional[str]:
        """
        Extract email addresses from text
        """
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(email_pattern, text)
        return match.group(0) if match else None

    def _extract_phone(self, text: str) -> Optional[str]:
        """
        Extract phone numbers from text
        """
        phone_pattern = r'\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        match = re.search(phone_pattern, text)
        return match.group(0) if match else None

    def _remove_duplicates(self, data: List[Dict]) -> List[Dict]:
        """
        Remove duplicate entries based on email address
        """
        seen_emails = set()
        unique_data = []
        
        for item in data:
            email = item.get('email')
            if email and email not in seen_emails:
                seen_emails.add(email)
                unique_data.append(item)
                
        return unique_data

    def save_to_csv(self, data: List[Dict], filename: str = "leads.csv"):
        """
        Save scraped data to CSV
        """
        try:
            df = pd.DataFrame(data)
            df.to_csv(filename, index=False)
            logger.info(f"Data saved to {filename}")
            return True
        except Exception as e:
            logger.error(f"Error saving to CSV: {str(e)}")
            raise 