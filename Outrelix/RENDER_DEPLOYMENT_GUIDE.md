# 🚀 Render Deployment Guide - Lead Engine Service

Step-by-step guide to deploy the Lead Engine as a separate service on Render.

---

## 📋 Prerequisites

1. ✅ Render account (free tier works)
2. ✅ GitHub repository with your code
3. ✅ Lead Engine code in `Outrelix-Scraper/` folder
4. ✅ All API keys ready

---

## 🎯 Step 1: Prepare Your Repository

### Option A: Lead Engine in Same Repo (Recommended)

If your Lead Engine (`Outrelix-Scraper/`) is in the same repository as your main app:

1. Make sure `Outrelix-Scraper/` is committed to git
2. Push to GitHub
3. You're ready! Skip to Step 2

### Option B: Separate Repository (Optional)

If you want it in a separate repo:

1. Create new GitHub repository
2. Copy `Outrelix-Scraper/` contents to it
3. Commit and push

---

## 🔧 Step 2: Create New Web Service on Render

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Click "New +"** → Select **"Web Service"**

3. **Connect Repository**:
   - If same repo: Select your existing repository
   - If separate repo: Connect the Lead Engine repository
   - Render will auto-detect it

4. **Configure Service**:

   **Service Details:**
   - **Name**: `outrelix-lead-engine` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `Outrelix-Scraper` ⚠️ **IMPORTANT!**

   **Build & Deploy:**
   - **Runtime**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     python start_server.py
     ```

   **⚠️ IMPORTANT: Root Directory**
   - Set this to: `Outrelix-Scraper`
   - This tells Render where your Lead Engine code is

---

## ⚙️ Step 3: Configure Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

### 🔐 Required (Must Have)

```env
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=$PORT
SERVER_RELOAD=false

# Authentication (CHANGE THESE!)
OUTRELIX_JWT_SECRET=<generate_strong_random_secret>
OUTRELIX_ADMIN_EMAIL=admin@yourdomain.com
OUTRELIX_ADMIN_PASSWORD=<strong_password>

# Supabase Integration
ENABLE_SUPABASE_AUTH=true
SUPABASE_JWT_SECRET=<your_supabase_jwt_secret>

# Rate Limiting
API_RATE_LIMIT_PER_MIN=120
```

### 🌐 API Keys (Data Sources)

```env
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
RAPID_EMAIL_VALIDATOR_HOST=email-validator-api.p.rapidapi.com
RAPID_EMAIL_VALIDATOR_BASE_URL=https://email-validator-api.p.rapidapi.com

# LinkedIn (Optional)
LINKEDIN_SCRAPER_HOST=linkedin-data-api.p.rapidapi.com
LINKEDIN_SCRAPER_BASE_URL=https://linkedin-data-api.p.rapidapi.com

# Optional Sources (add if using)
YELP_API_KEY=
CLEARBIT_API_KEY=
CLEARBIT_RAPID_HOST=Clearbitmikilior1V1.p.rapidapi.com
CLEARBIT_RAPID_BASE_URL=https://clearbitmikilior1v1.p.rapidapi.com
HUNTER_API_KEY=
```

### 📊 Google Sheets Integration (Optional)

```env
# Google Service Account JSON (full JSON as single line string)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"outrelix",...}

# Google Sheets URL
GSHEETS_SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/...
PUSH_TO_GSHEETS=true
```

**⚠️ Note**: For `GOOGLE_SERVICE_ACCOUNT_JSON`, you need to put the entire JSON as a **single line string**. Remove all newlines and escape quotes properly, OR use Render's "Secret File" feature if available.

**Better approach**: Store it as a multi-line environment variable in Render (some platforms support this), or use a secret management service.

### 🎛️ Feature Flags

```env
# Feature Toggles
ENABLE_OVERPASS=true
ENABLE_EMBED_SCORING=true
ENABLE_EMBED_DEDUPE=true
EMAIL_VALIDATOR_ENABLED=true
EMAIL_VALIDATOR_NETWORK=true
ENABLE_HF_MODELS=false
USE_TOR=false
```

### ⏱️ Performance Settings

```env
# Cache & Timeouts
FETCH_CACHE_TTL_SECONDS=300
LINKEDIN_CACHE_TTL_SECONDS=86400
SCRAPER_DEFAULT_TIMEOUT=20.0
```

### 📝 Default Parameters (Optional)

```env
QUERIES=roofing contractors,roofing companies
GEO=USA
CATEGORY=Roofing Contractors
LIMIT=1000
ENABLE_YELP=true
ENABLE_YELLOWPAGES=false
ENABLE_CLEARBIT=true
DRY_RUN=false
```

---

## 🔧 Step 4: Update Start Command for Render

Render uses the `$PORT` environment variable. Update the start command:

### Option A: Modify start_server.py (Recommended)

The `start_server.py` should already read `SERVER_PORT` from env, but we need to make sure it uses `$PORT` on Render.

**Create a simple wrapper script** or modify start_server to use `$PORT`:

Create file: `Outrelix-Scraper/run_server.py`

```python
#!/usr/bin/env python3
"""Wrapper script for Render deployment"""
import os
import sys

# Render uses $PORT, set it to SERVER_PORT for compatibility
if 'PORT' in os.environ and 'SERVER_PORT' not in os.environ:
    os.environ['SERVER_PORT'] = os.environ['PORT']

# Import and run the actual server
from start_server import main

if __name__ == "__main__":
    main()
