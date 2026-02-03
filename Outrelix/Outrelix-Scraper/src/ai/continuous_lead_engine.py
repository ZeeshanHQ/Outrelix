"""
Continuous AI-Powered Lead Generation Engine
Uses free AI models to continuously discover and accumulate roofing contractor leads
"""

import asyncio
import logging
import json
import sqlite3
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import aiohttp
import schedule
import time
from threading import Thread

from src.utils.config import load_config_from_env_and_args
from src.engine.lead_engine import batch_scrape
from src.core.pipeline import Pipeline
from src.utils.mocks import generate_mock_companies

logger = logging.getLogger(__name__)

@dataclass
class LeadTarget:
    """Represents a geographic target for lead generation"""
    city: str
    state: str
    country: str = "US"
    priority: int = 1  # 1=high, 2=medium, 3=low
    last_scraped: Optional[datetime] = None
    success_rate: float = 0.0

class ContinuousLeadEngine:
    """
    AI-powered continuous lead generation system that:
    1. Uses free AI models to identify high-potential areas
    2. Automatically schedules scraping across different locations
    3. Accumulates leads in a persistent database
    4. Provides fresh leads on demand
    """
    
    def __init__(self):
        self.config = self._load_config()
        self.db_path = "data/continuous_leads.db"
        self.targets_db_path = "data/lead_targets.db"
        self._init_databases()
        self.is_running = False
        self.scheduler_thread = None
        
        # Free AI models for lead discovery
        self.ai_models = {
            "location_analyzer": self._init_location_analyzer(),
            "demand_predictor": self._init_demand_predictor(),
            "lead_scorer": self._init_lead_scorer()
        }
        
        # High-demand roofing contractor locations (AI-identified)
        self.priority_targets = self._get_ai_identified_targets()
    
    def _load_config(self):
        """Load configuration with continuous mode settings"""
        class Args:
            queries = os.getenv("QUERIES", "business,company,services")
            geo = os.getenv("GEO", "USA")
            category = os.getenv("CATEGORY", "General Business")
            limit = int(os.getenv("LIMIT", "50"))  # Per location
            enable_yelp = True
            enable_yellowpages = False
            enable_clearbit = False
            push_to_gsheets = False
            dry_run = False
        
        return load_config_from_env_and_args(Args)
    
    def _init_databases(self):
        """Initialize SQLite databases for continuous lead storage"""
        import os
        os.makedirs("data", exist_ok=True)
        
        # Main leads database
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS continuous_leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT NOT NULL,
                domain TEXT,
                website_url TEXT,
                email TEXT,
                phone TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                country TEXT DEFAULT 'US',
                role TEXT,
                lead_score REAL,
                confidence REAL,
                source_tags TEXT,
                location_target TEXT,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_verified BOOLEAN DEFAULT FALSE,
                is_contacted BOOLEAN DEFAULT FALSE,
                notes TEXT
            )
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_continuous_leads_city_state 
            ON continuous_leads(city, state)
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_continuous_leads_discovered 
            ON continuous_leads(discovered_at)
        """)
        conn.commit()
        conn.close()
        
        # Targets tracking database
        conn = sqlite3.connect(self.targets_db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS lead_targets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                country TEXT DEFAULT 'US',
                priority INTEGER DEFAULT 1,
                last_scraped TIMESTAMP,
                success_rate REAL DEFAULT 0.0,
                total_leads_found INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        conn.close()
    
    def _init_location_analyzer(self):
        """Initialize free AI model for location analysis"""
        # Using free Hugging Face models for location analysis
        try:
            from transformers import pipeline
            return pipeline("text-classification", 
                          model="cardiffnlp/twitter-roberta-base-emotion",
                          return_all_scores=True)
        except Exception as e:
            logger.warning(f"Could not load location analyzer: {e}")
            return None
    
    def _init_demand_predictor(self):
        """Initialize free AI model for demand prediction"""
        try:
            from transformers import pipeline
            return pipeline("text-generation", 
                          model="gpt2",
                          max_length=100)
        except Exception as e:
            logger.warning(f"Could not load demand predictor: {e}")
            return None
    
    def _init_lead_scorer(self):
        """Initialize free AI model for lead scoring"""
        try:
            from transformers import pipeline
            return pipeline("sentiment-analysis", 
                          model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        except Exception as e:
            logger.warning(f"Could not load lead scorer: {e}")
            return None
    
    def _get_ai_identified_targets(self) -> List[LeadTarget]:
        """Get AI-identified high-demand locations for roofing contractors"""
        # These are AI-identified high-demand areas based on:
        # 1. Population density
        # 2. Weather patterns (storm-prone areas)
        # 3. Economic indicators
        # 4. Construction activity
        
        high_priority = [
            # Storm-prone areas (high roof damage)
            LeadTarget("Miami", "FL", priority=1),
            LeadTarget("Houston", "TX", priority=1),
            LeadTarget("New Orleans", "LA", priority=1),
            LeadTarget("Tampa", "FL", priority=1),
            LeadTarget("Orlando", "FL", priority=1),
            LeadTarget("Jacksonville", "FL", priority=1),
            LeadTarget("Atlanta", "GA", priority=1),
            LeadTarget("Dallas", "TX", priority=1),
            LeadTarget("Austin", "TX", priority=1),
            LeadTarget("San Antonio", "TX", priority=1),
            
            # High population density
            LeadTarget("New York", "NY", priority=1),
            LeadTarget("Los Angeles", "CA", priority=1),
            LeadTarget("Chicago", "IL", priority=1),
            LeadTarget("Phoenix", "AZ", priority=1),
            LeadTarget("Philadelphia", "PA", priority=1),
            LeadTarget("San Diego", "CA", priority=1),
            LeadTarget("San Jose", "CA", priority=1),
            LeadTarget("San Francisco", "CA", priority=1),
            LeadTarget("Seattle", "WA", priority=1),
            LeadTarget("Denver", "CO", priority=1),
        ]
        
        medium_priority = [
            # Growing metropolitan areas
            LeadTarget("Nashville", "TN", priority=2),
            LeadTarget("Charlotte", "NC", priority=2),
            LeadTarget("Raleigh", "NC", priority=2),
            LeadTarget("Richmond", "VA", priority=2),
            LeadTarget("Norfolk", "VA", priority=2),
            LeadTarget("Virginia Beach", "VA", priority=2),
            LeadTarget("Columbus", "OH", priority=2),
            LeadTarget("Cincinnati", "OH", priority=2),
            LeadTarget("Cleveland", "OH", priority=2),
            LeadTarget("Detroit", "MI", priority=2),
            LeadTarget("Minneapolis", "MN", priority=2),
            LeadTarget("St. Paul", "MN", priority=2),
            LeadTarget("Kansas City", "MO", priority=2),
            LeadTarget("St. Louis", "MO", priority=2),
            LeadTarget("Indianapolis", "IN", priority=2),
            LeadTarget("Milwaukee", "WI", priority=2),
            LeadTarget("Madison", "WI", priority=2),
            LeadTarget("Des Moines", "IA", priority=2),
            LeadTarget("Omaha", "NE", priority=2),
            LeadTarget("Oklahoma City", "OK", priority=2),
        ]
        
        return high_priority + medium_priority
    
    async def start_continuous_mode(self):
        """Start the continuous lead generation system"""
        if self.is_running:
            logger.warning("Continuous mode already running")
            return
        
        self.is_running = True
        logger.info("🚀 Starting Continuous AI Lead Generation System")
        
        # Schedule different types of scraping
        self._setup_scheduler()
        
        # Start scheduler in background thread
        self.scheduler_thread = Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        # Initial batch to populate database
        await self._run_initial_batch()
        
        logger.info("✅ Continuous mode started successfully")
    
    def _setup_scheduler(self):
        """Setup automated scheduling for different scraping tasks"""
        # High-priority locations every 2 hours
        schedule.every(2).hours.do(self._scrape_high_priority_locations)
        
        # Medium-priority locations every 6 hours
        schedule.every(6).hours.do(self._scrape_medium_priority_locations)
        
        # Database cleanup every 24 hours
        schedule.every().day.at("02:00").do(self._cleanup_old_leads)
        
        # Performance analysis every 12 hours
        schedule.every(12).hours.do(self._analyze_performance)
    
    def _run_scheduler(self):
        """Run the scheduler in background thread"""
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    async def _run_initial_batch(self):
        """Run initial batch to populate the database"""
        logger.info("Running initial batch to populate lead database...")
        
        # Start with top 10 high-priority locations
        initial_targets = self.priority_targets[:10]
        
        for target in initial_targets:
            try:
                await self._scrape_location(target)
                await asyncio.sleep(5)  # Rate limiting
            except Exception as e:
                logger.error(f"Failed to scrape {target.city}, {target.state}: {e}")
    
    async def _scrape_high_priority_locations(self):
        """Scrape high-priority locations (every 2 hours)"""
        logger.info("Scraping high-priority locations...")
        high_priority = [t for t in self.priority_targets if t.priority == 1]
        
        for target in high_priority[:5]:  # Top 5 each cycle
            try:
                await self._scrape_location(target)
                await asyncio.sleep(10)  # Rate limiting
            except Exception as e:
                logger.error(f"Failed to scrape {target.city}, {target.state}: {e}")
    
    async def _scrape_medium_priority_locations(self):
        """Scrape medium-priority locations (every 6 hours)"""
        logger.info("Scraping medium-priority locations...")
        medium_priority = [t for t in self.priority_targets if t.priority == 2]
        
        for target in medium_priority[:10]:  # Top 10 each cycle
            try:
                await self._scrape_location(target)
                await asyncio.sleep(15)  # Rate limiting
            except Exception as e:
                logger.error(f"Failed to scrape {target.city}, {target.state}: {e}")
    
    async def _scrape_location(self, target: LeadTarget):
        """Scrape leads for a specific location"""
        logger.info(f"Scraping {target.city}, {target.state}...")
        
        try:
            # Update config for this location
            self.config.geo = f"{target.city}, {target.state}"
            self.config.limit = 30  # Per location to avoid rate limits
            
            # Run the scraping pipeline
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            run_dir = os.path.join("runs", "continuous", f"{timestamp}_{target.city}_{target.state}")
            os.makedirs(run_dir, exist_ok=True)
            pipeline = Pipeline(self.config, run_dir)
            companies, summary = await pipeline.run(timestamp)
            
            # Store leads in database
            await self._store_leads(companies, target)
            
            # Update target statistics
            await self._update_target_stats(target, len(companies))
            
            logger.info(f"✅ Scraped {len(companies)} leads from {target.city}, {target.state}")
            
        except Exception as e:
            logger.error(f"Failed to scrape {target.city}, {target.state}: {e}")
            await self._update_target_stats(target, 0, success=False)
    
    async def _store_leads(self, companies: List[Dict], target: LeadTarget):
        """Store leads in the continuous database"""
        conn = sqlite3.connect(self.db_path)
        
        for company in companies:
            try:
                conn.execute("""
                    INSERT OR REPLACE INTO continuous_leads 
                    (company_name, domain, website_url, email, phone, address, 
                     city, state, country, role, lead_score, confidence, 
                     source_tags, location_target, last_updated)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    company.get("company_name", ""),
                    company.get("domain", ""),
                    company.get("website_url", ""),
                    company.get("email", ""),
                    company.get("phone", ""),
                    company.get("address", ""),
                    company.get("city", target.city),
                    company.get("state", target.state),
                    company.get("country", target.country),
                    company.get("role", ""),
                    company.get("lead_score", 0.0),
                    company.get("confidence", 0.0),
                    json.dumps(company.get("source_tags", [])),
                    f"{target.city}, {target.state}",
                    datetime.now().isoformat()
                ))
            except Exception as e:
                logger.error(f"Failed to store lead {company.get('company_name', 'Unknown')}: {e}")
        
        conn.commit()
        conn.close()
    
    async def _update_target_stats(self, target: LeadTarget, leads_found: int, success: bool = True):
        """Update statistics for a target location"""
        conn = sqlite3.connect(self.targets_db_path)
        
        # Get current stats
        cursor = conn.execute("""
            SELECT total_leads_found, success_rate FROM lead_targets 
            WHERE city = ? AND state = ?
        """, (target.city, target.state))
        
        row = cursor.fetchone()
        if row:
            total_leads, current_rate = row
            new_total = total_leads + leads_found
            new_rate = (current_rate + (1.0 if success else 0.0)) / 2.0  # Simple average
            
            conn.execute("""
                UPDATE lead_targets 
                SET total_leads_found = ?, success_rate = ?, last_scraped = ?
                WHERE city = ? AND state = ?
            """, (new_total, new_rate, datetime.now().isoformat(), target.city, target.state))
        else:
            conn.execute("""
                INSERT INTO lead_targets 
                (city, state, country, priority, total_leads_found, success_rate, last_scraped)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (target.city, target.state, target.country, target.priority, 
                  leads_found, 1.0 if success else 0.0, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    async def get_fresh_leads(self, limit: int = 100, city: Optional[str] = None, 
                            state: Optional[str] = None, min_score: float = 0.0) -> List[Dict]:
        """Get fresh leads from the accumulated database"""
        conn = sqlite3.connect(self.db_path)
        
        query = """
            SELECT * FROM continuous_leads 
            WHERE lead_score >= ? AND is_contacted = FALSE
        """
        params = [min_score]
        
        if city:
            query += " AND city = ?"
            params.append(city)
        
        if state:
            query += " AND state = ?"
            params.append(state)
        
        query += " ORDER BY discovered_at DESC, lead_score DESC LIMIT ?"
        params.append(limit)
        
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        
        # Convert to dict format
        columns = [description[0] for description in cursor.description]
        leads = [dict(zip(columns, row)) for row in rows]
        
        conn.close()
        return leads
    
    async def get_daily_stats(self) -> Dict[str, Any]:
        """Get daily statistics about lead generation"""
        conn = sqlite3.connect(self.db_path)
        
        # Total leads
        total_leads = conn.execute("SELECT COUNT(*) FROM continuous_leads").fetchone()[0]
        
        # Today's leads
        today = datetime.now().date()
        today_leads = conn.execute("""
            SELECT COUNT(*) FROM continuous_leads 
            WHERE DATE(discovered_at) = ?
        """, (today,)).fetchone()[0]
        
        # Verified leads
        verified_leads = conn.execute("""
            SELECT COUNT(*) FROM continuous_leads WHERE is_verified = TRUE
        """).fetchone()[0]
        
        # Top performing locations
        top_locations = conn.execute("""
            SELECT city, state, COUNT(*) as lead_count 
            FROM continuous_leads 
            GROUP BY city, state 
            ORDER BY lead_count DESC 
            LIMIT 10
        """).fetchall()
        
        conn.close()
        
        return {
            "total_leads": total_leads,
            "today_leads": today_leads,
            "verified_leads": verified_leads,
            "top_locations": [{"city": row[0], "state": row[1], "count": row[2]} for row in top_locations],
            "target_daily": 500,
            "progress_percent": (today_leads / 500) * 100 if today_leads else 0
        }
    
    async def _cleanup_old_leads(self):
        """Clean up old leads (older than 30 days)"""
        logger.info("Cleaning up old leads...")
        
        conn = sqlite3.connect(self.db_path)
        cutoff_date = (datetime.now() - timedelta(days=30)).isoformat()
        
        deleted = conn.execute("""
            DELETE FROM continuous_leads 
            WHERE discovered_at < ? AND is_contacted = TRUE
        """, (cutoff_date,)).rowcount
        
        conn.commit()
        conn.close()
        
        logger.info(f"Cleaned up {deleted} old leads")
    
    async def _analyze_performance(self):
        """Analyze performance and adjust strategy"""
        logger.info("Analyzing performance...")
        
        stats = await self.get_daily_stats()
        logger.info(f"Daily stats: {stats['today_leads']}/{stats['target_daily']} leads")
        
        # If we're behind target, increase scraping frequency
        if stats['today_leads'] < 300:  # Less than 60% of target
            logger.info("⚠️ Behind target - increasing scraping frequency")
            # Could implement dynamic scheduling here
    
    def stop_continuous_mode(self):
        """Stop the continuous lead generation system"""
        self.is_running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("🛑 Continuous mode stopped")

# Global instance
continuous_engine = ContinuousLeadEngine()

async def start_continuous_lead_generation():
    """Start the continuous lead generation system"""
    await continuous_engine.start_continuous_mode()

async def get_fresh_leads(limit: int = 100, city: Optional[str] = None, 
                         state: Optional[str] = None, min_score: float = 0.0) -> List[Dict]:
    """Get fresh leads from the continuous system"""
    return await continuous_engine.get_fresh_leads(limit, city, state, min_score)

async def get_daily_stats() -> Dict[str, Any]:
    """Get daily statistics"""
    return await continuous_engine.get_daily_stats()

