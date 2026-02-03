import asyncio
import logging
import os
import threading
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from collections import deque

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import jwt
from pydantic import BaseModel, Field
import shutil

from src.utils.config import load_config_from_env_and_args
from src.utils.logging_setup import create_run_context, setup_logging
from src.engine.lead_engine import export_csv as engine_export_csv
from src.engine.lead_engine import save_to_db as engine_save_to_db
from src.engine.lead_engine import scrape_website_contacts as engine_scrape_website
from src.engine.lead_engine import search_businesses as engine_search
from src.engine.lead_engine import clean_and_validate_data as engine_clean
from src.engine.enrich import enrich_rows
from src.engine.lead_engine import batch_scrape as engine_batch_scrape
from src.server.continuous_api import router as continuous_router
from src.server.auth import (
    create_token, verify_token, require_auth, authenticate_employee,
    get_user_identifier
)
from src.server.usage_tracker import get_usage_tracker

logger = logging.getLogger(__name__)


class RunRequest(BaseModel):
    queries: str = Field(..., description="Comma-separated search queries")
    geo: str = Field(..., description="Geographic scope, e.g., USA")
    category: str = Field(..., description="Category, e.g., B2B Software")
    limit: int = Field(50, ge=1, le=5000)
    enable_overpass: bool = True
    enable_yelp: bool = True
    enable_yellowpages: bool = False
    enable_clearbit: bool = True
    push_to_gsheets: bool = False
    dry_run: bool = True
    free_mode: Optional[bool] = None
    enable_embed_scoring: Optional[bool] = False
    enable_embed_dedupe: Optional[bool] = False


class RunRecord(BaseModel):
    run_id: str
    created_at: str
    status: str
    message: Optional[str] = None
    run_dir: Optional[str] = None
    summary_path: Optional[str] = None
    progress: float = 0.0  # 0.0 - 1.0
    stage: Optional[str] = "queued"


def _validate_run_request(req: RunRequest) -> None:
    """Basic server-side validation to avoid bad inputs."""
    # Keywords: non-empty, limited length
    if not req.queries or len(req.queries) > 500:
        raise HTTPException(status_code=400, detail="queries is required and must be <= 500 chars")
    # Geo: non-empty, reasonable length
    if not req.geo or len(req.geo) > 200:
        raise HTTPException(status_code=400, detail="geo is required and must be <= 200 chars")
    # Category: non-empty, reasonable length
    if not req.category or len(req.category) > 200:
        raise HTTPException(status_code=400, detail="category is required and must be <= 200 chars")
    # Limit: pydantic enforces range, but double-check
    if req.limit < 1 or req.limit > 5000:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 5000")
    # Basic character safety (no control chars)
    for field_name, val in [("queries", req.queries), ("geo", req.geo), ("category", req.category)]:
        if any(ord(ch) < 32 for ch in val):
            raise HTTPException(status_code=400, detail=f"{field_name} contains invalid characters")


