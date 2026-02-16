"""
Rate limiter utility for RapidAPI free tier limits.
Implements token bucket algorithm with per-provider tracking.
"""

import asyncio
import logging
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, Optional

logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    """Configuration for rate limiting per API provider."""
    requests_per_minute: int = 10  # Default: 10 requests per minute for free tier
    requests_per_hour: int = 500  # Default: 500 requests per hour
    burst_size: int = 5  # Allow burst of 5 requests
    backoff_base: float = 1.0  # Base backoff in seconds
    backoff_max: float = 60.0  # Max backoff in seconds


class RateLimiter:
    """
    Token bucket rate limiter with per-provider tracking.
    Tracks both per-minute and per-hour limits.
    """
    
    def __init__(self):
        self._providers: Dict[str, RateLimitConfig] = {}
        self._minute_buckets: Dict[str, list] = defaultdict(list)  # Timestamps of requests in last minute
        self._hour_buckets: Dict[str, list] = defaultdict(list)  # Timestamps of requests in last hour
        self._locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)
        self._backoff_until: Dict[str, float] = {}  # Provider -> timestamp until which we back off
        
    def register_provider(self, provider: str, config: RateLimitConfig):
        """Register a provider with its rate limit configuration."""
        self._providers[provider] = config
        logger.info(f"Registered rate limiter for {provider}: {config.requests_per_minute}/min, {config.requests_per_hour}/hour")
    
    def get_config(self, provider: str) -> RateLimitConfig:
        """Get rate limit config for a provider, or return default."""
        return self._providers.get(provider, RateLimitConfig())
    
    async def acquire(self, provider: str) -> bool:
        """
        Try to acquire a token for making an API call.
        Returns True if allowed, False if rate limited.
        Waits if necessary to respect rate limits.
        """
        config = self.get_config(provider)
        lock = self._locks[provider]
        
        async with lock:
            now = time.time()
            
            # Check if we're in backoff period
            if provider in self._backoff_until:
                if now < self._backoff_until[provider]:
                    wait_time = self._backoff_until[provider] - now
                    logger.warning(f"Rate limiter: {provider} in backoff, waiting {wait_time:.1f}s")
                    await asyncio.sleep(wait_time)
                    now = time.time()
                else:
                    del self._backoff_until[provider]
            
            # Clean old entries from minute bucket
            minute_window = now - 60
            self._minute_buckets[provider] = [
                ts for ts in self._minute_buckets[provider] if ts > minute_window
            ]
            
            # Clean old entries from hour bucket
            hour_window = now - 3600
            self._hour_buckets[provider] = [
                ts for ts in self._hour_buckets[provider] if ts > hour_window
            ]
            
            # Check per-minute limit
            if len(self._minute_buckets[provider]) >= config.requests_per_minute:
                # Calculate wait time until oldest request expires
                oldest = min(self._minute_buckets[provider])
                wait_time = 60 - (now - oldest) + 0.1  # Add small buffer
                if wait_time > 0:
                    logger.warning(f"Rate limiter: {provider} minute limit reached ({config.requests_per_minute}/min), waiting {wait_time:.1f}s")
                    await asyncio.sleep(wait_time)
                    now = time.time()
                    # Re-clean after wait
                    minute_window = now - 60
                    self._minute_buckets[provider] = [
                        ts for ts in self._minute_buckets[provider] if ts > minute_window
                    ]
            
            # Check per-hour limit
            if len(self._hour_buckets[provider]) >= config.requests_per_hour:
                oldest = min(self._hour_buckets[provider])
                wait_time = 3600 - (now - oldest) + 0.1
                if wait_time > 0:
                    logger.warning(f"Rate limiter: {provider} hour limit reached ({config.requests_per_hour}/hour), waiting {wait_time:.1f}s")
                    await asyncio.sleep(min(wait_time, 60))  # Cap wait at 60s to avoid blocking too long
                    now = time.time()
                    # Re-clean after wait
                    hour_window = now - 3600
                    self._hour_buckets[provider] = [
                        ts for ts in self._hour_buckets[provider] if ts > hour_window
                    ]
            
            # Record this request
            self._minute_buckets[provider].append(now)
            self._hour_buckets[provider].append(now)
            
            return True
    
    def record_rate_limit_error(self, provider: str, retry_after: Optional[int] = None):
        """
        Record that we hit a rate limit error (429).
        Sets backoff period based on retry_after header or exponential backoff.
        """
        config = self.get_config(provider)
        now = time.time()
        
        if retry_after:
            backoff_until = now + retry_after
        else:
            # Exponential backoff
            current_backoff = config.backoff_base
            if provider in self._backoff_until:
                # Double the backoff time
                elapsed = now - (self._backoff_until[provider] - current_backoff)
                current_backoff = min(config.backoff_base * (2 ** min(elapsed / 60, 5)), config.backoff_max)
            
            backoff_until = now + current_backoff
        
        self._backoff_until[provider] = backoff_until
        logger.warning(f"Rate limiter: {provider} hit rate limit, backing off until {backoff_until:.1f}")
    
    def get_stats(self, provider: str) -> Dict[str, int]:
        """Get current rate limit statistics for a provider."""
        now = time.time()
        minute_window = now - 60
        hour_window = now - 3600
        
        minute_count = len([ts for ts in self._minute_buckets[provider] if ts > minute_window])
        hour_count = len([ts for ts in self._hour_buckets[provider] if ts > hour_window])
        
        return {
            "requests_last_minute": minute_count,
            "requests_last_hour": hour_count,
            "in_backoff": provider in self._backoff_until and now < self._backoff_until[provider]
        }


