#!/usr/bin/env python3
"""
Quick test script for the Website Contacts Extractor API integration.
Run this to verify the API is working correctly.
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.insert(0, 'src')

from src.apis.contact_extractor import ContactExtractor

async def test_contact_extractor():
    """Test the contact extractor with a real website."""
    
    # Load environment variables
    load_dotenv()
    
    # Get API credentials
    rapidapi_key = os.getenv("CONTACT_EXTRACTOR_RAPIDAPI_KEY")
    host = os.getenv("CONTACT_EXTRACTOR_RAPIDAPI_HOST")
    base_url = os.getenv("CONTACT_EXTRACTOR_BASE_URL")
    backup_key = os.getenv("CONTACT_EXTRACTOR_BACKUP_KEY")
    
    if not rapidapi_key or not host or not base_url:
        print("❌ Missing API credentials. Please check your .env file.")
        print("Required: CONTACT_EXTRACTOR_RAPIDAPI_KEY, CONTACT_EXTRACTOR_RAPIDAPI_HOST, CONTACT_EXTRACTOR_BASE_URL")
        return
    
    print("🔧 Testing Website Contacts Extractor API...")
    print(f"Host: {host}")
    print(f"Base URL: {base_url}")
    print(f"API Key: {rapidapi_key[:10]}...")
    if backup_key:
        print(f"Backup Key: {backup_key[:10]}...")
    print()
    
    # Create contact extractor
    extractor = ContactExtractor(
        host=host,
        base_url=base_url,
        rapidapi_key=rapidapi_key,
        backup_key=backup_key,
        dry_run=False  # Test with real API
    )
    
    # Test with a real website
    test_website = "https://stripe.com"  # Known to have contact info
    
    print(f"🌐 Testing with website: {test_website}")
    print("⏳ Extracting contacts...")
    
    try:
        result = await extractor.extract_contacts(test_website, max_requests=2, dedupe=True)
        
        print("✅ Success!")
        print(f"📧 Emails found: {len(result.get('emails', []))}")
        for email in result.get('emails', []):
            print(f"   - {email}")
        
        print(f"📞 Phones found: {len(result.get('phones', []))}")
        for phone in result.get('phones', []):
            print(f"   - {phone}")
        
        print(f"🔗 Social links:")
        social_links = result.get('social_links', {})
        for platform, links in social_links.items():
            if links:
                print(f"   - {platform}: {links}")
        
        print(f"📊 Status: {result.get('status_code', 'unknown')}")
        print(f"✅ Extraction success: {result.get('extraction_success', False)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("This might be due to API limits or network issues.")
    
    print("\n🧪 Testing with dry run mode...")
    
    # Test dry run mode
    dry_extractor = ContactExtractor(
        host=host,
        base_url=base_url,
        rapidapi_key=rapidapi_key,
        backup_key=backup_key,
        dry_run=True
    )
    
    dry_result = await dry_extractor.extract_contacts(test_website)
    print(f"📧 Mock emails: {dry_result.get('emails', [])}")
    print(f"📞 Mock phones: {dry_result.get('phones', [])}")

if __name__ == "__main__":
    asyncio.run(test_contact_extractor())
