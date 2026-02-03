import logging
import os
import random
from typing import Optional

logger = logging.getLogger(__name__)


def _tor_enabled() -> bool:
    return (os.getenv("USE_TOR") or "").strip().lower() in {"1", "true", "yes", "y"}


async def fetch_html_js(url: str, timeout: float = 25.0, proxy: Optional[str] = None, headless: bool = True) -> str:
    try:
        from playwright.async_api import async_playwright  # type: ignore
    except Exception as e:  # pragma: no cover
        logger.debug("Playwright not available: %s", e)
        return ""
    launch_args = {"headless": headless}
    # Prefer explicit proxy arg, else env HTTP(S)_PROXY, else Tor if enabled
    tor_addr = os.getenv("TOR_SOCKS_ADDR", "socks5://127.0.0.1:9050")
    resolved_proxy = proxy or os.getenv("HTTPS_PROXY") or os.getenv("HTTP_PROXY") or (tor_addr if _tor_enabled() else None)
    if resolved_proxy:
        if _tor_enabled() and not proxy:
            logger.info("[TOR] Routing Playwright through %s", tor_addr)
        launch_args["proxy"] = {"server": resolved_proxy}
    ua_pool = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36",
    ]
    try:
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(**launch_args)
            ctx = await browser.new_context(user_agent=random.choice(ua_pool))
            page = await ctx.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=int(timeout * 1000))
            # Wait for network to be mostly idle
            try:
                await page.wait_for_load_state("networkidle", timeout=10000)
            except Exception:
                pass
            content = await page.content()
            await ctx.close()
            await browser.close()
            return content
    except Exception as e:  # noqa: BLE001
        logger.debug("Playwright fetch failed for %s: %s", url, e)
        return ""


