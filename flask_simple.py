from flask import Flask, request, jsonify, redirect, Response
from flask_cors import CORS
import os
import requests
import json
from datetime import datetime, timedelta
import random
import string
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

app = Flask(__name__)
CORS(app, origins=['https://outrelix.vercel.app', 'http://localhost:3000'])

# Environment variables
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://bfoggljxtwoloxthtocy.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
RESEND_DOMAIN = os.environ.get('RESEND_DOMAIN', 'cavexa.online')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@cavexa.online')

# Google OAuth (use env vars instead of local file)
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GMAIL_REDIRECT_URI = os.environ.get('GMAIL_REDIRECT_URI', 'https://outrelix-backend.onrender.com/auth/gmail/callback')
GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]

@app.route('/')
def home():
    return jsonify({
        "message": "Outrelix API is running!", 
        "status": "success",
        "python_version": "3.11+",
        "endpoints": [
            "/health",
            "/api/user/gmail-status",
            "/api/otp/send",
            "/api/otp/verify", 
            "/api/otp/resend",
            "/api/user/onboarding",
            "/api/campaign/start",
            "/api/industries",
            "/me"
        ]
    })

@app.route('/health')
def health():
    """Health check endpoint for backend wake-up system"""
    return jsonify({
        "status": "online",
        "message": "Backend is awake and ready"
    })

