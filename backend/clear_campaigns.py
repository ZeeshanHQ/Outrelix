import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"

def clear_all_campaigns():
    """Clear all campaigns from the database"""
    try:
        # Get all campaigns first
        url = f"{SUPABASE_URL}/rest/v1/campaigns"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            campaigns = response.json()
            print(f"Found {len(campaigns)} campaigns in database")
            
            if campaigns:
                for campaign in campaigns:
                    campaign_id = campaign.get('id')
                    campaign_name = campaign.get('name')
                    user_id = campaign.get('user_id')
                    print(f"Deleting Campaign ID: {campaign_id}, Name: {campaign_name}, User: {user_id}")
                    
                    # Delete individual campaign
                    delete_url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{campaign_id}"
                    delete_response = requests.delete(delete_url, headers=headers)
                    
                    if delete_response.status_code in (200, 204):
                        print(f"✅ Deleted campaign: {campaign_name}")
                    else:
                        print(f"❌ Failed to delete campaign {campaign_name}: {delete_response.status_code} - {delete_response.text}")
            else:
                print("No campaigns found to delete")
        else:
            print(f"Failed to get campaigns: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error clearing campaigns: {e}")

if __name__ == "__main__":
    print("🗑️ Clearing all campaigns from database...")
    clear_all_campaigns()
    print("Done!") 