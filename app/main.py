from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
import os
from datetime import datetime, timedelta
from .scrapers import IndustryScraper
import pandas as pd
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Industry Email Scraper API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for React app
app.mount("/static", StaticFiles(directory="build/static"), name="static")

# Initialize scraper with error handling
try:
    scraper = IndustryScraper()
    logger.info("Scraper initialized successfully")
except Exception as e:
    logger.error(f"Error initializing scraper: {str(e)}")
    scraper = None

class ScrapeRequest(BaseModel):
    industry: str
    max_companies: Optional[int] = 100
    format: Optional[str] = "csv"  # or "json"

class CampaignRequest(BaseModel):
    industry: str
    sender_email: EmailStr
    email_template: str
    subject: str
    schedule: Optional[bool] = False
    schedule_time: Optional[datetime] = None

# Store for background tasks
scrape_jobs = {}
campaigns = {}

@app.get("/")
async def serve_react_app():
    """Serve the React app."""
    return FileResponse("build/index.html")

@app.get("/{path:path}")
async def serve_react_routes(path: str):
    """Serve React routes."""
    if os.path.exists(f"build/{path}"):
        return FileResponse(f"build/{path}")
    return FileResponse("build/index.html")

@app.get("/api/industries")
async def get_industries():
    """Get list of supported industries and their status."""
    if not scraper:
        raise HTTPException(status_code=500, detail="Scraper not initialized")
    return scraper.get_supported_industries()

