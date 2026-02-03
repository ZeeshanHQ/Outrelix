print("THIS IS THE CORRECT APP.PY FILE")
import logging
from fastapi import FastAPI, Request, Response, Depends, HTTPException, status
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
from supabase import create_client, Client
import json
import os
from typing import List

# -------------------- SUPABASE SETUP --------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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
app.add_middleware(SessionMiddleware, secret_key='your_secret_key')

email_handler = EmailHandler()
reply_detector = ReplyDetector()

SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
]
CLIENT_SECRETS_FILE = "credentials.json"

# -------------------- MODELS --------------------
class LoginRequest(BaseModel):
    email: str
    password: str = None

class CustomizeMessageRequest(BaseModel):
    template: str
    subject: str

class SendBatchRequest(BaseModel):
    batch_number: int

class CampaignCreate(BaseModel):
    name: str
    recipients: List[str]
    industry: str
    template: str
    csv_uploaded: str
    duration: int

# -------------------- GMAIL OAUTH2 ROUTES --------------------
@app.get('/auth/gmail')
async def auth_gmail(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=f"{os.getenv('BACKEND_URL')}/auth/gmail/callback" if os.getenv('BACKEND_URL') else 'http://127.0.0.1:5000/auth/gmail/callback'
    )
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    request.session['state'] = state
    request.session['oauth_user_id'] = user_id
    return RedirectResponse(authorization_url)

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
        redirect_uri=f"{os.getenv('BACKEND_URL')}/auth/gmail/callback" if os.getenv('BACKEND_URL') else 'http://127.0.0.1:5000/auth/gmail/callback'
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
    supabase.table("users").update({
        "gmail_token": token_json,
        "gmail_email": email
    }).eq("id", user_id).execute()
    return RedirectResponse((os.getenv('FRONTEND_URL', 'http://localhost:3000')) + '/dashboard?gmail_connected=true')

# -------------------- HELPER: GET GMAIL SERVICE FOR USER --------------------
def get_gmail_service_for_user(user_id):
    user = supabase.table("users").select("gmail_token").eq("id", user_id).single().execute()
    token_json = user.data["gmail_token"]
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

@app.post('/api/check-replies')
async def check_replies(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    targets = email_handler.load_target_emails()
    gmail_service = get_gmail_service_for_user(user_id)
    stats = reply_detector.check_replies(gmail_service, targets)
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

@app.post('/api/customize-message')
async def customize_message(body: CustomizeMessageRequest):
    if not body.template or not body.subject:
        return JSONResponse({'error': 'Template and subject are required'}, status_code=400)
    return JSONResponse({'status': 'success'})

@app.post('/login')
async def login(body: LoginRequest, request: Request):
    email = body.email
    # Query Supabase for user with this email
    user_resp = supabase.table('users').select('id, email').eq('email', email).single().execute()
    if not user_resp.data:
        new_user = supabase.table('users').insert({'email': email}).execute()
        if not new_user.data:
            return JSONResponse({'error': 'Could not create user'}, status_code=500)
        user_id = new_user.data[0]['id']
    else:
        user_id = user_resp.data['id']
    request.session['user_id'] = user_id
    return JSONResponse({'status': 'success', 'user_id': user_id})

@app.post('/logout')
async def logout(request: Request):
    request.session.clear()
    return JSONResponse({'status': 'success'})

@app.get('/me')
async def me(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'error': 'Not logged in'}, status_code=401)
    user = supabase.table('users').select('id, email, gmail_email').eq('id', user_id).single().execute()
    return JSONResponse(user.data)

@app.get('/api/user/gmail-status')
async def gmail_status(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    user = supabase.table('users').select('gmail_email').eq('id', user_id).single().execute()
    email = user.data.get('gmail_email') if user.data else None
    return JSONResponse({'connected': bool(email), 'email': email})

@app.post('/api/campaigns')
async def create_campaign(request: Request, campaign_data: CampaignCreate):
    user_id = request.session.get('user_id')
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not logged in")

    try:
        # Save the campaign to the database
        new_campaign_data = {
            'user_id': user_id,
            'name': campaign_data.name,
            'industry': campaign_data.industry,
            'recipients': campaign_data.recipients,
            'template': campaign_data.template,
            'status': 'running', # Or 'scheduled'
            'csv_uploaded': campaign_data.csv_uploaded,
            'duration': campaign_data.duration,
        }
        
        response = supabase.table('campaigns').insert(new_campaign_data).execute()
        
        if not response.data:
             raise HTTPException(status_code=500, detail="Failed to create campaign in database.")

        created_campaign = response.data[0]

        # TODO: Here is where we will trigger the actual email sending logic in the future.
        # For now, we just save it.

        return JSONResponse(status_code=status.HTTP_201_CREATED, content=created_campaign)

    except Exception as e:
        logger.error(f"Error creating campaign for user {user_id}: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

print("app.py loaded successfully") 