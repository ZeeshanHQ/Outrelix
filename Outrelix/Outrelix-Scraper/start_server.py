#!/usr/bin/env python3
"""
Startup script for Outrelix Lead Engine UI Server
Shows clear error messages if something is wrong
"""

import os
import sys
import logging

# Setup logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s'
)
logger = logging.getLogger(__name__)

# Load .env file FIRST before checking env vars
try:
    from dotenv import load_dotenv
    # Load .env from current directory
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_file):
        load_dotenv(env_file, override=True)
        logger.info("✅ Loaded .env file from: %s", env_file)
    else:
        logger.warning("⚠️  .env file not found at: %s", env_file)
        logger.warning("   Will use system environment variables only")
except ImportError:
    logger.warning("⚠️  python-dotenv not installed")
    logger.warning("   Install with: pip install python-dotenv")
    logger.warning("   Or set environment variables manually")
except Exception as e:
    logger.warning("⚠️  Error loading .env file: %s", e)

def check_required_env():
    """Check required environment variables and show helpful errors"""
    errors = []
    warnings = []
    
    # Required for security - strip whitespace and handle empty strings
    jwt_secret = (os.getenv("OUTRELIX_JWT_SECRET") or "").strip()
    admin_email = (os.getenv("OUTRELIX_ADMIN_EMAIL") or "").strip()
    admin_password = (os.getenv("OUTRELIX_ADMIN_PASSWORD") or "").strip()
    
    # Debug: Show what was loaded (hide password for security)
    logger.debug("Environment check:")
    logger.debug("  OUTRELIX_JWT_SECRET: %s", "SET" if jwt_secret else "NOT SET")
    logger.debug("  OUTRELIX_ADMIN_EMAIL: %s", admin_email[:10] + "..." if admin_email else "NOT SET")
    logger.debug("  OUTRELIX_ADMIN_PASSWORD: %s", "SET" if admin_password else "NOT SET")
    
    if not jwt_secret or jwt_secret == "dev_only_change_me":
        errors.append("❌ OUTRELIX_JWT_SECRET must be set (use a strong random string)")
        errors.append(f"   Current value: {'(empty)' if not jwt_secret else '(default)'}")
    
    if not admin_email or admin_email == "admin@outrelix.local":
        errors.append("❌ OUTRELIX_ADMIN_EMAIL must be set")
        errors.append(f"   Current value: {'(empty)' if not admin_email else admin_email}")
    
    if not admin_password or admin_password == "admin123":
        errors.append("❌ OUTRELIX_ADMIN_PASSWORD must be set (use a strong password)")
        errors.append(f"   Current value: {'(empty)' if not admin_password else '(default)'}")
    
    # Optional but recommended
    if not os.getenv("ENABLE_OVERPASS"):
        warnings.append("⚠️  ENABLE_OVERPASS not set (defaults to true)")
    
    if errors:
        logger.error("=" * 60)
        logger.error("MISSING REQUIRED ENVIRONMENT VARIABLES:")
        logger.error("=" * 60)
        for err in errors:
            logger.error(err)
        logger.error("")
        logger.error("Set them in .env file or export before running:")
        logger.error("  export OUTRELIX_JWT_SECRET='your-secret-key-here'")
        logger.error("  export OUTRELIX_ADMIN_EMAIL='admin@example.com'")
        logger.error("  export OUTRELIX_ADMIN_PASSWORD='your-password'")
        logger.error("=" * 60)
        return False
    
    if warnings:
        for warn in warnings:
            logger.warning(warn)
    
    logger.info("✅ All required environment variables are set")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    missing = []
    
    try:
        import fastapi
    except ImportError:
        missing.append("fastapi")
    
    try:
        import uvicorn
    except ImportError:
        missing.append("uvicorn[standard]")
    
    try:
        import jwt
    except ImportError:
        missing.append("PyJWT")
    
    if missing:
        logger.error("=" * 60)
        logger.error("MISSING REQUIRED PACKAGES:")
        logger.error("=" * 60)
        for pkg in missing:
            logger.error(f"  ❌ {pkg}")
        logger.error("")
        logger.error("Install with: pip install -r requirements.txt")
        logger.error("=" * 60)
        return False
    
    logger.info("✅ All required packages are installed")
    return True

def main():
    """Main startup function"""
    logger.info("=" * 60)
    logger.info("🚀 Starting Outrelix Lead Engine Server")
    logger.info("=" * 60)
    
    # Check dependencies first
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment variables
    if not check_required_env():
        sys.exit(1)
    
    # Import uvicorn after checks
    try:
        import uvicorn
    except ImportError:
        logger.error("uvicorn not installed. Run: pip install uvicorn[standard]")
        sys.exit(1)
    
    # Get configuration
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    port = int(os.getenv("SERVER_PORT", "8000"))
    reload = os.getenv("SERVER_RELOAD", "true").lower() == "true"
    
    logger.info("")
    logger.info("=" * 60)
    logger.info("📡 Server Configuration:")
    logger.info(f"   Host: {host}")
    logger.info(f"   Port: {port}")
    logger.info(f"   Reload: {reload}")
    logger.info("=" * 60)
    logger.info("")
    logger.info("🌐 Open your browser to: http://localhost:%s", port)
    logger.info("")
    logger.info("💡 TIP: All errors will appear in this terminal")
    logger.info("   Press Ctrl+C to stop the server")
    logger.info("")
    logger.info("=" * 60)
    logger.info("")
    
    # Start server
    try:
        uvicorn.run(
            "src.server.app:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("")
        logger.info("👋 Server stopped by user")
    except Exception as e:
        logger.error("")
        logger.error("=" * 60)
        logger.error("❌ SERVER STARTUP FAILED:")
        logger.error("=" * 60)
        logger.error(f"Error: {e}")
        logger.error("")
        logger.error("Common issues:")
        logger.error("  1. Port already in use? Try: export SERVER_PORT=8001")
        logger.error("  2. Missing dependencies? Run: pip install -r requirements.txt")
        logger.error("  3. Check the error message above for details")
        logger.error("=" * 60)
        sys.exit(1)

if __name__ == "__main__":
    main()

