"""
Lead Engine Service - HTTP client wrapper for Outrelix Lead Engine microservice
"""
import os
import httpx
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Lead Engine service URL (defaults to localhost for development)
LEAD_ENGINE_URL = os.getenv("LEAD_ENGINE_URL", "http://localhost:8000")
LEAD_ENGINE_TIMEOUT = float(os.getenv("LEAD_ENGINE_TIMEOUT", "300.0"))  # 5 minutes default


class LeadEngineService:
    """Service wrapper for communicating with Lead Engine microservice"""
    
    def __init__(self, supabase_token: Optional[str] = None):
        """
        Initialize Lead Engine service client
        
        Args:
            supabase_token: Supabase JWT token for authentication with Lead Engine
        """
        self.base_url = LEAD_ENGINE_URL.rstrip('/')
        self.supabase_token = supabase_token
        self.timeout = httpx.Timeout(LEAD_ENGINE_TIMEOUT, connect=10.0)
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with authentication"""
        headers = {"Content-Type": "application/json"}
        if self.supabase_token:
            headers["Authorization"] = f"Bearer {self.supabase_token}"
        return headers
    
    async def health_check(self) -> Dict[str, Any]:
        """Check if Lead Engine service is healthy"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.base_url}/health")
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Lead Engine health check failed: {e}")
            raise
    
    async def start_run(
        self,
        queries: str,
        geo: str,
        category: str,
        limit: int = 100,
        enable_yelp: bool = True,
        enable_clearbit: bool = True,
        enable_yellowpages: bool = False,
        enable_overpass: bool = True,
        push_to_gsheets: bool = False,
        dry_run: bool = False,
        free_mode: Optional[bool] = None,
        enable_embed_scoring: bool = False,
        enable_embed_dedupe: bool = False,
    ) -> Dict[str, Any]:
        """
        Start a new lead generation run
        
        Returns:
            Dict with run_id, status, created_at, etc.
        """
        payload = {
            "queries": queries,
            "geo": geo,
            "category": category,
            "limit": limit,
            "enable_yelp": enable_yelp,
            "enable_clearbit": enable_clearbit,
            "enable_yellowpages": enable_yellowpages,
            "enable_overpass": enable_overpass,
            "push_to_gsheets": push_to_gsheets,
            "dry_run": dry_run,
            "enable_embed_scoring": enable_embed_scoring,
            "enable_embed_dedupe": enable_embed_dedupe,
        }
        
        if free_mode is not None:
            payload["free_mode"] = free_mode
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/runs",
                    headers=self._get_headers(),
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Lead Engine start_run failed: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Lead Engine start_run error: {e}")
            raise
    
    async def get_run_status(self, run_id: str) -> Dict[str, Any]:
        """Get status of a lead generation run"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/runs/{run_id}",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Run {run_id} not found")
            logger.error(f"Lead Engine get_run_status failed: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"Lead Engine get_run_status error: {e}")
            raise
    
    async def get_run_summary(self, run_id: str) -> Dict[str, Any]:
        """Get summary/statistics for a completed run"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/runs/{run_id}/summary",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Run {run_id} or summary not found")
            logger.error(f"Lead Engine get_run_summary failed: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"Lead Engine get_run_summary error: {e}")
            raise
    
    async def get_leads(self, run_id: str) -> Dict[str, Any]:
        """
        Get leads for a completed run
        
        Returns:
            Dict with 'items' list of leads and 'total' count
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/runs/{run_id}/leads",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Run {run_id} not found")
            if e.response.status_code == 409:
                raise ValueError(f"Run {run_id} not completed yet")
            logger.error(f"Lead Engine get_leads failed: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"Lead Engine get_leads error: {e}")
            raise
    
    async def delete_run(self, run_id: str) -> Dict[str, Any]:
        """Delete a run and its data"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.delete(
                    f"{self.base_url}/runs/{run_id}",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise ValueError(f"Run {run_id} not found")
            logger.error(f"Lead Engine delete_run failed: {e.response.status_code}")
            raise
        except Exception as e:
            logger.error(f"Lead Engine delete_run error: {e}")
            raise
    
    async def get_usage_stats(self) -> Dict[str, Any]:
        """Get usage statistics for current user"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/usage/stats",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Lead Engine get_usage_stats error: {e}")
            raise
    
    async def list_runs(self) -> Dict[str, Any]:
        """List all runs for current user"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/runs",
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Lead Engine list_runs error: {e}")
            raise

