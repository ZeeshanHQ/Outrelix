import logging
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status, Path, Body
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import HTMLResponse
from pydantic import BaseModel
from email_handler import EmailHandler
from reply_detector import ReplyDetector
from config import BATCH_SIZE, MAX_BATCHES
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
# Removed supabase client import to avoid dependency conflicts
import json
import os
import requests
import base64
import time
from email.mime.text import MIMEText
import httpx
from pydantic import BaseModel
from typing import List, Optional
from fastapi import BackgroundTasks
from dotenv import load_dotenv
import asyncio
from datetime import datetime, time as dt_time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from lead_engine_service import LeadEngineService

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Load environment variables
load_dotenv()

# Add DeepSeek API configuration
# DEEPSEEK_API_KEY = "sk-fe9702a172be481fb9d0b86781702685"
# DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

# Resend API configuration for OTP emails
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_DOMAIN = os.getenv("RESEND_DOMAIN")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")

# -------------------- SUPABASE SETUP --------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# Removed supabase client initialization - using direct HTTP requests instead

# Helper function for Supabase HTTP requests
def supabase_request(method, table, data=None, params=None, user_id=None):
    """Make HTTP requests to Supabase REST API"""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    if params:
        url += "?" + "&".join([f"{k}=eq.{v}" for k, v in params.items()])
    
    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    elif method == "PATCH":
        response = requests.patch(url, headers=headers, json=data)
    elif method == "DELETE":
        response = requests.delete(url, headers=headers)
    
    if response.status_code >= 400:
        raise Exception(f"Supabase request failed: {response.status_code} - {response.text}")
    
    return response.json() if response.content else None

def supabase_rpc(function_name, params):
    """Call Supabase RPC functions"""
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=params)
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
    allow_origins=list(filter(None, [
        os.getenv("FRONTEND_URL"),
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000"
    ])),
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
CLIENT_SECRETS_FILE = os.getenv("GOOGLE_CLIENT_SECRETS_FILE", "credentials.json")

SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1/users" if SUPABASE_URL else None
SUPABASE_SERVICE_ROLE_KEY = SUPABASE_KEY  # Use your service role key for backend

# -------------------- MODELS --------------------
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

# -------------------- GMAIL OAUTH2 ROUTES --------------------
@app.get('/auth/gmail')
async def auth_gmail(request: Request):
    try:
        user_id = request.session.get('user_id')
        print(f"[DEBUG] /auth/gmail hit, user_id in session: {user_id}")
        if not user_id:
            return HTMLResponse("<h2>Error: You must be logged in to connect Gmail. Please log in first.</h2>", status_code=401)
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri=f"{os.getenv('BACKEND_URL')}/auth/gmail/callback" if os.getenv('BACKEND_URL') else str(request.url).split('/auth')[0] + '/auth/gmail/callback'
        )
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        request.session['state'] = state
        request.session['oauth_user_id'] = user_id
        print(f"[DEBUG] /auth/gmail: Redirecting to {authorization_url}")
        return RedirectResponse(authorization_url)
    except Exception as e:
        print(f"[ERROR] /auth/gmail crashed: {e}")
        return HTMLResponse(f"/auth/gmail crashed: {e}", status_code=500)

@app.get('/auth/gmail/callback')
async def auth_gmail_callback(request: Request):
    state = request.session.get('state')
    user_id = request.session.get('oauth_user_id')
    if not user_id:
        return Response(content="No user in session", status_code=400)
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        state=state,
        redirect_uri=f"{os.getenv('BACKEND_URL')}/auth/gmail/callback" if os.getenv('BACKEND_URL') else str(request.url).split('/auth')[0] + '/auth/gmail/callback'
    )
    flow.fetch_token(authorization_response=str(request.url))
    credentials = flow.credentials
    service = build('gmail', 'v1', credentials=credentials)
    try:
        profile = service.users().getProfile(userId='me').execute()
        email = profile['emailAddress']
    except Exception as e:
        return Response(content=f"Failed to verify Gmail access: {str(e)}", status_code=400)
    token_json = {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": credentials.scopes
    }
    # Save Gmail token and Gmail address
    supabase_request("PATCH", "users", {
        "gmail_token": token_json,
        "gmail_email": email
    }, params={"id": user_id})
        return HTMLResponse("""
        <script>
          if (window.opener) {
            window.opener.postMessage({ gmailConnected: true }, "*");
            window.close();
          } else {
            window.location = '""" + (os.getenv('FRONTEND_URL', 'http://localhost:3000')) + """/dashboard?gmail_connected=true';
          }
        </script>
        <p>You can close this window.</p>
    """)

