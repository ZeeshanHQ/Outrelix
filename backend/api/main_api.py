import logging
import requests
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status, Path, Body
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse
from pydantic import BaseModel
from api.email_handler import EmailHandler
from services.reply_detector import ReplyDetector
from api.config import BATCH_SIZE, MAX_BATCHES
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
# Removed supabase client import to avoid dependency conflicts
import json
import os
import base64
import time
from email.mime.text import MIMEText
import httpx
from pydantic import BaseModel
from typing import List
from fastapi import BackgroundTasks
from dotenv import load_dotenv
import asyncio
from datetime import datetime, time as dt_time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'

# Load environment variables
load_dotenv()

# Add DeepSeek API configuration
# DEEPSEEK_API_KEY = "sk-fe9702a172be481fb9d0b86781702685"
# DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Resend API configuration for OTP emails
RESEND_API_KEY = "re_CDQcfX8S_KLKwPtn9gzgTjyqNXw47GqUD"
RESEND_DOMAIN = "cavexa.online"
SENDER_EMAIL = "noreply@cavexa.online"

# -------------------- SUPABASE SETUP --------------------
SUPABASE_URL = "https://bfoggljxtwoloxthtocy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM"
# Removed supabase client initialization - using direct HTTP requests instead

# Helper function for Supabase HTTP requests
def supabase_request(method, table, data=None, params=None, user_id=None):
    """Make HTTP requests to Supabase REST API using httpx for better SSL stability"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    if params:
        url += "?" + "&".join([f"{k}=eq.{v}" for k, v in params.items()])
    
    with httpx.Client(timeout=30.0) as client:
        if method == "GET":
            response = client.get(url, headers=headers)
        elif method == "POST":
            response = client.post(url, headers=headers, json=data)
        elif method == "PATCH":
            response = client.patch(url, headers=headers, json=data)
        elif method == "DELETE":
            response = client.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
    
    if response.status_code >= 400:
        raise Exception(f"Supabase request failed: {response.status_code} - {response.text}")
    
    return response.json() if response.content else None

def supabase_rpc(function_name, params):
    """Call Supabase RPC functions using httpx for better SSL stability"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    with httpx.Client(timeout=30.0) as client:
        response = client.post(url, headers=headers, json=params)
    
    if response.status_code >= 400:
        raise Exception(f"Supabase RPC failed: {response.status_code} - {response.text}")
    
    return response.json() if response.content else None

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='outreach.log'
)
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SessionMiddleware, secret_key='your_secret_key', same_site="lax")

email_handler = EmailHandler()
reply_detector = ReplyDetector()

SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'openid'
]
CLIENT_SECRETS_FILE = "credentials.json"

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1/profiles"
SUPABASE_SERVICE_ROLE_KEY = SUPABASE_KEY  # Use your service role key for backend

# -------------------- MODELS --------------------
class OnboardingData(BaseModel):
    # From Concierge Flow
    favorite_client: str = ""
    problem_solved: str = ""
    trigger: str = ""
    # From Settings / Traditional
    expect: str = ""
    primary_role: str = ""
    industry: str = ""
    company_size: str = ""
    email_platform: str = ""
    job_title: str = ""
    company_name: str = ""
    budget_range: str = ""
    team_size: str = ""
    preferred_contact: str = ""
    additional_notes: str = ""

class UserProfileUpdate(BaseModel):
    name: str = None
    avatar_url: str = None
    onboarding_data: OnboardingData = None
    onboarding_done: bool = None

class LoginRequest(BaseModel):
    email: str
    password: str = None
    name: str = None
    country: str = None
    country_name: str = None
    timezone: str = None

class CustomizeMessageRequest(BaseModel):
    template: str
    subject: str

class SendBatchRequest(BaseModel):
    batch_number: int

class CampaignRequest(BaseModel):
    name: str
    recipients: list
    industry: str
    template: str
    csv_uploaded: str
    duration: int = None

class GenerateEmailRequest(BaseModel):
    campaign_goal: str
    industry: str
    recipient_name: str = "{name}"

class StartCampaignPayload(BaseModel):
    campaignName: str
    campaignGoal: str
    emails: List[str]
    industry: str
    emailSource: str

class OnboardingData(BaseModel):
    expect: str = ""
    primary_role: str = ""
    industry: str = ""
    company_size: str = ""
    email_platform: str = ""
    job_title: str = ""
    company_name: str = ""
    budget_range: str = ""
    team_size: str = ""
    preferred_contact: str = ""
    additional_notes: str = ""

import jwt
from core.pipeline import Pipeline
from utils.config import load_config_from_env_and_args
import argparse

# -------------------- AUTHENTICATION HELPERS --------------------
async def get_current_user(request: Request):
    """
    Dependency to get the current user ID from session or Authorization header.
    Supports both Starlette sessions and Supabase Bearer tokens.
    """
    # 1. Try session first (original method)
    user_id = request.session.get('user_id')
    if user_id:
        print(f"[DEBUG] Found user_id in session: {user_id}")
        return user_id
        
    # 2. Try Authorization header (Bearer token)
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        print(f"[DEBUG] Received Bearer token: {token[:15]}...")
        try:
            # If it's the service role key, we don't treat it as a user session
            if token == SUPABASE_KEY:
                print("[DEBUG] Received SUPABASE_KEY (Service Role) - Access Denied for user-specific endpoints")
                return None
                
            # Check for X-User-Id header as a fallback
            x_user_id = request.headers.get('X-User-Id')
            if x_user_id:
                print(f"[DEBUG] Found X-User-Id header: {x_user_id}")
                return x_user_id
                
            # Supabase tokens are JWTs. We'll decode without verification to get 'sub'
            try:
                # Use jwt (PyJWT) to decode
                decoded = jwt.decode(token, options={"verify_signature": False})
                uid = decoded.get('sub')
                if uid:
                    print(f"[DEBUG] Extracted user_id from JWT sub: {uid}")
                    return uid
                print("[DEBUG] No 'sub' field in JWT")
            except Exception as jwt_err:
                print(f"[DEBUG] JWT decode failed: {jwt_err}")
                
            # Fallback: Check if it's a raw user_id (some dev flows pass it directly)
            if len(token) > 30 and "-" in token: # Simple UUID check
                print(f"[DEBUG] Treating token as raw user_id: {token}")
                return token

        except Exception as e:
            print(f"[DEBUG] Auth extraction failed: {e}")
            return None
            
    print("[DEBUG] No authentication found (no session, no valid header)")
    return None

class LeadEngineRunParams(BaseModel):
    queries: str
    geo: str = "USA"
    category: str = "General"
    limit: int = 100
    enable_yelp: bool = True
    enable_clearbit: bool = True
    enable_yellowpages: bool = False
    enable_overpass: bool = True
    dry_run: bool = False

class ResendSendRequest(BaseModel):
    to: str
    subject: str
    body: str

