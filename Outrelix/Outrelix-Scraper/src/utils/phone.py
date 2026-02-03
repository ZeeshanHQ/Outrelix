import logging
from typing import Optional, Tuple

import phonenumbers

logger = logging.getLogger(__name__)


def normalize_phone(phone_raw: Optional[str], default_region: str = "US", dry_run: bool = False) -> Tuple[Optional[str], Optional[bool], Optional[str]]:
    if not phone_raw:
        return None, None, None

    phone_raw = phone_raw.strip()

    if dry_run:
        logger.info("DRY_RUN: normalizing phone deterministically")
    try:
        parsed = phonenumbers.parse(phone_raw, default_region)
        is_valid = phonenumbers.is_valid_number(parsed)
        e164 = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164) if is_valid else None
        number_type = phonenumbers.number_type(parsed)
        type_str = {
            phonenumbers.PhoneNumberType.FIXED_LINE: "landline",
            phonenumbers.PhoneNumberType.MOBILE: "mobile",
            phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE: "mobile",
            phonenumbers.PhoneNumberType.VOIP: "voip",
        }.get(number_type, "unknown")
        return e164, is_valid, type_str
    except Exception:
        return None, False, None
