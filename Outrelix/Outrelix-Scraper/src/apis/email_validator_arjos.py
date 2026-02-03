import logging
from typing import Dict

from src.utils.hashing import hash_email

logger = logging.getLogger(__name__)


class ArjosEmailValidator:
    def __init__(self, host: str, rapidapi_key: str, dry_run: bool = False):
        self.host = host
        self.rapidapi_key = rapidapi_key
        self.dry_run = dry_run

    async def validate(self, email: str) -> Dict:
        if self.dry_run or not self.rapidapi_key or not self.host:
            logger.info("DRY_RUN/disabled: ARJOS validator using mocks for email=%s", email)
            h = hash_email(email)
            bucket = int(h[:2], 16) % 4
            if bucket == 0:
                return {"is_valid": True, "is_disposable": False, "mx_found": True, "deliverability": "high"}
            if bucket == 1:
                return {"is_valid": True, "is_disposable": False, "mx_found": True, "deliverability": "medium"}
            if bucket == 2:
                return {"is_valid": True, "is_disposable": True, "mx_found": True, "deliverability": "low"}
            return {"is_valid": False, "is_disposable": False, "mx_found": False, "deliverability": "unknown"}
        logger.info("ArjosEmailValidator real call not yet implemented")
        return {"is_valid": False, "is_disposable": False, "mx_found": False, "deliverability": "unknown"}
