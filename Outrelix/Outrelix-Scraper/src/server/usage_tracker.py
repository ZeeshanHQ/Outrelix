"""
Usage tracking for employee monitoring and API limit management
"""

import os
import logging
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# Usage limits per user
MAX_RUNS_PER_DAY = int(os.getenv("MAX_RUNS_PER_DAY", "50"))
MAX_LEADS_PER_RUN = int(os.getenv("MAX_LEADS_PER_RUN", "5000"))
MAX_API_CALLS_PER_DAY = int(os.getenv("MAX_API_CALLS_PER_DAY", "10000"))

# Database path
DB_DIR = Path("data")
DB_DIR.mkdir(exist_ok=True)
USAGE_DB = DB_DIR / "usage.db"


class UsageTracker:
    """Track user usage for monitoring and limits"""
    
    def __init__(self):
        self._init_db()
    
    def _init_db(self):
        """Initialize usage database"""
        conn = sqlite3.connect(str(USAGE_DB))
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usage_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_user_date ON usage_log(user_id, created_at)
        """)
        conn.commit()
        conn.close()
    
    def log_action(self, user_id: str, action: str, details: Optional[Dict[str, Any]] = None):
        """Log a user action"""
        try:
            conn = sqlite3.connect(str(USAGE_DB))
            cursor = conn.cursor()
            details_json = str(details) if details else None
            cursor.execute(
                "INSERT INTO usage_log (user_id, action, details) VALUES (?, ?, ?)",
                (user_id, action, details_json)
            )
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to log usage: {e}")
    
    def get_user_stats(self, user_id: str, days: int = 1) -> Dict[str, Any]:
        """Get user statistics for last N days"""
        try:
            conn = sqlite3.connect(str(USAGE_DB))
            cursor = conn.cursor()
            since = datetime.now() - timedelta(days=days)
            
            # Count runs
            cursor.execute("""
                SELECT COUNT(*) FROM usage_log 
                WHERE user_id = ? AND action = 'run_started' AND created_at >= ?
            """, (user_id, since.isoformat()))
            runs_count = cursor.fetchone()[0]
            
            # Count API calls
            cursor.execute("""
                SELECT COUNT(*) FROM usage_log 
                WHERE user_id = ? AND action LIKE 'api_call_%' AND created_at >= ?
            """, (user_id, since.isoformat()))
            api_calls = cursor.fetchone()[0]
            
            # Get recent actions
            cursor.execute("""
                SELECT action, details, created_at FROM usage_log 
                WHERE user_id = ? AND created_at >= ?
                ORDER BY created_at DESC LIMIT 20
            """, (user_id, since.isoformat()))
            recent_actions = [
                {"action": row[0], "details": row[1], "time": row[2]}
                for row in cursor.fetchall()
            ]
            
            conn.close()
            
            return {
                "runs_today": runs_count,
                "api_calls_today": api_calls,
                "recent_actions": recent_actions,
                "limits": {
                    "max_runs_per_day": MAX_RUNS_PER_DAY,
                    "max_leads_per_run": MAX_LEADS_PER_RUN,
                    "max_api_calls_per_day": MAX_API_CALLS_PER_DAY,
                },
                "within_limits": {
                    "runs": runs_count < MAX_RUNS_PER_DAY,
                    "api_calls": api_calls < MAX_API_CALLS_PER_DAY,
                }
            }
        except Exception as e:
            logger.error(f"Failed to get user stats: {e}")
            return {
                "runs_today": 0,
                "api_calls_today": 0,
                "recent_actions": [],
                "limits": {},
                "within_limits": {"runs": True, "api_calls": True}
            }

    def get_all_user_ids(self, days: int = 7) -> list[str]:
        """Return distinct user IDs seen in the last N days"""
        try:
            conn = sqlite3.connect(str(USAGE_DB))
            cursor = conn.cursor()
            since = datetime.now() - timedelta(days=days)
            cursor.execute(
                """
                SELECT DISTINCT user_id FROM usage_log
                WHERE created_at >= ?
                ORDER BY user_id
                """,
                (since.isoformat(),)
            )
            rows = cursor.fetchall()
            conn.close()
            return [r[0] for r in rows]
        except Exception as e:
            logger.error(f"Failed to get user ids: {e}")
            return []

    def get_all_stats(self, days: int = 1) -> Dict[str, Any]:
        """Get stats for all users in last N days"""
        ids = self.get_all_user_ids(days=days)
        out = {}
        for uid in ids:
            out[uid] = self.get_user_stats(uid, days=days)
        return out
    
    def check_limits(self, user_id: str) -> tuple[bool, Optional[str]]:
        """Check if user is within limits. Returns (allowed, error_message)"""
        stats = self.get_user_stats(user_id, days=1)
        
        if stats["runs_today"] >= MAX_RUNS_PER_DAY:
            return False, f"Daily run limit reached ({MAX_RUNS_PER_DAY} runs/day)"
        
        if stats["api_calls_today"] >= MAX_API_CALLS_PER_DAY:
            return False, f"Daily API call limit reached ({MAX_API_CALLS_PER_DAY} calls/day)"
        
        return True, None


# Global usage tracker
_usage_tracker: Optional[UsageTracker] = None

def get_usage_tracker() -> UsageTracker:
    """Get global usage tracker instance"""
    global _usage_tracker
    if _usage_tracker is None:
        _usage_tracker = UsageTracker()
    return _usage_tracker



