import httpx
import json

SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"

def list_all():
    url = f"{SUPABASE_URL}/rest/v1/campaigns"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    with httpx.Client() as client:
        resp = client.get(url, headers=headers)
        data = resp.json()
        print(f"Total campaigns: {len(data)}")
        for c in data:
            print(f"ID: {c.get('id')}, Name: {c.get('name')}, User: {c.get('user_id')}, Status: {c.get('status')}")

if __name__ == "__main__":
    list_all()
