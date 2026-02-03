import logging
from typing import Dict, Optional

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential


logger = logging.getLogger(__name__)


class LinkedInDataApi:
    def __init__(self, host: str, base_url: str, rapidapi_key: str, dry_run: bool = False):
        self.host = host.rstrip("/")
        self.base_url = base_url.rstrip("/")
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    def _headers(self) -> Dict[str, str]:
        return {
            "x-rapidapi-host": self.host,
            "x-rapidapi-key": self.rapidapi_key,
        }

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=4))
    async def get_company_by_domain(self, domain: Optional[str]) -> Dict:
        if not domain:
            return {}
        if self.dry_run or not self.rapidapi_key:
            logger.info("DRY_RUN/disabled: LinkedIn company-by-domain for %s", domain)
            # Minimal mock
            return {
                "enrichment_linkedin_url": f"https://www.linkedin.com/company/{domain.split('.')[0]}",
                "enrichment_employee_count": 50,
                "enrichment_industry": "Software",
            }
        url = f"{self.base_url}/get-company-by-domain"
        params = {"domain": domain}
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                r = await client.get(url, headers=self._headers(), params=params)
                r.raise_for_status()
                data = r.json() if r.content else {}
            except httpx.HTTPStatusError as exc:
                # Non-fatal: just skip LinkedIn enrichment on 403/429/etc.
                logger.warning("LinkedIn company-by-domain failed (%s). Continuing without enrichment.", exc.response.status_code)
                return {}
            out: Dict = {}
            if data:
                out["enrichment_linkedin_url"] = data.get("linkedin_url") or data.get("company_url")
                out["enrichment_employee_count"] = data.get("employeeCount") or data.get("employees")
                out["enrichment_industry"] = data.get("industry")
            return out

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=4))
    async def search_people(self, keywords: str, company: Optional[str] = None, geo: Optional[str] = None, start: int = 0) -> Dict:
        if self.dry_run or not self.rapidapi_key:
            logger.info("DRY_RUN/disabled: LinkedIn search-people keywords=%s company=%s", keywords, company)
            return {
                "people": [
                    {"full_name": "Alex Founder", "title": "Founder & CEO", "company": company or "SaaSCo"},
                    {"full_name": "Mia Head of Growth", "title": "Head of Growth", "company": company or "SaaSCo"},
                ]
            }
        url = f"{self.base_url}/search-people"
        params = {"keywords": keywords, "start": str(start)}
        if geo:
            params["geo"] = geo
        if company:
            params["company"] = company
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                r = await client.get(url, headers=self._headers(), params=params)
                r.raise_for_status()
                return r.json()
            except httpx.HTTPStatusError as exc:
                logger.warning("LinkedIn search-people failed (%s). Returning empty.", exc.response.status_code)
                return {"people": []}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, min=0.5, max=4))
    async def profile_by_url(self, url_or_id: str) -> Dict:
        if self.dry_run or not self.rapidapi_key:
            logger.info("DRY_RUN/disabled: LinkedIn profile-by-url %s", url_or_id)
            return {"full_name": "Demo Owner", "title": "Owner", "company": "DemoCo"}
        url = f"{self.base_url}/get-profile-data-by-url"
        params = {"url": url_or_id}
        async with httpx.AsyncClient(timeout=20) as client:
            try:
                r = await client.get(url, headers=self._headers(), params=params)
                r.raise_for_status()
                return r.json()
            except httpx.HTTPStatusError as exc:
                logger.warning("LinkedIn profile-by-url failed (%s). Returning empty.", exc.response.status_code)
                return {}


