import asyncio
import logging
from typing import Dict, List, Optional

from src.utils.http_client import HttpClient
from src.utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)


class YellowPagesClient:
    def __init__(self, host: Optional[str], rapidapi_key: Optional[str], dry_run: bool = False):
        self.host = host
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        if self.dry_run or not self.rapidapi_key or not self.host:
            logger.info("DRY_RUN/disabled: YellowPages search using mocks or skipping if disabled")
            # Sometimes return empty to simulate sparse coverage
            from random import Random
            rnd = Random("yellowpages")
            count = rnd.choice([0, 3, 5, 10])
            count = min(count, limit or count)
            return generate_mock_companies(seed="yellowpages", count=count, source_tag="yellowpages") if count else []

        headers = {"X-RapidAPI-Key": self.rapidapi_key, "X-RapidAPI-Host": self.host}
        items: List[Dict] = []
        async with HttpClient(base_url=f"https://{self.host}", headers=headers, dry_run=False, rate_limit_provider="yellowpages") as http:
            page = 0
            per_page = 20
            while len(items) < limit:
                page += 1
                params = {"query": ", ".join(queries) + f" {geo}", "page": page, "limit": per_page}
                data = await http.get("/search", params=params)
                results = data.get("results", [])
                for r in results:
                    items.append(self._normalize(r))
                    if len(items) >= limit:
                        break
                await asyncio.sleep(0.1)
                if not results:
                    break
        return items

    def _normalize(self, raw: Dict) -> Dict:
        return {
            "company_id": "",
            "company_name": raw.get("name"),
            "domain": raw.get("domain"),
            "website_url": raw.get("website"),
            "phone_raw": raw.get("phone"),
            "phone_e164": None,
            "phone_valid": None,
            "phone_type": None,
            "address": raw.get("address"),
            "city": raw.get("city"),
            "state": raw.get("state"),
            "country": raw.get("country"),
            "zip": raw.get("zip"),
            "categories": raw.get("categories", []),
            "source_tags": ["yellowpages"],
            "rating": raw.get("rating"),
            "review_count": raw.get("review_count"),
            "emails_found": [],
        }
