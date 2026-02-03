# 🚀 Deployment Environment Variables Guide

## Architecture Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Vercel    │────────▶│   Render    │────────▶│   Render    │
│  (Frontend) │  HTTP   │ (Main API)  │  HTTP   │ (Lead Engine)│
│   React     │         │   FastAPI   │         │   FastAPI   │
└─────────────┘         └─────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      └────────────────────────┼────────────────────────┘
                               │
                          ┌─────────┐
                          │Supabase │
                          │(Database)│
                          └─────────┘
```

## ✅ Recommended: Keep Lead Engine Separate

**YES, keep Lead Engine as a separate service!** 

**Reasons:**
- ✅ Independent scaling (CPU-intensive scraping)
- ✅ Isolated failures (won't crash main app)
- ✅ Separate resource allocation
- ✅ Easier to update/deploy independently
- ✅ Better for monitoring and logging

**Deploy Lead Engine as:**
- Separate Render service (recommended)
- Or separate VPS/server
- Or separate container/instance

---

## 📋 Environment Variables by Service

### 1️⃣ **Vercel (Frontend) - Public Environment Variables**

```env
# Supabase Client (public keys are safe)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
```

**Notes:**
- ✅ These are public (exposed to browser)
- ✅ Only use PUBLIC/ANON keys
- ✅ Never put secrets here!

---

### 2️⃣ **Render - Main App Backend**

```env
# ============================================
# CORS & URLs
# ============================================
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-app.vercel.app

# ============================================
# Supabase (Database & Auth)
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_key  # ⚠️ SERVICE ROLE (not anon!)

# ============================================
# Email Service (OTP)
# ============================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_DOMAIN=yourdomain.com
SENDER_EMAIL=noreply@yourdomain.com

# ============================================
# Google OAuth (Gmail Integration)
# ============================================
GOOGLE_CLIENT_SECRETS_FILE=credentials.json
# OR use environment variable approach (better for Render):
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# ============================================
# AI Email Generation
# ============================================
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxx

# ============================================
# Lead Engine Integration
# ============================================
LEAD_ENGINE_URL=https://your-lead-engine.onrender.com
LEAD_ENGINE_TIMEOUT=300.0
```

**⚠️ Important Changes:**
- ✅ Use `SUPABASE_SERVICE_ROLE_KEY` (not anon key) for backend
- ✅ Use HTTPS URLs (not localhost)
- ✅ Store `credentials.json` securely or use env vars

---

### 3️⃣ **Render - Lead Engine Service (SEPARATE SERVICE)**

```env
# ============================================
# Server Configuration
# ============================================
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_RELOAD=false  # Set to false in production

# ============================================
# Authentication
# ============================================
OUTRELIX_JWT_SECRET=change_to_strong_random_secret  # ⚠️ CHANGE THIS!
OUTRELIX_ADMIN_EMAIL=admin@yourdomain.com  # ⚠️ CHANGE THIS!
OUTRELIX_ADMIN_PASSWORD=change_to_strong_password  # ⚠️ CHANGE THIS!

# Supabase Integration (for auth from main app)
ENABLE_SUPABASE_AUTH=true
SUPABASE_JWT_SECRET=your_supabase_jwt_secret  # From Supabase Dashboard → Settings → API → JWT Secret

# ============================================
# Google Sheets Integration (Optional)
# ============================================
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}  # Full JSON as string
GSHEETS_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/...
PUSH_TO_GSHEETS=true  # Set to false if not using Google Sheets

# ============================================
# Data Source APIs
# ============================================
# Google Maps (RapidAPI)
RAPIDAPI_KEY=d3da522594mshcedadd005bb5b06p11c77djsn8757548ce09f
GOOGLE_MAPS_EXTRACTOR_HOST=maps-data.p.rapidapi.com
GOOGLE_MAPS_EXTRACTOR_BASE=https://maps-data.p.rapidapi.com

# Website Contacts Extractor
CONTACT_EXTRACTOR_RAPIDAPI_KEY=d3da522594mshcedadd005bb5b06p11c77djsn8757548ce09f
CONTACT_EXTRACTOR_RAPIDAPI_HOST=website-contacts-extractor.p.rapidapi.com
CONTACT_EXTRACTOR_BASE_URL=https://website-contacts-extractor.p.rapidapi.com
CONTACT_EXTRACTOR_BACKUP_KEY=de50043e34msheceb6604a49b4c5p1e0fe8jsndfbaf9e967ba
CONTACT_EXTRACTOR_BACKUP_HOST=website-contacts-extractor.p.rapidapi.com

