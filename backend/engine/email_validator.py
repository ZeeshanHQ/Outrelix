import asyncio
import re
import socket
from typing import Any, Dict, List, Optional

import dns.resolver  # type: ignore
import aiosmtplib  # type: ignore

from utils.config import load_config_from_env_and_args
from extractors.email_validator_arjos import ArjosEmailValidator


EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$")

DISPOSABLE_DOMAINS = {
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "trashmail.com",
    "dispostable.com",
}

FREE_DOMAINS = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "aol.com"}


def _cfg():
    class Args:
        queries = []
        geo = ""
        category = ""
        limit = 0
        enable_yelp = False
        enable_yellowpages = False
        enable_clearbit = False
        push_to_gsheets = False
        dry_run = True
        free_mode = False
        enable_overpass = False
        enable_embed_scoring = False
        enable_embed_dedupe = False
    return load_config_from_env_and_args(Args)


def _syntax_ok(email: str) -> bool:
    return bool(EMAIL_RE.match(email or ""))


async def _resolve_mx(domain: str) -> List[str]:
    try:
        answers = dns.resolver.resolve(domain, "MX")
        hosts = [str(r.exchange).rstrip('.') for r in answers]
        return hosts
    except Exception:
        return []


async def _smtp_check(mx_host: str, email: str, timeout: float = 8.0) -> Optional[bool]:
    try:
        client = aiosmtplib.SMTP(hostname=mx_host, port=25, timeout=timeout)
        await client.connect()
        try:
            await client.ehlo()
        except Exception:
            pass
        # Use a null sender to minimize intrusion
        try:
            await client.mail("<>")
        except Exception:
            pass
        code, message = await client.rcpt(email)
        await client.quit()
        if 200 <= code < 300:
            return True
        if 500 <= code < 600:
            return False
        return None
    except (aiosmtplib.errors.SMTPException, socket.timeout, OSError):
        return None


async def validate_email(email: str, retries: int = 2) -> Dict[str, Any]:
    email = (email or "").strip()
    result: Dict[str, Any] = {"email": email, "is_valid": False, "score": 0.0, "reason": ""}
    if not email:
        result["reason"] = "empty"
        return result

    # Syntax
    if not _syntax_ok(email):
        result["reason"] = "bad_syntax"
        return result
    result["score"] += 0.2

    local, _, domain = email.partition("@")
    domain = domain.lower()
    is_disposable = domain in DISPOSABLE_DOMAINS
    is_free = domain in FREE_DOMAINS
    if is_disposable:
        result["reason"] = "disposable"
        result["score"] -= 0.3
    if is_free:
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "free"

    cfg = _cfg()
    if not cfg.email_validator_enabled:
        # only syntax check used
        result["is_valid"] = True
        result["score"] = max(0.0, min(1.0, result["score"]))
        return result

    # MX
    mx_hosts = await _resolve_mx(domain)
    if not mx_hosts:
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "no_mx"
        result["score"] -= 0.2
        return result
    result["score"] += 0.3

    if not cfg.email_validator_network:
        # stop here with MX confirmation only
        result["is_valid"] = True
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "mx_only"
        return result

    # SMTP RCPT TO on first 2 MX hosts
    verdict: Optional[bool] = None
    for host in mx_hosts[:2]:
        attempt = 0
        while attempt <= retries and verdict is None:
            attempt += 1
            v = await _smtp_check(host, email)
            if v is not None:
                verdict = v
                break
            await asyncio.sleep(0.5 * attempt)
        if verdict is not None:
            break

    if verdict is True:
        result["is_valid"] = True
        result["score"] += 0.4
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "smtp_accept"
    elif verdict is False:
        result["is_valid"] = False
        result["score"] -= 0.3
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "smtp_reject"
    else:
        # ambiguous (greylisting, catch-all)
        result["is_valid"] = True
        result["score"] += 0.1
        result["reason"] = (result["reason"] + "," if result["reason"] else "") + "catch_all_or_unknown"

    # Optional ARJOS fallback for second opinion
    cfg = _cfg()
    if hasattr(cfg, 'arjos_email_validator_host') and cfg.arjos_email_validator_host:
        try:
            arjos = ArjosEmailValidator(host=cfg.arjos_email_validator_host, dry_run=False)
            arjos_result = await arjos.validate(email)
            if arjos_result and arjos_result.get("is_valid") is not None:
                # Blend scores: 70% self-hosted, 30% ARJOS
                arjos_score = float(arjos_result.get("score", 0.5))
                result["score"] = 0.7 * result["score"] + 0.3 * arjos_score
                if arjos_result.get("is_valid") and not result["is_valid"]:
                    result["is_valid"] = True
                    result["reason"] = (result["reason"] + "," if result["reason"] else "") + "arjos_override"
        except Exception:
            pass  # fallback failed, keep self-hosted result

    # clamp score
    result["score"] = max(0.0, min(1.0, result["score"]))
    return result


async def validate_batch(emails: List[str], concurrency: int = 10) -> List[Dict[str, Any]]:
    sem = asyncio.Semaphore(concurrency)
    out: List[Dict[str, Any]] = []

    async def worker(e: str):
        async with sem:
            out.append(await validate_email(e))

    await asyncio.gather(*(worker(e) for e in emails))
    return out


