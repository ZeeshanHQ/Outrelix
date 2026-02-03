# Integration Guide: Lead Engine → Main App

## 🎯 Overview

This guide explains how to integrate the Lead Engine API into your main Supabase-based application. The engine runs as a **separate service** (microservice) that your main app calls via HTTP.

---

## 📋 Architecture Decision

### ✅ **Recommended: Keep as Separate Service**

**Why?**
- Lead generation is CPU/API-intensive and can slow down your main app
- Separate scaling (run multiple workers if needed)
- Independent deployment and updates
- Clear separation of concerns

**How it works:**
```
Main App (Supabase) → HTTP API → Lead Engine Service
     ↓                                    ↓
  User Auth                          Lead Processing
  UI/Pages                           Background Jobs
  Database                           File Storage
```

---

## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:8000  (development)
https://your-lead-engine-domain.com  (production)
```

### Authentication Required
All endpoints (except `/health`) require authentication via:
- **Bearer Token**: `Authorization: Bearer <jwt_token>`
- **API Key**: `X-API-Key: <api_key>`
- **Supabase Token**: `Authorization: Bearer <supabase_jwt>` (when enabled)

---

### 1. **Health Check** (No Auth)
```http
GET /health
```
**Response:**
```json
{"status": "ok"}
```

---

### 2. **Start Lead Generation Run**
```http
POST /runs
Authorization: Bearer <token>
Content-Type: application/json

{
  "queries": "roofing contractors,construction",
  "geo": "California, USA",
  "category": "Construction",
  "limit": 100,
  "enable_overpass": true,
  "enable_yelp": true,
  "enable_yellowpages": false,
  "enable_clearbit": true,
  "push_to_gsheets": false,
  "dry_run": false,
  "free_mode": false,
  "enable_embed_scoring": false,
  "enable_embed_dedupe": false
}
```

**Response:**
```json
{
  "run_id": "abc123",
  "created_at": "2024-01-15T10:30:00",
  "status": "running",
  "progress": 0.0,
  "stage": "sourcing"
}
```

---

### 3. **Check Run Status**
```http
GET /runs/{run_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "run_id": "abc123",
  "status": "completed",
  "progress": 1.0,
  "stage": "completed",
  "message": "Successfully generated 45 leads",
  "run_dir": "/path/to/data",
  "summary_path": "/path/to/summary.json"
}
```

**Status values:** `queued`, `running`, `completed`, `failed`

---

### 4. **Get Run Summary (Stats)**
```http
GET /runs/{run_id}/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_businesses": 150,
  "total_contacts": 45,
  "validated_emails": 38,
  "enriched": 35,
  "free_mode": false,
  "validation_strategy": "rapidapi",
  "mocks_used": [],
  "rate_limit_stats": {...}
}
```

---

### 5. **Get Leads (CSV/Excel Data)**
```http
GET /runs/{run_id}/leads
Authorization: Bearer <token>
```

**Response:**
```json
{
  "items": [
    {
      "company_name": "ABC Roofing",
      "domain": "abcroofing.com",
      "email": "contact@abcroofing.com",
      "phone": "+1-555-1234",
      "address": "123 Main St, CA",
      "score": 85
    },
    ...
  ],
  "total": 45
}
```

---

### 6. **Export Leads to CSV**
```http
POST /runs/{run_id}/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "csv"  // or "excel"
}
```

**Response:** File download

---

### 7. **List All Runs**
```http
GET /runs
Authorization: Bearer <token>
```

**Response:**
```json
{
  "run_id_1": {...},
  "run_id_2": {...}
}
```

---

### 8. **Delete Run**
```http
DELETE /runs/{run_id}
Authorization: Bearer <token>
```

---

### 9. **Usage Statistics**
```http
GET /usage/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user_id": "user@example.com",
  "runs_today": 5,
  "api_calls_today": 1200,
  "limit_runs_per_day": 10,
  "limit_api_calls_per_day": 5000
}
```

---

### 10. **Admin: All Users Usage** (Admin Only)
```http
GET /usage/all
Authorization: Bearer <admin_token>
```

---

## 🔐 Authentication Integration Options

### **Option 1: Supabase JWT (Recommended for Production)**

The engine already supports Supabase tokens! Here's how to enable it:

#### Step 1: Enable Supabase Auth in Lead Engine

In Lead Engine's `.env`:
```env
ENABLE_SUPABASE_AUTH=true
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```

**Where to find `SUPABASE_JWT_SECRET`:**
- Supabase Dashboard → Settings → API → `JWT Secret` (not the anon key!)

#### Step 2: In Your Main App, Get Supabase Token

```javascript
// In your main app (React/Next.js/etc)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// User logs in via Supabase
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get the session token
const token = data.session.access_token