# Global rate limiter instance
_global_rate_limiter: Optional[RateLimiter] = None


def get_rate_limiter() -> RateLimiter:
    """Get or create the global rate limiter instance."""
    import os
    
    global _global_rate_limiter
    if _global_rate_limiter is None:
        _global_rate_limiter = RateLimiter()
        
        # Helper to read env var with default
        def get_int_env(key: str, default: int) -> int:
            val = os.getenv(key)
            return int(val) if val else default
        
        # Register default providers with free tier limits (configurable via env)
        _global_rate_limiter.register_provider("google_maps", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_GMAPS_PER_MIN", 10),
            requests_per_hour=get_int_env("RATE_LIMIT_GMAPS_PER_HOUR", 500),
            burst_size=get_int_env("RATE_LIMIT_GMAPS_BURST", 5)
        ))
        _global_rate_limiter.register_provider("yelp", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_YELP_PER_MIN", 5),
            requests_per_hour=get_int_env("RATE_LIMIT_YELP_PER_HOUR", 5000),
            burst_size=get_int_env("RATE_LIMIT_YELP_BURST", 3)
        ))
        _global_rate_limiter.register_provider("contact_extractor", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_CONTACT_PER_MIN", 10),
            requests_per_hour=get_int_env("RATE_LIMIT_CONTACT_PER_HOUR", 500),
            burst_size=get_int_env("RATE_LIMIT_CONTACT_BURST", 5)
        ))
        _global_rate_limiter.register_provider("email_validator", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_EMAIL_PER_MIN", 20),
            requests_per_hour=get_int_env("RATE_LIMIT_EMAIL_PER_HOUR", 1000),
            burst_size=get_int_env("RATE_LIMIT_EMAIL_BURST", 10)
        ))
        _global_rate_limiter.register_provider("yellowpages", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_YP_PER_MIN", 10),
            requests_per_hour=get_int_env("RATE_LIMIT_YP_PER_HOUR", 500),
            burst_size=get_int_env("RATE_LIMIT_YP_BURST", 5)
        ))
        _global_rate_limiter.register_provider("overpass", RateLimitConfig(
            requests_per_minute=get_int_env("RATE_LIMIT_OVERPASS_PER_MIN", 30),
            requests_per_hour=get_int_env("RATE_LIMIT_OVERPASS_PER_HOUR", 1000),
            burst_size=get_int_env("RATE_LIMIT_OVERPASS_BURST", 10)
        ))
    return _global_rate_limiter

