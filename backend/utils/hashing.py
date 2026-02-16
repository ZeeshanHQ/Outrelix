import hashlib
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def _normalize_for_hash(value: Optional[str]) -> str:
    return (value or "").strip().lower()


def generate_company_id(domain: Optional[str], phone_e164: Optional[str], dry_run: bool = False) -> str:
    if dry_run:
        logger.info("DRY_RUN: generating deterministic mock company_id")
    base = f"{_normalize_for_hash(domain)}|{_normalize_for_hash(phone_e164)}"
    return hashlib.sha1(base.encode("utf-8")).hexdigest()[:16]


def hash_email(email: str) -> str:
    norm = _normalize_for_hash(email)
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()[:24]


def build_dedupe_key(domain: Optional[str], phone_e164: Optional[str], company_name: Optional[str]) -> str:
    # Prefer domain or phone; include fuzzy-friendly name to separate businesses without domain.
    parts = [
        _normalize_for_hash(domain),
        _normalize_for_hash(phone_e164),
        _normalize_for_hash(company_name),
    ]
    return "|".join(parts)