# -------------------- GMAIL OAUTH2 ROUTES --------------------
@app.get('/auth/gmail')
async def auth_gmail(request: Request):
    try:
        # 1. Try session first
        user_id = request.session.get('user_id')
        # 2. Try query parameter (used when opening as popup from frontend)
        if not user_id:
            user_id = request.query_params.get('user_id')
        # 3. Try JWT from Authorization header
        if not user_id:
            user_id = await get_current_user(request)
        print(f"[DEBUG] /auth/gmail hit, resolved user_id: {user_id}")
        if not user_id:
            return HTMLResponse("<h2>Error: You must be logged in to connect Gmail. Please log in first.</h2>", status_code=401)
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri='http://localhost:8000/auth/gmail/callback'
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        # Store user_id in session AND encode in state for reliability
        request.session['state'] = state
        request.session['oauth_user_id'] = user_id
        # Also pass user_id via a cookie as popup sessions can be unreliable
        print(f"[DEBUG] /auth/gmail: Redirecting to {authorization_url}")
        response = RedirectResponse(authorization_url)
        response.set_cookie('oauth_user_id', user_id, max_age=600, httponly=True, samesite='lax')
        return response
    except Exception as e:
        print(f"[ERROR] /auth/gmail crashed: {e}")
        import traceback
        traceback.print_exc()
        return HTMLResponse(f"/auth/gmail crashed: {e}", status_code=500)

