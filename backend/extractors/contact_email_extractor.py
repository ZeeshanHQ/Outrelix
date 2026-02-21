import logging
from typing import Dict, List

from utils.hashing import hash_email

logger = logging.getLogger(__name__)


class ContactEmailExtractor:
    def __init__(self, host: str, rapidapi_key: str, dry_run: bool = False):
        self.host = host
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    async def fetch_emails(self, domain: str) -> List[Dict]:
        if self.dry_run or not self.rapidapi_key or not self.host:
            logger.info("DRY_RUN/disabled: ContactEmailExtractor using mocks for domain=%s", domain)
            # Deterministic based on hash of domain
            h = hash_email(domain)
            n = int(h[:2], 16) % 4  # 0..3
            results: List[Dict] = []
            for i in range(n):
                results.append({"email": f"info{i}@{domain}", "source": "contact_page_extractor"})
            # Occasionally add malformed
            if int(h[2:4], 16) % 3 == 0 and n > 0:
                results.append({"email": f"bad-email-at-{domain}", "source": "contact_page_extractor"})
            return results
        # Real implementation would call RapidAPI endpoint and parse
        # Placeholder for future non-dry_run path
        logger.info("ContactEmailExtractor real call not yet implemented")
        return []