@app.post("/api/scrape")
async def start_scrape(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """Start a new scraping job."""
    # Validate industry
    if request.industry not in scraper.supported_industries:
        raise HTTPException(status_code=400, detail=f"Industry {request.industry} not supported")
    
    if not scraper.supported_industries[request.industry]['scrapable']:
        raise HTTPException(
            status_code=403,
            detail=f"Industry {request.industry} is not available in the free plan"
        )
    
    # Generate job ID
    job_id = f"{request.industry}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Create output directory if it doesn't exist
    os.makedirs("output", exist_ok=True)
    
    # Store job info
    scrape_jobs[job_id] = {
        "status": "pending",
        "industry": request.industry,
        "max_companies": request.max_companies,
        "format": request.format
    }
    
    # Start background task
    background_tasks.add_task(
        run_scrape_job,
        job_id,
        request.industry,
        request.max_companies,
        request.format
    )
    
    return {"status": "success", "job_id": job_id}

@app.post("/api/campaign/start")
async def start_campaign(request: CampaignRequest, background_tasks: BackgroundTasks):
    """Start a new campaign."""
    # Validate industry
    if request.industry not in scraper.supported_industries:
        raise HTTPException(status_code=400, detail=f"Industry {request.industry} not supported")
    
    # Create campaign ID
    campaign_id = f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    # Get leads for the industry
    leads = scraper.get_leads(request.industry)
    total_leads = len(leads)
    
    # Calculate estimated completion time (assuming 1 email per minute)
    start_time = datetime.now()
    if request.schedule and request.schedule_time:
        start_time = request.schedule_time
    estimated_completion = start_time + timedelta(minutes=total_leads)
    
    # Store campaign info
    campaigns[campaign_id] = {
        "status": "scheduled" if request.schedule else "active",
        "industry": request.industry,
        "sender_email": request.sender_email,
        "email_template": request.email_template,
        "subject": request.subject,
        "started_at": start_time.isoformat(),
        "estimated_completion": estimated_completion.isoformat(),
        "total_leads": total_leads,
        "emails_sent": 0,
        "success_rate": 0,
        "progress": 0,
        "activity_log": [
            f"Campaign {'scheduled' if request.schedule else 'started'} at {start_time.strftime('%Y-%m-%d %H:%M:%S')}",
            f"Targeting {total_leads} leads in {request.industry} industry"
        ]
    }
    
    # Start background task for sending emails
    if not request.schedule:
        background_tasks.add_task(
            run_campaign,
            campaign_id,
            request.industry,
            request.sender_email,
            request.email_template,
            request.subject,
            leads
        )
    else:
        # Schedule the campaign for later
        background_tasks.add_task(
            schedule_campaign,
            campaign_id,
            request.schedule_time
        )
    
    return {"status": "success", "campaign_id": campaign_id}

@app.get("/api/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status of a scraping job."""
    if job_id not in scrape_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return scrape_jobs[job_id]

@app.get("/api/campaign/{campaign_id}/status")
async def get_campaign_status(campaign_id: str):
    """Get status of a campaign."""
    if campaign_id not in campaigns:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaigns[campaign_id]

@app.get("/api/campaign/{campaign_id}/download")
async def download_campaign_results(campaign_id: str, format: str = "csv"):
    """Download campaign results."""
    if campaign_id not in campaigns:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    campaign = campaigns[campaign_id]
    industry = campaign["industry"]
    
    # Get leads
    df = scraper.get_leads(industry)
    
    # Export data
    if format == "csv":
        return Response(
            content=df.to_csv(index=False),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=campaign_{campaign_id}.csv"}
        )
    else:
        return Response(
            content=df.to_json(orient="records"),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=campaign_{campaign_id}.json"}
        )

async def run_scrape_job(job_id: str, industry: str, max_companies: int, format: str):
    """Run scraping job in background."""
    try:
        # Update job status
        scrape_jobs[job_id]["status"] = "running"
        
        # Run scraper
        df = scraper.scrape_industry(industry, max_companies)
        
        # Export data
        filename = f"output/{job_id}.{format}"
        if format == "csv":
            scraper.export_to_csv(df, filename)
        else:
            scraper.export_to_json(df, filename)
        
        # Update job status
        scrape_jobs[job_id].update({
            "status": "completed",
            "output_file": filename,
            "records_scraped": len(df)
        })
        
    except Exception as e:
        scrape_jobs[job_id].update({
            "status": "failed",
            "error": str(e)
        })

async def schedule_campaign(campaign_id: str, schedule_time: datetime):
    """Schedule a campaign to start at a specific time."""
    try:
        # Calculate delay until scheduled time
        now = datetime.now()
        delay = (schedule_time - now).total_seconds()
        
        if delay > 0:
            # Wait until scheduled time
            await asyncio.sleep(delay)
        
        # Get campaign info
        campaign = campaigns[campaign_id]
        
        # Update campaign status
        campaign["status"] = "active"
        campaign["activity_log"].append(
            f"Campaign started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        
        # Get leads
        leads = scraper.get_leads(campaign["industry"])
        
        # Start sending emails
        await run_campaign(
            campaign_id,
            campaign["industry"],
            campaign["sender_email"],
            campaign["email_template"],
            campaign["subject"],
            leads
        )
        
    except Exception as e:
        campaign["status"] = "failed"
        campaign["activity_log"].append(f"Campaign failed: {str(e)}")

async def run_campaign(campaign_id: str, industry: str, sender_email: str, email_template: str, subject: str, leads: pd.DataFrame):
    """Run campaign in background."""
    try:
        campaign = campaigns[campaign_id]
        total_leads = len(leads)
        
        for index, lead in leads.iterrows():
            try:
                # Format email template with lead data
                formatted_template = email_template.format(
                    company=lead['company'],
                    name=lead.get('name', ''),
                    position=lead.get('position', '')
                )
                
                # Send email to lead
                # TODO: Implement email sending logic
                
                # Update campaign stats
                campaign["emails_sent"] += 1
                campaign["progress"] = int((index + 1) / total_leads * 100)
                campaign["success_rate"] = int((campaign["emails_sent"] / total_leads) * 100)
                
                # Add activity log entry
                campaign["activity_log"].append(
                    f"Sent email to {lead['email']} at {lead['company']}"
                )
                
                # Keep only last 10 activity log entries
                campaign["activity_log"] = campaign["activity_log"][-10:]
                
                # Wait 1 minute between emails
                await asyncio.sleep(60)
                
            except Exception as e:
                campaign["activity_log"].append(
                    f"Error sending email to {lead['email']}: {str(e)}"
                )
        
        # Mark campaign as completed
        campaign["status"] = "completed"
        campaign["progress"] = 100
        campaign["activity_log"].append(
            f"Campaign completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        
    except Exception as e:
        campaign["status"] = "failed"
        campaign["activity_log"].append(f"Campaign failed: {str(e)}") 