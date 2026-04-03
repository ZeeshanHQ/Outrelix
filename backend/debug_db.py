import httpx
import json

SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"

def check_db():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    with httpx.Client() as client:
        # 1. Check Profiles
        url = f"{SUPABASE_URL}/rest/v1/profiles?select=count"
        resp = client.get(url, headers=headers)
        print(f"Total profiles: {resp.text}")
        
        # 2. Check Campaigns
        url = f"{SUPABASE_URL}/rest/v1/campaigns?select=count"
        resp = client.get(url, headers=headers)
        print(f"Total campaigns: {resp.text}")
        
        # 3. Check for any campaign at all
        url = f"{SUPABASE_URL}/rest/v1/campaigns?limit=1"
        resp = client.get(url, headers=headers)
        print(f"One campaign raw: {resp.text}")

if __name__ == "__main__":
    check_db()
