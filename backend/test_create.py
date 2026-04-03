import httpx
import json

SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"
USER_ID = "f7ec6955-f10c-4b84-a4a6-be397cbac3f9"

def manual_create():
    url = f"{SUPABASE_URL}/rest/v1/campaigns"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    # Try a minimal set of columns that MUST exist
    data = {
        "user_id": USER_ID,
        "name": "Manual Test Campaign",
        "description": "Testing persistence",
        "status": "draft"
    }
    
    with httpx.Client() as client:
        resp = client.post(url, headers=headers, json=data)
        print(f"Status Code: {resp.status_code}")
        print(f"Response Body: {resp.text}")
        
        # Now check if it's there
        check_url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{resp.json()[0]['id']}" if resp.status_code in (200, 201) else url
        get_resp = client.get(check_url, headers=headers)
        print(f"GET check: {get_resp.text}")

if __name__ == "__main__":
    manual_create()
