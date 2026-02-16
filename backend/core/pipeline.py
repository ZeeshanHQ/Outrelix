import asyncio
import json
import logging
import os
from typing import Dict, List, Tuple

import pandas as pd

from src.apis.clearbit import ClearbitClient
from src.apis.contact_extractor import ContactExtractor
from src.apis.email_validator_arjos import ArjosEmailValidator
from src.apis.email_validator_rapid import RapidEmailValidator
from src.apis.google_maps_extractor import GoogleMapsExtractor
from src.apis.google_maps_direct import GoogleMapsDirectExtractor
from src.apis.contact_extractor_direct import ContactExtractorDirect
from src.apis.hunter import HunterClient
from src.apis.yelp import YelpClient
from src.apis.yellowpages import YellowPagesClient
from src.apis.linkedin_data import LinkedInDataApi
from src.apis.overpass import OverpassClient
from src.core.ai_enrich import enrich_records
from src.core.merge import merge_sources
from src.utils.selection import choose_primary_email
from src.utils.writers import write_csv, write_excel
from src.engine.email_validator import validate_batch as local_validate_batch
from src.utils.sheets import create_sheets_writer
from src.utils.analytics import create_analytics_engine
from src.utils.enrichment_cache import get_enrichment_cache, set_enrichment_cache
from src.storage.db import dedupe_conn

logger = logging.getLogger(__name__)


