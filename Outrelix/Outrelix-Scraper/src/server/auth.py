"""
Authentication system for Lead Engine
Supports both API keys and JWT tokens (for Supabase integration later)
"""

import os
import logging
import jwt
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, Request

logger = logging.getLogger(__name__)

# API Keys for employees (can be set via env or database later)
EMPLOYEE_API_KEYS = os.getenv("EMPLOYEE_API_KEYS", "").split(",")
EMPLOYEE_API_KEYS = [k.strip() for k in EMPLOYEE_API_KEYS if k.strip()]

# JWT config
JWT_SECRET = os.getenv("OUTRELIX_JWT_SECRET")
JWT_ALG = "HS256"
ADMIN_EMAIL = os.getenv("OUTRELIX_ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("OUTRELIX_ADMIN_PASSWORD")

# Supabase integration (optional, for future)
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ENABLE_SUPABASE_AUTH = os.getenv("ENABLE_SUPABASE_AUTH", "false").lower() == "true"


def create_token(email: str, role: str, expires_hours: int = 8) -> str:
    """Create JWT token"""
    payload = {
        "sub": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=expires_hours),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify Supabase JWT token (for future integration)"""
    if not ENABLE_SUPABASE_AUTH or not SUPABASE_JWT_SECRET:
        return None
    
    try:
        # Supabase uses different secret, decode without verification first to get user
        decoded = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return {
            "sub": decoded.get("sub"),
            "email": decoded.get("email"),
            "role": decoded.get("role", "user"),
        }
    except Exception:
        return None


def verify_api_key(api_key: str) -> Optional[Dict[str, Any]]:
    """Verify API key and return user info"""
    if not api_key or api_key not in EMPLOYEE_API_KEYS:
        return None
    
    # Extract user info from API key (format: "key_employee_name" or just the key)
    # For now, return basic user info
    return {
        "sub": f"api_user_{api_key[:8]}",
        "role": "user",
        "auth_method": "api_key",
    }


def require_auth(request: Request) -> Dict[str, Any]:
    """
    Flexible authentication: supports JWT tokens, API keys, and Supabase tokens
    Priority: Supabase > JWT > API Key
    """
    auth_header = request.headers.get("Authorization", "")
    
    if not auth_header:
        raise HTTPException(
            status_code=401, 
            detail="Authentication required. Provide 'Authorization: Bearer <token>' or 'X-API-Key: <key>' header"
        )
    
    # Try Bearer token (JWT or Supabase)
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        
        # Try Supabase first (if enabled)
        if ENABLE_SUPABASE_AUTH:
            supabase_user = verify_supabase_token(token)
            if supabase_user:
                logger.info(f"Authenticated via Supabase: {supabase_user.get('email')}")
                return supabase_user
        
        # Try regular JWT
        try:
            claims = verify_token(token)
            logger.debug(f"Authenticated via JWT: {claims.get('sub')}")
            return claims
        except HTTPException:
            raise
    
    # Try API Key header
    api_key = request.headers.get("X-API-Key") or request.headers.get("API-Key")
    if api_key:
        user = verify_api_key(api_key)
        if user:
            logger.info(f"Authenticated via API Key: {user.get('sub')}")
            return user
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    raise HTTPException(
        status_code=401,
        detail="Invalid authorization format. Use 'Bearer <token>' or 'X-API-Key: <key>'"
    )


def authenticate_employee(email: str, password: str) -> Dict[str, Any]:
    """
    Authenticate employee login (for UI)
    Returns user info if valid, raises HTTPException if not
    """
    # Admin check
    if email == ADMIN_EMAIL:
        if password == ADMIN_PASSWORD:
            return {
                "email": email,
                "role": "admin",
                "sub": email,
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Employee check (can be extended with database)
    # For now, allow any email with password (but log it)
    if password and len(password) >= 4:
        logger.info(f"Employee login: {email}")
        return {
            "email": email,
            "role": "user",
            "sub": email,
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")


def get_user_identifier(claims: Dict[str, Any]) -> str:
    """Get unique identifier for user (for tracking)"""
    return claims.get("sub") or claims.get("email") or "unknown"



