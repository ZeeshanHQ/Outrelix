import logging
from typing import Any, Dict, List, Tuple

from rapidfuzz import fuzz
import logging
import math

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
        logger.warning("Embedding model not available for dedupe (fallback to fuzzy): %s", e)
        _embedder = None
        return None


def _embed(text: str):
    model = _get_embedder()
    if model is None:
        return None
    try:
        return model.encode([text], normalize_embeddings=True)[0]
    except Exception as e:
        logger.warning("Embedding failed, fallback to fuzzy: %s", e)
        return None


def _cosine(a, b) -> float:
    try:
        import numpy as np
        return float(np.dot(a, b))
    except Exception:
        return 0.0

logger = logging.getLogger(__name__)


def name_similarity(a: str, b: str) -> int:
    a = (a or "").lower()
    b = (b or "").lower()
    scores = [
        fuzz.token_set_ratio(a, b),
        fuzz.partial_ratio(a, b),
        fuzz.token_sort_ratio(a, b),
    ]
    return int(max(scores))


def _pick_best(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    return sorted(records, key=lambda x: (
        int(bool(x.get("primary_email"))),
        int(bool(x.get("phone_e164"))),
        int(bool(x.get("website_url"))),
        len(x.get("source_tags") or []),
    ), reverse=True)[0]


def dedupe_companies(records: List[Dict[str, Any]], dry_run: bool = False, name_threshold: int = 88, enable_embeddings: bool = False, embed_threshold: float = 0.82) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    if dry_run:
        logger.info("DRY_RUN: fuzzy dedupe will simulate name collisions")

    # Precompute embeddings if enabled
    embeds: Dict[str, Any] = {}
    if enable_embeddings:
        for r in records:
            txt = " ".join([
                (r.get("company_name") or ""),
                (r.get("domain") or ""),
                " ".join(r.get("categories") or []),
            ]).strip()
            emb = _embed(txt)
            if emb is not None:
                embeds[id(r)] = emb

    by_key: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        key = (
            (r.get("domain") or "")
            or (r.get("phone_e164") or "")
            or (r.get("website_url") or "")
            or (r.get("company_name") or "").lower()
        )
        by_key.setdefault(key, []).append(r)

    merged: List[Dict[str, Any]] = []
    stats = {"groups": 0, "merged": 0, "kept": 0}

    for key, group in by_key.items():
        if len(group) == 1:
            merged.append(group[0])
            stats["kept"] += 1
            continue

        stats["groups"] += 1

        if key and key != (group[0].get("company_name") or "").lower():
            best = _pick_best(group)
            merged.append(best)
            stats["merged"] += len(group) - 1
            stats["kept"] += 1
            continue

        # Prefer SaaS/agency profile as anchor if present
        group_sorted = sorted(group, key=lambda r: (
            int("SaaS" in (r.get("categories") or [])),
            int("B2B" in (r.get("categories") or [])),
            len(r.get("source_tags") or [])
        ), reverse=True)
        anchor = group_sorted[0]
        similar = [anchor]
        for candidate in group_sorted[1:]:
            if name_similarity(anchor.get("company_name", ""), candidate.get("company_name", "")) >= name_threshold:
                similar.append(candidate)
                continue
            if enable_embeddings:
                a_emb = embeds.get(id(anchor))
                b_emb = embeds.get(id(candidate))
                if a_emb is not None and b_emb is not None:
                    cos = _cosine(a_emb, b_emb)
                    if cos >= embed_threshold:
                        similar.append(candidate)
                        continue

        if len(similar) > 1:
            best = _pick_best(similar)
            merged.append(best)
            stats["merged"] += len(similar) - 1
            stats["kept"] += 1
            continue

        if dry_run and len(group) >= 2:
            best = _pick_best(group[:2])
            merged.append(best)
            stats["merged"] += 1
            stats["kept"] += 1
            continue

        merged.append(group[0])
        stats["kept"] += 1

    return merged, stats
