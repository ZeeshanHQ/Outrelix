import logging
import random
from typing import Dict, List

from src.utils.hashing import generate_company_id
from src.utils.phone import normalize_phone

logger = logging.getLogger(__name__)


_COMPANY_NAMES = [
    "Premier Roofing", "Elite Roofing Solutions", "Apex Roofing", "Summit Roofing", "Peak Roofing",
    "Crown Roofing", "Royal Roofing", "Noble Roofing", "Superior Roofing", "Excellence Roofing",
    "Pro Roofing", "Master Roofing", "Expert Roofing", "Quality Roofing", "Reliable Roofing",
    "Trusted Roofing", "Dependable Roofing", "Solid Roofing", "Sturdy Roofing", "Strong Roofing",
    "Best Roofing", "Top Roofing", "First Choice Roofing", "Preferred Roofing",
    "Roofing Masters", "Roofing Experts", "Roofing Specialists", "Roofing Professionals",
]

_DOMAINS = [
    "premierroofing.com", "eliteroofing.com", "apexroofing.net", "summitroofing.co",
    "peakroofing.com", "crownroofing.net", "royalroofing.com", "nobleroofing.co",
    "superiorroofing.com", "excellenceroofing.net", "proroofing.com", "masterroofing.co",
    "expertroofing.com", "qualityroofing.net", "reliableroofing.com", "trustedroofing.co",
    "dependableroofing.com", "solidroofing.net", "sturdyroofing.com", "strongroofing.co",
    "bestroofing.com", "toproofing.net", "firstchoiceroofing.com", "preferredroofing.co",
    "roofingmasters.com", "roofingexperts.net", "roofingspecialists.com", "roofingpros.co",
]


def generate_mock_companies(seed: str, count: int, source_tag: str, start_index: int = 0) -> List[Dict]:
    rnd = random.Random(seed + f"-{source_tag}-{start_index}-{count}")
    results: List[Dict] = []
    for i in range(count):
        name = rnd.choice(_COMPANY_NAMES)
        domain = rnd.choice(_DOMAINS) if rnd.random() > 0.1 else None
        phone_raw = f"({rnd.randint(200, 989)}) {rnd.randint(200, 999)}-{rnd.randint(1000, 9999)}" if rnd.random() > 0.2 else None
        phone_e164, is_valid, phone_type = normalize_phone(phone_raw or "", default_region="US", dry_run=True)
        website_url = f"https://{domain}" if domain and rnd.random() > 0.15 else None
        city = rnd.choice(["New York", "San Francisco", "Austin", "Seattle", "Chicago", None])
        state = rnd.choice(["NY", "CA", "TX", "WA", "IL", None])
        rating = round(rnd.uniform(3.0, 5.0), 1) if rnd.random() > 0.3 else None
        review_count = rnd.randint(0, 500) if rating is not None else None

        owner_first = rnd.choice(["Mike","John","David","Robert","James","William","Richard","Thomas","Charles","Daniel"]) if rnd.random() > 0.3 else None
        owner_last = rnd.choice(["Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez"]) if owner_first else None

        company = {
            "company_id": generate_company_id(domain or name, phone_e164 or "", dry_run=True),
            "company_name": name,
            "domain": domain,
            "website_url": website_url,
            "phone_raw": phone_raw,
            "phone_e164": phone_e164,
            "phone_valid": is_valid,
            "phone_type": phone_type,
            "city": city,
            "state": state,
            "country": "USA",
            "categories": ["Roofing", "Construction", "Home Improvement" if rnd.random() > 0.5 else "Contractor"],
            "source_tags": [source_tag],
            "rating": rating,
            "review_count": review_count,
            "emails_found": [
                {"email": f"{(owner_first or 'info').lower()}.{(owner_last or 'team').lower()}@{domain}" if domain else None,
                 "source": "contact_page_extractor", "validation": {"deliverability": rnd.choice(["high","medium","low"])}}
            ],
            "owner_name": (f"{owner_first} {owner_last}" if owner_first and owner_last else None),
        }
        results.append(company)

    if count >= 5:
        first = results[0].copy()
        first["company_name"] = (first.get("company_name") or "") + " Inc"
        results.append(first)
    return results
