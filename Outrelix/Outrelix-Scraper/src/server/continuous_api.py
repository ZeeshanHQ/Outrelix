"""
API endpoints for continuous lead generation system
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional, Dict, Any
import os
import jwt
import asyncio
from datetime import datetime

from src.ai.continuous_lead_engine import continuous_engine, get_fresh_leads, get_daily_stats
JWT_SECRET = os.getenv("OUTRELIX_JWT_SECRET", "dev_only_change_me")
JWT_ALG = "HS256"

def get_current_user(request: Request) -> Dict[str, Any]:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = auth.split(" ", 1)[1]
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception as exc:
        raise HTTPException(status_code=401, detail="invalid token") from exc

router = APIRouter(prefix="/continuous", tags=["continuous"])

@router.post("/start")
async def start_continuous_mode(current_user: dict = Depends(get_current_user)):
    """Start the continuous AI-powered lead generation system"""
    try:
        await continuous_engine.start_continuous_mode()
        return {
            "status": "success",
            "message": "Continuous lead generation started",
            "started_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start continuous mode: {str(e)}")

@router.post("/stop")
async def stop_continuous_mode(current_user: dict = Depends(get_current_user)):
    """Stop the continuous lead generation system"""
    try:
        continuous_engine.stop_continuous_mode()
        return {
            "status": "success",
            "message": "Continuous lead generation stopped",
            "stopped_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop continuous mode: {str(e)}")

@router.get("/status")
async def get_continuous_status(current_user: dict = Depends(get_current_user)):
    """Get the status of continuous lead generation"""
    return {
        "is_running": continuous_engine.is_running,
        "started_at": datetime.now().isoformat() if continuous_engine.is_running else None,
        "total_targets": len(continuous_engine.priority_targets),
        "high_priority_targets": len([t for t in continuous_engine.priority_targets if t.priority == 1]),
        "medium_priority_targets": len([t for t in continuous_engine.priority_targets if t.priority == 2])
    }

@router.get("/leads/fresh")
async def get_fresh_leads_endpoint(
    limit: int = 100,
    city: Optional[str] = None,
    state: Optional[str] = None,
    min_score: float = 0.0,
    current_user: dict = Depends(get_current_user)
):
    """Get fresh leads from the continuous system"""
    try:
        leads = await get_fresh_leads(limit, city, state, min_score)
        return {
            "status": "success",
            "count": len(leads),
            "leads": leads,
            "filters": {
                "limit": limit,
                "city": city,
                "state": state,
                "min_score": min_score
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get fresh leads: {str(e)}")

@router.get("/stats/daily")
async def get_daily_stats_endpoint(current_user: dict = Depends(get_current_user)):
    """Get daily statistics about lead generation"""
    try:
        stats = await get_daily_stats()
        return {
            "status": "success",
            "stats": stats,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get daily stats: {str(e)}")

@router.get("/targets")
async def get_target_locations(current_user: dict = Depends(get_current_user)):
    """Get all target locations for lead generation"""
    try:
        targets = []
        for target in continuous_engine.priority_targets:
            targets.append({
                "city": target.city,
                "state": target.state,
                "country": target.country,
                "priority": target.priority,
                "last_scraped": target.last_scraped.isoformat() if target.last_scraped else None,
                "success_rate": target.success_rate
            })
        
        return {
            "status": "success",
            "count": len(targets),
            "targets": targets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get targets: {str(e)}")

@router.post("/leads/mark-contacted")
async def mark_leads_contacted(
    lead_ids: List[int],
    current_user: dict = Depends(get_current_user)
):
    """Mark leads as contacted to avoid duplicate outreach"""
    try:
        import sqlite3
        
        conn = sqlite3.connect(continuous_engine.db_path)
        placeholders = ",".join("?" * len(lead_ids))
        
        updated = conn.execute(f"""
            UPDATE continuous_leads 
            SET is_contacted = TRUE, last_updated = ?
            WHERE id IN ({placeholders})
        """, [datetime.now().isoformat()] + lead_ids).rowcount
        
        conn.commit()
        conn.close()
        
        return {
            "status": "success",
            "updated_count": updated,
            "message": f"Marked {updated} leads as contacted"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark leads as contacted: {str(e)}")

@router.get("/leads/export")
async def export_continuous_leads(
    format: str = "csv",
    limit: int = 1000,
    city: Optional[str] = None,
    state: Optional[str] = None,
    min_score: float = 0.0,
    current_user: dict = Depends(get_current_user)
):
    """Export leads from continuous system"""
    try:
        leads = await get_fresh_leads(limit, city, state, min_score)
        
        if format.lower() == "csv":
            import csv
            import io
            
            output = io.StringIO()
            if leads:
                writer = csv.DictWriter(output, fieldnames=leads[0].keys())
                writer.writeheader()
                writer.writerows(leads)
            
            return {
                "status": "success",
                "format": "csv",
                "count": len(leads),
                "data": output.getvalue()
            }
        else:
            return {
                "status": "success",
                "format": "json",
                "count": len(leads),
                "data": leads
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export leads: {str(e)}")

@router.post("/scrape/now")
async def trigger_immediate_scrape(
    city: str,
    state: str,
    limit: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Trigger immediate scraping for a specific location"""
    try:
        from src.ai.continuous_lead_engine import LeadTarget
        
        target = LeadTarget(city=city, state=state, country="US", priority=1)
        await continuous_engine._scrape_location(target)
        
        # Get the leads that were just scraped
        leads = await get_fresh_leads(limit=limit, city=city, state=state)
        
        return {
            "status": "success",
            "message": f"Scraped {city}, {state}",
            "leads_found": len(leads),
            "leads": leads
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scrape location: {str(e)}")

