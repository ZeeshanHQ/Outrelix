import logging
from typing import Dict

from src.utils.hashing import hash_email
from src.utils.http_client import HttpClient

logger = logging.getLogger(__name__)


class RapidEmailValidator:
    def __init__(self, host: str, base_url: str, rapidapi_key: str, dry_run: bool = False):
        self.host = host
        self.base_url = base_url
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    async def validate(self, email: str) -> Dict:
        if self.dry_run or not self.rapidapi_key or not self.host or not self.base_url:
            logger.info("DRY_RUN/disabled: RapidEmailValidator using mocks for email=%s", email)
            h = hash_email(email)
            bucket = int(h[:2], 16) % 4
            if bucket == 0:
                return {"is_valid": True, "is_disposable": False, "mx_found": True, "deliverability": "high"}
            if bucket == 1:
                return {"is_valid": True, "is_disposable": False, "mx_found": True, "deliverability": "medium"}
            if bucket == 2:
                return {"is_valid": True, "is_disposable": True, "mx_found": True, "deliverability": "low"}
            return {"is_valid": False, "is_disposable": False, "mx_found": False, "deliverability": "unknown"}

        headers = {
            "X-RapidAPI-Key": self.rapidapi_key,
            "X-RapidAPI-Host": self.host,
            "Content-Type": "application/json",
        }
        async with HttpClient(base_url=self.base_url, headers=headers, dry_run=False, rate_limit_provider="email_validator") as http:
            try:
                # Provider accepts email as query; our HttpClient.post has no params arg
                data = await http.post(f"/verify?email={email}", json={"email": email})
                # Normalize provider response
                status = bool(data.get("status")) or (str(data.get("message", "")).lower().find("valid") >= 0)
                mx_found = bool((data.get("data") or {}).get("valid_domain")) or bool((data.get("data") or {}).get("server"))
                return {
                    "is_valid": status,
                    "is_disposable": False,
                    "mx_found": mx_found,
                    "deliverability": "high" if status else "unknown",
                    "raw": data,
                }
            except Exception:
                logger.exception("RapidEmailValidator call failed; returning unknown")
                return {"is_valid": False, "is_disposable": False, "mx_found": False, "deliverability": "unknown"}