# Email Validation
ARJOS_EMAIL_VALIDATOR_HOST=  # Add if you have it
RAPID_EMAIL_VALIDATOR_HOST=email-validator-api.p.rapidapi.com
RAPID_EMAIL_VALIDATOR_BASE_URL=https://email-validator-api.p.rapidapi.com

# LinkedIn (Optional)
LINKEDIN_SCRAPER_HOST=linkedin-data-api.p.rapidapi.com
LINKEDIN_SCRAPER_BASE_URL=https://linkedin-data-api.p.rapidapi.com
# Uses RAPIDAPI_KEY above

# Optional Sources
YELP_API_KEY=  # Add if using Yelp
YELLOWPAGES_HOST=  # Add if using Yellow Pages
CLEARBIT_API_KEY=  # Add if using Clearbit
CLEARBIT_RAPID_HOST=Clearbitmikilior1V1.p.rapidapi.com
CLEARBIT_RAPID_BASE_URL=https://clearbitmikilior1v1.p.rapidapi.com

# Hunter.io (Backup for email extraction)
HUNTER_API_KEY=  # Add if using Hunter.io

# Phone Validation
PHONE_VALIDATOR_HOST=  # Add if you have phone validator API

# AI (Optional - for enrichment)
OPENROUTER_API_KEY=  # Optional: for AI enrichment features

# ============================================
# Feature Flags
# ============================================
ENABLE_OVERPASS=true
ENABLE_EMBED_SCORING=true
ENABLE_EMBED_DEDUPE=true
EMAIL_VALIDATOR_ENABLED=true
EMAIL_VALIDATOR_NETWORK=true
ENABLE_HF_MODELS=false

# ============================================
# Default Run Parameters (Optional)
# ============================================
QUERIES=roofing contractors,roofing companies
GEO=USA
CATEGORY=Roofing Contractors
LIMIT=1000
ENABLE_YELP=true
ENABLE_YELLOWPAGES=false
ENABLE_CLEARBIT=true
DRY_RUN=false

# ============================================
# Cache & Performance
# ============================================
FETCH_CACHE_TTL_SECONDS=300
LINKEDIN_CACHE_TTL_SECONDS=86400
SCRAPER_DEFAULT_TIMEOUT=20.0

# ============================================
# Tor/Proxy (Optional - for advanced use)
# ============================================
USE_TOR=false  # Set to false unless you need Tor
TOR_SOCKS_ADDR=socks5://127.0.0.1:9050
PROXY_POOL=  # Comma-separated proxy list if needed

# ============================================
# Rate Limiting
# ============================================
API_RATE_LIMIT_PER_MIN=120
```

---

## 🔒 Security Checklist

### ⚠️ **MUST CHANGE for Production:**

1. **Lead Engine JWT Secret:**
   ```env
   OUTRELIX_JWT_SECRET=generate_strong_random_string_here
   ```
   - Generate: `openssl rand -hex 32`
   - **NEVER use default "change_me" or "86987654321"**

2. **Lead Engine Admin Credentials:**
   ```env
   OUTRELIX_ADMIN_EMAIL=admin@yourdomain.com  # Use real email
   OUTRELIX_ADMIN_PASSWORD=strong_unique_password  # Use strong password
   ```
   - **NEVER use default "admin@outrelix.local" or "admin123"**

3. **Supabase Service Role Key:**
   - Use **Service Role Key** (not anon key) in backend
   - Keep it secret - never expose to frontend

4. **API Keys:**
   - Rotate API keys periodically
   - Use environment variables (not hardcoded)
   - Monitor usage to detect leaks

---

## 📊 What to Change/Remove

### ❌ **REMOVE from Production (Old/Development):**

1. **Localhost URLs:**
   - ❌ `http://localhost:3000`
   - ❌ `http://localhost:5000`
   - ❌ `http://localhost:8000`
   - ✅ Replace with production URLs

2. **Default/Weak Secrets:**
   - ❌ `OUTRELIX_JWT_SECRET=86987654321`
   - ❌ `OUTRELIX_JWT_SECRET=change_me`
   - ❌ `OUTRELIX_ADMIN_PASSWORD=admin123`
   - ✅ Generate strong random secrets