// Use it to call Lead Engine
const response = await fetch('http://localhost:8000/runs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    queries: 'roofing',
    geo: 'California',
    category: 'Construction',
    limit: 100
  })
})
```

#### Step 3: Backend Integration (If using server-side)

```python
# In your main app backend (FastAPI/Django/etc)
import httpx

async def start_lead_generation(user_token: str, params: dict):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8000/runs",
            headers={
                "Authorization": f"Bearer {user_token}",  # Supabase token
                "Content-Type": "application/json"
            },
            json=params,
            timeout=30.0
        )
        return response.json()
```

---

### **Option 2: API Keys (Simple, Good for Testing)**

#### Step 1: Generate API Keys

In Lead Engine's `.env`:
```env
EMPLOYEE_API_KEYS=key_employee1,key_employee2,key_employee3
```

#### Step 2: Store in Your Main App Database

```sql
-- In your Supabase database
CREATE TABLE employee_api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 3: Use in Main App

```javascript
// Get API key for current user from your database
const { data } = await supabase
  .from('employee_api_keys')
  .select('api_key')
  .eq('user_id', user.id)
  .single()

// Call Lead Engine
const response = await fetch('http://localhost:8000/runs', {
  headers: {
    'X-API-Key': data.api_key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(params)
})
```

---

### **Option 3: Proxy Token (Hybrid)**

Create a proxy endpoint in your main app that:
1. Validates Supabase auth
2. Generates a short-lived JWT for Lead Engine
3. Forwards requests

```python
# In your main app backend
from fastapi import Depends, HTTPException
from supabase import create_client

@app.post("/api/leads/start")
async def proxy_start_lead_generation(
    params: dict,
    user = Depends(get_current_user)  # Your Supabase auth
):
    # Generate Lead Engine token
    lead_engine_token = create_lead_engine_token(user.email)
    
    # Forward to Lead Engine
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://lead-engine:8000/runs",
            headers={
                "Authorization": f"Bearer {lead_engine_token}",
                "Content-Type": "application/json"
            },
            json=params
        )
        return response.json()
```

---

## 🚀 Step-by-Step Integration

### **Phase 1: Basic Integration (Test)**

1. **Start Lead Engine**
   ```bash
   cd Outrelix-Scraper
   python start_server.py
   ```

2. **Test from Main App**
   ```javascript
   // Simple test
   const response = await fetch('http://localhost:8000/health')
   console.log(await response.json())  // Should be {"status": "ok"}
   ```

3. **Create a Test Page in Main App**
   ```javascript
   // pages/leads/test.js (or similar)
   async function testLeadEngine() {
     const token = await getSupabaseToken()  // Your auth helper
     
     const res = await fetch('http://localhost:8000/runs', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         queries: 'test',
         geo: 'USA',
         category: 'Test',
         limit: 10,
         dry_run: true  // Safe for testing
       })
     })
     
     const run = await res.json()
     console.log('Run started:', run.run_id)
   }
   ```

---

### **Phase 2: Production Integration**

#### Step 1: Deploy Lead Engine

**Option A: Same Server (Simple)**
- Deploy Lead Engine on a subdomain: `leads.yourdomain.com`
- Or on a different port: `yourdomain.com:8000`

**Option B: Separate Server (Recommended)**
- Deploy on a separate VPS/container
- Use environment variable for URL:
  ```env
  LEAD_ENGINE_URL=https://leads-api.yourdomain.com
  ```

#### Step 2: Configure CORS (If needed)

In Lead Engine's `src/server/app.py`, add:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-main-app.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Step 3: Create Lead Generation Service in Main App

