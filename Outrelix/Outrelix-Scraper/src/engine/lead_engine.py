import asyncio
import logging
import re
from typing import Any, Dict, List, Tuple, Iterable

from src.ai.nlp import SimpleNlpExtractor
from src.scraper.web import scrape_website
from src.storage.db import save_leads

logger = logging.getLogger(__name__)


async def search_businesses(keywords: str, location: str) -> List[Dict[str, Any]]:
    logger.info("search_businesses keywords=%s location=%s", keywords, location)
    try:
        from src.utils.config import load_config_from_env_and_args
        from src.apis.google_maps_extractor import GoogleMapsExtractor
        from src.apis.yelp import YelpClient
        class Args:  # minimal args to satisfy loader
            queries = [keywords]
            geo = location or "USA"
            category = ""
            limit = 30
            enable_yelp = True
            enable_yellowpages = False
            enable_clearbit = False
            push_to_gsheets = False
            dry_run = False
        cfg = load_config_from_env_and_args(Args)
        gmaps = GoogleMapsExtractor(
            host=cfg.google_maps_extractor_host or "",
            base_path=cfg.google_maps_extractor_base or "/search",
            rapidapi_key=cfg.rapidapi_key or "",
            dry_run=cfg.dry_run,
        )
        yelp = YelpClient(api_key=cfg.yelp_api_key or "", dry_run=(cfg.dry_run or not cfg.enable_yelp))
        gmaps_res, yelp_res = await asyncio.gather(
            gmaps.search([keywords], cfg.geo, cfg.limit),
            yelp.search([keywords], cfg.geo, cfg.limit) if cfg.enable_yelp else asyncio.sleep(0, result=[]),
        )
        # Simple merge: prefer gmaps website when available
        items: List[Dict[str, Any]] = []
        seen = set()
        for r in gmaps_res + yelp_res:
            name = r.get("name") or ""
            website = r.get("website") or r.get("domain") or ""
            key = (name.lower(), website.lower())
            if key in seen:
                continue
            seen.add(key)
            items.append({"name": name, "website": website, "source": r.get("source", "search")})
        if items:
            return items[: cfg.limit]
    except Exception as e:  # noqa: BLE001
        logger.debug("search_businesses fallback to mock: %s", e)
    base = re.sub(r"[^a-z0-9]+", "", keywords.lower()) or "business"
    return [{"name": f"{keywords} Co {i}", "website": f"https://www.{base}{i}.com", "source": "mock"} for i in range(1, 4)]


async def _scrape_one_business(biz: Dict[str, Any]) -> List[Dict[str, Any]]:
    site = biz.get("website") or ""
    contacts = await scrape_website(site)
    rows: List[Dict[str, Any]] = []
    for email in contacts.get("emails", []):
        rows.append({
            "name": "",
            "role": "",
            "company": biz.get("name"),
            "email": email,
            "phone": "",
            "website": site,
            "source": "ai_web",
            "confidence": 0.6,
        })
    for phone in contacts.get("phones", []):
        rows.append({
            "name": "",
            "role": "",
            "company": biz.get("name"),
            "email": "",
            "phone": phone,
            "website": site,
            "source": "ai_web",
            "confidence": 0.5,
        })
    return rows


async def _retry(coro_fn, *args, retries: int = 3, delay: float = 0.5, **kwargs):
    last_exc = None
    for attempt in range(retries):
        try:
            return await coro_fn(*args, **kwargs)
        except Exception as e:  # noqa: BLE001
            last_exc = e
            await asyncio.sleep(delay * (2 ** attempt))
    if last_exc:
        raise last_exc
    return None


async def process_keyword_location(keywords: str, location: str) -> List[Dict[str, Any]]:
    businesses = await _retry(search_businesses, keywords, location)
    rows: List[Dict[str, Any]] = []
    for biz in businesses:
        rows.extend(await _retry(_scrape_one_business, biz))
    return rows


async def batch_scrape(
    tasks: Iterable[Tuple[str, str]],
    concurrency: int = 5,
    rate_limit_per_sec: float = 2.0,
) -> List[Dict[str, Any]]:
    """Process multiple (keywords, location) tasks concurrently with rate limiting.

    - concurrency: max simultaneous keyword/location pipelines
    - rate_limit_per_sec: approximate per-task start rate
    """
    sem = asyncio.Semaphore(concurrency)
    results: List[Dict[str, Any]] = []
    lock = asyncio.Lock()

    async def worker(kw: str, loc: str):
        async with sem:
            try:
                out = await process_keyword_location(kw, loc)
                cleaned = clean_and_validate_data(out)
                async with lock:
                    results.extend(cleaned)
            finally:
                # basic pacing between task starts
                await asyncio.sleep(max(0.0, 1.0 / rate_limit_per_sec))

    coros = [worker(kw, loc) for kw, loc in tasks]
    await asyncio.gather(*coros)
    return results


async def scrape_website_contacts(website: str) -> Dict[str, List[str]]:
    return await scrape_website(website)


def extract_contacts_with_ai(text_blocks: List[str]) -> List[Tuple[str, str]]:
    nlp = SimpleNlpExtractor(enable_models=False)
    results: List[Tuple[str, str]] = []
    for text in text_blocks:
        pairs = nlp.extract_people_and_roles(text)
        for name, role in pairs:
            results.append((name, role or ""))
    # Deduplicate
    uniq: List[Tuple[str, str]] = []
    seen = set()
    for name, role in results:
        key = (name.lower(), role.lower())
        if key in seen:
            continue
        seen.add(key)
        uniq.append((name, role))
    return uniq[:50]


def clean_and_validate_data(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cleaned: List[Dict[str, Any]] = []
    for row in rows:
        email = (row.get("email") or "").strip()
        phone = (row.get("phone") or "").strip()
        name = (row.get("name") or "").strip()
        role = (row.get("role") or "").strip()
        company = (row.get("company") or row.get("company_name") or row.get("name") or "").strip()
        website = (row.get("website") or "").strip()
        source = (row.get("source") or "web").strip()
        confidence = float(row.get("confidence") or 0.5)
        if not (email or phone):
            continue
        cleaned.append({
            "full_name": name,
            "role": role,
            "company": company,
            "email": email,
            "phone": phone,
            "website": website,
            "source": source,
            "confidence": max(0.0, min(1.0, confidence)),
        })
    return cleaned


def save_to_db(rows: List[Dict[str, Any]]) -> int:
    tuples: List[Tuple[Any, ...]] = []
    for r in rows:
        tuples.append((r.get("full_name"), r.get("role"), r.get("company"), r.get("email"), r.get("phone"), r.get("website"), r.get("source"), r.get("confidence")))
    return save_leads(tuples)


def export_csv(rows: List[Dict[str, Any]], path: str) -> str:
    import csv
    from pathlib import Path

    Path(path).parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["full_name", "role", "company", "email", "phone", "website", "source", "confidence"]
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k, "") for k in fieldnames})
    return path


