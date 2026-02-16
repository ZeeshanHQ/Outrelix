import logging
from dataclasses import dataclass, field
from typing import List, Optional

logger = logging.getLogger(__name__)


@dataclass
class EmailValidation:
    is_valid: bool = False
    is_disposable: bool = False
    mx_found: bool = False
    deliverability: str = "unknown"  # high|medium|low|unknown


@dataclass
class EmailFound:
    email: str
    source: str  # contact_page_extractor | hunter | ai_predicted | dry_run_mock
    validation: Optional[EmailValidation] = None


@dataclass
class Company:
    company_id: str
    company_name: Optional[str] = None
    domain: Optional[str] = None
    website_url: Optional[str] = None

    phone_raw: Optional[str] = None
    phone_e164: Optional[str] = None
    phone_valid: Optional[bool] = None
    phone_type: Optional[str] = None  # landline|voip|mobile|unknown

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip: Optional[str] = None

    categories: List[str] = field(default_factory=list)
    source_tags: List[str] = field(default_factory=list)

    rating: Optional[float] = None
    review_count: Optional[int] = None

    enrichment_employee_count: Optional[int] = None
    enrichment_industry: Optional[str] = None
    enrichment_linkedin_url: Optional[str] = None

    emails_found: List[EmailFound] = field(default_factory=list)
    primary_email: Optional[str] = None

    ai_email_pattern: Optional[str] = None
    ai_outreach_line: Optional[str] = None
    lead_score: Optional[int] = None

    def normalize_strings(self) -> None:
        if self.company_name:
            self.company_name = self.company_name.strip()
        if self.domain:
            self.domain = self.domain.strip().lower()
        if self.website_url:
            self.website_url = self.website_url.strip()
        if self.address:
            self.address = self.address.strip()
        if self.city:
            self.city = self.city.strip()
        if self.state:
            self.state = self.state.strip()
        if self.country:
            self.country = self.country.strip()
        if self.zip:
            self.zip = self.zip.strip()

    def add_email(self, email: str, source: str, validation: Optional[EmailValidation] = None) -> None:
        self.emails_found.append(EmailFound(email=email.strip().lower(), source=source, validation=validation))

    def log_dry_run(self, dry_run: bool) -> None:
        if dry_run:
            logger.info("DRY_RUN active in Company model for company_id=%s", self.company_id)