```

**Update Start Command in Render:**
```bash
python run_server.py
```

### Option B: Use Direct uvicorn (Simpler)

**Start Command:**
```bash
cd Outrelix-Scraper && uvicorn src.server.app:app --host 0.0.0.0 --port $PORT
```

**But this bypasses the env checks in start_server.py**, so you might want to keep the wrapper.

---

## 📝 Step 5: Create runtime.txt (Optional)

Create `Outrelix-Scraper/runtime.txt`:

```txt
python-3.11.0
```

Or use Python 3.10:
```txt
python-3.10.12
```

This ensures Render uses the correct Python version.

---

## ✅ Step 6: Important Render Settings

### Auto-Deploy
- ✅ Enable **"Auto-Deploy"** (deploys on git push)

### Health Check
- **Health Check Path**: `/health`
- This helps Render know if your service is healthy

### Instance Type (Free Tier)
- **Free tier**: 512 MB RAM, shared CPU
- **For production**: Consider paid plan (more RAM/CPU for scraping)

### Disk (if needed)
- Lead Engine generates files in `output/` directory
- Free tier has ephemeral disk (data cleared on restart)
- If you need persistence, use paid plan or external storage (S3, etc.)

---

## 🚀 Step 7: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies (`pip install -r requirements.txt`)
   - Start the server
3. Wait for deployment (usually 2-5 minutes)
4. Check logs for any errors

---

## 🔍 Step 8: Verify Deployment

1. **Check Health Endpoint**:
   ```
   https://your-service-name.onrender.com/health
   ```
   Should return: `{"status": "ok"}`

2. **Check Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Look for: "🚀 Starting Outrelix Lead Engine Server"
   - No errors should appear

3. **Test API** (if you have authentication set up):
   ```bash
   curl https://your-service-name.onrender.com/health
   ```

---

## 🔗 Step 9: Update Main Backend

Update your main backend's environment variable:

**In Main Backend (Render):**
```env
LEAD_ENGINE_URL=https://your-lead-engine-service.onrender.com
```

Replace `your-lead-engine-service` with your actual Render service URL.

---

## 🐛 Troubleshooting

### ❌ Build Fails

**Error**: `ModuleNotFoundError` or import errors

**Solution**:
- Check `requirements.txt` is in `Outrelix-Scraper/` folder
- Verify all dependencies are listed
- Check build logs for specific missing packages

### ❌ Server Won't Start

**Error**: Port binding error or server crashes

**Solution**:
- Ensure `SERVER_PORT=$PORT` is set
- Check start command is correct
- Verify all required env vars are set
- Check logs for specific error messages

### ❌ Authentication Errors

**Error**: "Authentication required" when calling API

**Solution**:
- Verify `ENABLE_SUPABASE_AUTH=true`
- Check `SUPABASE_JWT_SECRET` is correct (from Supabase Dashboard)
- Ensure main app is sending Supabase token in headers

### ❌ API Keys Not Working

**Error**: API calls failing

**Solution**:
- Verify API keys are set correctly
- Check for typos (no extra spaces)
- Verify API keys haven't expired
- Check usage limits on RapidAPI

### ❌ Out of Memory

**Error**: Service crashes or times out

**Solution**:
- Upgrade to paid plan (more RAM)
- Reduce `LIMIT` parameter in requests
- Disable heavy features (ENABLE_EMBED_SCORING, etc.)
- Process leads in smaller batches

---

## 📊 Monitoring

### Render Logs
- View real-time logs in Render Dashboard
- Check for errors, warnings, or API rate limits

### Health Checks
- Render automatically checks `/health` endpoint
- Service marked unhealthy if health check fails

### Metrics
- Monitor CPU/RAM usage
- Check request counts
- Watch for timeouts

---

## 🔒 Security Best Practices

1. ✅ **Change all default secrets**:
   - `OUTRELIX_JWT_SECRET` - Generate strong random string
   - `OUTRELIX_ADMIN_PASSWORD` - Use strong password
   - `OUTRELIX_ADMIN_EMAIL` - Use company email

2. ✅ **Keep API keys secret**:
   - Never commit to git
   - Use Render's environment variables
   - Rotate periodically

3. ✅ **Enable HTTPS**:
   - Render provides HTTPS automatically
   - Use HTTPS URLs in configuration

4. ✅ **Rate Limiting**:
   - Already configured (`API_RATE_LIMIT_PER_MIN`)
   - Adjust based on your needs

---

## 📝 Quick Checklist

Before deploying, ensure:

- [ ] Repository is pushed to GitHub
- [ ] All environment variables are set in Render
- [ ] `OUTRELIX_JWT_SECRET` changed from default
- [ ] `OUTRELIX_ADMIN_PASSWORD` changed from default
- [ ] `SUPABASE_JWT_SECRET` is set correctly
- [ ] Root directory is set to `Outrelix-Scraper`
- [ ] Build command is correct
- [ ] Start command uses `$PORT`
- [ ] Health check path is `/health`
- [ ] Main backend has `LEAD_ENGINE_URL` updated

---

## 🎉 You're Done!

Once deployed:

1. ✅ Lead Engine service is running on Render
2. ✅ Main backend can connect to it
3. ✅ Frontend can use lead generation features
4. ✅ All services are properly integrated

**Next Steps:**
- Test lead generation from your frontend
- Monitor usage and performance
- Set up alerts for errors
- Scale resources if needed

---

## 📞 Need Help?

- Check Render documentation: https://render.com/docs
- Review Lead Engine logs in Render Dashboard
- Check main integration guide: `LEAD_ENGINE_INTEGRATION.md`
- Verify environment variables match the guide

**Happy Deploying! 🚀**