# -------------------- HELPER: GET GMAIL SERVICE FOR USER --------------------
def get_gmail_service_for_user(user_id):
    user_data = supabase_request("GET", "users", params={"id": user_id})
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
    user_id = request.session.get('user_id')
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
    user_id = request.session.get('user_id')
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
        url = f"{SUPABASE_URL}/rest/v1/campaigns"
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
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    try:
        # Use the REST API directly to avoid client compatibility issues
        url = f"{SUPABASE_URL}/rest/v1/campaigns?user_id=eq.{user_id}"
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
        url = f"{SUPABASE_URL}/rest/v1/campaigns?limit=1"
        headers = {
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(url, headers=headers)
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
    resp = requests.get(url, headers=headers)
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
            update_resp = requests.patch(f"{SUPABASE_REST_URL}?id=eq.{user_id}", headers=headers, json=update_data)
            print('[DEBUG] Supabase REST user update:', update_resp.status_code, update_resp.text)
    else:
        # Create user if not found
        data = {"email": email}
        if hasattr(body, "name") and body.name:
            data["name"] = body.name
        if country:
            data["country"] = country
        if country_name:
            data["country_name"] = country_name
        if timezone:
            data["timezone"] = timezone
        resp = requests.post(SUPABASE_REST_URL, headers=headers, json=data)
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
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    user_data = supabase_request("GET", "users", params={"id": user_id})
    if not user_data or len(user_data) == 0:
        return JSONResponse({'error': 'User not found'}, status_code=404)
    return JSONResponse(user_data[0])

@app.get('/api/user/gmail-status')
async def gmail_status(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    try:
        user_data = supabase_request("GET", "users", params={"id": user_id})
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
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    user_data = supabase_request("GET", "users", params={"id": user_id})
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
    supabase_request("PATCH", "users", {'gmail_status': status}, params={"id": user_id})
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
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

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
            "HTTP-Referer": os.getenv("FRONTEND_URL", "http://localhost:3000"),
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
        user_res = supabase.table("users").select("plan, timezone").eq("id", user_id).single().execute()
        user_plan = user_res.data.get("plan", "free")
        user_timezone = user_res.data.get("timezone", "UTC") # Default to UTC if not set

        if user_plan == 'free':
            campaign_count_res = supabase.table("campaigns").select("id", count='exact').eq("user_id", user_id).execute()
            if campaign_count_res.count >= 3:
                raise HTTPException(
                    status_code=403, 
                    detail="You've reached the 3-campaign limit for the free plan. Please upgrade to Pro for unlimited campaigns."
                )
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
        user_res = supabase.table("users").select("plan").eq("id", user_id).single().execute()
        user_plan = user_res.data.get("plan", "Free")
    except Exception as e:
        print(f"[WARNING] Could not get user plan, defaulting to Free: {e}")
        user_plan = "Free"

    # 1. Generate email content FIRST (before saving to database)
    print("Generating email template...")
    email_content = await generate_email_with_openrouter(payload.campaignGoal, payload.industry, user_plan)
    print(f"Email template generated: {email_content['subject']}")

    # 2. Save the campaign to the database with the generated template
    try:
        url = f"{SUPABASE_URL}/rest/v1/campaigns"
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
        supabase.table("campaigns").update({"status": "completed"}).eq("id", campaign_id).execute()
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
    supabase.table("campaigns").update({"status": "completed"}).eq("id", campaign_id).execute()
    print(f"Finished processing campaign: {payload.campaignName}")

@app.get('/api/user/gmail-token-valid')
async def gmail_token_valid(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'valid': False, 'email': None})
    user = supabase.table('users').select('gmail_token, gmail_email').eq('id', user_id).single().execute()
    token_json = user.data.get('gmail_token') if user.data else None
    email = user.data.get('gmail_email') if user.data else None
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
        supabase.table('users').update({'gmail_token': None, 'gmail_email': None}).eq('id', user_id).execute()
        return JSONResponse({'valid': False, 'email': None})

@app.delete('/api/campaigns/{campaign_id}')
async def delete_campaign(campaign_id: int, request: Request):
    """Delete a campaign by ID from Supabase using REST API."""
    user_id = request.session.get('user_id')
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
    user_id = request.session.get('user_id')
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
        users = supabase.table('users').select('id, gmail_token').execute().data
        for user in users:
            user_id = user['id']
            token_json = user.get('gmail_token')
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
            supabase.table('users').update({'gmail_status': status}).eq('id', user_id).execute()
        await asyncio.sleep(300)  # 5 minutes

@app.on_event('startup')
async def start_gmail_status_checker():
    asyncio.create_task(gmail_status_background_checker())

@app.post('/api/user/onboarding')
async def update_onboarding(request: Request, data: OnboardingData = Body(...)):
    print("[DEBUG] /api/user/onboarding called with:", data)
    user_id = request.session.get('user_id')
    if not user_id:
        print("[ERROR] Not authenticated in onboarding endpoint")
        return JSONResponse({"error": "Not authenticated"}, status_code=401)
    update_result = supabase.table('users').update({
        "onboarding_completed": True,
        "expect": data.expect,
        "primary_role": data.primary_role,
        "industry": data.industry,
        "company_size": data.company_size,
        "email_platform": data.email_platform,
        "company_name": data.company_name
    }).eq('id', user_id).execute()
    if not update_result.data:
        print("[ERROR] Supabase onboarding update error:", update_result)
        return JSONResponse({"error": str(update_result)}, status_code=500)
    print("[DEBUG] Onboarding update success for user_id:", user_id)
    return {"success": True}

# =====================================================
# LEAD ENGINE INTEGRATION ENDPOINTS
# =====================================================

class LeadRunRequest(BaseModel):
    queries: str
    geo: str
    category: str
    limit: int = 100
    enable_yelp: bool = True
    enable_clearbit: bool = True
    enable_yellowpages: bool = False
    enable_overpass: bool = True
    push_to_gsheets: bool = False
    dry_run: bool = False
    free_mode: Optional[bool] = None
    enable_embed_scoring: bool = False
    enable_embed_dedupe: bool = False

@app.get('/api/lead-engine/health')
async def lead_engine_health():
    """Check if Lead Engine service is available"""
    try:
        service = LeadEngineService()
        result = await service.health_check()
        return JSONResponse(result)
    except Exception as e:
        logger.error(f"Lead Engine health check failed: {e}")
        return JSONResponse({"status": "error", "message": str(e)}, status_code=503)

@app.post('/api/lead-engine/runs')
async def start_lead_run(request: Request, payload: LeadRunRequest):
    """
    Start a new lead generation run
    Requires Supabase token in Authorization header from frontend
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    # Get Supabase token from request header (frontend should send it)
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        # Try to get token from X-Supabase-Token header as fallback
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse(
            {'error': 'Supabase token required. Send Authorization: Bearer <token> header'},
            status_code=400
        )
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        run_result = await service.start_run(
            queries=payload.queries,
            geo=payload.geo,
            category=payload.category,
            limit=payload.limit,
            enable_yelp=payload.enable_yelp,
            enable_clearbit=payload.enable_clearbit,
            enable_yellowpages=payload.enable_yellowpages,
            enable_overpass=payload.enable_overpass,
            push_to_gsheets=payload.push_to_gsheets,
            dry_run=payload.dry_run,
            free_mode=payload.free_mode,
            enable_embed_scoring=payload.enable_embed_scoring,
            enable_embed_dedupe=payload.enable_embed_dedupe,
        )
        
        # Optionally persist run to our database
        try:
            url = f"{SUPABASE_URL}/rest/v1/lead_runs"
            headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            run_data = {
                "user_id": user_id,
                "engine_run_id": run_result.get("run_id"),
                "queries": payload.queries,
                "geo": payload.geo,
                "category": payload.category,
                "status": run_result.get("status", "queued"),
            }
            requests.post(url, headers=headers, json=run_data)
        except Exception as db_error:
            logger.warning(f"Failed to persist run to database: {db_error}")
            # Don't fail the request if DB persistence fails
        
        return JSONResponse(run_result)
    except Exception as e:
        logger.error(f"Failed to start lead run: {e}")
        return JSONResponse(
            {'error': f'Failed to start lead generation: {str(e)}'},
            status_code=500
        )

@app.get('/api/lead-engine/runs/{run_id}')
async def get_lead_run_status(request: Request, run_id: str):
    """Get status of a lead generation run"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        status_result = await service.get_run_status(run_id)
        return JSONResponse(status_result)
    except ValueError as e:
        return JSONResponse({'error': str(e)}, status_code=404)
    except Exception as e:
        logger.error(f"Failed to get run status: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get('/api/lead-engine/runs/{run_id}/summary')
async def get_lead_run_summary(request: Request, run_id: str):
    """Get summary/statistics for a completed run"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        summary = await service.get_run_summary(run_id)
        return JSONResponse(summary)
    except ValueError as e:
        return JSONResponse({'error': str(e)}, status_code=404)
    except Exception as e:
        logger.error(f"Failed to get run summary: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get('/api/lead-engine/runs/{run_id}/leads')
async def get_lead_run_leads(request: Request, run_id: str):
    """Get leads for a completed run"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        leads_result = await service.get_leads(run_id)
        
        # Optionally persist leads to our database
        try:
            # First get the run_id from our database
            url = f"{SUPABASE_URL}/rest/v1/lead_runs?engine_run_id=eq.{run_id}&user_id=eq.{user_id}"
            headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json"
            }
            run_response = requests.get(url, headers=headers)
            if run_response.status_code == 200 and run_response.json():
                our_run_id = run_response.json()[0]['id']
                
                # Insert leads
                leads_url = f"{SUPABASE_URL}/rest/v1/lead_results"
                leads_items = leads_result.get('items', [])
                if leads_items:
                    leads_data = [{
                        "run_id": our_run_id,
                        "company_name": lead.get("company"),
                        "email": lead.get("email"),
                        "phone": lead.get("phone"),
                        "domain": lead.get("domain"),
                        "location": lead.get("location"),
                        "score": lead.get("lead_score", 0),
                        "quality": lead.get("quality"),
                        "industry": lead.get("industry"),
                        "source": lead.get("source"),
                    } for lead in leads_items]
                    requests.post(leads_url, headers=headers, json=leads_data)
        except Exception as db_error:
            logger.warning(f"Failed to persist leads to database: {db_error}")
            # Don't fail the request if DB persistence fails
        
        return JSONResponse(leads_result)
    except ValueError as e:
        return JSONResponse({'error': str(e)}, status_code=404)
    except Exception as e:
        logger.error(f"Failed to get leads: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.delete('/api/lead-engine/runs/{run_id}')
async def delete_lead_run(request: Request, run_id: str):
    """Delete a lead generation run"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        result = await service.delete_run(run_id)
        return JSONResponse(result)
    except ValueError as e:
        return JSONResponse({'error': str(e)}, status_code=404)
    except Exception as e:
        logger.error(f"Failed to delete run: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get('/api/lead-engine/usage/stats')
async def get_lead_engine_usage_stats(request: Request):
    """Get usage statistics for Lead Engine"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        stats = await service.get_usage_stats()
        return JSONResponse(stats)
    except Exception as e:
        logger.error(f"Failed to get usage stats: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get('/api/lead-engine/runs')
async def list_lead_runs(request: Request):
    """List all lead generation runs for current user"""
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    
    auth_header = request.headers.get('Authorization', '')
    supabase_token = None
    if auth_header.startswith('Bearer '):
        supabase_token = auth_header.split(' ', 1)[1]
    else:
        supabase_token = request.headers.get('X-Supabase-Token')
    
    if not supabase_token:
        return JSONResponse({'error': 'Supabase token required'}, status_code=400)
    
    try:
        service = LeadEngineService(supabase_token=supabase_token)
        runs = await service.list_runs()
        return JSONResponse(runs)
    except Exception as e:
        logger.error(f"Failed to list runs: {e}")
        return JSONResponse({'error': str(e)}, status_code=500)

print("main_api.py loaded successfully") 