@app.get('/auth/gmail/callback')
async def auth_gmail_callback(request: Request):
    try:
        # 1. First, get the state from the incoming request query params (Google's response)
        returned_state = request.query_params.get('state', '')
        
        # 2. Try to get our saved state from session, fallback to the returned one if lost (CSRF workaround)
        saved_state = request.session.get('state')
        if not saved_state:
            print(f"[DEBUG] /auth/gmail/callback: Session state lost, falling back to returned state: {returned_state}")
            saved_state = returned_state
            
        user_id = request.session.get('oauth_user_id')
        # Fallback: try cookie if session lost
        if not user_id:
            user_id = request.cookies.get('oauth_user_id')
            print(f"[DEBUG] /auth/gmail/callback: Got user_id from cookie: {user_id}")
        # Fallback: try query param
        if not user_id:
            user_id = request.query_params.get('user_id')
            print(f"[DEBUG] /auth/gmail/callback: Got user_id from query: {user_id}")
            
        if not user_id:
            return HTMLResponse("<h2>Error: No user found in session. Please try connecting Gmail again.</h2>", status_code=400)
            
        print(f"[DEBUG] /auth/gmail/callback: user_id={user_id}, saved_state={'present' if saved_state else 'MISSING'}")
        
        # 3. Initialize flow with the SAVED state (what we think we sent)
        os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
        
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            state=saved_state,
            redirect_uri='http://localhost:8000/auth/gmail/callback'
        )
        
        # 4. Exchange auth code for tokens MANUALLY to bypass oauthlib's CSRF state strictness 
        # which fails on localhost when cross-domain cookies are dropped
        try:
            code = request.query_params.get('code')
            if not code:
                raise ValueError("No authorization code found in the callback URL.")
                
            with httpx.Client(timeout=30.0) as client:
                token_response = client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": flow.client_config["client_id"],
                        "client_secret": flow.client_config["client_secret"],
                        "redirect_uri": 'http://localhost:8000/auth/gmail/callback',
                        "grant_type": "authorization_code"
                    }
                )
            
            if token_response.status_code >= 400:
                raise ValueError(f"Google Token API Error: {token_response.text}")
                
            token_data = token_response.json()
            
            # Reconstruct the credentials object
            credentials = Credentials(
                token=token_data["access_token"],
                refresh_token=token_data.get("refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=flow.client_config["client_id"],
                client_secret=flow.client_config["client_secret"],
                scopes=token_data.get("scope", "").split(" ")
            )
            
        except Exception as token_err:
            print(f"[ERROR] /auth/gmail/callback: Manual token exchange failed: {token_err}")
            import traceback
            traceback.print_exc()
            return HTMLResponse(f"""
                <h2>Gmail Connection Failed</h2>
                <p>Token exchange error: {str(token_err)}</p>
                <p>This usually means you need to re-download your OAuth credentials from Google Cloud Console.</p>
                <p>Steps: Go to <a href="https://console.cloud.google.com/apis/credentials">Google Cloud Console</a> → 
                Your OAuth 2.0 Client → Download JSON → Replace credentials.json</p>
                <br/><button onclick="window.close()">Close</button>
            """, status_code=400)
            
        service = build('gmail', 'v1', credentials=credentials)
        try:
            profile = service.users().getProfile(userId='me').execute()
            email = profile['emailAddress']
        except Exception as e:
            return HTMLResponse(f"<h2>Failed to verify Gmail access: {str(e)}</h2>", status_code=400)
        token_json = {
            "token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": list(credentials.scopes) if credentials.scopes else []
        }
        # Save Gmail token and Gmail address
        supabase_request("PATCH", "profiles", {
            "gmail_token": token_json,
            "gmail_email": email
        }, params={"id": user_id})
        print(f"[DEBUG] /auth/gmail/callback: Gmail connected successfully for {email} (user: {user_id})")
        return HTMLResponse("""
            <script>
              if (window.opener) {
                window.opener.postMessage({ gmailConnected: true }, "*");
                window.close();
              } else {
                window.location = 'http://localhost:3000/dashboard?gmail_connected=true';
              }
            </script>
            <p>Gmail connected! You can close this window.</p>
        """)
    except Exception as e:
        print(f"[ERROR] /auth/gmail/callback crashed: {e}")
        import traceback
        traceback.print_exc()
        return HTMLResponse(f"<h2>Gmail callback error: {str(e)}</h2>", status_code=500)


# -------------------- HELPER: GET GMAIL SERVICE FOR USER --------------------
def get_gmail_service_for_user(user_id):
    user_data = supabase_request("GET", "profiles", params={"id": user_id})
    if not user_data or len(user_data) == 0:
        raise Exception("User not found")
    token_json = user_data[0]["gmail_token"]
    creds = Credentials(
        token=token_json["token"],
        refresh_token=token_json["refresh_token"],
        token_uri=token_json["token_uri"],
        client_id=token_json["client_id"],
        client_secret=token_json["client_secret"],
        scopes=token_json["scopes"]
    )
    return build('gmail', 'v1', credentials=creds)

@app.get('/')
async def index():
    return HTMLResponse("<h1>Outrelix Backend Running</h1>")

@app.post('/api/send-batch')
async def send_batch(request: Request, body: SendBatchRequest):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    batch_number = body.batch_number
    if not 1 <= batch_number <= MAX_BATCHES:
        return JSONResponse({'error': 'Invalid batch number'}, status_code=400)
    targets = email_handler.load_target_emails()
    gmail_service = get_gmail_service_for_user(user_id)
    stats = email_handler.send_batch_emails_with_gmail_service(targets, batch_number, BATCH_SIZE, gmail_service)
    return JSONResponse(stats)

@app.get('/api/industries')
async def get_industries():
    industries = [
        {"name": "Technology", "icon": "💻", "color": "bg-blue-500", "isOpen": True},
        {"name": "Marketing", "icon": "📢", "color": "bg-indigo-500", "isOpen": True},
        {"name": "E-commerce", "icon": "🛍️", "color": "bg-pink-500", "isOpen": True},
        {"name": "Real Estate", "icon": "🏠", "color": "bg-red-500", "isOpen": True},
        {"name": "Education", "icon": "📚", "color": "bg-purple-500", "isOpen": True},
        {"name": "Healthcare", "icon": "🏥", "color": "bg-green-500", "isOpen": False},
        {"name": "Finance", "icon": "💰", "color": "bg-yellow-500", "isOpen": False},
        {"name": "Manufacturing", "icon": "🏭", "color": "bg-gray-500", "isOpen": False},
        {"name": "Legal", "icon": "⚖️", "color": "bg-orange-500", "isOpen": False},
        {"name": "Consulting", "icon": "💼", "color": "bg-teal-500", "isOpen": False},
        {"name": "Non-Profit", "icon": "🤝", "color": "bg-emerald-500", "isOpen": False},
        {"name": "Government", "icon": "🏛️", "color": "bg-slate-500", "isOpen": False}
    ]
    return JSONResponse(industries)

@app.get('/api/industries')
async def get_industries():
    targets = email_handler.load_target_emails()
    industries = sorted(set(t['industry'] for t in targets))
    return JSONResponse(industries)

@app.post('/api/customize-message')
async def customize_message(body: CustomizeMessageRequest):
    if not body.template or not body.subject:
        return JSONResponse({'error': 'Template and subject are required'}, status_code=400)
    return JSONResponse({'status': 'success'})

@app.post('/api/campaigns')
async def create_campaign(request: Request, body: CampaignRequest):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    try:
        # Create campaign in database - only include columns that exist in the table
        campaign_data = {
            "user_id": user_id,
            "name": body.name,
            "industry": body.industry,
            "csv_uploaded": body.csv_uploaded == "csv",  # Convert string to boolean
            "status": "draft",  # Start as draft
            "emails_sent": 0,
            "positive_replies": 0
        }
        
        # Use the REST API directly to avoid client compatibility issues
        url = "https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        response = requests.post(url, headers=headers, json=campaign_data)
        
        if response.status_code in (200, 201):
            campaign = response.json()[0]
            print(f"[DEBUG] Campaign created successfully: {campaign['id']}")
            return JSONResponse({
                'status': 'success',
                'id': campaign['id'],
                'name': campaign['name'],
                'industry': campaign['industry'],
                'status': campaign['status'],
                'created_at': campaign.get('created_at'),
                'message': 'Campaign created successfully'
            })
        else:
            print(f"[ERROR] Supabase response: {response.status_code} - {response.text}")
            return JSONResponse({'error': 'Failed to create campaign in database'}, status_code=500)
            
    except Exception as e:
        print(f"[ERROR] Failed to create campaign: {e}")
        return JSONResponse({'error': f'Failed to create campaign: {str(e)}'}, status_code=500)

@app.get('/api/campaigns')
async def get_campaigns(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    try:
        # Use the REST API directly to avoid client compatibility issues
        url = f"https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns?user_id=eq.{user_id}"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            campaigns = response.json() if response.json() else []
            return JSONResponse({'campaigns': campaigns})
        else:
            print(f"[ERROR] Supabase response: {response.status_code} - {response.text}")
            return JSONResponse({'error': 'Failed to get campaigns from database'}, status_code=500)
            
    except Exception as e:
        print(f"[ERROR] Failed to get campaigns: {e}")
        return JSONResponse({'error': f'Failed to get campaigns: {str(e)}'}, status_code=500)

@app.get('/api/campaigns/schema')
async def get_campaigns_schema():
    """Debug endpoint to check campaigns table structure"""
    try:
        url = "https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns?limit=1"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        with httpx.Client(timeout=30.0) as client:
            response = client.get(url, headers=headers)
        print(f"[DEBUG] Schema check response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data:
                columns = list(data[0].keys())
                print(f"[DEBUG] Available columns: {columns}")
                return JSONResponse({'columns': columns, 'sample': data[0]})
            else:
                return JSONResponse({'columns': [], 'message': 'No campaigns found'})
        else:
            print(f"[ERROR] Schema check failed: {response.text}")
            return JSONResponse({'error': 'Failed to check schema'}, status_code=500)
            
    except Exception as e:
        print(f"[ERROR] Schema check exception: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.post('/login')
async def login(body: LoginRequest, request: Request):
    print('[DEBUG] /login body:', body)
    print('[DEBUG] /login body dict:', body.dict())
    email = body.email
    # Use REST API to check if user exists
    url = f"{SUPABASE_REST_URL}?email=eq.{email}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    with httpx.Client(timeout=30.0) as client:
        resp = client.get(url, headers=headers)
    print('[DEBUG] Supabase REST user lookup:', resp.status_code, resp.text)
    users = resp.json()
    is_new_user = False
    country = getattr(body, 'country', None)
    country_name = getattr(body, 'country_name', None)
    timezone = getattr(body, 'timezone', None)
    if users:
        user_id = users[0]['id']
        # Update country, country_name, and timezone if provided
        update_data = {}
        if country:
            update_data['country'] = country
        if country_name:
            update_data['country_name'] = country_name
        if timezone:
            update_data['timezone'] = timezone
        if update_data:
            with httpx.Client(timeout=30.0) as client:
                update_resp = client.patch(f"{SUPABASE_REST_URL}?id=eq.{user_id}", headers=headers, json=update_data)
            print('[DEBUG] Supabase REST user update:', update_resp.status_code, update_resp.text)
    else:
        # Create user if not found
        data = {"email": email}
        if hasattr(body, "name") and body.name:
            data["full_name"] = body.name
        if country:
            data["country"] = country
        if country_name:
            data["country_name"] = country_name
        if timezone:
            data["timezone"] = timezone
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(SUPABASE_REST_URL, headers=headers, json=data)
        print('[DEBUG] Supabase REST user create:', resp.status_code, resp.text)
        if resp.status_code not in (200, 201):
            return JSONResponse({'error': 'Could not create user'}, status_code=500)
        user_id = resp.json()[0]['id']
        is_new_user = True
    request.session['user_id'] = user_id
    print('[DEBUG] Login success, user_id:', user_id, 'is_new_user:', is_new_user)
    return JSONResponse({'status': 'success', 'user_id': user_id, 'is_new_user': is_new_user})

@app.post('/logout')
async def logout(request: Request):
    request.session.clear()
    return JSONResponse({'status': 'success'})

@app.get('/me')
async def me(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    user_data = supabase_request("GET", "profiles", params={"id": user_id})
    if not user_data or len(user_data) == 0:
        return JSONResponse({'error': 'User not found'}, status_code=404)
    return JSONResponse(user_data[0])

@app.get('/api/user/gmail-status')
async def gmail_status(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    try:
        user_data = supabase_request("GET", "profiles", params={"id": user_id})
        if not user_data or len(user_data) == 0:
            return JSONResponse({'connected': False, 'email': None})
        status = user_data[0].get('gmail_status')
        email = user_data[0].get('gmail_email')
        return JSONResponse({'connected': bool(status), 'email': email})
    except Exception as e:
        print(f"[ERROR] /api/user/gmail-status: {e}")
        return JSONResponse({'connected': False, 'email': None})

@app.get('/api/user/gmail-status/refresh')
async def gmail_status_refresh(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    user_data = supabase_request("GET", "profiles", params={"id": user_id})
    token_json = user_data[0].get('gmail_token') if user_data and len(user_data) > 0 else None
    email = user_data[0].get('gmail_email') if user_data and len(user_data) > 0 else None
    status = False
    if token_json:
        try:
            creds = Credentials(
                token=token_json["token"],
                refresh_token=token_json["refresh_token"],
                token_uri=token_json["token_uri"],
                client_id=token_json["client_id"],
                client_secret=token_json["client_secret"],
                scopes=token_json["scopes"]
            )
            service = build('gmail', 'v1', credentials=creds)
            service.users().getProfile(userId='me').execute()
            status = True
        except Exception:
            status = False
    supabase_request("PATCH", "profiles", {'gmail_status': status}, params={"id": user_id})
    return JSONResponse({'connected': bool(status), 'email': email})

@app.get('/test')
async def test():
    return {"status": "ok"}

# =====================================================
# OTP VERIFICATION ENDPOINTS
# =====================================================

class OTPRequest(BaseModel):
    email: str
    purpose: str = "email_verification"

class OTPVerifyRequest(BaseModel):
    email: str
    otp_code: str
    purpose: str = "email_verification"

@app.post('/api/otp/send')
async def send_otp(request: OTPRequest):
    """Send OTP to user's email using Resend API"""
    try:
        # Generate OTP using Supabase function
        otp_result = supabase_rpc('create_otp', {
            'p_email': request.email,
            'p_purpose': request.purpose,
            'p_expiry_minutes': 10
        })
        
        if not otp_result:
            return JSONResponse({'error': 'Failed to generate OTP'}, status_code=500)
        
        otp_code = otp_result['otp_code']
        
        # Send email using Resend API
        email_data = {
            "from": SENDER_EMAIL,
            "to": [request.email],
            "subject": "Outrelix - Email Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Outrelix Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">{otp_code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">This email was sent by Outrelix</p>
            </div>
            """
        }
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.resend.com/emails",
            headers=headers,
            json=email_data
        )
        
        if response.status_code == 200:
            return JSONResponse({
                'message': 'OTP sent successfully',
                'expires_in_minutes': 10
            })
        else:
            print(f"Resend API error: {response.status_code} - {response.text}")
            return JSONResponse({'error': 'Failed to send email'}, status_code=500)
            
    except Exception as e:
        print(f"Error sending OTP: {e}")
        return JSONResponse({'error': 'Internal server error'}, status_code=500)

@app.post('/api/otp/verify')
async def verify_otp(request: OTPVerifyRequest):
    """Verify OTP code"""
    try:
        # Validate OTP using Supabase function
        validation_result = supabase_rpc('validate_otp', {
            'p_email': request.email,
            'p_otp_code': request.otp_code,
            'p_purpose': request.purpose
        })
        
        if not validation_result:
            return JSONResponse({'error': 'Failed to validate OTP'}, status_code=500)
        
        result = validation_result
        
        if result['valid']:
            # If email verification, update user profile
            if request.purpose == 'email_verification':
                # Update user's email_verified status in profiles table
                supabase_request("PATCH", "profiles", {
                    'email_verified': True,
                    'updated_at': 'NOW()'
                }, params={"email": request.email})
            
            return JSONResponse({
                'valid': True,
                'message': result['message']
            })
        else:
            return JSONResponse({
                'valid': False,
                'message': result['message']
            }, status_code=400)
            
    except Exception as e:
        print(f"Error verifying OTP: {e}")
        return JSONResponse({'error': 'Internal server error'}, status_code=500)

@app.post('/api/otp/resend')
async def resend_otp(request: OTPRequest):
    """Resend OTP to user's email"""
    try:
        # Clean up old OTPs for this email
        supabase.table('otp_verifications').delete().eq('email', request.email).eq('purpose', request.purpose).execute()
        
        # Generate new OTP
        otp_result = supabase.rpc('create_otp', {
            'p_email': request.email,
            'p_purpose': request.purpose,
            'p_expiry_minutes': 10
        }).execute()
        
        if not otp_result.data:
            return JSONResponse({'error': 'Failed to generate OTP'}, status_code=500)
        
        otp_code = otp_result.data['otp_code']
        
        # Send email using Resend API
        email_data = {
            "from": SENDER_EMAIL,
            "to": [request.email],
            "subject": "Outrelix - New Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3b82f6;">Outrelix - New Verification Code</h2>
                <p>Here's your new verification code:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
                    <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">{otp_code}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">This email was sent by Outrelix</p>
            </div>
            """
        }
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.resend.com/emails",
            headers=headers,
            json=email_data
        )
        
        if response.status_code == 200:
            return JSONResponse({
                'message': 'New OTP sent successfully',
                'expires_in_minutes': 10
            })
        else:
            print(f"Resend API error: {response.status_code} - {response.text}")
            return JSONResponse({'error': 'Failed to send email'}, status_code=500)
            
    except Exception as e:
        print(f"Error resending OTP: {e}")
        return JSONResponse({'error': 'Internal server error'}, status_code=500)

def update_gmail_token_rest(user_id, token_json, email):
    url = f"{SUPABASE_REST_URL}?id=eq.{user_id}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    data = {
        "gmail_token": json.dumps(token_json)
    }
    response = requests.patch(url, headers=headers, json=data)
    print("[DEBUG] Supabase REST API response:", response.status_code, response.text)
    return response.ok

# -------------------- GEOIP ENDPOINT --------------------
@app.get('/api/geoip')
async def geoip(request: Request):
    ip = request.client.host
    locale_country = request.query_params.get('locale')
    if ip in ('127.0.0.1', '::1', 'localhost'):
        return JSONResponse({'country': 'PK', 'country_name': 'Pakistan'})
    try:
        geo_url = f'https://ipapi.co/{ip}/json/'
        geo_res = requests.get(geo_url, timeout=3)
        geo_data = geo_res.json()
        country = geo_data.get('country')
        country_name = geo_data.get('country_name')
        if country and len(country) == 2 and country_name:
            return JSONResponse({'country': country, 'country_name': country_name})
    except Exception as e:
        print(f'[geoip] Geo-IP lookup failed: {e}')
    if locale_country and len(locale_country) == 2 and locale_country.isalpha():
        # Optionally map locale_country to a full name (simple fallback)
        country_map = {'US': 'United States', 'IN': 'India', 'CN': 'China', 'PK': 'Pakistan'}
        return JSONResponse({'country': locale_country.upper(), 'country_name': country_map.get(locale_country.upper(), locale_country.upper())})
    return JSONResponse({'country': None, 'country_name': None})

# Remove DeepSeek API config
# DEEPSEEK_API_KEY = ...
# DEEPSEEK_API_URL = ...

# Remove generate_email_from_deepseek and /api/ai/generate-email endpoint

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "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")

async def generate_email_with_openrouter(campaign_goal: str, industry: str, user_plan: str = "Free"):
    """Generate email using OpenRouter Qwen2.5-VL 72B Instruct (text-only usage).
    Returns a dict: { 'subject': str, 'body': str }
    """
    if user_plan.lower() == "pro":
        prompt = f"""
You are an expert email copywriter specializing in {industry} industry outreach.
Create a detailed, professional, and engaging email template for this campaign goal:

Campaign Goal: {campaign_goal}
Industry: {industry}

Guidelines:
- Write a longer, more detailed, and highly professional email (2-4 paragraphs)
- Include personalization placeholders like {{name}}, {{company}}
- Include a compelling subject line
- Include a clear call-to-action
- Do NOT include any promotional or branding text
- Format with proper line breaks and structure

Format the response as JSON:
{{
  "subject": "Your subject line here",
  "body": "Your email body here with proper formatting"
}}
"""
    else:
        prompt = f"""
You are an expert email copywriter specializing in {industry} industry outreach.
Create a short, simple, and basic email template for this campaign goal:

Campaign Goal: {campaign_goal}
Industry: {industry}

Guidelines:
- Write a short, basic, and easy-to-understand email (1-2 short paragraphs)
- Include personalization placeholders like {{name}}, {{company}}
- Include a simple subject line
- Include a clear call-to-action
- Format with proper line breaks and structure

Format the response as JSON:
{{
  "subject": "Your subject line here",
  "body": "Your email body here with proper formatting"
}}
"""

    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Outrelix"
        }
        payload = {
            "model": "qwen/qwen2.5-vl-72b-instruct:free",
            "messages": [
                {"role": "system", "content": "You write short, clear cold emails and polite follow-ups."},
                {"role": "user", "content": prompt}
            ]
        }
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=60)
        result = response.json()
        content = result['choices'][0]['message']['content']
        try:
            email_data = json.loads(content)
            email_body = email_data.get('body', 'Thank you for your time.')
            if user_plan.lower() != "pro":
                email_body = add_outrelix_branding(email_body)
            return {
                'subject': email_data.get('subject', 'Professional Outreach'),
                'body': email_body
            }
        except Exception:
            lines = content.strip().split('\n')
            subject = lines[0].replace('Subject:', '').strip() if lines else 'Professional Outreach'
            body = '\n'.join(lines[1:]).strip() if len(lines) > 1 else content
            if user_plan.lower() != "pro":
                body = add_outrelix_branding(body)
            return {
                'subject': subject,
                'body': body
            }
    except Exception as e:
        print(f"[ERROR] OpenRouter request failed: {e}")
        return {
            'subject': 'Professional Outreach',
            'body': f'Hi {{name}},\n\nI wanted to reach out regarding {campaign_goal} in the {industry} industry.\n\nBest,\nYour Name'
        }

def add_outrelix_branding(email_body: str) -> str:
    """Add Outrelix branding to email body for free users."""
    branding = """

---
Sent with ❤️ using Outrelix - AI-Powered Email Outreach
Transform your business communication at outrelix.com"""
    
    # Add branding before the signature if it exists
    if 'Best regards,' in email_body or 'Regards,' in email_body or 'Sincerely,' in email_body:
        # Find the last occurrence of common signature lines
        signature_lines = ['Best regards,', 'Regards,', 'Sincerely,', 'Thank you,', 'Cheers,']
        for sig_line in signature_lines:
            if sig_line in email_body:
                parts = email_body.split(sig_line)
                if len(parts) > 1:
                    # Insert branding before the signature
                    return parts[0] + branding + '\n\n' + sig_line + parts[1]
    
    # If no signature found, add branding at the end
    return email_body + branding

def generate_fallback_template(industry: str, goal_type: str, add_branding: bool = True):
    """Generate a basic fallback template when API fails."""
    
    fallback_templates = {
        'Technology': {
            'subject': 'Innovation Partnership Opportunity',
            'body': """Hi {name},

I hope this email finds you well. I came across {company} and was impressed by your innovative work in the technology space.

I believe there could be valuable opportunities for collaboration between our organizations. Would you be interested in a brief conversation to explore potential synergies?

Looking forward to connecting.

Best regards,
{your_name}"""
        },
        'Real Estate': {
            'subject': 'Property Investment Opportunity',
            'body': """Hi {name},

I hope you're doing well. I noticed {company}'s impressive portfolio in the real estate market.

I believe there might be interesting investment opportunities we could discuss. Would you be available for a brief call to explore potential collaborations?

Best regards,
{your_name}"""
        },
        'Marketing': {
            'subject': 'Marketing Partnership Opportunity',
            'body': """Hi {name},

I hope this message reaches you well. I've been following {company}'s marketing initiatives and am impressed by your results.

I believe there could be valuable partnership opportunities between our organizations. Would you be interested in discussing potential collaborations?

Best regards,
{your_name}"""
        },
        'E-commerce': {
            'subject': 'E-commerce Growth Opportunity',
            'body': """Hi {name},

I hope you're having a great day. I came across {company} and was impressed by your e-commerce success.

I believe there could be opportunities to help grow your business further. Would you be interested in a brief conversation about potential strategies?

Best regards,
{your_name}"""
        },
        'Education': {
            'subject': 'Educational Partnership Opportunity',
            'body': """Hi {name},

I hope this email finds you well. I've been impressed by {company}'s commitment to education and learning.

I believe there could be valuable opportunities for collaboration in the educational space. Would you be interested in discussing potential partnerships?

Best regards,
{your_name}"""
        }
    }
    
    template = fallback_templates.get(industry, fallback_templates['Technology'])
    
    # Add branding for free users
    if add_branding:
        template['body'] = add_outrelix_branding(template['body'])
    
    return template

# -------------------- GMAIL SENDING HELPER --------------------
def send_email_via_gmail(service, to_email: str, subject: str, body: str):
    try:
        # Replace placeholder or use a generic name if not available
        final_body = body.replace('{name}', 'there') 
        
        message = MIMEText(final_body)
        message['to'] = to_email
        message['subject'] = subject
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        create_message = {'raw': encoded_message}
        send_message = (
            service.users().messages().send(userId="me", body=create_message).execute()
        )
        print(f"Message Id: {send_message['id']} sent to {to_email}")
    except Exception as e:
        print(f"[ERROR] Failed to send email to {to_email}: {e}")

# -------------------- CAMPAIGN ROUTES --------------------
@app.post('/api/campaign/start')
async def start_campaign(payload: StartCampaignPayload, request: Request, background_tasks: BackgroundTasks):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="User not authenticated")

    # Check user's plan and campaign limit
    try:
        user_data = supabase_request("GET", "users", params={"id": user_id})
        if not user_data:
             raise HTTPException(status_code=404, detail="User not found")
        
        user_record = user_data[0]
        user_plan = user_record.get("plan", "free")
        user_timezone = user_record.get("timezone", "UTC") # Default to UTC if not set

        if user_plan == 'free':
            # Count campaigns for this user
            campaign_data = supabase_request("GET", "campaigns", params={"user_id": user_id})
            count = len(campaign_data) if campaign_data else 0
            if count >= 3:
                raise HTTPException(
                    status_code=403, 
                    detail="You've reached the 3-campaign limit for the free plan. Please upgrade to Pro for unlimited campaigns."
                )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Could not verify campaign limit for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Could not verify your account limits. Please try again.")

    # Get user's Gmail service to ensure they are connected
    try:
        service = get_gmail_service_for_user(user_id)
        profile = service.users().getProfile(userId='me').execute()
        print(f"Authenticated as {profile['emailAddress']}. Starting campaign.")
    except Exception as e:
        print(f"[ERROR] Could not get Gmail service for user {user_id}: {e}")
        raise HTTPException(status_code=403, detail="Gmail not connected or token expired. Please reconnect.")

    # Generate email template in the background
    background_tasks.add_task(process_and_send_campaign, user_id, payload, user_timezone)
    
    return JSONResponse(
        status_code=202,
        content={"message": "Campaign accepted and is being processed."}
    )

async def process_and_send_campaign(user_id: str, payload: StartCampaignPayload, user_timezone_str: str):
    print(f"Starting background task for campaign: {payload.campaignName} in timezone {user_timezone_str}")

    # Get user's plan for template quality
    try:
        user_data = supabase_request("GET", "users", params={"id": user_id})
        user_plan = user_data[0].get("plan", "Free") if user_data else "Free"
    except Exception as e:
        print(f"[WARNING] Could not get user plan, defaulting to Free: {e}")
        user_plan = "Free"

    # 1. Generate email content FIRST (before saving to database)
    print("Generating email template...")
    email_content = await generate_email_with_openrouter(payload.campaignGoal, payload.industry, user_plan)
    print(f"Email template generated: {email_content['subject']}")

    # 2. Save the campaign to the database with the generated template
    try:
        url = "https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        campaign_data = {
            "user_id": user_id,
            "name": payload.campaignName,
            "goal": payload.campaignGoal,
            "industry": payload.industry,
            "status": "ready",  # Changed from "processing" to "ready"
            "email_template": email_content['body'],  # Store the generated template
            "email_subject": email_content['subject']  # Store the subject too
        }
        response = requests.post(url, headers=headers, json=campaign_data)
        if response.status_code in (200, 201):
            campaign_id = response.json()[0]['id']
            print(f"Campaign {campaign_id} saved to database with template.")
        else:
            print(f"[ERROR] Supabase REST insert failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"[ERROR] Exception while saving campaign to database: {e}")
        return

    # 3. Get the Gmail service for sending emails
    service = get_gmail_service_for_user(user_id)

    # 4. Schedule and send emails with timezone awareness (using stored template)
    try:
        user_tz = ZoneInfo(user_timezone_str)
    except ZoneInfoNotFoundError:
        print(f"Invalid timezone '{user_timezone_str}', defaulting to UTC.")
        user_tz = ZoneInfo("UTC")

    day_start = dt_time(8, 0)
    day_end = dt_time(20, 0)
    
    emails_to_send = payload.emails
    if len(emails_to_send) == 1:
        # For a single email, send immediately if within the window, else wait.
        now_local = datetime.now(user_tz)
        if not (day_start <= now_local.time() <= day_end):
            print("Outside of sending window. Waiting for the next available slot.")
            await asyncio.sleep(3600) # Simple 1hr wait to re-evaluate
        
        send_email_via_gmail(service, emails_to_send[0], email_content['subject'], email_content['body'])
        supabase_request("PATCH", "campaigns", {"status": "completed"}, params={"id": campaign_id})
        return

    emails_per_day = 50
    batch_size = 10
    delay_between_batches_seconds = 7200 # 2 hours

    daily_emails = emails_to_send[:emails_per_day]
    
    for i in range(0, len(daily_emails), batch_size):
        # Wait until we are within the sending window
        while True:
            now_local = datetime.now(user_tz)
            if day_start <= now_local.time() <= day_end:
                print("Within sending window. Proceeding with batch.")
                break
            
            print(f"Current local time {now_local.time()} is outside of the sending window ({day_start}-{day_end}). Waiting...")
            tomorrow = now_local.date() + timedelta(days=1)
            next_start_time = datetime.combine(tomorrow, day_start, tzinfo=user_tz)
            sleep_seconds = (next_start_time - now_local).total_seconds()
            print(f"Sleeping for {sleep_seconds / 3600:.2f} hours until the next window.")
            await asyncio.sleep(sleep_seconds)

        batch = daily_emails[i:i+batch_size]
        print(f"Sending batch {i//batch_size + 1}...")
        for email in batch:
            send_email_via_gmail(service, email, email_content['subject'], email_content['body'])
            await asyncio.sleep(2) # Small non-blocking delay
        
        # If there are more batches, wait for the 2-hour interval
        if i + batch_size < len(daily_emails):
            print(f"Waiting for {delay_between_batches_seconds / 3600:.2f} hours before next batch...")
            await asyncio.sleep(delay_between_batches_seconds)
            
    # Update campaign status after all batches for the day are sent
    supabase_request("PATCH", "campaigns", {"status": "completed"}, params={"id": campaign_id})
    print(f"Finished processing campaign: {payload.campaignName}")

@app.get('/api/user/gmail-token-valid')
async def gmail_token_valid(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'valid': False, 'email': None})
    user_data = supabase_request("GET", "users", params={"id": user_id})
    user_record = user_data[0] if user_data else {}
    token_json = user_record.get('gmail_token')
    email = user_record.get('gmail_email')
    if not token_json:
        return JSONResponse({'valid': False, 'email': None})
    try:
        creds = Credentials(
            token=token_json["token"],
            refresh_token=token_json["refresh_token"],
            token_uri=token_json["token_uri"],
            client_id=token_json["client_id"],
            client_secret=token_json["client_secret"],
            scopes=token_json["scopes"]
        )
        service = build('gmail', 'v1', credentials=creds)
        profile = service.users().getProfile(userId='me').execute()
        return JSONResponse({'valid': True, 'email': profile['emailAddress']})
    except Exception as e:
        # Clear expired/invalid token from Supabase
        supabase_request("PATCH", "users", {'gmail_token': None, 'gmail_email': None}, params={"id": user_id})
        return JSONResponse({'valid': False, 'email': None})

@app.delete('/api/campaigns/{campaign_id}')
async def delete_campaign(campaign_id: int, request: Request):
    """Delete a campaign by ID from Supabase using REST API."""
    user_id = await get_current_user(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # First, verify the campaign belongs to the user
        verify_url = f"https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns?id=eq.{campaign_id}&user_id=eq.{user_id}"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        verify_response = requests.get(verify_url, headers=headers)
        if verify_response.status_code != 200:
            print(f"[ERROR] Campaign verification failed: {verify_response.status_code} - {verify_response.text}")
            raise HTTPException(status_code=500, detail="Failed to verify campaign ownership")
        
        campaigns = verify_response.json()
        if not campaigns:
            raise HTTPException(status_code=404, detail="Campaign not found or you don't have permission to delete it")
        
        # Now delete the campaign
        delete_url = f"https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns?id=eq.{campaign_id}&user_id=eq.{user_id}"
        delete_response = requests.delete(delete_url, headers=headers)
        
        if delete_response.status_code in (200, 204):
            return {"success": True, "message": "Campaign deleted successfully"}
        else:
            print(f"[ERROR] Supabase REST delete failed: {delete_response.status_code} - {delete_response.text}")
            raise HTTPException(status_code=500, detail="Failed to delete campaign from database")
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error in delete_campaign: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get('/api/campaigns/{campaign_id}')
async def get_campaign_details(campaign_id: int, request: Request):
    """Get campaign details including email template."""
    user_id = await get_current_user(request)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        url = f"https://bfoggljxtwoloxthtocy.supabase.co/rest/v1/campaigns?id=eq.{campaign_id}&user_id=eq.{user_id}"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            campaigns = response.json()
            if campaigns:
                return JSONResponse(campaigns[0])
            else:
                raise HTTPException(status_code=404, detail="Campaign not found")
        else:
            print(f"[ERROR] Supabase REST get failed: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Failed to retrieve campaign")
    except Exception as e:
        print(f"[ERROR] Error retrieving campaign: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Background Gmail status checker
async def gmail_status_background_checker():
    while True:
        try:
            users = supabase_request("GET", "profiles")
            if not users:
                await asyncio.sleep(60)
                continue
                
            for user in users:
                user_id = user['id']
                token_json = user.get('gmail_token')
                status = False
                if token_json:
                    try:
                        # Handle both dict and stringified JSON
                        if isinstance(token_json, str):
                            token_json = json.loads(token_json)
                            
                        creds = Credentials(
                            token=token_json["token"],
                            refresh_token=token_json["refresh_token"],
                            token_uri=token_json["token_uri"],
                            client_id=token_json["client_id"],
                            client_secret=token_json["client_secret"],
                            scopes=token_json["scopes"]
                        )
                        service = build('gmail', 'v1', credentials=creds)
                        service.users().getProfile(userId='me').execute()
                        status = True
                    except Exception:
                        status = False
                supabase_request("PATCH", "profiles", {'gmail_status': status}, params={"id": user_id})
        except Exception as e:
            print(f"[ERROR] background checker error: {e}")
        await asyncio.sleep(300)  # 5 minutes

@app.on_event('startup')
async def start_gmail_status_checker():
    asyncio.create_task(gmail_status_background_checker())

@app.post('/api/user/onboarding')
async def update_onboarding(request: Request, data: OnboardingData = Body(...)):
    print("[DEBUG] /api/user/onboarding called with:", data)
    user_id = await get_current_user(request)
    if not user_id:
        print("[ERROR] Not authenticated in onboarding endpoint")
        return JSONResponse({"error": "Not authenticated"}, status_code=401)
    try:
        supabase_request("PATCH", "profiles", {
            "onboarding_completed": True,
            "expect": data.expect,
            "primary_role": data.primary_role,
            "industry": data.industry,
            "company_size": data.company_size,
            "email_platform": data.email_platform,
            "company_name": data.company_name
        }, params={"id": user_id})
    except Exception as e:
        print(f"[ERROR] Supabase onboarding update error: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)
    print("[DEBUG] Onboarding update success for user_id:", user_id)
    return {"success": True}

@app.post('/api/outreach/send-email-resend')
async def send_email_resend(request: Request, body: ResendSendRequest):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    try:
        # Get user info for "From" name
        user_data = supabase_request("GET", "users", params={"id": user_id})
        user_name = user_data[0].get('name', 'Outrelix User') if user_data else 'Outrelix User'

        email_data = {
            "from": f"{user_name} via Outrelix <noreply@cavexa.online>",
            "to": [body.to],
            "subject": body.subject,
            "text": body.body,
            "html": body.body.replace('\n', '<br>')
        }
        
        headers = {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            "https://api.resend.com/emails",
            headers=headers,
            json=email_data
        )
        
        if response.status_code in (200, 201):
            # Log the outreach in campaigns table as a single send
            try:
                campaign_data = {
                    "user_id": user_id,
                    "name": f"Outreach to {body.to}",
                    "goal": "Direct outreach from Analyzer",
                    "industry": "General",
                    "status": "completed",
                    "email_template": body.body,
                    "email_subject": body.subject
                }
                supabase_request("POST", "campaigns", campaign_data)
            except Exception as log_error:
                print(f"[WARNING] Could not log outreach to campaigns table: {log_error}")

            return JSONResponse({'status': 'success', 'id': response.json().get('id')})
        else:
            print(f"Resend API error: {response.status_code} - {response.text}")
            return JSONResponse({'error': f'Resend error: {response.text}'}, status_code=500)
            
    except Exception as e:
        print(f"Error in send_email_resend: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

# -------------------- LEAD ENGINE ROUTES --------------------

# Store runs in memory for now, could be persisted to JSON or DB
# In a real app, this would be a table in Supabase
RUNS_DATA = {}
DUMMY_RUNS_FILE = "backend/storage/lead_runs.json"

def load_lead_runs():
    global RUNS_DATA
    try:
        if os.path.exists(DUMMY_RUNS_FILE):
            with open(DUMMY_RUNS_FILE, 'r') as f:
                RUNS_DATA = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to load lead runs: {e}")

def save_lead_runs():
    try:
        os.makedirs(os.path.dirname(DUMMY_RUNS_FILE), exist_ok=True)
        with open(DUMMY_RUNS_FILE, 'w') as f:
            json.dump(RUNS_DATA, f)
    except Exception as e:
        print(f"[ERROR] Failed to save lead runs: {e}")

load_lead_runs()

@app.get('/api/lead-engine/health')
async def lead_engine_health():
    return {"status": "healthy", "service": "lead-engine"}

@app.post('/api/lead-engine/runs')
async def start_lead_run(request: Request, params: LeadEngineRunParams, background_tasks: BackgroundTasks):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    run_id = f"run_{int(time.time())}"
    RUNS_DATA[run_id] = {
        "run_id": run_id,
        "user_id": user_id,
        "status": "pending",
        "queries": params.queries,
        "geo": params.geo,
        "created_at": datetime.now().isoformat(),
        "leads_count": 0,
        "progress": 0
    }
    save_lead_runs()
    
    background_tasks.add_task(run_pipeline_task, run_id, params)
    
    return RUNS_DATA[run_id]

async def run_pipeline_task(run_id: str, params: LeadEngineRunParams):
    try:
        RUNS_DATA[run_id]["status"] = "processing"
        RUNS_DATA[run_id]["progress"] = 10
        save_lead_runs()
        
        # Prepare Pipeline config
        # We'll create a dummy args object for load_config_from_env_and_args
        class Args:
            pass
        args = Args()
        args.queries = [params.queries] if isinstance(params.queries, str) else params.queries
        args.geo = params.geo
        args.category = params.category
        args.limit = params.limit
        args.enable_yelp = params.enable_yelp
        args.enable_yellowpages = params.enable_yellowpages
        args.enable_clearbit = params.enable_clearbit
        args.enable_overpass = params.enable_overpass
        args.push_to_gsheets = False
        args.dry_run = params.dry_run
        args.free_mode = True # Default to free mode for now
        args.enable_embed_scoring = False
        args.enable_embed_dedupe = False
        
        config = load_config_from_env_and_args(args)
        run_dir = f"backend/output/{run_id}"
        os.makedirs(run_dir, exist_ok=True)
        
        pipeline = Pipeline(config, run_dir)
        
        RUNS_DATA[run_id]["progress"] = 30
        save_lead_runs()
        
        # 1. Source Businesses
        merged, metrics = await pipeline.source_businesses()
        RUNS_DATA[run_id]["progress"] = 60
        save_lead_runs()
        
        # 2. Find Emails and Validate
        enriched, raw_contacts, validated_emails = await pipeline.find_emails_and_validate(merged)
        RUNS_DATA[run_id]["progress"] = 90
        save_lead_runs()
        
        # 3. Apply AI Enrichment (Scoring, LinkedIn, Summaries)
        final_leads = await pipeline.apply_enrichment(enriched)
        
        # Store leads in RUNS_DATA or a separate file
        leads_file = f"{run_dir}/leads.json"
        with open(leads_file, 'w') as f:
            json.dump({"items": final_leads, "total": len(final_leads)}, f)
            
        logger.info(f"Run {run_id} completed successfully with {len(final_leads)} leads.")
        RUNS_DATA[run_id]["status"] = "completed"
        RUNS_DATA[run_id]["progress"] = 100
        RUNS_DATA[run_id]["leads_count"] = len(final_leads)
        save_lead_runs()
        
    except Exception as e:
        import traceback
        err_tb = traceback.format_exc()
        print(f"[ERROR] Lead Engine Task Failed: {e}")
        print(f"[ERROR] Full Traceback:\n{err_tb}")
        RUNS_DATA[run_id]["status"] = "failed"
        RUNS_DATA[run_id]["error"] = str(e)
        RUNS_DATA[run_id]["traceback"] = err_tb
        save_lead_runs()

@app.get('/api/lead-engine/runs')
async def list_lead_runs(request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    # Filter by user_id
    user_runs = {rid: run for rid, run in RUNS_DATA.items() if run.get('user_id') == user_id}
    return user_runs

@app.get('/api/lead-engine/runs/{run_id}')
async def get_lead_run_status(run_id: str, request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    run = RUNS_DATA.get(run_id)
    if not run or run.get('user_id') != user_id:
        return JSONResponse({'error': 'Run not found'}, status_code=404)
    
    return run

@app.get("/api/user/profile")
async def get_user_profile(user_id: str = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    try:
        users = supabase_request("GET", "users", params={"id": user_id})
        if not users or not isinstance(users, list):
            return {"status": "error", "message": "User not found"}
        
        user = users[0]
        return {
            "status": "success",
            "profile": {
                "id": str(user.get("id")),
                "name": user.get("full_name"),
                "email": user.get("email"),
                "avatar_url": user.get("avatar_url"),
                "onboarding_data": user.get("onboarding_data", {}),
                "onboarding_done": user.get("onboarding_done", False)
            }
        }
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        return {"status": "error", "message": str(e)}

@app.patch("/api/user/profile")
async def update_user_profile(update: UserProfileUpdate, user_id: str = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    data = {}
    if update.name is not None:
        data["full_name"] = update.name
    if update.avatar_url is not None:
        data["avatar_url"] = update.avatar_url
    if update.onboarding_data is not None:
        data["onboarding_data"] = update.onboarding_data.dict()
    if update.onboarding_done is not None:
        data["onboarding_done"] = update.onboarding_done

    if not data:
        return {"status": "success", "message": "No changes requested"}

    try:
        supabase_request("PATCH", "users", data, params={"id": user_id})
        return {"status": "success", "message": "Profile updated"}
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        return {"status": "error", "message": str(e)}

@app.get('/api/lead-engine/runs/{run_id}/leads')
async def get_lead_run_results(run_id: str, request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    run = RUNS_DATA.get(run_id)
    if not run or run.get('user_id') != user_id:
        return JSONResponse({'error': 'Run not found'}, status_code=404)
    
    if run.get('status') != 'completed':
        return JSONResponse({'error': 'Run not completed'}, status_code=409)
    
    leads_file = f"backend/output/{run_id}/leads.json"
    if os.path.exists(leads_file):
        with open(leads_file, 'r') as f:
            return json.load(f)
    
    return {"items": [], "total": 0}

@app.delete('/api/lead-engine/runs/{run_id}')
async def delete_lead_run(run_id: str, request: Request):
    user_id = await get_current_user(request)
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    if run_id in RUNS_DATA and RUNS_DATA[run_id].get('user_id') == user_id:
        del RUNS_DATA[run_id]
        save_lead_runs()
        return {"status": "success"}
    
    return JSONResponse({'error': 'Run not found'}, status_code=404)

print("main_api.py loaded successfully")