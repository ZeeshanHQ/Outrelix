import logging
from typing import Dict, List, Optional, Tuple

try:
    from transformers import pipeline  # type: ignore
except Exception:  # pragma: no cover - optional dependency for offline tests
    pipeline = None  # type: ignore

logger = logging.getLogger(__name__)


class SimpleNlpExtractor:
    def __init__(self, enable_models: bool = False):
        self.enable_models = enable_models and pipeline is not None
        self._ner = None
        self._clf = None

    def _load_pipelines(self) -> None:
        if not self.enable_models:
            return
        if self._ner is None:
            try:
                self._ner = pipeline("token-classification", model="dslim/bert-base-NER", aggregation_strategy="simple")
            except Exception as e:  # pragma: no cover
                logger.warning("Failed to load NER model: %s", e)
                self.enable_models = False
        if self._clf is None:
            try:
                self._clf = pipeline("text-classification", model="bert-base-uncased")
            except Exception as e:  # pragma: no cover
                logger.warning("Failed to load classifier model: %s", e)
                self.enable_models = False

    def extract_people_and_roles(self, text: str) -> List[Tuple[str, Optional[str]]]:
        if not text:
            return []
        self._load_pipelines()
        results: List[Tuple[str, Optional[str]]] = []
        if self.enable_models and self._ner is not None:
            try:
                ents = self._ner(text)
                for ent in ents:
                    if ent.get("entity_group") == "PER":
                        results.append((ent.get("word", "").strip(), None))
            except Exception as e:  # pragma: no cover
                logger.debug("NER inference failed: %s", e)
        # Heuristic titles
        titles = ["Owner", "Manager", "Contractor", "President", "Director", "Principal", "Head", "Supervisor"]
        for title in titles:
            if title.lower() in text.lower():
                results.append(("", title))
        # Deduplicate
        seen = set()
        uniq: List[Tuple[str, Optional[str]]] = []
        for name, role in results:
            key = (name.lower(), (role or "").lower())
            if key in seen:
                continue
            seen.add(key)
            uniq.append((name, role))
        return uniq[:10]

    def classify_contact_text(self, text: str) -> float:
        """Return confidence 0..1 that text is a real contact snippet."""
        if not text:
            return 0.0
        self._load_pipelines()
        score = 0.0
        if any(tok in text.lower() for tok in ["email", "@", "contact", "reach", "call", "phone", "owner", "manager", "contractor"]):
            score += 0.4
        if self.enable_models and self._clf is not None:
            try:
                out = self._clf(text, truncation=True, max_length=256)
                prob = out[0].get("score", 0.5)
                score += 0.4 * prob
            except Exception as e:  # pragma: no cover
                logger.debug("Classification failed: %s", e)
        return max(0.0, min(1.0, score))