```javascript
// services/leadEngine.js
const LEAD_ENGINE_URL = process.env.LEAD_ENGINE_URL || 'http://localhost:8000'

export class LeadEngineService {
  constructor(supabaseToken) {
    this.token = supabaseToken
  }

  async startRun(params) {
    const res = await fetch(`${LEAD_ENGINE_URL}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
    
    if (!res.ok) {
      throw new Error(`Lead Engine error: ${res.statusText}`)
    }
    
    return res.json()
  }

  async getRunStatus(runId) {
    const res = await fetch(`${LEAD_ENGINE_URL}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    return res.json()
  }

  async getLeads(runId) {
    const res = await fetch(`${LEAD_ENGINE_URL}/runs/${runId}/leads`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    })
    return res.json()
  }

  async pollUntilComplete(runId, onProgress) {
    while (true) {
      const status = await this.getRunStatus(runId)
      
      if (onProgress) {
        onProgress(status)
      }
      
      if (status.status === 'completed') {
        return status
      }
      
      if (status.status === 'failed') {
        throw new Error(status.message || 'Run failed')
      }
      
      // Poll every 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}
```

#### Step 4: Create UI Component in Main App

```javascript
// components/LeadGenerator.jsx
import { useState } from 'react'
import { LeadEngineService } from '@/services/leadEngine'
import { useSupabase } from '@/hooks/useSupabase'

export function LeadGenerator() {
  const { session } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(null)
  const [leads, setLeads] = useState(null)

  const handleGenerate = async () => {
    setLoading(true)
    const service = new LeadEngineService(session.access_token)
    
    try {
      // Start run
      const run = await service.startRun({
        queries: 'roofing contractors',
        geo: 'California',
        category: 'Construction',
        limit: 100
      })
      
      // Poll for completion
      const completed = await service.pollUntilComplete(
        run.run_id,
        (status) => {
          setProgress({
            stage: status.stage,
            progress: status.progress * 100
          })
        }
      )
      
      // Get leads
      const leadsData = await service.getLeads(run.run_id)
      setLeads(leadsData.items)
      
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate leads: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Leads'}
      </button>
      
      {progress && (
        <div>
          <p>Stage: {progress.stage}</p>
          <progress value={progress.progress} max="100" />
        </div>
      )}
      
      {leads && (
        <div>
          <h3>Found {leads.length} leads</h3>
          <table>
            {/* Render leads */}
          </table>
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Database Integration (Optional)

### Store Runs in Your Main App Database

```sql
-- In Supabase
CREATE TABLE lead_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  engine_run_id TEXT NOT NULL,  -- The run_id from Lead Engine
  queries TEXT,
  geo TEXT,
  category TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE lead_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID REFERENCES lead_runs(id),
  company_name TEXT,
  email TEXT,
  phone TEXT,
  domain TEXT,
  score INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Sync after run completes:**
```javascript
// After getting leads from Lead Engine
const leads = await service.getLeads(runId)

// Insert into your database
await supabase.from('lead_runs').insert({
  engine_run_id: runId,
  user_id: user.id,
  status: 'completed',
  queries: params.queries,
  geo: params.geo,
  category: params.category
})

await supabase.from('lead_results').insert(
  leads.items.map(lead => ({
    run_id: runId,
    company_name: lead.company_name,
    email: lead.email,
    phone: lead.phone,
    domain: lead.domain,
    score: lead.score
  }))
)
```

---

## 🔒 Security Checklist

- [ ] **Enable Supabase Auth** (`ENABLE_SUPABASE_AUTH=true`)
- [ ] **Set Strong JWT Secret** (if not using Supabase)
- [ ] **Use HTTPS** in production
- [ ] **Rate Limit** (already implemented, but check limits)
- [ ] **Validate User Permissions** (check if user can create runs)
- [ ] **Sanitize Inputs** (already done server-side, but double-check)
- [ ] **Monitor Usage** (check `/usage/stats` regularly)
- [ ] **Set Environment Variables** (never commit secrets)

---

## 🐛 Troubleshooting

### **Error: "Authentication required"**
- Check if token is being sent: `Authorization: Bearer <token>`
- Verify Supabase auth is enabled if using Supabase tokens
- Check JWT secret matches

### **Error: "Too many requests"**
- Rate limit hit (120/min default)
- Wait 60 seconds or increase limit in `.env`: `API_RATE_LIMIT_PER_MIN=200`

### **Error: "Run not found"**
- Run ID doesn't exist or expired (runs are kept in memory, restart clears them)
- Consider persisting runs to database (future enhancement)

### **CORS Errors**
- Add CORS middleware (see Phase 2, Step 2)
- Check `allow_origins` includes your main app domain

---

## ✅ Honest Assessment

### **What Works Well:**
- ✅ API is RESTful and well-structured
- ✅ Authentication is flexible (Supabase-ready)
- ✅ Background processing (non-blocking)
- ✅ Progress tracking
- ✅ Usage limits and monitoring
- ✅ Error handling

### **What Needs Work:**
- ⚠️ **Runs are in-memory** (lost on restart) → Consider database persistence
- ⚠️ **No user management** (relies on Supabase) → Good for integration!
- ⚠️ **File storage is local** → Consider cloud storage (S3/GCS) for production
- ⚠️ **No webhook support** → You'll need to poll for completion

### **Recommendation:**
**✅ YES, integrate it!** But:
1. Start with **Option 1 (Supabase JWT)** for auth
2. Add **database persistence** for runs (store in your main app DB)
3. Add **webhook support** later (or keep polling)
4. Deploy Lead Engine as **separate service** (don't embed)

---

## 📝 Next Steps

1. **Test Supabase Auth** (enable in Lead Engine `.env`)
2. **Create test page** in main app
3. **Deploy Lead Engine** (separate server/subdomain)
4. **Add database sync** (store runs/results)
5. **Add error handling** and retries
6. **Monitor usage** via `/usage/stats`

---

## 🆘 Need Help?

Check:
- `README_STARTUP.md` - Server setup
- `EMPLOYEE_SETUP_GUIDE.md` - Usage guide
- `src/server/app.py` - API implementation
- `src/server/auth.py` - Auth logic

