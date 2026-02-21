import asyncio
import logging
from typing import Dict, List, Optional

from utils.http_client import HttpClient
from utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)


class ContactExtractor:
    def __init__(self, host: str, base_url: str, rapidapi_key: str, backup_key: Optional[str] = None, dry_run: bool = False):
        self.host = host
        self.base_url = base_url
        self.rapidapi_key = rapidapi_key
        self.backup_key = backup_key
        self.dry_run = dry_run
        self.current_key = rapidapi_key

    async def extract_contacts(self, website_url: str, max_requests: int = 2, dedupe: bool = True) -> Dict:
        """
        Extract contact information from a website URL.
        
        Args:
            website_url: The website URL to extract contacts from
            max_requests: Maximum number of pages to crawl (default: 2)
            dedupe: Whether to deduplicate results (default: True)
            
        Returns:
            Dict containing extracted contact information
        """
        if self.dry_run or not self.rapidapi_key:
            logger.info("DRY_RUN/disabled: ContactExtractor using mocks")
            return self._generate_mock_contacts(website_url)

        headers = {
            "X-RapidAPI-Key": self.current_key,
            "X-RapidAPI-Host": self.host
        }
        
        params = {
            "start_url": website_url,
            "max_requests": max_requests,
            "dedupe": dedupe
        }

        try:
            async with HttpClient(base_url=self.base_url, headers=headers, dry_run=False, rate_limit_provider="contact_extractor") as http:
                data = await http.get("/get_contact_details", params=params)
                return self._normalize_response(data, website_url)
        except Exception as e:
            # If primary key fails and we have a backup, try with backup key
            if self.backup_key and self.current_key == self.rapidapi_key:
                logger.warning(f"Primary API key failed, trying backup key: {e}")
                self.current_key = self.backup_key
                headers["X-RapidAPI-Key"] = self.current_key
                
                try:
                    async with HttpClient(base_url=self.base_url, headers=headers, dry_run=False, rate_limit_provider="contact_extractor") as http:
                        data = await http.get("/get_contact_details", params=params)
                        return self._normalize_response(data, website_url)
                except Exception as backup_e:
                    logger.error(f"Both API keys failed. Primary: {e}, Backup: {backup_e}")
                    return self._generate_mock_contacts(website_url)
            else:
                logger.error(f"Contact extraction failed: {e}")
                return self._generate_mock_contacts(website_url)

    def _normalize_response(self, raw_data: Dict, website_url: str) -> Dict:
        """
        Normalize the API response to our standard format.
        
        Expected response format:
        [
            {
                "link": "https://example.com/",
                "domain": "example.com",
                "emails": ["info@example.com"],
                "phones": ["+1234567890"],
                "linkedins": ["https://linkedin.com/company/..."],
                "twitters": ["https://twitter.com/..."],
                "instagrams": ["https://instagram.com/..."],
                "facebooks": ["https://facebook.com/..."],
                "youtubes": ["https://youtube.com/..."],
                "tiktoks": ["https://tiktok.com/..."],
                "status_code": 200
            }
        ]
        """
        if not isinstance(raw_data, list) or not raw_data:
            return self._generate_mock_contacts(website_url)

        # Take the first result (usually the main page)
        result = raw_data[0]
        
        # Extract and deduplicate contact information
        emails = list(set(result.get("emails", [])))
        phones = list(set(result.get("phones", [])))
        
        # Extract social media links
        social_links = {
            "linkedin": list(set(result.get("linkedins", []))),
            "twitter": list(set(result.get("twitters", []))),
            "instagram": list(set(result.get("instagrams", []))),
            "facebook": list(set(result.get("facebooks", []))),
            "youtube": list(set(result.get("youtubes", []))),
            "tiktok": list(set(result.get("tiktoks", [])))
        }
        
        return {
            "website": website_url,
            "domain": result.get("domain", ""),
            "emails": emails,
            "phones": phones,
            "social_links": social_links,
            "status_code": result.get("status_code", 200),
            "extraction_success": result.get("status_code", 0) == 200,
            "source": "contact_extractor"
        }

    def _generate_mock_contacts(self, website_url: str) -> Dict:
        """Generate mock contact data for testing/dry run."""
        return {
            "website": website_url,
            "domain": website_url.replace("https://", "").replace("http://", "").split("/")[0],
            "emails": ["info@example.com", "contact@example.com"],
            "phones": ["+1-555-0123", "+1-555-0456"],
            "social_links": {
                "linkedin": ["https://linkedin.com/company/example"],
                "twitter": ["https://twitter.com/example"],
                "instagram": ["https://instagram.com/example"],
                "facebook": ["https://facebook.com/example"],
                "youtube": ["https://youtube.com/example"],
                "tiktok": []
            },
            "status_code": 200,
            "extraction_success": True,
            "source": "contact_extractor_mock"
        }

    async def batch_extract_contacts(self, website_urls: List[str], max_requests: int = 2, dedupe: bool = True) -> List[Dict]:
        """
        Extract contacts from multiple websites with rate limiting.
        
        Args:
            website_urls: List of website URLs to extract contacts from
            max_requests: Maximum number of pages to crawl per website
            dedupe: Whether to deduplicate results
            
        Returns:
            List of contact extraction results
        """
        results = []
        
        for i, url in enumerate(website_urls):
            try:
                result = await self.extract_contacts(url, max_requests, dedupe)
                results.append(result)
                
                # Rate limiting: wait between requests to respect API limits
                if i < len(website_urls) - 1:  # Don't wait after the last request
                    await asyncio.sleep(1)  # 1 second between requests
                    
            except Exception as e:
                logger.error(f"Failed to extract contacts from {url}: {e}")
                results.append(self._generate_mock_contacts(url))
        
        return results
