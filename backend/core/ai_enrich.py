import logging
from typing import Dict, List

from utils.relevance import relevance_score

logger = logging.getLogger(__name__)


def clean_fields(record: Dict, dry_run: bool = False) -> Dict:
    try:
        if dry_run:
            logger.info("DRY_RUN: AI clean_fields using heuristics")
        name = record.get("company_name") or ""
        
        # Defensive check: if name is somehow a list, join it
        if isinstance(name, list):
            name = " ".join(filter(None, [str(part) for part in name]))
        elif not isinstance(name, str):
            name = str(name)

        if name:
            record["company_name"] = " ".join(part.capitalize() for part in name.split())
    except Exception as e:
        logger.warning("Failed to clean fields for record: %s", e)
        # Keep original name if cleaning fails
    return record


def predict_email_pattern(domain: str, dry_run: bool = False) -> str:
    if dry_run:
        logger.info("DRY_RUN: AI predict_email_pattern")
    # Simple heuristic
    return f"first.last@{domain}"


def detect_intent_signals(record: Dict) -> List[str]:
    """Detect high-value intent signals from company description/metadata."""
    signals = []
    text = (record.get("description") or "").lower() + " " + (record.get("enrichment_industry") or "").lower()
    
    # Hiring Signals
    if any(kw in text for kw in ["hiring", "recruitment", "careers", "open positions", "join our team"]):
        signals.append("Hiring Spike")
    
    # Growth/Funding Signals
    if any(kw in text for kw in ["funding", "series a", "series b", "series c", "seed round", "capital raised", "expansion"]):
        signals.append("Growth Mode")
    
    # Tech Stack / Tech Intent
    if any(kw in text for kw in ["ai", "machine learning", "saas", "aws", "cloud", "digital transformation"]):
        signals.append("Tech Intent")
        
    return signals


def generate_outreach_line(record: Dict, dry_run: bool = False) -> str:
    """Generate a personalized outreach line based on intent signals."""
    if dry_run:
        return f"I noticed {record.get('company_name')} is doing some great work in {record.get('enrichment_industry', 'your sector')}."
    
    signals = record.get("intent_signals") or detect_intent_signals(record)
    company = record.get("company_name", "your company")
    
    if "Hiring Spike" in signals:
        return f"I noticed {company} is scaling the team lately—exciting times! Are you looking for ways to streamline that growth?"
    if "Growth Mode" in signals:
        return f"Congrats on the recent expansion at {company}! I'd love to share how we help growing firms capitalize on this momentum."
    if "Tech Intent" in signals:
        return f"Impressive tech stack at {company}. We've been helping similar companies optimize their AI workflows."
        
    return f"I came across {company} and was impressed by your presence in the {record.get('enrichment_industry', 'market')}."


def compute_social_score(record: Dict) -> int:
    """Score based on social intelligence signals."""
    score = 0
    social = record.get("social_links") or {}
    if social.get("linkedin"):
        score += 15
    if social.get("facebook"):
        score += 5
    if social.get("instagram"):
        score += 5
    if social.get("twitter"):
        score += 3
    if record.get("linkedin_contacts"):
        score += 10
    return min(score, 30)


def compute_lead_score(record: Dict, dry_run: bool = False) -> int:
    """Compute a high-value score (0-100) based on firmographics and intent signals."""
    if dry_run:
        return 85
    
    score = 0
    
    # 1. Verification Score (Fundamental)
    if record.get("primary_email"):
        score += 30
    elif record.get("ai_email_pattern"):
        score += 15
        
    # 2. Intent Signals (High Value)
    signals = record.get("intent_signals") or detect_intent_signals(record)
    score += len(signals) * 15
    
    # 3. Firmographic Score
    emp_count = record.get("enrichment_employee_count")
    if isinstance(emp_count, (int, float)):
        if emp_count > 500: score += 20
        elif emp_count > 50: score += 15
        elif emp_count > 10: score += 10
    elif isinstance(emp_count, str) and emp_count.isdigit():
        val = int(emp_count)
        if val > 500: score += 20
        elif val > 50: score += 15
        elif val > 10: score += 10
        
    if record.get("enrichment_linkedin_url"):
        score += 10
        
    # 4. Social intelligence
    score += compute_social_score(record)
        
    return min(score, 100)


def enrich_records(records: List[Dict], dry_run: bool = False, queries: List[str] = None, category: str = "", enable_embed_scoring: bool = False) -> List[Dict]:
    out: List[Dict] = []
    queries = queries or []
    category = category or ""
    for r in records:
        r = clean_fields(r, dry_run=dry_run)
        if not r.get("primary_email") and r.get("domain"):
            r["ai_email_pattern"] = predict_email_pattern(r["domain"], dry_run=dry_run)
        
        # Detect intent signals once and store them
        r["intent_signals"] = detect_intent_signals(r)
        
        r["ai_outreach_line"] = generate_outreach_line(r, dry_run=dry_run)
        r["lead_score"] = compute_lead_score(r, dry_run=dry_run)
        try:
            r["relevance_score"] = relevance_score(r, queries, category, enable_embeddings=enable_embed_scoring)
        except Exception as e:  # pragma: no cover - defensive
            logger.debug("Relevance scoring failed: %s", e)
            r["relevance_score"] = 0.0
        out.append(r)
    return out
