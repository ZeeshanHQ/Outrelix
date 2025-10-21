from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from scraper import Scraper
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Outrelix Scraping API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class IndustryRequest(BaseModel):
    industry: str
    max_results: Optional[int] = 100

@app.get("/")
async def root():
    return {"message": "Welcome to Outrelix Scraping API"}

@app.post("/scrape")
async def scrape_industry(request: IndustryRequest, background_tasks: BackgroundTasks):
    try:
        scraper = Scraper()
        results = await scraper.scrape_industry(request.industry, request.max_results)
        
        # Save results to CSV
        filename = f"{request.industry.lower().replace(' ', '_')}_leads.csv"
        scraper.save_to_csv(results, filename)
        
        return {
            "status": "success",
            "message": f"Successfully scraped {len(results)} companies from {request.industry} industry",
            "results": results,
            "csv_file": filename
        }
    except Exception as e:
        logger.error(f"Error in scrape_industry endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{filename}")
async def download_file(filename: str):
    try:
        if not os.path.exists(filename):
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(filename, media_type='text/csv', filename=filename)
    except Exception as e:
        logger.error(f"Error downloading file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)