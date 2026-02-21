import asyncio
import logging
import os
from typing import Any, Dict, Optional

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from utils.rate_limiter import get_rate_limiter

logger = logging.getLogger(__name__)


class HttpClient:
    def __init__(self, base_url: Optional[str] = None, headers: Optional[Dict[str, str]] = None, dry_run: bool = False, rate_limit_provider: Optional[str] = None):
        self.base_url = base_url or ""
        self.headers = headers or {}
        self.dry_run = dry_run
        self.rate_limit_provider = rate_limit_provider  # Provider name for rate limiting (e.g., "google_maps")
        self._client: Optional[httpx.AsyncClient] = None
        self._use_tor = (os.getenv("USE_TOR") or "").strip().lower() in {"1", "true", "yes", "y"}
        self._tor_addr = os.getenv("TOR_SOCKS_ADDR", "socks5://127.0.0.1:9050")
        # Do not proxy API calls by default (e.g., RapidAPI). Allow override via APIS_USE_PROXIES=true
        self._apis_use_proxies = (os.getenv("APIS_USE_PROXIES") or "").strip().lower() in {"1", "true", "yes", "y"}
        self._rate_limiter = get_rate_limiter() if rate_limit_provider else None

    async def __aenter__(self):
        if not self.dry_run:
            proxies = None
            if self._use_tor:
                # Avoid proxies for well-known API hosts unless explicitly enabled
                base = (self.base_url or "").lower()
                is_api_host = ("rapidapi.com" in base) or ("api." in base and ".com" in base)
                if is_api_host and not self._apis_use_proxies:
                    proxies = None
                    logger.info("[TOR] Skipped for API host (base_url=%s)", self.base_url)
                else:
                    proxies = {"http://": self._tor_addr, "https://": self._tor_addr}
                    logger.info("[TOR] Routing client through %s", self._tor_addr)
            self._client = httpx.AsyncClient(base_url=self.base_url, headers=self.headers, timeout=30, proxies=proxies)
        else:
            logger.info("DRY_RUN: HttpClient will short-circuit requests")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if self.dry_run:
            await asyncio.sleep(0.01)
            logger.info("DRY_RUN: GET %s params=%s", url, params)
            return {"dry_run": True, "url": url, "params": params or {}, "status": 200}
        
        # Rate limiting
        if self._rate_limiter and self.rate_limit_provider:
            await self._rate_limiter.acquire(self.rate_limit_provider)
        
        assert self._client is not None
        
        # Retry logic with rate limit handling
        max_retries = 3
        for attempt in range(max_retries):
            try:
                resp = await self._client.get(url, params=params)
                
                # Handle rate limit errors (429)
                if resp.status_code == 429:
                    retry_after = None
                    if "Retry-After" in resp.headers:
                        try:
                            retry_after = int(resp.headers["Retry-After"])
                        except ValueError:
                            pass
                    
                    if self._rate_limiter and self.rate_limit_provider:
                        self._rate_limiter.record_rate_limit_error(self.rate_limit_provider, retry_after)
                    
                    if attempt < max_retries - 1:
                        wait_time = retry_after or (2 ** attempt)
                        logger.warning(f"Rate limit hit (429), waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        resp.raise_for_status()
                
                resp.raise_for_status()
                return resp.json()

            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and attempt < max_retries - 1:
                    # Already handled above, but catch here too
                    continue
                raise
            except httpx.HTTPError as e:
                if attempt < max_retries - 1:
                    wait_time = 0.5 * (2 ** attempt)
                    logger.warning(f"HTTP error, retrying in {wait_time}s: {e}")
                    await asyncio.sleep(wait_time)
                    continue
                raise
        
        # Should not reach here, but just in case
        raise httpx.HTTPError("Max retries exceeded")

    async def post(self, url: str, json: Optional[Dict[str, Any]] = None, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if self.dry_run:
            await asyncio.sleep(0.01)
            logger.info("DRY_RUN: POST %s json=%s data=%s", url, json, data)
            return {"dry_run": True, "url": url, "json": json or {}, "data": data or {}, "status": 200}
        
        # Rate limiting
        if self._rate_limiter and self.rate_limit_provider:
            await self._rate_limiter.acquire(self.rate_limit_provider)
        
        assert self._client is not None
        
        # Retry logic with rate limit handling
        max_retries = 3
        for attempt in range(max_retries):
            try:
                resp = await self._client.post(url, json=json, data=data)
                
                # Handle rate limit errors (429)
                if resp.status_code == 429:
                    retry_after = None
                    if "Retry-After" in resp.headers:
                        try:
                            retry_after = int(resp.headers["Retry-After"])
                        except ValueError:
                            pass
                    
                    if self._rate_limiter and self.rate_limit_provider:
                        self._rate_limiter.record_rate_limit_error(self.rate_limit_provider, retry_after)
                    
                    if attempt < max_retries - 1:
                        wait_time = retry_after or (2 ** attempt)
                        logger.warning(f"Rate limit hit (429), waiting {wait_time}s before retry {attempt + 1}/{max_retries}")
                        await asyncio.sleep(wait_time)
                        continue
                    else:
                        resp.raise_for_status()
                
                resp.raise_for_status()
                return resp.json()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 429 and attempt < max_retries - 1:
                    continue
                raise
            except httpx.HTTPError as e:
                if attempt < max_retries - 1:
                    wait_time = 0.5 * (2 ** attempt)
                    logger.warning(f"HTTP error, retrying in {wait_time}s: {e}")
                    await asyncio.sleep(wait_time)
                    continue
                raise
        
        # Should not reach here, but just in case
        raise httpx.HTTPError("Max retries exceeded")


_shared_client: Optional[httpx.AsyncClient] = None
_shared_dry_run: bool = False


async def get_shared_client(dry_run: bool = False, base_url: Optional[str] = None, headers: Optional[Dict[str, str]] = None) -> Optional[httpx.AsyncClient]:
    global _shared_client, _shared_dry_run
    if dry_run:
        _shared_dry_run = True
        logger.info("DRY_RUN: shared client is a no-op; requests are mocked")
        return None
    if _shared_client is None:
        use_tor = (os.getenv("USE_TOR") or "").strip().lower() in {"1", "true", "yes", "y"}
        tor_addr = os.getenv("TOR_SOCKS_ADDR", "socks5://127.0.0.1:9050")
        proxies = {"http://": tor_addr, "https://": tor_addr} if use_tor else None
        if use_tor:
            logger.info("[TOR] Routing shared client through %s", tor_addr)
        _shared_client = httpx.AsyncClient(base_url=base_url or "", headers=headers or {}, timeout=30, proxies=proxies)
    return _shared_client


async def close_shared_client():
    global _shared_client
    if _shared_client is not None:
        await _shared_client.aclose()
        _shared_client = None
