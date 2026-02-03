import asyncio
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

import phonenumbers  # type: ignore

from src.ai.nlp import SimpleNlpExtractor
from src.engine.email_validator import validate_email, validate_batch
from src.utils.config import load_config_from_env_and_args

logger = logging.getLogger(__name__)


EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")


def is_valid_email(email: str) -> bool:
    if not email:
        return False
    email = email.strip()
    if not EMAIL_RE.match(email):
        return False
    # basic junk filters
    if any(bad in email.lower() for bad in ["example.com", "test@", "noreply@", "no-reply@"]):
        return False
    return True


def is_valid_phone(phone: str) -> bool:
    if not phone:
        return False
    try:
        num = phonenumbers.parse(phone, None)
        return phonenumbers.is_valid_number(num)
    except Exception:
        return False


def _hf_enabled() -> bool:
    class Args:
        queries = []
        geo = ""
        category = ""
        limit = 0
        enable_yelp = False
        enable_yellowpages = False
        enable_clearbit = False
        push_to_gsheets = False
        dry_run = True
    cfg = load_config_from_env_and_args(Args)
    return bool(getattr(cfg, "enable_hf_models", False))


def _ner_pipeline():
    try:
        from transformers import pipeline  # type: ignore
        return pipeline("token-classification", model="dslim/bert-base-NER", aggregation_strategy="simple")
    except Exception:
        return None


def _clf_pipeline():
    try:
        from transformers import pipeline  # type: ignore
        # small generic classifier; we will threshold on presence of contact cues + model score
        return pipeline("text-classification", model="distilbert-base-uncased", top_k=None)
    except Exception:
        return None


def classify_role(text: str) -> Optional[str]:
    if not text:
        return None
    titles = ["Founder", "Co-Founder", "CEO", "Owner", "Director", "President", "Principal", "Head"]
    lower = text.lower()
    for t in titles:
        if t.lower() in lower:
            return t
    # Hugging Face NER to extract entities that may indicate role
    if _hf_enabled():
        ner = _ner_pipeline()
        if ner is not None:
            try:
                ents = ner(text)
                # Prefer ORG/PER context with role keywords nearby
                if isinstance(ents, list):
                    for ent in ents:
                        if ent.get("entity_group") in {"ORG", "PER"}:
                            ctx = text[max(0, ent.get("start", 0) - 32): ent.get("end", 0) + 32]
                            for t in ["Founder", "Co-Founder", "CEO", "Owner", "Director", "President", "Principal", "Head"]:
                                if t.lower() in ctx.lower():
                                    return t
            except Exception:
                pass
    # fallback heuristic via our lightweight extractor
    nlp = SimpleNlpExtractor(enable_models=False)
    pairs = nlp.extract_people_and_roles(text)
    for _, role in pairs:
        if role:
            return role
    return None


def _classify_contact_text(text: str) -> float:
    base = 0.0
    if any(tok in text.lower() for tok in ["email", "@", "contact", "reach", "call", "phone", "ceo", "founder", "owner"]):
        base += 0.3
    if _hf_enabled():
        clf = _clf_pipeline()
        if clf is not None:
            try:
                out = clf(text, truncation=True, max_length=256)
                if isinstance(out, list) and out:
                    score = out[0].get("score", 0.5)
                    base += 0.4 * float(score)
            except Exception:
                pass
    return max(0.0, min(1.0, base))