class Pipeline:
    def __init__(self, config, run_dir: str):
        self.config = config
        self.run_dir = run_dir
        self.analytics_engine = create_analytics_engine()
        self.mock_warnings: List[str] = []
        self.validation_strategy: str = "unknown"

    async def source_businesses(self) -> Tuple[List[Dict], Dict[str, int]]:
        queries = self.config.queries
        geo = self.config.geo
        limit = self.config.limit


        # Treat free_mode as "no paid calls"
        dry = self.config.dry_run or self.config.free_mode

        if self.config.free_mode:
            logger.info("FREE MODE: Using GoogleMapsDirectExtractor (Playwright)")
            gmaps = GoogleMapsDirectExtractor(dry_run=self.config.dry_run)
            # In free mode, we skip Yelp/YP unless we build direct scrapers for them too.
            # For now, disable them to avoid RapidAPI errors.
            yelp = YelpClient(api_key="", dry_run=True)
            yellow = YellowPagesClient(host="", rapidapi_key="", dry_run=True)
            overpass = OverpassClient(dry_run=True)
        else:
            gmaps = GoogleMapsExtractor(
                host=self.config.google_maps_extractor_host or "",
                base_path=self.config.google_maps_extractor_base or "/search",
                rapidapi_key=self.config.rapidapi_key or "",
                dry_run=dry,
            )
            yelp = YelpClient(api_key=self.config.yelp_api_key or "", dry_run=(dry or not self.config.enable_yelp))
            yellow = YellowPagesClient(host=self.config.yellowpages_host or "", rapidapi_key=self.config.rapidapi_key or "", dry_run=(dry or not self.config.enable_yellowpages))
            overpass = OverpassClient(dry_run=(dry or not getattr(self.config, "enable_overpass", True)))

        # Track mock usage for transparency
        if getattr(gmaps, "dry_run", False) and not self.config.free_mode:
            self.mock_warnings.append("google_maps_mocked")
        if getattr(yelp, "dry_run", False):
            self.mock_warnings.append("yelp_mocked_or_disabled")
        if getattr(yellow, "dry_run", False):
            self.mock_warnings.append("yellowpages_mocked_or_disabled")
        if getattr(overpass, "dry_run", False):
            self.mock_warnings.append("overpass_mocked_or_disabled")

        results = await asyncio.gather(
            gmaps.search(queries, geo, limit),
            yelp.search(queries, geo, limit) if not self.config.free_mode and self.config.enable_yelp else asyncio.sleep(0, result=[]),
            yellow.search(queries, geo, limit) if not self.config.free_mode and self.config.enable_yellowpages else asyncio.sleep(0, result=[]),
            overpass.search(queries, geo, limit) if not self.config.free_mode and getattr(self.config, "enable_overpass", True) else asyncio.sleep(0, result=[]),
        )
        gmaps_res, yelp_res, yellow_res, overpass_res = results
        merged, metrics = merge_sources(
            gmaps_res,
            yelp_res,
            yellow_res,
            overpass_res,
            dry_run=dry,
            enable_embed_dedupe=getattr(self.config, "enable_embed_dedupe", False),
        )
        logger.info("SOURCING metrics: %s", metrics)
        return merged, metrics


    async def find_emails_and_validate(self, companies: List[Dict]) -> Tuple[List[Dict], List[Dict], List[Dict]]:
        dry = self.config.dry_run or self.config.free_mode
        
        if self.config.free_mode:
             # Use Direct Extractor
             contact = ContactExtractorDirect(dry_run=self.config.dry_run)
        else:
            contact = ContactExtractor(
                host=self.config.contact_extractor_rapidapi_host or "",
                base_url=self.config.contact_extractor_base_url or "",
                rapidapi_key=self.config.contact_extractor_rapidapi_key or "",
                backup_key=self.config.contact_extractor_backup_key,
                dry_run=dry
            )

        hunter = HunterClient(api_key=self.config.hunter_api_key or "", dry_run=(dry or not self.config.hunter_api_key))

        primary_validator = RapidEmailValidator(
            host=self.config.rapid_email_validator_host or "",
            base_url="https://" + (self.config.rapid_email_validator_host or "email-validator-api.p.rapidapi.com"),
            rapidapi_key=self.config.rapidapi_key or "",
            dry_run=dry,
        )
        fallback_validator = ArjosEmailValidator(host=self.config.arjos_email_validator_host or "", rapidapi_key=self.config.rapidapi_key or "", dry_run=dry)

        raw_contacts: List[Dict] = []
        validated_emails: List[Dict] = []
        local_validation_cache: Dict[str, Dict] = {}

        async def enrich_company(c: Dict) -> Dict:
            website = c.get("website")
            domain = c.get("domain")
            emails: List[Dict] = []
            
            # Try contact extraction from website if available
            # Try contact extraction from website if available
            if website:
                if self.config.free_mode:
                    # Direct extractor returns a slightly different format (already list of emails)
                    # But let's check the implementation of ContactExtractorDirect.extract_contacts returns Dict with 'emails' list.
                    contact_data = await contact.extract_contacts(website)
                    if contact_data.get("extraction_success"):
                        for email in contact_data.get("emails", []):
                             emails.append({
                                "email": email,
                                "source": "contact_extractor_direct"
                            })
                        c["phones_found"] = contact_data.get("phones", [])
                        c["social_links"] = contact_data.get("social_links", {})
                else:
                    contact_data = await contact.extract_contacts(website)
                    if contact_data.get("extraction_success"):
                        # Convert contact extractor format to our email format
                        for email in contact_data.get("emails", []):
                            emails.append({
                                "email": email,
                                "source": "contact_extractor"
                            })
                            # Also add phones and social links to company data
                        c["phones_found"] = contact_data.get("phones", [])
                        c["social_links"] = contact_data.get("social_links", {})
            
            # Fallback to Hunter.io if no emails found
            if not emails and domain:
                emails += await hunter.domain_search(domain)
            
            # Record raw contacts
            for e in emails:
                raw_contacts.append({
                    "company_id": c.get("company_id"), 
                    "email": e.get("email"), 
                    "source": e.get("source")
                })
            
            # Validate emails
            validated = []
            email_list = [e["email"] for e in emails if e.get("email")]

            # Decide validation strategy
            use_local = self.config.free_mode or not self.config.rapidapi_key
            self.validation_strategy = "local_mx_smtp" if use_local else "rapidapi_arjos"
            if contact.dry_run:
                self.mock_warnings.append("contact_extractor_mocked")
            if hunter.dry_run:
                self.mock_warnings.append("hunter_mocked")
            if use_local:
                self.mock_warnings.append("email_validation_local_only")
            if use_local and email_list:
                # Batch validate locally to minimize lookups
                to_validate = [e for e in email_list if e not in local_validation_cache]
                if to_validate:
                    local_results = await local_validate_batch(to_validate, concurrency=10)
                    for res in local_results:
                        local_validation_cache[res["email"]] = res
                for e in emails:
                    v = local_validation_cache.get(e["email"], {"is_valid": False, "reason": "not_validated"})
                    rec = {**e, "validation": v}
                    validated.append(rec)
                    validated_emails.append({"company_id": c.get("company_id"), **rec})
            else:
                for e in emails:
                    v = await primary_validator.validate(e["email"])
                    if not v.get("is_valid") and not self.config.dry_run:
                        v = await fallback_validator.validate(e["email"])
                    if primary_validator.dry_run:
                        self.mock_warnings.append("rapid_email_validator_mocked")
                    rec = {**e, "validation": v}
                    validated.append(rec)
                    validated_emails.append({"company_id": c.get("company_id"), **rec})
            
            c["emails_found"] = validated
            c["primary_email"] = choose_primary_email(validated)
            return c

        # Parallel processing with concurrency control
        semaphore = asyncio.Semaphore(10)  # Max 10 concurrent email extractions
        
        async def enrich_company_with_semaphore(c: Dict) -> Dict:
            async with semaphore:
                return await enrich_company(c)
        
        enriched = await asyncio.gather(*[enrich_company_with_semaphore(c) for c in companies])
        return enriched, raw_contacts, validated_emails

    async def apply_enrichment(self, companies: List[Dict]) -> List[Dict]:
        dry = self.config.dry_run or self.config.free_mode
        clearbit = ClearbitClient(
            api_key=self.config.clearbit_api_key or "",
            dry_run=(dry or not self.config.enable_clearbit),
            rapid_host=self.config.clearbit_rapid_host,
            rapid_base=self.config.clearbit_rapid_base_url,
            rapidapi_key=self.config.rapidapi_key,
        )
        linkedin = LinkedInDataApi(
            host=self.config.linkedin_host or "",
            base_url=self.config.linkedin_base_url or "https://linkedin-data-api.p.rapidapi.com",
            rapidapi_key=self.config.rapidapi_key or "",
            dry_run=dry,
        )
        if clearbit.dry_run or not self.config.enable_clearbit:
            self.mock_warnings.append("clearbit_mocked_or_disabled")
        if linkedin.dry_run:
            self.mock_warnings.append("linkedin_mocked")
        # Parallel processing with concurrency control for enrichment
        semaphore = asyncio.Semaphore(5)  # Max 5 concurrent enrichments (more API-heavy)
        
        async def enrich_single_company(c: Dict) -> Dict:
            async with semaphore:
                domain = c.get("domain")
                if not domain:
                    return c
                
                domain = domain.lower().strip()
                
                # Check cache first
                cached_clearbit = get_enrichment_cache(domain, "clearbit")
                cached_linkedin = get_enrichment_cache(domain, "linkedin")
                
                # Only make API calls if not cached
                li_enrich = cached_linkedin if cached_linkedin else None
                cb_enrich = cached_clearbit if cached_clearbit else None
                
                if not cached_linkedin or not cached_clearbit:
                    # Make API calls for missing data
                    tasks = []
                    if not cached_linkedin and not linkedin.dry_run:
                        tasks.append(("linkedin", linkedin.get_company_by_domain(domain)))
                    if not cached_clearbit and not clearbit.dry_run:
                        tasks.append(("clearbit", clearbit.enrich_company(domain)))
                    
                    if tasks:
                        results = await asyncio.gather(*[task[1] for task in tasks], return_exceptions=True)
                        for (provider, _), result in zip(tasks, results):
                            if isinstance(result, Exception):
                                logger.warning("%s enrichment failed for %s: %s", provider, domain, result)
                                if provider == "linkedin":
                                    li_enrich = {}
                                else:
                                    cb_enrich = {}
                            else:
                                # Cache successful results
                                if provider == "linkedin":
                                    li_enrich = result or {}
                                    if result:
                                        set_enrichment_cache(domain, "linkedin", result)
                                else:
                                    cb_enrich = result or {}
                                    if result:
                                        set_enrichment_cache(domain, "clearbit", result)
                
                # Use cached or fetched data
                if li_enrich is None:
                    li_enrich = {}
                if cb_enrich is None:
                    cb_enrich = {}
                
                enrich = {**cb_enrich, **li_enrich} if li_enrich else cb_enrich
                c.update(enrich)
                    
                # Attempt to find decision-makers quickly
                try:
                    people = await linkedin.search_people(
                        keywords="owner OR founder OR ceo OR president OR manager OR contractor",
                        company=c.get("company_name") or c.get("domain"),
                        geo="103644278",  # US
                        start=0,
                    )
                    c["linkedin_contacts"] = people.get("people") or []
                except Exception as e:
                        logger.warning("LinkedIn people search failed for %s: %s", c.get("domain"), e)
                        c["linkedin_contacts"] = []
                return c
        
        # Process all companies in parallel
        out = await asyncio.gather(*[enrich_single_company(c) for c in companies], return_exceptions=True)
        
        # Filter out exceptions and log them
        enriched_companies = []
        for i, result in enumerate(out):
            if isinstance(result, Exception):
                logger.error("Failed to enrich company %s: %s", companies[i].get("company_name", "unknown"), result)
                # Keep the original company data even if enrichment failed
                enriched_companies.append(companies[i])
            else:
                enriched_companies.append(result)
        
        out = enrich_records(
            enriched_companies,
            dry_run=dry,
            queries=self.config.queries,
            category=self.config.category,
            enable_embed_scoring=getattr(self.config, "enable_embed_scoring", False),
        )
        return out

    def write_final(self, records: List[Dict], raw_businesses: List[Dict], raw_contacts: List[Dict], validated_emails: List[Dict], timestamp: str) -> None:
        write_csv(pd.DataFrame(raw_businesses), os.path.join(self.run_dir, "raw_businesses.csv"), dry_run=self.config.dry_run)
        write_csv(pd.DataFrame(raw_contacts), os.path.join(self.run_dir, "raw_contacts.csv"), dry_run=self.config.dry_run)
        write_csv(pd.DataFrame(validated_emails), os.path.join(self.run_dir, "validated_emails.csv"), dry_run=self.config.dry_run)

        rows = []
        for r in records:
            rows.append({
                "company_id": r.get("company_id"),
                "name": r.get("company_name"),
                "website": r.get("website_url"),
                "phone_normalized": r.get("phone_e164"),
                "emails_validated": ";".join([e.get("email") for e in r.get("emails_found", []) if e.get("validation", {}).get("is_valid")]),
                "industry": r.get("enrichment_industry"),
                "size": r.get("enrichment_employee_count"),
                "linkedin": r.get("enrichment_linkedin_url"),
                "lead_score": r.get("lead_score"),
                "ai_outreach": r.get("ai_outreach_line"),
                "source_flags": ";".join(r.get("source_tags") or []),
            })
        df_final = pd.DataFrame(rows)

        if self.config.dry_run:
            xlsx_path = os.path.join(self.run_dir, "verified_leads_dryrun.xlsx")
            write_excel({f"run_{timestamp}": df_final.head(5).assign(DRY_RUN=True)}, xlsx_path, dry_run=True)
        else:
            xlsx_path = os.path.join(self.run_dir, "verified_leads.xlsx")
            write_excel({f"run_{timestamp}": df_final}, xlsx_path, dry_run=False)

        # Google Sheets push
        if self.config.push_to_gsheets:
            sheets_writer = create_sheets_writer(self.config, self.config.dry_run)
            if sheets_writer:
                # Prepare data for Google Sheets
                sheets_data = {
                    "RAW_BUSINESSES": pd.DataFrame(raw_businesses),
                    "RAW_CONTACTS": pd.DataFrame(raw_contacts),
                    "VALIDATED": pd.DataFrame(validated_emails),
                    "FINAL": df_final
                }
                
                # Write to Google Sheets
                results = sheets_writer.write_multiple_tabs(sheets_data)
                
                if all(results.values()):
                    logger.info("Successfully pushed all data to Google Sheets")
                else:
                    failed_tabs = [tab for tab, success in results.items() if not success]
                    logger.error(f"Failed to push tabs to Google Sheets: {failed_tabs}")
            else:
                logger.warning("Google Sheets integration not available")
        
        # Generate advanced analytics report
        analytics_report = self.analytics_engine.generate_performance_report(records)
        analytics_path = os.path.join(self.run_dir, "advanced_analytics.json")
        self.analytics_engine.export_analytics_report(analytics_report, analytics_path)
        
        logger.info("Advanced analytics report generated and exported")

    def write_summary(self, sourcing_metrics: Dict[str, int], companies: List[Dict], timestamp: str, dedup_skipped: int = 0) -> Dict:
        total = len(companies)
        emails_total = sum(len(r.get("emails_found", [])) for r in companies)
        emails_valid = sum(1 for r in companies for e in r.get("emails_found", []) if e.get("validation", {}).get("is_valid"))
        phones_valid = sum(1 for r in companies if r.get("phone_valid"))
        top_sources: Dict[str, int] = {}
        for r in companies:
            for s in r.get("source_tags") or []:
                top_sources[s] = top_sources.get(s, 0) + 1
        # Add rate limit statistics
        rate_limit_stats = {}
        if not self.config.dry_run:
            from src.utils.rate_limiter import get_rate_limiter
            limiter = get_rate_limiter()
            providers = ["google_maps", "yelp", "contact_extractor", "email_validator", "yellowpages"]
            for provider in providers:
                stats = limiter.get_stats(provider)
                if stats["requests_last_minute"] > 0 or stats["requests_last_hour"] > 0:
                    rate_limit_stats[provider] = stats
        
        summary = {
            "run": f"run_{timestamp}",
            "flags": {
                "free_mode": bool(getattr(self.config, "free_mode", False)),
                "dry_run": bool(self.config.dry_run),
                "enable_overpass": bool(getattr(self.config, "enable_overpass", False)),
                "enable_yelp": bool(self.config.enable_yelp),
                "enable_yellowpages": bool(self.config.enable_yellowpages),
                "enable_clearbit": bool(self.config.enable_clearbit),
                "enable_embed_scoring": bool(getattr(self.config, "enable_embed_scoring", False)),
                "enable_embed_dedupe": bool(getattr(self.config, "enable_embed_dedupe", False)),
            },
            "validation_strategy": self.validation_strategy or ("local_mx_smtp" if self.config.free_mode else "rapidapi_arjos"),
            "mocks_used": sorted(set(self.mock_warnings)) if self.mock_warnings else [],
            "sourcing": sourcing_metrics,
            "totals": {
                "companies": total,
                "emails_found": emails_total,
                "emails_valid": emails_valid,
                "valid_email_pct": round((emails_valid / emails_total) * 100, 2) if emails_total else 0.0,
                "phones_valid": phones_valid,
            },
            "top_sources": top_sources,
            "dedup": {
                "skipped": dedup_skipped,
                "kept": total,
            },
            "rate_limit_stats": rate_limit_stats if rate_limit_stats else None,
        }
        path = os.path.join(self.run_dir, "summary.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2)
        logger.info("Summary written to %s", path)
        self.send_completion_email(summary)
        return summary

    def send_completion_email(self, summary: Dict):
        """Send an email notification when the scraper finishes."""
        resend_key = os.getenv("RESEND_API_KEY")
        if not resend_key:
            return
            
        try:
            import requests
            sender = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")
            # In a real app, getting the user's email would technically require passing it in.
            # strict MVP: just send to a hardcoded or env var email for now, or the 'configured' user email
            recipient = "delivered@resend.dev" # Default for testing
            
            # Construct a nice HTML body
            html_body = f"""
            <h1>Scraper Run Completed</h1>
            <p><strong>Run ID:</strong> {summary['run']}</p>
            <p><strong>Companies Found:</strong> {summary['totals']['companies']}</p>
            <p><strong>Valid Emails:</strong> {summary['totals']['emails_valid']}</p>
            <p><strong>Valid Phones:</strong> {summary['totals']['phones_valid']}</p>
            <br>
            <p>Your results are ready in the dashboard.</p>
            """
            
            requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Outrelix Scraper <" + sender + ">",
                    "to": [recipient],
                    "subject": f"Scrape Completed: {summary['totals']['companies']} leads found",
                    "html": html_body
                },
                timeout=10
            )
            logger.info("Completion email sent.")
        except Exception as e:
            logger.error(f"Failed to send completion email: {e}")

    async def run(self, timestamp: str) -> Tuple[List[Dict], Dict[str, int]]:
        companies, sourcing_metrics = await self.source_businesses()
        raw_businesses = companies.copy()
        companies, raw_contacts, validated_emails = await self.find_emails_and_validate(companies)
        companies = await self.apply_enrichment(companies)

        # Cross-run deduplication (domain/phone)
        deduped: List[Dict] = []
        dedup_skipped = 0
        with dedupe_conn() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS seen (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    domain TEXT,
                    phone TEXT,
                    email TEXT,
                    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(domain, phone, email)
                )
                """
            )
            for c in companies:
                domain = (c.get("domain") or "").lower().strip() or None
                phone = (c.get("phone_e164") or "").strip() or None
                email = None
                # prefer validated primary email
                if c.get("primary_email"):
                    email = c.get("primary_email").strip().lower()
                elif c.get("emails_found"):
                    email = (c.get("emails_found")[0].get("email") or "").strip().lower() or None
                try:
                    conn.execute("INSERT OR IGNORE INTO seen (domain, phone, email) VALUES (?, ?, ?)", (domain, phone, email))
                    cur = conn.execute("SELECT changes()")
                    inserted = cur.fetchone()[0]
                    if inserted == 0:
                        dedup_skipped += 1
                        continue
                except Exception as e:
                    logger.warning("Dedup insert failed for %s/%s: %s", domain, phone, e)
                deduped.append(c)
            conn.commit()
        companies = deduped

        self.write_final(companies, raw_businesses, raw_contacts, validated_emails, timestamp)
        summary = self.write_summary(sourcing_metrics, companies, timestamp, dedup_skipped=dedup_skipped)

        if self.mock_warnings:
            logger.warning("Mocks/fallbacks used in run: %s", sorted(set(self.mock_warnings)))

        return companies, summary
