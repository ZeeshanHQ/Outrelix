from bs4 import BeautifulSoup
import requests
import re
import pandas as pd
from typing import List, Dict, Optional
import logging
from urllib.parse import urljoin, urlparse
import time
import random
from concurrent.futures import ThreadPoolExecutor
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndustryScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        # Define supported industries and their scraping strategies
        self.supported_industries = {
            "Technology": {"scrapable": True, "name": "Technology"},
            "Healthcare": {"scrapable": True, "name": "Healthcare"},
            "Real Estate": {"scrapable": True, "name": "Real Estate"},
            "E-commerce": {"scrapable": True, "name": "E-commerce"},
            "Education": {"scrapable": True, "name": "Education"},
            "Finance": {"scrapable": False, "name": "Finance"},
            "Legal": {"scrapable": False, "name": "Legal"}
        }

    def _extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text using regex."""
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        return list(set(re.findall(email_pattern, text)))

    def _is_valid_email(self, email: str) -> bool:
        """Validate email format and common patterns."""
        # Basic email validation
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            return False
        
        # Check for common disposable email domains
        disposable_domains = {'tempmail.com', 'throwawaymail.com', 'mailinator.com'}
        domain = email.split('@')[1]
        if domain in disposable_domains:
            return False
            
        return True

    def _scrape_company_page(self, url: str, industry: str) -> List[Dict]:
        """Scrape individual company page for contact information."""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract company name
            company_name = self._extract_company_name(soup)
            if not company_name:
                return []
            
            # Extract emails from page content
            page_text = soup.get_text()
            emails = self._extract_emails(page_text)
            valid_emails = [email for email in emails if self._is_valid_email(email)]
            
            # Create records for each valid email
            records = []
            for email in valid_emails:
                records.append({
                    'name': company_name,
                    'email': email,
                    'industry': industry
                })
            
            return records
            
        except Exception as e:
            logger.error(f"Error scraping company page {url}: {str(e)}")
            return []

    def _extract_company_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract company name from page."""
        # Try common meta tags
        meta_name = soup.find('meta', property='og:site_name')
        if meta_name:
            return meta_name.get('content')
        
        # Try title tag
        title = soup.find('title')
        if title:
            return title.text.split('|')[0].strip()
        
        return None

    def scrape_industry(self, industry: str, max_companies: int = 100) -> pd.DataFrame:
        """Scrape companies from a specific industry."""
        if industry not in self.supported_industries:
            raise ValueError(f"Industry {industry} not supported")
        
        if not self.supported_industries[industry]['scrapable']:
            raise ValueError(f"Industry {industry} is not available in the free plan")
        
        companies_data = []
        sources = self.supported_industries[industry]['sources']
        
        for source in sources:
            try:
                response = self.session.get(source, timeout=10)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract company links
                company_links = self._extract_company_links(soup, source)
                
                # Scrape each company page
                with ThreadPoolExecutor(max_workers=5) as executor:
                    futures = []
                    for link in company_links[:max_companies]:
                        futures.append(executor.submit(self._scrape_company_page, link, industry))
                    
                    for future in futures:
                        company_records = future.result()
                        companies_data.extend(company_records)
                
                # Add delay between requests
                time.sleep(random.uniform(1, 3))
                
            except Exception as e:
                logger.error(f"Error scraping source {source}: {str(e)}")
                continue
        
        # Convert to DataFrame with only required columns
        df = pd.DataFrame(companies_data)
        if not df.empty:
            df = df[['name', 'email', 'industry']]
        return df

    def _extract_company_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract company links from listing page."""
        links = []
        
        # Look for company links in common patterns
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, href)
            
            # Filter out non-company links
            if self._is_company_link(full_url):
                links.append(full_url)
        
        return list(set(links))

    def _is_company_link(self, url: str) -> bool:
        """Determine if a URL is likely to be a company page."""
        # Add your logic to identify company pages
        company_indicators = ['company', 'about', 'contact', 'team']
        path = urlparse(url).path.lower()
        
        return any(indicator in path for indicator in company_indicators)

    def get_supported_industries(self) -> Dict:
        """Get list of supported industries and their status."""
        return self.supported_industries

    def export_to_csv(self, df: pd.DataFrame, filename: str):
        """Export scraped data to CSV."""
        # Ensure only required columns are present
        if not df.empty:
            df = df[['name', 'email', 'industry']]
        df.to_csv(filename, index=False)
        logger.info(f"Data exported to {filename}")

    def export_to_json(self, df: pd.DataFrame, filename: str):
        """Export scraped data to JSON."""
        # Ensure only required columns are present
        if not df.empty:
            df = df[['name', 'email', 'industry']]
        df.to_json(filename, orient='records', indent=2)
        logger.info(f"Data exported to {filename}")

    def get_leads(self, industry):
        # Placeholder for actual scraping logic
        return [] 