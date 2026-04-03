import logging
from typing import Dict, List, Tuple

from utils.fuzzy import dedupe_companies
from utils.hashing import generate_company_id
from utils.phone import normalize_phone

logger = logging.getLogger(__name__)


def normalize_and_assign_ids(records: List[Dict], dry_run: bool = False) -> List[Dict]:
    normalized: List[Dict] = []
    for r in records:
        company_name = (r.get("company_name") or "").strip() or None
        domain = (r.get("domain") or "").strip().lower() or None
        website_url = (r.get("website_url") or r.get("website") or "").strip() or None
        phone_raw = r.get("phone_raw") or r.get("phone")
        phone_e164, phone_valid, phone_type = normalize_phone(phone_raw or "", default_region="US", dry_run=dry_run)

        company_id = generate_company_id(domain or company_name, phone_e164 or "", dry_run=dry_run)

        out = {
            **r,
            "company_name": company_name,
            "domain": domain,
            "website_url": website_url,
            "phone_raw": phone_raw,
            "phone_e164": phone_e164,
            "phone_number": phone_e164, # Alias for frontend
            "phone_valid": phone_valid,
            "phone_type": phone_type,
            "company_id": company_id,
        }
        normalized.append(out)
    return normalized


def merge_sources(gmaps: List[Dict], yelp: List[Dict], yellow: List[Dict], overpass: List[Dict], dry_run: bool = False, enable_embed_dedupe: bool = False) -> Tuple[List[Dict], Dict[str, int]]:
    all_records = []
    all_records.extend(gmaps or [])
    all_records.extend(yelp or [])
    all_records.extend(yellow or [])
    all_records.extend(overpass or [])

    logger.info("Merging sources: gmaps=%s yelp=%s yellowpages=%s overpass=%s", len(gmaps), len(yelp), len(yellow), len(overpass))

    normalized = normalize_and_assign_ids(all_records, dry_run=dry_run)

    merged, stats = dedupe_companies(normalized, dry_run=dry_run, name_threshold=85, enable_embeddings=enable_embed_dedupe)

    metrics = {
        "input_total": len(all_records),
        "normalized": len(normalized),
        "merged_total": len(merged),
        "groups": stats.get("groups", 0),
        "merged_count": stats.get("merged", 0),
        "kept": stats.get("kept", 0),
        "source_counts": {
            "gmaps": len(gmaps),
            "yelp": len(yelp),
            "yellowpages": len(yellow),
            "overpass": len(overpass),
        },
    }
    logger.info("Merge summary: %s", metrics)
    return merged, metrics
