import asyncio
import logging
from typing import Dict, List

from utils.http_client import HttpClient
from utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)


class YelpClient:
    def __init__(self, api_key: str, dry_run: bool = False):
        self.api_key = api_key
        self.dry_run = dry_run

    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        if self.dry_run or not self.api_key:
            logger.info("DRY_RUN/disabled: Yelp search using mocks")
            count = max(5, min(15, limit)) if limit else 5
            return generate_mock_companies(seed="yelp", count=count, source_tag="yelp")

        headers = {"Authorization": f"Bearer {self.api_key}"}
        items: List[Dict] = []
        async with HttpClient(base_url="https://api.yelp.com/v3", headers=headers, dry_run=False, rate_limit_provider="yelp") as http:
            page = 0
            per_page = 20
            while len(items) < limit:
                page += 1
                params = {"term": ", ".join(queries), "location": geo, "limit": per_page, "offset": (page - 1) * per_page}
                data = await http.get("/businesses/search", params=params)
                results = data.get("businesses", [])
                for r in results:
                    items.append(self._normalize(r))
                    if len(items) >= limit:
                        break
                await asyncio.sleep(0.1)
                if not results:
                    break
        return items

    def _normalize(self, raw: Dict) -> Dict:
        location = raw.get("location", {})
        return {
            "company_id": "",
            "company_name": raw.get("name"),
            "domain": None,
            "website_url": raw.get("url"),
            "phone_raw": raw.get("display_phone") or raw.get("phone"),
            "phone_e164": None,
            "phone_valid": None,
            "phone_type": None,
            "address": (", ".join(location.get("display_address", [])) if location else None),
            "city": location.get("city") if location else None,
            "state": location.get("state") if location else None,
            "country": location.get("country") if location else None,
            "zip": location.get("zip_code") if location else None,
            "categories": [c.get("title") for c in raw.get("categories", []) if c.get("title")],
            "source_tags": ["yelp"],
            "rating": raw.get("rating"),
            "review_count": raw.get("review_count"),
            "emails_found": [],
        }
