import logging
from typing import Dict, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from utils.hashing import hash_email

logger = logging.getLogger(__name__)


class ClearbitClient:
    def __init__(self, api_key: str, dry_run: bool = False, rapid_host: Optional[str] = None, rapid_base: Optional[str] = None, rapidapi_key: Optional[str] = None):
        self.api_key = api_key
        self.dry_run = dry_run
        self.rapid_host = (rapid_host or '').strip()
        self.rapid_base = (rapid_base or '').rstrip('/') if rapid_base else ''
        self.rapidapi_key = (rapidapi_key or '').strip()

    async def enrich_company(self, domain: Optional[str]) -> Dict:
        if not domain:
            return {}
        if self.dry_run or not self.api_key:
            logger.info("DRY_RUN/disabled: Clearbit enrichment using mocks for domain=%s", domain)
            h = hash_email(domain)
            bucket = int(h[:2], 16) % 5
            if bucket == 0:
                return {}
            return {
                "enrichment_industry": "Software",
                "enrichment_employee_count": 10 + bucket * 25,
                "enrichment_linkedin_url": f"https://www.linkedin.com/company/{domain.split('.')[0]}",
            }
        # Prefer RapidAPI wrapper if provided
        if self.rapid_host and self.rapidapi_key and self.rapid_base:
            try:
                return await self._rapid_find_company(domain)
            except Exception as e:
                logger.warning("Clearbit RapidAPI call failed: %s", e)
                return {}
        logger.info("ClearbitClient real call not yet implemented")
        return {}

    def _rapid_headers(self) -> Dict[str, str]:
        return {"x-rapidapi-host": self.rapid_host, "x-rapidapi-key": self.rapidapi_key, "Content-Type": "application/x-www-form-urlencoded"}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=3))
    async def _rapid_find_company(self, domain: str) -> Dict:
        url = f"{self.rapid_base}/findCompany"
        data = {"domain": domain}
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(url, headers=self._rapid_headers(), data=data)
            r.raise_for_status()
            j = r.json() if r.content else {}
            if not isinstance(j, dict):
                return {}
            # Normalize a few common fields
            out: Dict[str, Optional[object]] = {}
            out["enrichment_industry"] = j.get("category") or j.get("industry")
            out["enrichment_employee_count"] = j.get("employees") or j.get("metrics", {}).get("employees")
            out["enrichment_linkedin_url"] = j.get("linkedin") or j.get("links", {}).get("linkedin")
            return {k: v for k, v in out.items() if v}
