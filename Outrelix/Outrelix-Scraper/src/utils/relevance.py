import logging
from typing import Dict, Optional, List

logger = logging.getLogger(__name__)

_embedder = None


def _get_embedder():
    global _embedder
    if _embedder is not None:
        return _embedder
    try:
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        return _embedder
    except Exception as e:
        logger.warning("Embedding model not available (will fallback to heuristic): %s", e)
        _embedder = None
        return None


def _embed(text: str):
    model = _get_embedder()
    if model is None:
        return None
    try:
        return model.encode([text], normalize_embeddings=True)[0]
    except Exception as e:
        logger.warning("Embedding failed, fallback to heuristic: %s", e)
        return None


def _cosine(a, b) -> float:
    try:
        import numpy as np
        return float(np.dot(a, b))
    except Exception:
        return 0.0


def relevance_score(company: Dict, queries: List[str], category: str, enable_embeddings: bool = False) -> float:
    """Compute a relevance score (0..1) comparing company text to user queries/category.

    If embeddings are enabled and available, use cosine similarity; otherwise use heuristics.
    """
    # Build texts
    query_text = " ".join(queries or [])
    query_text = f"{query_text} {category}".strip()

    parts = [
        company.get("company_name") or "",
        company.get("enrichment_industry") or "",
        " ".join(company.get("categories") or []),
        " ".join(company.get("source_tags") or []),
    ]
    company_text = " ".join([p for p in parts if p]).strip()

    # Heuristic fallback
    def heuristic():
        score = 0.0
        cq = query_text.lower()
        ct = company_text.lower()
        if not cq or not ct:
            return 0.0
        for term in queries or []:
            t = term.lower().strip()
            if t and t in ct:
                score += 0.2
        if category.lower() in ct:
            score += 0.3
        if company.get("enrichment_industry") and category.lower() in (company.get("enrichment_industry") or "").lower():
            score += 0.3
        return max(0.0, min(1.0, score))

    if not enable_embeddings:
        return heuristic()

    q_emb = _embed(query_text)
    c_emb = _embed(company_text)
    if q_emb is None or c_emb is None:
        return heuristic()

    sim = _cosine(q_emb, c_emb)
    # Normalize cosine (-1..1) to 0..1
    return max(0.0, min(1.0, (sim + 1.0) / 2.0))



