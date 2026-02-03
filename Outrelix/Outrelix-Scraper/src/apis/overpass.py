import asyncio
import logging
import re
from typing import Dict, List

from src.utils.http_client import HttpClient
from src.utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)


class OverpassClient:
    """
    Simple Overpass (OpenStreetMap) client for free business discovery.
    Uses name regex match within an area by name (city/state/country).
    """

    def __init__(self, endpoint: str = "https://overpass-api.de/api/interpreter", dry_run: bool = False):
        self.endpoint = endpoint
        self.dry_run = dry_run

    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        if self.dry_run:
            logger.info("DRY_RUN: Overpass search using mocks")
            count = max(5, min(20, limit)) if limit else 5
            return generate_mock_companies(seed="overpass", count=count, source_tag="overpass")

        # Build regex from queries
        terms = [re.escape(q) for q in queries if q]
        if not terms:
            return []
        regex = "|".join(terms)

        # Overpass query: search area by name, match nodes/ways/relations by name regex
        overpass_q = f"""
        [out:json][timeout:25];
        area["name"="{geo}"][admin_level~"[2-8]"]->.searchArea;
        (
          node["name"~"{regex}",i](area.searchArea);
          way["name"~"{regex}",i](area.searchArea);
          relation["name"~"{regex}",i](area.searchArea);
        );
        out center {max(1, min(limit, 50))};
        """

        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        async with HttpClient(base_url=self.endpoint, headers=headers, dry_run=False, rate_limit_provider="overpass") as http:
            data = await http.post("", data={"data": overpass_q})
            elements = data.get("elements", [])
            items: List[Dict] = []
            for el in elements:
                tags = el.get("tags", {}) or {}
                name = tags.get("name")
                website = tags.get("website") or tags.get("contact:website")
                phone = tags.get("phone") or tags.get("contact:phone")
                city = tags.get("addr:city")
                state = tags.get("addr:state")
                country = tags.get("addr:country")
                address_parts = []
                for k in ["addr:housenumber", "addr:street", "addr:city", "addr:state", "addr:postcode", "addr:country"]:
                    v = tags.get(k)
                    if v:
                        address_parts.append(v)
                address = ", ".join(address_parts) if address_parts else None
                items.append(
                    {
                        "company_id": "",
                        "company_name": name,
                        "domain": None,
                        "website_url": website,
                        "phone_raw": phone,
                        "phone_e164": None,
                        "phone_valid": None,
                        "phone_type": None,
                        "address": address,
                        "city": city,
                        "state": state,
                        "country": country,
                        "zip": tags.get("addr:postcode"),
                        "categories": [tags.get("amenity") or tags.get("shop") or tags.get("office") or "Business"],
                        "source_tags": ["overpass"],
                        "rating": None,
                        "review_count": None,
                        "emails_found": [],
                        "lat": el.get("lat") or el.get("center", {}).get("lat"),
                        "lng": el.get("lon") or el.get("center", {}).get("lon"),
                    }
                )
                if len(items) >= limit:
                    break
            return items



