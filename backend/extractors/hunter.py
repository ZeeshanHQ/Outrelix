import logging
from typing import Dict, List

from utils.hashing import hash_email

logger = logging.getLogger(__name__)


class HunterClient:
    def __init__(self, api_key: str, dry_run: bool = False):
        self.api_key = api_key
        self.dry_run = dry_run

    async def domain_search(self, domain: str) -> List[Dict]:
        if self.dry_run or not self.api_key:
            logger.info("DRY_RUN/disabled: Hunter domain_search using mocks for domain=%s", domain)
            h = hash_email(domain)
            bucket = int(h[:2], 16) % 4
            if bucket == 0:
                return []
            results: List[Dict] = []
            results.append({"email": f"hello@{domain}", "source": "hunter"})
            if bucket >= 2:
                results.append({"email": f"sales@{domain}", "source": "hunter"})
            if bucket >= 3:
                results.append({"email": f"jane.doe@{domain}", "source": "hunter"})
            return results
        logger.info("HunterClient real call not yet implemented")
        return []