class BackgroundRunManager:
    def __init__(self) -> None:
        self._runs: Dict[str, RunRecord] = {}
        self._locks: Dict[str, threading.Lock] = {}

    def list_runs(self) -> Dict[str, RunRecord]:
        return self._runs

    def get(self, run_id: str) -> Optional[RunRecord]:
        return self._runs.get(run_id)

    def _set_status(
        self,
        run_id: str,
        status: str,
        message: Optional[str] = None,
        summary_path: Optional[str] = None,
        progress: Optional[float] = None,
        stage: Optional[str] = None,
    ) -> None:
        rec = self._runs[run_id]
        rec.status = status
        rec.message = message
        if summary_path:
            rec.summary_path = summary_path
        if progress is not None:
            rec.progress = max(0.0, min(1.0, float(progress)))
        if stage is not None:
            rec.stage = stage
        self._runs[run_id] = rec

    def start(self, req: RunRequest) -> RunRecord:
        run_id = uuid.uuid4().hex[:12]
        created_at = datetime.utcnow().isoformat()
        record = RunRecord(run_id=run_id, created_at=created_at, status="queued")
        self._runs[run_id] = record
        self._locks[run_id] = threading.Lock()

        thread = threading.Thread(target=self._worker, args=(run_id, req), daemon=True)
        thread.start()
        return record

    def _worker(self, run_id: str, req: RunRequest) -> None:
        try:
            self._set_status(run_id, "starting")

            # Build args-like object for config loader
            class Args:
                pass

            args = Args()
            args.queries = req.queries
            args.geo = req.geo
            args.category = req.category
            args.limit = req.limit
            args.enable_overpass = req.enable_overpass
            args.enable_yelp = req.enable_yelp
            args.enable_yellowpages = req.enable_yellowpages
            args.enable_clearbit = req.enable_clearbit
            args.push_to_gsheets = req.push_to_gsheets
            args.dry_run = req.dry_run
            args.free_mode = req.free_mode
            args.enable_embed_scoring = req.enable_embed_scoring
            args.enable_embed_dedupe = req.enable_embed_dedupe

            config = load_config_from_env_and_args(args)

            run_dir, ts = create_run_context(dry_run=config.dry_run)
            setup_logging(run_dir=run_dir, dry_run=config.dry_run)

            self._runs[run_id].run_dir = run_dir

            from src.core.pipeline import Pipeline  # lazy import to speed app startup

            self._set_status(run_id, "running", progress=0.1, stage="running")
            companies: Any = None
            summary: Dict[str, Any] = {}

            def _run_pipeline() -> None:
                nonlocal companies, summary
                pipeline = Pipeline(config, run_dir)
                companies, summary = asyncio.run(pipeline.run(ts))

            _run_pipeline()

            # Write status from summary
            summary_path = os.path.join(run_dir, "summary.json")
            self._set_status(run_id, "completed", message="success", summary_path=summary_path, progress=1.0, stage="completed")
        except Exception as exc:  # noqa: BLE001
            logger.exception("Run %s failed", run_id)
            self._set_status(run_id, "failed", message=str(exc), progress=1.0, stage="failed")


app = FastAPI(title="Outrelix Lead Engine API", version="1.0.0")

# Include continuous API router
app.include_router(continuous_router)
manager = BackgroundRunManager()

# Static and templates
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")
templates = Jinja2Templates(directory=TEMPLATES_DIR)

# Auth config (imported from auth.py)
from src.server.auth import ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET

if not JWT_SECRET or JWT_SECRET == "dev_only_change_me":
    raise RuntimeError("OUTRELIX_JWT_SECRET must be set to a strong secret.")
if not ADMIN_EMAIL or not ADMIN_PASSWORD or ADMIN_PASSWORD == "admin123":
    raise RuntimeError("OUTRELIX_ADMIN_EMAIL and OUTRELIX_ADMIN_PASSWORD must be set (not defaults).")

# Simple in-memory rate limiter (best-effort)
RATE_LIMIT_PER_MIN = int(os.getenv("API_RATE_LIMIT_PER_MIN", "120"))
_requests_window: Dict[str, deque] = {}


def rate_limit_middleware(max_per_min: int = RATE_LIMIT_PER_MIN):
    window = 60.0

    async def middleware(request: Request, call_next):
        # Skip static and health
        path = request.url.path
        if path.startswith("/static") or path == "/health":
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = datetime.utcnow().timestamp()

        dq = _requests_window.get(client_ip)
        if dq is None:
            dq = deque()
            _requests_window[client_ip] = dq

        # Clean old entries
        while dq and now - dq[0] > window:
            dq.popleft()

        if len(dq) >= max_per_min:
            raise HTTPException(status_code=429, detail="Too many requests, slow down")

        dq.append(now)
        return await call_next(request)

    return middleware


# Rate limit middleware (register after function definition)
app.middleware("http")(rate_limit_middleware())


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ExportRequest(BaseModel):
    format: str = Field(..., description="Export format: xlsx, csv, or json")
    filename: str = Field(..., description="Filename without extension")
    include_raw_data: bool = Field(True, description="Include raw business data")
    include_validation_details: bool = Field(True, description="Include email validation details")
    include_ai_insights: bool = Field(True, description="Include AI insights and scoring")


