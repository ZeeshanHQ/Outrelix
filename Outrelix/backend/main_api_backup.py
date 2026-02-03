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
import requests

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

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
            redirect_uri='http://localhost:5000/auth/gmail/callback'
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
        redirect_uri='http://localhost:5000/auth/gmail/callback'
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
    supabase.table("users").update({
        "gmail_token": token_json,
        "gmail_email": email
    }).eq("id", user_id).execute()
    return HTMLResponse("""
        <script>
          if (window.opener) {
            window.opener.postMessage({ gmailConnected: true }, "*");
            window.close();
          } else {
            window.location = 'http://localhost:3000/dashboard?gmail_connected=true';
          }
        </script>
        <p>You can close this window.</p>
    """)

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
    targets = email_handler.load_target_emails()
    industries = sorted(set(t['industry'] for t in targets))
    return JSONResponse(industries)

@app.post('/api/customize-message')
async def customize_message(body: CustomizeMessageRequest):
    if not body.template or not body.subject:
        return JSONResponse({'error': 'Template and subject are required'}, status_code=400)
    return JSONResponse({'status': 'success'})

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
    user = supabase.table('users').select('id, email, name, country, country_name, timezone').eq('id', user_id).single().execute()
    return JSONResponse(user.data)

@app.get('/api/user/gmail-status')
async def gmail_status(request: Request):
    user_id = request.session.get('user_id')
    if not user_id:
        return JSONResponse({'connected': False, 'email': None})
    user = supabase.table('users').select('gmail_email').eq('id', user_id).single().execute()
    email = user.data.get('gmail_email') if user.data else None
    return JSONResponse({'connected': bool(email), 'email': email})

@app.get('/test')
async def test():
    return {"status": "ok"}

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

print("main_api.py loaded successfully") 