3. **Personal Email in Production:**
   - ❌ `OUTRELIX_ADMIN_EMAIL=zeeshanexpert26@gmail.com`
   - ✅ Use company email: `admin@yourdomain.com`

4. **Test/Personal Credentials:**
   - ❌ Personal API keys (rotate them)
   - ❌ Test spreadsheet URLs (use production)
   - ❌ Development database URLs

### ✅ **KEEP but Update:**

1. **API Keys:**
   - ✅ Keep RapidAPI keys (they look valid)
   - ✅ Keep Google Service Account JSON
   - ⚠️ Monitor usage limits

2. **Service Account JSON:**
   - ✅ Keep Google Service Account (but verify permissions)
   - ✅ Ensure it has correct scopes
   - ⚠️ Never commit to git

3. **Configuration Values:**
   - ✅ Keep feature flags (ENABLE_YELP, etc.)
   - ✅ Keep cache settings
   - ✅ Keep timeout values

---

## 🔧 Render Deployment Setup

### Main App Backend (Render)

1. **Create New Web Service:**
   - Name: `outrelix-backend`
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn main_api:app --host 0.0.0.0 --port $PORT`

2. **Set Environment Variables:**
   - Copy from "2️⃣ Render - Main App Backend" above
   - Use Render's environment variable interface

3. **Important Settings:**
   - ✅ Enable "Auto-Deploy" for production
   - ✅ Set up health check endpoint
   - ✅ Configure persistent disk if needed

### Lead Engine Service (Render)

1. **Create New Web Service:**
   - Name: `outrelix-lead-engine`
   - Root Directory: `Outrelix-Scraper`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python start_server.py`

2. **Set Environment Variables:**
   - Copy from "3️⃣ Render - Lead Engine Service" above
   - **MUST set all required keys**

3. **Important Settings:**
   - ⚠️ May need higher CPU/RAM (scraping is intensive)
   - ✅ Set up health check: `/health`
   - ✅ Enable auto-deploy

---

## 🔍 Finding Supabase JWT Secret

To get `SUPABASE_JWT_SECRET` for Lead Engine:

1. Go to Supabase Dashboard
2. Select your project
3. Settings → API
4. Scroll to "JWT Settings"
5. Copy "JWT Secret" (long string, starts with something like `your-super-secret-jwt-token...`)
6. ⚠️ This is DIFFERENT from "anon" or "service_role" keys!

---

## ✅ Summary: What Goes Where

| Variable | Frontend (Vercel) | Main Backend (Render) | Lead Engine (Render) |
|----------|------------------|----------------------|---------------------|
| Supabase URL | ✅ (Anon) | ✅ (Service Role) | ❌ |
| Supabase Anon Key | ✅ | ❌ | ❌ |
| Supabase Service Key | ❌ | ✅ | ❌ |
| Supabase JWT Secret | ❌ | ❌ | ✅ |
| Resend API | ❌ | ✅ | ❌ |
| OpenRouter API | ❌ | ✅ | ✅ (optional) |
| Google OAuth | ❌ | ✅ | ❌ |
| Lead Engine URL | ❌ | ✅ | ❌ |
| RapidAPI Keys | ❌ | ❌ | ✅ |
| Google Service Account | ❌ | ❌ | ✅ |
| Scraping API Keys | ❌ | ❌ | ✅ |

---

## 🚨 Critical Security Notes

1. **Never commit `.env` files to git**
2. **Use different secrets for production vs development**
3. **Rotate API keys if exposed/compromised**
4. **Monitor API usage for unexpected spikes**
5. **Use strong, random secrets (not sequential numbers)**
6. **Enable rate limiting in production**
7. **Use HTTPS everywhere**
8. **Set up monitoring and alerts**

---

## 📝 Quick Deployment Checklist

- [ ] Change all default secrets/passwords
- [ ] Replace localhost URLs with production URLs
- [ ] Set up environment variables in Vercel
- [ ] Set up environment variables in Render (main backend)
- [ ] Set up separate Render service for Lead Engine
- [ ] Configure CORS properly
- [ ] Test health endpoints
- [ ] Set up monitoring
- [ ] Configure custom domains
- [ ] Set up SSL/HTTPS
- [ ] Test end-to-end flow
- [ ] Set up error tracking (Sentry, etc.)

---

**Questions? Check the main integration guide: `LEAD_ENGINE_INTEGRATION.md`**

