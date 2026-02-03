"""
Caching system for company enrichment data (Clearbit, LinkedIn).
Prevents duplicate API calls for the same domain across runs.
"""

import json
import logging
import os
import sqlite3
import time
from typing import Dict, Optional

logger = logging.getLogger(__name__)

# Cache database path
CACHE_DB_PATH = os.path.join("data", "enrichment_cache.sqlite")

# Default TTL: 7 days (enrichment data doesn't change often)
DEFAULT_TTL_SECONDS = int(os.getenv("ENRICHMENT_CACHE_TTL_SECONDS", "604800"))


def _ensure_cache_db():
    """Ensure cache database and table exist."""
    try:
        os.makedirs(os.path.dirname(CACHE_DB_PATH), exist_ok=True)
        with sqlite3.connect(CACHE_DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS enrichment_cache (
                    domain TEXT PRIMARY KEY,
                    provider TEXT NOT NULL,
                    data TEXT NOT NULL,
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )
            """)
            # Index for faster lookups
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_enrichment_cache_domain_provider 
                ON enrichment_cache(domain, provider)
            """)
            conn.commit()
    except Exception as e:
        logger.warning("Failed to initialize enrichment cache DB: %s", e)


def get_enrichment_cache(domain: str, provider: str, ttl_seconds: Optional[int] = None) -> Optional[Dict]:
    """
    Get cached enrichment data for a domain and provider.
    
    Args:
        domain: Company domain (e.g., "example.com")
        provider: Provider name ("clearbit" or "linkedin")
        ttl_seconds: Optional TTL override (default: DEFAULT_TTL_SECONDS)
    
    Returns:
        Cached data dict if found and not expired, None otherwise
    """
    if not domain:
        return None
    
    domain = domain.lower().strip()
    provider = provider.lower().strip()
    ttl = ttl_seconds or DEFAULT_TTL_SECONDS
    
    try:
        _ensure_cache_db()
        with sqlite3.connect(CACHE_DB_PATH) as conn:
            cur = conn.execute(
                "SELECT data, updated_at FROM enrichment_cache WHERE domain = ? AND provider = ?",
                (domain, provider)
            )
            row = cur.fetchone()
            
            if not row:
                return None
            
            data_json, updated_at = row[0], int(row[1])
            age_seconds = time.time() - updated_at
            
            if age_seconds > ttl:
                # Cache expired, delete it
                conn.execute(
                    "DELETE FROM enrichment_cache WHERE domain = ? AND provider = ?",
                    (domain, provider)
                )
                conn.commit()
                logger.debug("Cache expired for %s/%s (age: %ds)", domain, provider, int(age_seconds))
                return None
            
            # Cache hit
            cached_data = json.loads(data_json)
            logger.debug("Cache hit for %s/%s (age: %ds)", domain, provider, int(age_seconds))
            return cached_data
            
    except Exception as e:
        logger.warning("Failed to get enrichment cache for %s/%s: %s", domain, provider, e)
        return None


def set_enrichment_cache(domain: str, provider: str, data: Dict) -> None:
    """
    Cache enrichment data for a domain and provider.
    
    Args:
        domain: Company domain (e.g., "example.com")
        provider: Provider name ("clearbit" or "linkedin")
        data: Enrichment data to cache
    """
    if not domain or not data:
        return
    
    domain = domain.lower().strip()
    provider = provider.lower().strip()
    now = int(time.time())
    
    try:
        _ensure_cache_db()
        with sqlite3.connect(CACHE_DB_PATH) as conn:
            data_json = json.dumps(data)
            conn.execute("""
                INSERT OR REPLACE INTO enrichment_cache 
                (domain, provider, data, created_at, updated_at)
                VALUES (?, ?, ?, 
                    COALESCE((SELECT created_at FROM enrichment_cache WHERE domain = ? AND provider = ?), ?),
                    ?)
            """, (domain, provider, data_json, domain, provider, now, now))
            conn.commit()
            logger.debug("Cached enrichment data for %s/%s", domain, provider)
    except Exception as e:
        logger.warning("Failed to cache enrichment data for %s/%s: %s", domain, provider, e)


def clear_enrichment_cache(domain: Optional[str] = None, provider: Optional[str] = None) -> int:
    """
    Clear enrichment cache entries.
    
    Args:
        domain: Optional domain to clear (if None, clears all)
        provider: Optional provider to clear (if None, clears all)
    
    Returns:
        Number of entries deleted
    """
    try:
        _ensure_cache_db()
        with sqlite3.connect(CACHE_DB_PATH) as conn:
            if domain and provider:
                cur = conn.execute(
                    "DELETE FROM enrichment_cache WHERE domain = ? AND provider = ?",
                    (domain.lower().strip(), provider.lower().strip())
                )
            elif domain:
                cur = conn.execute(
                    "DELETE FROM enrichment_cache WHERE domain = ?",
                    (domain.lower().strip(),)
                )
            elif provider:
                cur = conn.execute(
                    "DELETE FROM enrichment_cache WHERE provider = ?",
                    (provider.lower().strip(),)
                )
            else:
                cur = conn.execute("DELETE FROM enrichment_cache")
            
            deleted = cur.rowcount
            conn.commit()
            logger.info("Cleared %d cache entries (domain=%s, provider=%s)", deleted, domain, provider)
            return deleted
    except Exception as e:
        logger.warning("Failed to clear enrichment cache: %s", e)
        return 0


def get_cache_stats() -> Dict[str, int]:
    """Get statistics about the cache."""
    try:
        _ensure_cache_db()
        with sqlite3.connect(CACHE_DB_PATH) as conn:
            total = conn.execute("SELECT COUNT(*) FROM enrichment_cache").fetchone()[0]
            clearbit = conn.execute(
                "SELECT COUNT(*) FROM enrichment_cache WHERE provider = 'clearbit'"
            ).fetchone()[0]
            linkedin = conn.execute(
                "SELECT COUNT(*) FROM enrichment_cache WHERE provider = 'linkedin'"
            ).fetchone()[0]
            
            # Count expired entries
            now = time.time()
            expired = conn.execute(
                "SELECT COUNT(*) FROM enrichment_cache WHERE updated_at < ?",
                (int(now - DEFAULT_TTL_SECONDS),)
            ).fetchone()[0]
            
            return {
                "total_entries": total,
                "clearbit_entries": clearbit,
                "linkedin_entries": linkedin,
                "expired_entries": expired,
            }
    except Exception as e:
        logger.warning("Failed to get cache stats: %s", e)
        return {
            "total_entries": 0,
            "clearbit_entries": 0,
            "linkedin_entries": 0,
            "expired_entries": 0,
        }





