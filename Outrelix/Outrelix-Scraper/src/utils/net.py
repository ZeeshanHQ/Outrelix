import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


def _tor_enabled() -> bool:
    return (os.getenv("USE_TOR") or "").strip().lower() in {"1", "true", "yes", "y"}


async def get_public_ip(force_tor: Optional[bool] = None, timeout: float = 10.0) -> str:
    """Return current public IP from api.ipify.org. If force_tor is True, use Tor; if False, no Tor; if None, follow USE_TOR.
    """
    tor_addr = os.getenv("TOR_SOCKS_ADDR", "socks5://127.0.0.1:9050")
    use_tor = _tor_enabled() if force_tor is None else bool(force_tor)
    proxies = {"http://": tor_addr, "https://": tor_addr} if use_tor else None
    if use_tor:
        logger.info("[TOR] Routing request through %s", tor_addr)
    url = "https://api.ipify.org?format=text"
    async with httpx.AsyncClient(timeout=timeout, proxies=proxies, follow_redirects=True) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.text.strip()


