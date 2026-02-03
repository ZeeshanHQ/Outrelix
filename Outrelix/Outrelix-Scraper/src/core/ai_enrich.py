import logging
from typing import Dict, List

from src.utils.relevance import relevance_score

logger = logging.getLogger(__name__)


def clean_fields(record: Dict, dry_run: bool = False) -> Dict:
    if dry_run:
        logger.info("DRY_RUN: AI clean_fields using heuristics")
    name = record.get("company_name") or ""
    record["company_name"] = " ".join(part.capitalize() for part in name.split()) if name else name
    return record


def predict_email_pattern(domain: str, dry_run: bool = False) -> str:
    if dry_run:
        logger.info("DRY_RUN: AI predict_email_pattern")
    # Simple heuristic
    return f"first.last@{domain}"


def generate_outreach_line(record: Dict, dry_run: bool = False) -> str:
    if dry_run:
        logger.info("DRY_RUN: AI generate_outreach_line")
    name = record.get("company_name") or "your team"
    return f"Loved how {name} presents their product—quick question about boosting demo conversions."


def compute_lead_score(record: Dict, dry_run: bool = False) -> int:
    if dry_run:
        logger.info("DRY_RUN: AI compute_lead_score heuristic")
    score = 0
    if record.get("primary_email"):
        score += 40
    if record.get("website_url"):
        score += 20
    if record.get("phone_valid"):
        score += 10
    if (record.get("rating") or 0) >= 4.2:
        score += 10
    if record.get("enrichment_employee_count"):
        score += 10
    if record.get("enrichment_industry") == "Roofing":
        score += 10
    return min(score, 100)


def enrich_records(records: List[Dict], dry_run: bool = False, queries: List[str] = None, category: str = "", enable_embed_scoring: bool = False) -> List[Dict]:
    out: List[Dict] = []
    queries = queries or []
    category = category or ""
    for r in records:
        r = clean_fields(r, dry_run=dry_run)
        if not r.get("primary_email") and r.get("domain"):
            r["ai_email_pattern"] = predict_email_pattern(r["domain"], dry_run=dry_run)
        r["ai_outreach_line"] = generate_outreach_line(r, dry_run=dry_run)
        r["lead_score"] = compute_lead_score(r, dry_run=dry_run)
        try:
            r["relevance_score"] = relevance_score(r, queries, category, enable_embeddings=enable_embed_scoring)
        except Exception as e:  # pragma: no cover - defensive
            logger.debug("Relevance scoring failed: %s", e)
            r["relevance_score"] = 0.0
        out.append(r)
    return out
