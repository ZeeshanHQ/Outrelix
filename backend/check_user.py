import httpx
import json

SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"
USER_ID = "f7ec6955-f10c-4b84-a4a6-be397cbac3f9" # From the logs

def check_user():
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    with httpx.Client() as client:
        # Check if user exists in profiles
        url = f"{SUPABASE_URL}/rest/v1/profiles?id=eq.{USER_ID}"
        resp = client.get(url, headers=headers)
        print(f"User in 'profiles': {resp.text}")
        
        # Check all profiles to see what IDs exist
        url = f"{SUPABASE_URL}/rest/v1/profiles?select=id,email"
        resp = client.get(url, headers=headers)
        print(f"All profiles: {json.dumps(resp.json(), indent=2)}")

if __name__ == "__main__":
    check_user()
