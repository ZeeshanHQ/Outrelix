#!/usr/bin/env python3
"""
Quick script to check if .env file is being loaded correctly
"""

import os
import sys

print("=" * 60)
print("🔍 Checking .env file loading...")
print("=" * 60)

# Try to load .env
try:
    from dotenv import load_dotenv
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    
    if os.path.exists(env_file):
        print(f"✅ Found .env file at: {env_file}")
        load_dotenv(env_file, override=True)
        print("✅ Loaded .env file")
    else:
        print(f"❌ .env file NOT found at: {env_file}")
        print(f"   Current directory: {os.getcwd()}")
        print(f"   Script directory: {os.path.dirname(os.path.abspath(__file__))}")
        sys.exit(1)
except ImportError:
    print("❌ python-dotenv not installed!")
    print("   Install with: pip install python-dotenv")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error loading .env: {e}")
    sys.exit(1)

print("")
print("=" * 60)
print("📋 Environment Variables Check:")
print("=" * 60)

# Check required vars
required = {
    "OUTRELIX_JWT_SECRET": os.getenv("OUTRELIX_JWT_SECRET", "").strip(),
    "OUTRELIX_ADMIN_EMAIL": os.getenv("OUTRELIX_ADMIN_EMAIL", "").strip(),
    "OUTRELIX_ADMIN_PASSWORD": os.getenv("OUTRELIX_ADMIN_PASSWORD", "").strip(),
}

optional = {
    "ENABLE_OVERPASS": os.getenv("ENABLE_OVERPASS", "").strip(),
    "ENABLE_EMBED_SCORING": os.getenv("ENABLE_EMBED_SCORING", "").strip(),
    "ENABLE_EMBED_DEDUPE": os.getenv("ENABLE_EMBED_DEDUPE", "").strip(),
}

all_good = True

for key, value in required.items():
    if value:
        # Hide sensitive data
        if "PASSWORD" in key or "SECRET" in key:
            display = "*" * min(len(value), 10) + "..." if len(value) > 10 else "*" * len(value)
        else:
            display = value
        print(f"✅ {key}: {display}")
    else:
        print(f"❌ {key}: NOT SET")
        all_good = False

print("")
print("Optional variables:")
for key, value in optional.items():
    if value:
        print(f"✅ {key}: {value}")
    else:
        print(f"⚠️  {key}: not set (will use default)")

print("")
print("=" * 60)

if all_good:
    print("✅ All required environment variables are set!")
    print("   You can now run: python start_server.py")
else:
    print("❌ Some required variables are missing!")
    print("")
    print("Make sure your .env file has:")
    print("  OUTRELIX_JWT_SECRET=your-secret-key")
    print("  OUTRELIX_ADMIN_EMAIL=your-email@example.com")
    print("  OUTRELIX_ADMIN_PASSWORD=your-password")
    print("")
    print("Note: Remove any comments (#) from the same line")
    print("      Use separate lines for comments")

print("=" * 60)