def compute_confidence(row: Dict[str, Any]) -> float:
    score = 0.3
    email = (row.get("email") or "").strip()
    phone = (row.get("phone") or "").strip()
    role = (row.get("role") or "").strip()
    source = (row.get("source") or "").lower()

    # Email validation with enhanced scoring
    if is_valid_email(email):
        score += 0.3  # base email validity
        # Use email validator score if available
        email_score = row.get("email_score")
        if email_score is not None:
            score += 0.2 * float(email_score)  # weighted email validator score
        else:
            score += 0.1  # fallback for basic email validity
    if is_valid_phone(phone):
        score += 0.2
    if role:
        leadership = ["Founder", "Co-Founder", "CEO", "Owner", "President"]
        if any(r.lower() in role.lower() for r in leadership):
            score += 0.2
        else:
            score += 0.1
    # boost using classifier on synthetic contact text
    text = " ".join([str(row.get(k) or "") for k in ("full_name", "role", "company", "email", "phone")])
    score += 0.2 * _classify_contact_text(text)
    if source in {"gmaps", "yelp", "ai_web"}:
        score += 0.05
    return max(0.0, min(1.0, score))


async def enrich_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Enrich rows with role classification, email validation, and confidence scoring."""
    out: List[Dict[str, Any]] = []
    
    # Check if email validation is enabled
    class Args:
        queries = []
        geo = ""
        category = ""
        limit = 0
        enable_yelp = False
        enable_yellowpages = False
        enable_clearbit = False
        push_to_gsheets = False
        dry_run = True
    cfg = load_config_from_env_and_args(Args)
    email_validation_enabled = getattr(cfg, "email_validator_enabled", False)
    
    # Collect emails for batch validation
    emails_to_validate = []
    email_to_row_index = {}
    
    for i, r in enumerate(rows):
        rr = dict(r)
        email = (rr.get("email") or "").strip()
        if email and is_valid_email(email):
            emails_to_validate.append(email)
            email_to_row_index[email] = i
        
        # infer role from any available context
        role = rr.get("role") or rr.get("role_text") or ""
        if not role:
            # combine sparse strings
            context = " ".join([str(rr.get(k) or "") for k in ("name", "company", "website")])
            role = classify_role(context) or ""
        rr["role"] = role
        out.append(rr)
    
    # Batch validate emails if enabled
    if email_validation_enabled and emails_to_validate:
        try:
            logger.info(f"Validating {len(emails_to_validate)} emails in batch")
            validation_results = await validate_batch(emails_to_validate, concurrency=10)
            
            # Apply validation results to rows
            for result in validation_results:
                email = result.get("email", "")
                if email in email_to_row_index:
                    row_idx = email_to_row_index[email]
                    out[row_idx]["email_valid"] = result.get("is_valid", False)
                    out[row_idx]["email_score"] = result.get("score", 0.0)
                    out[row_idx]["email_reason"] = result.get("reason", "")
        except Exception as e:
            logger.warning(f"Email validation failed: {e}")
            # Continue without validation results
    
    # Compute confidence scores (now includes email validation scores)
    for rr in out:
        rr["confidence"] = compute_confidence(rr)
    
    return out


def cluster_companies(rows: List[Dict[str, Any]], enable: bool = False) -> List[Dict[str, Any]]:
    """Optional: assign cluster_id to group similar companies by name/domain.

    Uses sentence-transformers style embeddings if available; falls back to simple hashing.
    """
    if not enable:
        return rows
    try:
        from sentence_transformers import SentenceTransformer  # type: ignore
        import numpy as np  # type: ignore
        from sklearn.cluster import DBSCAN  # type: ignore
    except Exception:
        # fallback: no clustering libs; tag each as its own cluster
        rid = 0
        out = []
        for r in rows:
            rr = dict(r)
            rr["cluster_id"] = f"c{rid}"
            rid += 1
            out.append(rr)
        return out

    texts = []
    for r in rows:
        name = (r.get("company") or r.get("name") or "").strip()
        domain = (r.get("website") or "").replace("https://", "").replace("http://", "")
        texts.append(f"{name} {domain}")
    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    emb = model.encode(texts, normalize_embeddings=True)
    clustering = DBSCAN(eps=0.25, min_samples=2, metric="cosine").fit(emb)
    labels = clustering.labels_.tolist()
    out = []
    for r, lab in zip(rows, labels):
        rr = dict(r)
        rr["cluster_id"] = f"c{lab}" if lab >= 0 else "c-1"
        out.append(rr)
    return out