class BatchItem(BaseModel):
    keywords: str
    location: str


class BatchResponse(BaseModel):
    count: int
    inserted: int
    csv: str


# Auth functions imported from auth.py


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    """Login endpoint - supports admin and employee accounts"""
    try:
        user_info = authenticate_employee(payload.email, payload.password)
        token = create_token(user_info["email"], user_info["role"])
        logger.info(f"Login successful: {user_info['email']} ({user_info['role']})")
        return TokenResponse(access_token=token)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=401, detail="Login failed")


@app.get("/runs")
def list_runs(_: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    return {rid: r.dict() for rid, r in manager.list_runs().items()}


@app.post("/runs", response_model=RunRecord)
def start_run(payload: RunRequest, request: Request, user: Dict[str, Any] = Depends(require_auth)) -> RunRecord:
    """Start a lead generation run with usage tracking"""
    # Get user ID
    user_id = get_user_identifier(user)
    
    # Check usage limits
    tracker = get_usage_tracker()
    allowed, error_msg = tracker.check_limits(user_id)
    if not allowed:
        raise HTTPException(status_code=429, detail=error_msg)
    
    # Validate request
    _validate_run_request(payload)
    
    # Warn about free_mode (mock data)
    if payload.free_mode:
        logger.warning(f"User {user_id} started run with free_mode=True (will use mock data)")
    
    # Log the run start
    tracker.log_action(user_id, "run_started", {
        "queries": payload.queries,
        "geo": payload.geo,
        "category": payload.category,
        "limit": payload.limit,
        "free_mode": payload.free_mode,
    })
    
    # Warn if free_mode is requested; allow pass-through to config loader
    if payload.free_mode is None:
        payload.free_mode = False
    
    rec = manager.start(payload)
    return rec


@app.get("/runs/{run_id}", response_model=RunRecord)
def run_status(run_id: str, _: Dict[str, Any] = Depends(require_auth)) -> RunRecord:
    rec = manager.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run not found")
    return rec


@app.get("/runs/{run_id}/summary")
def run_summary(run_id: str, _: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    rec = manager.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run not found")
    if rec.status not in {"completed", "failed"}:
        raise HTTPException(status_code=409, detail="run not completed yet")
    if not rec.summary_path or not os.path.exists(rec.summary_path):
        raise HTTPException(status_code=404, detail="summary not found")
    import json

    with open(rec.summary_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.get("/runs/{run_id}/leads")
def run_leads(run_id: str, _: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """Return detailed leads for a completed run.

    Prefers `verified_leads.xlsx` if present, otherwise falls back to
    `raw_contacts.csv`, then `raw_businesses.csv`.
    """
    rec = manager.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run not found")
    if rec.status != "completed":
        raise HTTPException(status_code=409, detail="run not completed yet")
    if not rec.run_dir or not os.path.exists(rec.run_dir):
        raise HTTPException(status_code=404, detail="run data not found")

    import pandas as pd  # local import to keep startup fast

    verified_leads_path = os.path.join(rec.run_dir, "verified_leads.xlsx")
    verified_leads_dryrun_path = os.path.join(rec.run_dir, "verified_leads_dryrun.xlsx")
    raw_contacts_path = os.path.join(rec.run_dir, "raw_contacts.csv")
    raw_businesses_path = os.path.join(rec.run_dir, "raw_businesses.csv")

    df = None
    if os.path.exists(verified_leads_path):
        df = pd.read_excel(verified_leads_path)
    elif os.path.exists(verified_leads_dryrun_path):
        # Prefer the dry-run verified file if present (more complete than raw files)
        df = pd.read_excel(verified_leads_dryrun_path)
    elif os.path.exists(raw_contacts_path):
        df = pd.read_csv(raw_contacts_path)
    elif os.path.exists(raw_businesses_path):
        df = pd.read_csv(raw_businesses_path)
    else:
        return {"items": []}

    def get_first_present(row: Dict[str, Any], keys: list[str]) -> Any:
        for k in keys:
            if k in row and pd.notna(row[k]):
                return row[k]
        return None

    # Optional enrichment map from businesses when we started from contacts
    business_by_id: Dict[str, Dict[str, Any]] = {}
    if os.path.exists(raw_businesses_path):
        try:
            df_biz = pd.read_csv(raw_businesses_path)
            for b in df_biz.to_dict(orient="records"):
                business_by_id[str(b.get("company_id"))] = b
        except Exception:  # noqa: BLE001
            business_by_id = {}

    import ast

    def _sanitize(val: Any) -> Any:
        try:
            if val is None:
                return None
            # pandas NaN/NaT handling
            if isinstance(val, float) and pd.isna(val):
                return None
            if isinstance(val, (int, float)):
                # guard against inf/-inf
                if val != val or val in (float("inf"), float("-inf")):
                    return None
                return val
            s = str(val).strip()
            return s if s and s.lower() != "nan" else None
        except Exception:
            return None

    items = []
    for row in df.to_dict(orient="records"):
        company = get_first_present(row, [
            "company_name", "company", "business_name", "name",
        ])
        domain = get_first_present(row, ["domain", "website", "url", "site"])
        email = get_first_present(row, ["email", "emails", "contact_email"])  # may be list/string
        if isinstance(email, list) and email:
            email = email[0]
        phone = get_first_present(row, ["phone", "phones", "contact_phone", "phone_e164", "phone_raw"])  # may be list
        if isinstance(phone, list) and phone:
            phone = phone[0]
        location = get_first_present(row, [
            "location", "city_state", "address", "city", "state"
        ])
        def _clean_str(val: Any) -> Optional[str]:
            if val is None:
                return None
            try:
                # pandas may pass NaN as float; treat as missing
                if isinstance(val, float) and pd.isna(val):
                    return None
            except Exception:
                pass
            s = str(val).strip()
            return s if s and s.lower() != "nan" else None
        if isinstance(location, dict):
            city = _clean_str(location.get("city"))
            state = _clean_str(location.get("state"))
            location = ", ".join([p for p in [city, state] if p]) or None

        email_valid = bool(get_first_present(row, [
            "email_valid", "is_valid_email", "validation_result", "email_status"
        ]) in [True, "valid", "VALID", "deliverable"]) if any(
            k in row for k in ["email_valid", "is_valid_email", "validation_result", "email_status"]
        ) else None

        # If we started from raw_contacts, enrich from raw_businesses
        if (not company or not domain or email_valid is None) and business_by_id:
            biz = None
            cid = str(get_first_present(row, ["company_id"]))
            if cid and cid in business_by_id:
                biz = business_by_id[cid]
            if biz:
                company = company or biz.get("company_name")
                domain = domain or biz.get("domain")
                if not location:
                    city = _clean_str(biz.get("city"))
                    state = _clean_str(biz.get("state"))
                    location = ", ".join([p for p in [city, state] if p]) or None
                phone = phone or biz.get("phone_e164") or biz.get("phone_raw")
                # try to infer email validity from emails_found list
                if email and email_valid is None and biz.get("emails_found"):
                    try:
                        arr = ast.literal_eval(str(biz.get("emails_found")))
                        for ent in arr:
                            if isinstance(ent, dict) and ent.get("email") == email:
                                v = (ent.get("validation") or {}).get("is_valid")
                                if v is not None:
                                    email_valid = bool(v)
                                    break
                    except Exception:  # noqa: BLE001
                        pass

        score = get_first_present(row, ["confidence", "lead_score", "score"]) or 0
        try:
            lead_score = int(float(score))
        except Exception:
            lead_score = 0
        quality = "high" if lead_score >= 80 else ("medium" if lead_score >= 50 else "low")

        industry = get_first_present(row, ["industry"]) or "Roofing"
        employees = get_first_present(row, ["employees", "employee_count"]) or None
        source = get_first_present(row, ["source"]) or "Google Maps"
        ai_insights = get_first_present(row, ["ai_insights"]) or ""

        items.append({
            "company": _sanitize(company) or (_sanitize(domain) or ""),
            "domain": _sanitize(domain),
            "location": _sanitize(location) or "",
            "email": _sanitize(email),
            "email_valid": bool(email_valid) if email_valid is not None else None,
            "phone": _sanitize(phone),
            "lead_score": int(max(0, min(100, lead_score))),
            "quality": _sanitize(quality),
            "industry": _sanitize(industry),
            "employees": int(employees) if isinstance(employees, (int, float)) and not pd.isna(employees) else 0,
            "source": _sanitize(source),
            "ai_insights": _sanitize(ai_insights),
        })

    return {"items": items}


@app.delete("/runs/{run_id}")
def delete_run(run_id: str, _: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    rec = manager.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run not found")
    # Remove output directory if present
    if rec.run_dir and os.path.exists(rec.run_dir):
        try:
            shutil.rmtree(rec.run_dir, ignore_errors=True)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to remove run dir %s: %s", rec.run_dir, exc)
    # Drop from in-memory registry
    if run_id in manager._runs:  # noqa: SLF001 - internal store
        del manager._runs[run_id]
    return {"ok": True}


@app.get("/usage/stats")
def get_usage_stats(user: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """Get usage statistics for current user"""
    user_id = get_user_identifier(user)
    tracker = get_usage_tracker()
    return tracker.get_user_stats(user_id, days=1)


@app.get("/usage/all")
def get_usage_all(user: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    """Get usage statistics for all users (admin view)"""
    # Admin-only
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="admin only")
    tracker = get_usage_tracker()
    return tracker.get_all_stats(days=1)


@app.get("/analytics")
def get_analytics(_: Dict[str, Any] = Depends(require_auth)) -> Dict[str, Any]:
    # return latest advanced_analytics.json from newest run dir
    out_dir = os.path.join(os.getcwd(), "output")
    if not os.path.isdir(out_dir):
        raise HTTPException(status_code=404, detail="no analytics available")
    run_dirs = [os.path.join(out_dir, d) for d in os.listdir(out_dir) if d.startswith("run_")]
    if not run_dirs:
        raise HTTPException(status_code=404, detail="no runs found")
    latest = max(run_dirs, key=os.path.getmtime)
    analytics_path = os.path.join(latest, "advanced_analytics.json")
    if not os.path.exists(analytics_path):
        raise HTTPException(status_code=404, detail="analytics not found")
    import json
    with open(analytics_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.post("/runs/{run_id}/export")
def export_run_data(run_id: str, payload: ExportRequest, _: Dict[str, Any] = Depends(require_auth)) -> Response:
    """Export run data in specified format"""
    rec = manager.get(run_id)
    if not rec:
        raise HTTPException(status_code=404, detail="run not found")
    if rec.status != "completed":
        raise HTTPException(status_code=409, detail="run not completed yet")
    if not rec.run_dir or not os.path.exists(rec.run_dir):
        raise HTTPException(status_code=404, detail="run data not found")
    
    try:
        import pandas as pd
        import json
        from io import BytesIO
        
        # Load the data files
        verified_leads_path = os.path.join(rec.run_dir, "verified_leads.xlsx")
        raw_businesses_path = os.path.join(rec.run_dir, "raw_businesses.csv")
        raw_contacts_path = os.path.join(rec.run_dir, "raw_contacts.csv")
        validated_emails_path = os.path.join(rec.run_dir, "validated_emails.csv")
        
        # Prepare data based on request
        data_to_export = {}
        
        # Always include main verified leads
        if os.path.exists(verified_leads_path):
            df_leads = pd.read_excel(verified_leads_path)
            data_to_export["verified_leads"] = df_leads
        
        # Include additional data based on options
        if payload.include_raw_data:
            if os.path.exists(raw_businesses_path):
                df_businesses = pd.read_csv(raw_businesses_path)
                data_to_export["raw_businesses"] = df_businesses
            if os.path.exists(raw_contacts_path):
                df_contacts = pd.read_csv(raw_contacts_path)
                data_to_export["raw_contacts"] = df_contacts
        
        if payload.include_validation_details and os.path.exists(validated_emails_path):
            df_validated = pd.read_csv(validated_emails_path)
            data_to_export["validated_emails"] = df_validated
        
        # Generate export based on format
        if payload.format == "json":
            # Convert all dataframes to dict format
            json_data = {}
            for sheet_name, df in data_to_export.items():
                json_data[sheet_name] = df.to_dict('records')
            
            # Add metadata
            json_data["metadata"] = {
                "run_id": run_id,
                "exported_at": datetime.utcnow().isoformat(),
                "format": payload.format,
                "options": {
                    "include_raw_data": payload.include_raw_data,
                    "include_validation_details": payload.include_validation_details,
                    "include_ai_insights": payload.include_ai_insights
                }
            }
            
            json_str = json.dumps(json_data, indent=2, default=str)
            return Response(
                content=json_str,
                media_type="application/json",
                headers={"Content-Disposition": f"attachment; filename={payload.filename}.json"}
            )
        
        elif payload.format == "csv":
            # For CSV, export only the main verified leads
            if "verified_leads" in data_to_export:
                csv_buffer = BytesIO()
                data_to_export["verified_leads"].to_csv(csv_buffer, index=False)
                csv_content = csv_buffer.getvalue()
                
                return Response(
                    content=csv_content,
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename={payload.filename}.csv"}
                )
            else:
                raise HTTPException(status_code=404, detail="No verified leads data found")
        
        elif payload.format == "xlsx":
            # For Excel, create multiple sheets
            excel_buffer = BytesIO()
            with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                for sheet_name, df in data_to_export.items():
                    # Truncate sheet name if too long (Excel limit is 31 chars)
                    sheet_name_short = sheet_name[:31]
                    df.to_excel(writer, sheet_name=sheet_name_short, index=False)
            
            excel_content = excel_buffer.getvalue()
            
            return Response(
                content=excel_content,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={payload.filename}.xlsx"}
            )
        
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use xlsx, csv, or json")
    
    except Exception as e:
        logger.exception("Export failed for run %s", run_id)
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


@app.get("/", response_class=HTMLResponse)
def home(request: Request) -> Any:
    return templates.TemplateResponse("index.html", {"request": request})


# Serve root logo.png for convenience in dev
@app.get("/logo.png")
def get_logo() -> Any:
    logo_path = os.path.join(os.getcwd(), "logo.png")
    if not os.path.exists(logo_path):
        raise HTTPException(status_code=404, detail="logo.png not found in project root")
    return FileResponse(logo_path)


# Lightweight AI scraping endpoint
@app.post("/ai/scrape-and-store")
async def ai_scrape_and_store(payload: Dict[str, str]) -> Dict[str, Any]:
    keywords = (payload.get("keywords") or "").strip()
    location = (payload.get("location") or "").strip()
    if not keywords:
        raise HTTPException(status_code=400, detail="keywords required")
    businesses = await engine_search(keywords, location)
    collected: list[dict[str, Any]] = []
    for biz in businesses:
        site = biz.get("website") or ""
        contacts = await engine_scrape_website(site)
        for email in contacts.get("emails", []):
            collected.append({
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
            collected.append({
                "name": "",
                "role": "",
                "company": biz.get("name"),
                "email": "",
                "phone": phone,
                "website": site,
                "source": "ai_web",
                "confidence": 0.5,
            })
    cleaned = engine_clean(collected)
    enriched = await enrich_rows(cleaned)
    inserted = engine_save_to_db(enriched)
    csv_path = engine_export_csv(enriched, "exports/ai_leads.csv")
    return {"inserted": inserted, "csv": csv_path, "count": len(enriched)}


@app.post("/batch_scrape", response_model=BatchResponse)
async def batch_scrape_endpoint(items: list[BatchItem]) -> Any:
    if not items:
        raise HTTPException(status_code=400, detail="empty payload")
    tasks = [(it.keywords, it.location) for it in items]
    rows = await engine_batch_scrape(tasks)
    enriched = await enrich_rows(rows)
    inserted = engine_save_to_db(enriched)
    csv_path = engine_export_csv(enriched, "exports/ai_leads_batch.csv")
    return {"count": len(enriched), "inserted": inserted, "csv": csv_path}