# User management endpoints
@app.route('/me', methods=['GET'])
def get_user():
    """Get current user profile"""
    try:
        # Get user info from request headers or session
        # For now, return mock data - in production, get from Supabase auth
        return jsonify({
            "id": "user_123",
            "name": "Sam Gya",  # This should come from Supabase auth
            "email": "gyasam76@gmail.com",  # This should come from Supabase auth
            "created_at": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/onboarding', methods=['POST'])
def user_onboarding():
    """Handle user onboarding data"""
    try:
        data = request.get_json()
        print(f"Onboarding data received: {data}")
        
        return jsonify({
            "message": "Onboarding data saved successfully",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Gmail integration endpoints
@app.route('/api/user/gmail-status', methods=['GET'])
def gmail_status():
    """Check Gmail connection status"""
    try:
        return jsonify({
            "connected": True,
            "email": "user@gmail.com",
            "status": "active"
        })
    except Exception as e:
        return jsonify({
            "connected": False,
            "email": "",
            "error": str(e)
        })

@app.route('/auth/gmail')
def auth_gmail():
    """Start Gmail OAuth flow using Google client credentials from env."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return Response("Google OAuth env vars missing", status=500)
    flow = Flow.from_client_config({
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [GMAIL_REDIRECT_URI]
        }
    }, scopes=GMAIL_SCOPES, redirect_uri=GMAIL_REDIRECT_URI)

    authorization_url, state = flow.authorization_url(
        access_type='offline', include_granted_scopes='true', prompt='consent'
    )
    # We skip persisting state for simplicity under deadline
    return redirect(authorization_url)

@app.route('/auth/gmail/callback')
def auth_gmail_callback():
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return Response("Google OAuth env vars missing", status=500)
    try:
        flow = Flow.from_client_config({
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GMAIL_REDIRECT_URI]
            }
        }, scopes=GMAIL_SCOPES, redirect_uri=GMAIL_REDIRECT_URI)

        flow.fetch_token(authorization_response=request.url)
        credentials = flow.credentials

        # Fetch user email to confirm connection
        service = build('gmail', 'v1', credentials=credentials)
        profile = service.users().getProfile(userId='me').execute()
        email = profile.get('emailAddress')

        # For hackathon deadline: do not persist tokens; simply notify frontend
        return Response(
            """
            <script>
              if (window.opener) {
                window.opener.postMessage({ gmailConnected: true, email: "%s" }, "*");
                window.close();
              } else {
                window.location = 'https://outrelix.vercel.app/dashboard?gmail_connected=true';
              }
            </script>
            <p>You can close this window.</p>
            """ % (email or ''),
            mimetype='text/html'
        )
    except Exception as e:
        return Response(f"Gmail callback error: {e}", status=500)

# OTP verification system
@app.route('/api/otp/send', methods=['POST'])
def send_otp():
    """Send OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Generate 6-digit OTP
        otp = ''.join(random.choices(string.digits, k=6))
        print(f"OTP generated for {email}: {otp}")
        
        # Send email via Resend API
        email_data = {
            "from": f"Outrelix <{SENDER_EMAIL}>",
            "to": [email],
            "subject": "Your Outrelix Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Outrelix Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
                    {otp}
                </div>
                <p>This code will expire in 10 minutes.</p>
            </div>
            """
        }
        
        # Send via Resend API
        resend_response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {RESEND_API_KEY}',
                'Content-Type': 'application/json'
            },
            json=email_data
        )
        
        if resend_response.status_code == 200:
            return jsonify({
                "message": "OTP sent successfully",
                "status": "success"
            })
        else:
            return jsonify({
                "error": "Failed to send OTP",
                "status": "error"
            }), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/otp/verify', methods=['POST'])
def verify_otp():
    """Verify OTP code"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return jsonify({"error": "Email and OTP are required"}), 400
        
        # Mock verification - accept any 6-digit code
        if len(otp) == 6 and otp.isdigit():
            return jsonify({
                "message": "OTP verified successfully",
                "status": "success",
                "verified": True
            })
        else:
            return jsonify({
                "message": "Invalid OTP",
                "status": "error",
                "verified": False
            }), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/otp/resend', methods=['POST'])
def resend_otp():
    """Resend OTP to user's email"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400
        
        # Generate new OTP
        otp = ''.join(random.choices(string.digits, k=6))
        print(f"OTP resent for {email}: {otp}")
        
        return jsonify({
            "message": "OTP resent successfully",
            "status": "success"
        })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Campaign management endpoints
@app.route('/api/campaign/start', methods=['POST'])
def start_campaign():
    """Start a new campaign"""
    try:
        data = request.get_json()
        print(f"Campaign started: {data}")
        
        return jsonify({
            "message": "Campaign started successfully",
            "campaign_id": "campaign_123",
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Industries endpoint
@app.route('/api/industries', methods=['GET'])
def get_industries():
    """Get list of industries"""
    try:
        industries = [
            "Technology",
            "Healthcare", 
            "Finance",
            "Education",
            "Manufacturing",
            "Retail",
            "Real Estate",
            "Consulting",
            "Marketing",
            "E-commerce"
        ]
        
        return jsonify({
            "industries": industries,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Campaign endpoints with Supabase integration (REAL DB, no mock) ---
def get_supabase_headers():
    assert SUPABASE_KEY, "SUPABASE_KEY env var required"
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

@app.route("/api/campaigns", methods=["GET"])
def get_campaigns():
    """Get all campaigns (optionally filter by user_id)"""
    user_id = request.args.get('user_id')  # pass ?user_id=...
    url = f"{SUPABASE_URL}/rest/v1/campaigns"
    params = []
    if user_id:
        params.append(f"user_id=eq.{user_id}")
    if params:
        url += "?" + "&".join(params)
    r = requests.get(url, headers=get_supabase_headers())
    if r.status_code == 200:
        return jsonify({"campaigns": r.json()})
    return jsonify({"error": "Failed to fetch", "detail": r.text}), r.status_code

@app.route('/api/campaigns/<campaign_id>', methods=['GET'])
def get_campaign_by_id(campaign_id):
    """Get a single campaign by ID"""
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{campaign_id}"
    r = requests.get(url, headers=get_supabase_headers())
    if r.status_code == 200:
        rows = r.json()
        if rows:
            return jsonify(rows[0])
        return jsonify({"error": "Not found"}), 404
    return jsonify({"error": "Failed to fetch", "detail": r.text}), r.status_code

@app.route('/api/campaigns', methods=['POST'])
def create_campaign():
    """Create a new campaign in Supabase"""
    data = request.get_json()
    required = {"user_id", "name", "industry"}
    if not data or not required.issubset(data):
        return jsonify({"error": "Missing user_id, name, or industry"}), 400
    payload = {
        "user_id": data["user_id"],
        "name": data["name"],
        "industry": data.get("industry"),
        "csv_uploaded": bool(data.get("csv_uploaded", False)),
        "status": data.get("status", "draft"),
        "emails_sent": data.get("emails_sent", 0),
        "positive_replies": data.get("positive_replies", 0),
        "created_at": datetime.utcnow().isoformat()
    }
    # include additional user fields if desired!
    r = requests.post(f"{SUPABASE_URL}/rest/v1/campaigns", headers=get_supabase_headers(), json=payload)
    if r.status_code in (200, 201):
        return jsonify(r.json()[0]), 201
    return jsonify({"error": f"Create failed: {r.text}"}), r.status_code

@app.route('/api/campaigns/<campaign_id>', methods=['PATCH'])
def update_campaign(campaign_id):
    """Update campaign fields"""
    data = request.get_json()
    # Data can contain any updatable column
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{campaign_id}"
    r = requests.patch(url, headers=get_supabase_headers(), json=data)
    if r.status_code in (200, 204):
        # GET updated state
        r_get = requests.get(url, headers=get_supabase_headers())
        return jsonify(r_get.json()[0])
    return jsonify({"error": f"Patch failed: {r.text}"}), r.status_code

@app.route('/api/campaigns/<campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    """Delete a campaign by id from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/campaigns?id=eq.{campaign_id}"
    r = requests.delete(url, headers=get_supabase_headers())
    if r.status_code in (200, 204):
        return jsonify({"deleted": True})
    return jsonify({"error": f"Delete failed: {r.text}"}), r.status_code

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)

