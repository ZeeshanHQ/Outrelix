import asyncio
import logging
from typing import Dict, List, Optional
import httpx

from utils.http_client import HttpClient
from utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)


class GoogleMapsExtractor:
    def __init__(self, host: str, base_path: str, rapidapi_key: str, dry_run: bool = False):
        self.host = host
        self.base_path = base_path  # kept for backward compatibility, not used by new endpoints
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    async def search(self, queries: List[str], geo: str, limit: int) -> List[Dict]:
        if self.dry_run or not self.rapidapi_key or not self.host:
            logger.info("DRY_RUN/disabled: GoogleMapsExtractor search using mocks")
            count = max(10, min(30, limit)) if limit else 10
            return generate_mock_companies(seed="gmaps", count=count, source_tag="gmaps")

        headers = {"X-RapidAPI-Key": self.rapidapi_key, "X-RapidAPI-Host": self.host}
        items: List[Dict] = []
        async with HttpClient(base_url=f"https://{self.host}", headers=headers, dry_run=False, rate_limit_provider="google_maps") as http:
            per_page = 20
            offset = 0
            # Build stable base params per provided cURL
            base_params: Dict[str, object] = {
                "query": ", ".join(queries),
                "country": "us",
                "lang": "en",
            }
            # If geo looks like lat,lng include it; otherwise API can work with country
            try:
                if "," in geo:
                    lat_str, lng_str = [x.strip() for x in geo.split(",", 1)]
                    base_params["lat"] = float(lat_str)
                    base_params["lng"] = float(lng_str)
                    base_params["zoom"] = 13
            except Exception:
                pass

            while len(items) < limit:
                page_limit = min(per_page, max(1, limit - len(items)))
                params = {**base_params, "limit": page_limit, "offset": offset}
                try:
                    data = await http.get("/searchmaps.php", params=params)
                except httpx.HTTPStatusError as e:  # noqa: PERF203
                    code = e.response.status_code if e.response is not None else None
                    logger.warning("Google Maps RapidAPI blocked (%s). Falling back to partial results.", code)
                    # Break and return what we have so far; upstream will continue with other sources
                    break
                results = data.get("results") or data.get("data") or data.get("items") or []
                for r in results:
                    items.append(self._normalize(r))
                    if len(items) >= limit:
                        break
                # Advance pagination
                offset += page_limit
                await asyncio.sleep(0.05)
                if not results:
                    break
        return items

    async def place_info(self, *, place_id: Optional[str] = None, business_id: Optional[str] = None, country: str = "us", lang: str = "en") -> Dict:
        if self.dry_run or not self.rapidapi_key or not self.host:
            logger.info("DRY_RUN/disabled: GoogleMapsExtractor place_info using mocks")
            # return minimal mock enrichment
            return {"website": None, "phone": None}
        if not place_id and not business_id:
            return {}
        headers = {"X-RapidAPI-Key": self.rapidapi_key, "X-RapidAPI-Host": self.host}
        async with HttpClient(base_url=f"https://{self.host}", headers=headers, dry_run=False, rate_limit_provider="google_maps") as http:
            params: Dict[str, object] = {"country": country, "lang": lang}
            if place_id:
                params["place_id"] = place_id
            if business_id:
                params["business_id"] = business_id
            try:
                data = await http.get("/place.php", params=params)
                return data
            except httpx.HTTPStatusError as e:  # noqa: PERF203
                code = e.response.status_code if e.response is not None else None
                logger.warning("Google Maps place_info blocked (%s). Returning minimal info.", code)
                return {"website": None, "phone": None}

    def _normalize(self, raw: Dict) -> Dict:
        # Safely map fields that commonly appear in Maps Data responses
        name = raw.get("title") or raw.get("name")
        website = raw.get("website") or raw.get("site") or raw.get("url")
        phone = raw.get("phone") or raw.get("phone_number")
        address = raw.get("full_address") or raw.get("address")
        city = raw.get("city") or raw.get("locality")
        state = raw.get("state") or raw.get("region")
        country = raw.get("country") or "US"
        categories = raw.get("category") or raw.get("types") or []
        if isinstance(categories, str):
            categories = [categories]
        rating = raw.get("rating") or raw.get("stars")
        reviews = raw.get("reviews") or raw.get("user_ratings_total") or raw.get("reviews_count")
        place_id = raw.get("place_id") or raw.get("id")

        return {
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
            "zip": raw.get("zip") or raw.get("postal_code"),
            "categories": categories,
            "source_tags": ["gmaps"],
            "rating": rating,
            "review_count": reviews,
            "place_id": place_id,
            "lat": raw.get("lat") or raw.get("latitude"),
            "lng": raw.get("lng") or raw.get("longitude"),
            "emails_found": [],
        }
