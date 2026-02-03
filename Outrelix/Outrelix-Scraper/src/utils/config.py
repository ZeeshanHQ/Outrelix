import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv


@dataclass
class Config:
    queries: list
    geo: str
    category: str
    limit: int
    enable_overpass: bool
    enable_yelp: bool
    enable_yellowpages: bool
    enable_clearbit: bool
    push_to_gsheets: bool
    dry_run: bool
    enable_embed_scoring: bool
    enable_embed_dedupe: bool

    rapidapi_key: Optional[str]
    google_maps_extractor_host: Optional[str]
    google_maps_extractor_base: Optional[str]
    yelp_api_key: Optional[str]
    yellowpages_host: Optional[str]
    contact_extractor_host: Optional[str]
    contact_extractor_rapidapi_key: Optional[str]
    contact_extractor_rapidapi_host: Optional[str]
    contact_extractor_base_url: Optional[str]
    contact_extractor_backup_key: Optional[str]
    hunter_api_key: Optional[str]
    clearbit_api_key: Optional[str]
    clearbit_rapid_host: Optional[str]
    clearbit_rapid_base_url: Optional[str]
    arjos_email_validator_host: Optional[str]
    rapid_email_validator_host: Optional[str]
    rapid_email_validator_base: Optional[str]
    phone_validator_host: Optional[str]
    openrouter_api_key: Optional[str]

    google_service_account_json: Optional[str]
    gsheets_spreadsheet_url: Optional[str]

    # LinkedIn Data API (RapidAPI)
    linkedin_host: Optional[str]
    linkedin_base_url: Optional[str]
    fetch_cache_ttl_seconds: int
    enable_hf_models: bool
    email_validator_enabled: bool
    email_validator_network: bool


def str_to_bool(value: Optional[str]) -> bool:
    if value is None:
        return False
    return value.strip().lower() in {"1", "true", "yes", "y"}


def load_config_from_env_and_args(args) -> Config:
    load_dotenv(override=False)

    # Defaults - configurable
    default_queries = os.getenv("QUERIES", "business,company,services")
    queries = [q.strip() for q in (args.queries or default_queries).split(",") if q.strip()]
    geo = args.geo or os.getenv("GEO", "USA")
    category = args.category or os.getenv("CATEGORY", "General Business")
    limit = int(args.limit or os.getenv("LIMIT", 1000) or 1000)

    enable_overpass = bool(getattr(args, "enable_overpass", None)) if getattr(args, "enable_overpass", None) is not None else str_to_bool(os.getenv("ENABLE_OVERPASS", "true"))
    enable_yelp = bool(args.enable_yelp) if args.enable_yelp is not None else str_to_bool(os.getenv("ENABLE_YELP", "true"))
    enable_yellowpages = bool(args.enable_yellowpages) if args.enable_yellowpages is not None else str_to_bool(os.getenv("ENABLE_YELLOWPAGES", "false"))
    enable_clearbit = bool(args.enable_clearbit) if args.enable_clearbit is not None else str_to_bool(os.getenv("ENABLE_CLEARBIT", "true"))
    push_to_gsheets = bool(args.push_to_gsheets) if args.push_to_gsheets is not None else str_to_bool(os.getenv("PUSH_TO_GSHEETS", "false"))
    dry_run = bool(args.dry_run) if args.dry_run is not None else str_to_bool(os.getenv("DRY_RUN", "true"))
    enable_embed_scoring = bool(getattr(args, "enable_embed_scoring", None)) if getattr(args, "enable_embed_scoring", None) is not None else str_to_bool(os.getenv("ENABLE_EMBED_SCORING", "false"))
    enable_embed_dedupe = bool(getattr(args, "enable_embed_dedupe", None)) if getattr(args, "enable_embed_dedupe", None) is not None else str_to_bool(os.getenv("ENABLE_EMBED_DEDUPE", "false"))

    return Config(
        queries=queries,
        geo=geo,
        category=category,
        limit=limit,
        enable_overpass=enable_overpass,
        enable_yelp=enable_yelp,
        enable_yellowpages=enable_yellowpages,
        enable_clearbit=enable_clearbit,
        push_to_gsheets=push_to_gsheets,
        dry_run=dry_run,
        enable_embed_scoring=enable_embed_scoring,
        enable_embed_dedupe=enable_embed_dedupe,
        rapidapi_key=os.getenv("RAPIDAPI_KEY"),
        google_maps_extractor_host=os.getenv("GOOGLE_MAPS_EXTRACTOR_HOST"),
        google_maps_extractor_base=os.getenv("GOOGLE_MAPS_EXTRACTOR_BASE"),
        yelp_api_key=os.getenv("YELP_API_KEY"),
        yellowpages_host=os.getenv("YELLOWPAGES_HOST"),
        contact_extractor_host=os.getenv("CONTACT_EXTRACTOR_HOST"),
        contact_extractor_rapidapi_key=os.getenv("CONTACT_EXTRACTOR_RAPIDAPI_KEY"),
        contact_extractor_rapidapi_host=os.getenv("CONTACT_EXTRACTOR_RAPIDAPI_HOST"),
        contact_extractor_base_url=os.getenv("CONTACT_EXTRACTOR_BASE_URL"),
        contact_extractor_backup_key=os.getenv("CONTACT_EXTRACTOR_BACKUP_KEY"),
        hunter_api_key=os.getenv("HUNTER_API_KEY"),
        clearbit_api_key=os.getenv("CLEARBIT_API_KEY"),
        clearbit_rapid_host=os.getenv("CLEARBIT_RAPID_HOST"),
        clearbit_rapid_base_url=os.getenv("CLEARBIT_RAPID_BASE_URL"),
        arjos_email_validator_host=os.getenv("ARJOS_EMAIL_VALIDATOR_HOST"),
        rapid_email_validator_host=os.getenv("RAPID_EMAIL_VALIDATOR_HOST"),
        rapid_email_validator_base=os.getenv("RAPID_EMAIL_VALIDATOR_BASE_URL"),
        phone_validator_host=os.getenv("PHONE_VALIDATOR_HOST"),
        openrouter_api_key=os.getenv("OPENROUTER_API_KEY"),
        google_service_account_json=os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON"),
        gsheets_spreadsheet_url=os.getenv("GSHEETS_SPREADSHEET_URL"),
        linkedin_host=os.getenv("LINKEDIN_SCRAPER_HOST"),
        linkedin_base_url=os.getenv("LINKEDIN_SCRAPER_BASE_URL"),
        fetch_cache_ttl_seconds=int(os.getenv("FETCH_CACHE_TTL_SECONDS", "300")),
        enable_hf_models=str_to_bool(os.getenv("ENABLE_HF_MODELS", "false")),
        email_validator_enabled=str_to_bool(os.getenv("EMAIL_VALIDATOR_ENABLED", "true")),
        email_validator_network=str_to_bool(os.getenv("EMAIL_VALIDATOR_NETWORK", "true")),
    )

