import logging
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


_DELIVER_SCORES: Dict[str, int] = {"high": 3, "medium": 2, "low": 1, "unknown": 0}
_SOURCE_SCORES: Dict[str, int] = {
    "contact_page_extractor": 4,  # prioritize direct site found emails
    "hunter": 3,
    "ai_predicted": 1,
}
_ROLE_PREFIXES: Tuple[str, ...] = ("info@", "sales@", "support@", "hello@")


def _is_role(email: str) -> bool:
    e = (email or "").lower()
    return any(e.startswith(p) for p in _ROLE_PREFIXES)


def _base_score(e: Dict) -> Tuple[int, int, int]:
    v = e.get("validation") or {}
    deliver = _DELIVER_SCORES.get(str(v.get("deliverability") or "unknown"), 0)
    is_valid = 1 if bool(v.get("is_valid")) else 0
    source_score = _SOURCE_SCORES.get(str(e.get("source") or "").lower(), 0)
    return (deliver, is_valid, source_score)


def choose_primary_email(emails: List[Dict]) -> Optional[str]:
    if not emails:
        return None

    personals = [e for e in emails if not _is_role(str(e.get("email") or ""))]
    roles = [e for e in emails if _is_role(str(e.get("email") or ""))]

    best_personal = max(personals, key=_base_score) if personals else None
    best_role = max(roles, key=_base_score) if roles else None

    if best_personal and best_role:
        role_src = str(best_role.get("source") or "").lower()
        role_deliver = _base_score(best_role)[0]
        personal_deliver = _base_score(best_personal)[0]
        # For B2B SaaS, allow role email from contact page to win only if clearly more deliverable
        if role_src == "contact_page_extractor" and role_deliver > personal_deliver + 1:
            logger.info("Primary email selected (contact extractor outranks personal by deliverability): %s", best_role.get("email"))
            return str(best_role.get("email") or "")
        logger.info("Primary email selected (prefer personal over role): %s", best_personal.get("email"))
        return str(best_personal.get("email") or "")

    if best_personal:
        logger.info("Primary email selected (only personal available): %s", best_personal.get("email"))
        return str(best_personal.get("email") or "")

    if best_role:
        logger.info("Primary email selected (only role available): %s", best_role.get("email"))
        return str(best_role.get("email") or "")

    return None
