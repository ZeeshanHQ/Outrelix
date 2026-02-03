# Lead Engine Integration - Complete Guide

## 🎯 Overview

The Lead Engine has been successfully integrated into the main Outrelix application as a **separate microservice**. This document explains what was implemented and how to use it.

## ✅ What Was Implemented

### 1. Backend Integration (`backend/lead_engine_service.py`)
- Created `LeadEngineService` class that acts as an HTTP client wrapper
- Handles all communication with the Lead Engine microservice
- Supports Supabase JWT authentication
- Includes methods for:
  - Starting lead generation runs
  - Checking run status
  - Fetching leads
  - Getting summaries and statistics
  - Deleting runs

### 2. API Routes (`backend/main_api.py`)
Added the following endpoints that proxy requests to Lead Engine:
- `GET /api/lead-engine/health` - Health check
- `POST /api/lead-engine/runs` - Start a new lead generation run
- `GET /api/lead-engine/runs/{run_id}` - Get run status
- `GET /api/lead-engine/runs/{run_id}/summary` - Get run summary
- `GET /api/lead-engine/runs/{run_id}/leads` - Get leads for a run
- `DELETE /api/lead-engine/runs/{run_id}` - Delete a run
- `GET /api/lead-engine/usage/stats` - Get usage statistics
- `GET /api/lead-engine/runs` - List all runs

### 3. Database Schema (`supabase/migrations/008_lead_engine.sql`)
Created two new tables:
- **`lead_runs`** - Stores lead generation run metadata
- **`lead_results`** - Stores individual leads from completed runs

Both tables include:
- Row Level Security (RLS) policies
- Proper indexing for performance
- Foreign key relationships
- Automatic timestamp updates

### 4. Frontend Service (`src/utils/leadEngineService.js`)
- React client for calling the backend API
- Automatically handles Supabase token authentication
- Includes polling helper for run status
- Error handling and retry logic

### 5. UI Components
- **`src/pages/Leads.jsx`** - Complete leads page with:
  - Lead generation form
  - Runs list with status tracking
  - Results table with lead details
  - Real-time progress polling
  - Run management (view/delete)

- **Updated `src/components/AppSidebar.jsx`** - Added "Lead Generation" navigation item

- **Updated `src/App.jsx`** - Added `/leads` route

## 🔧 Configuration Required

### 1. Environment Variables

Add to your `.env` file in the **main app backend**:

```env
# Lead Engine Service URL
LEAD_ENGINE_URL=http://localhost:8000
LEAD_ENGINE_TIMEOUT=300.0
```

**For production:**
```env
LEAD_ENGINE_URL=https://your-lead-engine-domain.com
```

### 2. Lead Engine Configuration

In the **Lead Engine service** (Outrelix-Scraper folder), configure `.env`:

```env
# Enable Supabase authentication
ENABLE_SUPABASE_AUTH=true
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_here

# Required for Lead Engine
OUTRELIX_JWT_SECRET=your_lead_engine_jwt_secret
OUTRELIX_ADMIN_EMAIL=admin@yourdomain.com
OUTRELIX_ADMIN_PASSWORD=your_secure_password
```

**How to get `SUPABASE_JWT_SECRET`:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the **JWT Secret** (NOT the anon key!)

### 3. Database Migration

Run the migration to create the tables:

```sql
-- In Supabase Dashboard → SQL Editor
-- Run the contents of: supabase/migrations/008_lead_engine.sql
```

Or if using Supabase CLI:
```bash
supabase db push
```

## 🚀 How to Use

### Starting the Services

1. **Start Lead Engine Service:**
```bash
cd Outrelix-Scraper
python start_server.py
# Should be running on http://localhost:8000
```

2. **Start Main App Backend:**
```bash
cd backend
uvicorn main_api:app --reload --port 5000
```

3. **Start Frontend:**
```bash
npm start
```

### Using the UI

1. Navigate to `/leads` in your app
2. Fill in the lead generation form:
   - **Queries**: Comma-separated search terms (e.g., "SaaS companies, marketing agencies")
   - **Geo**: Geographic location (e.g., "USA", "California")
   - **Category**: Optional category
   - **Limit**: Number of leads to generate (1-5000)
   - **Options**: Enable/disable Yelp, Clearbit, etc.

3. Click "Generate Leads"
4. Monitor progress in the "Runs" tab
5. View results when completed

### API Usage (Programmatic)

```javascript
import leadEngineService from './utils/leadEngineService';

// Start a run
const run = await leadEngineService.startRun({
  queries: 'SaaS companies, marketing agencies',
  geo: 'USA',
  category: 'B2B Software',
  limit: 100,
  enable_yelp: true,
  enable_clearbit: true,
  dry_run: false
});

// Poll for completion
const completed = await leadEngineService.pollUntilComplete(
  run.run_id,
  (status) => {
    console.log(`Progress: ${status.progress * 100}%`);
    console.log(`Stage: ${status.stage}`);
  }
);

// Get leads
const leadsData = await leadEngineService.getLeads(run.run_id);
console.log(`Found ${leadsData.items.length} leads`);
```

## 📊 Database Integration

The integration automatically persists runs and leads to your Supabase database:

- **`lead_runs`** table stores:
  - Run metadata (queries, geo, category)
  - Status and progress
  - Timestamps

- **`lead_results`** table stores:
  - Company information
  - Contact details (email, phone)
  - Lead scores and quality ratings
  - Source information

You can query these tables directly:

```sql
-- Get all runs for a user
SELECT * FROM lead_runs WHERE user_id = 'user-uuid';

-- Get leads from a specific run
SELECT * FROM lead_results WHERE run_id = 'run-uuid';

-- Get high-quality leads
SELECT * FROM lead_results WHERE quality = 'high' ORDER BY score DESC;
```

## 🔒 Authentication Flow

1. **Frontend** gets Supabase access token from user session
2. **Frontend** sends token in `Authorization: Bearer <token>` header
3. **Main App Backend** forwards token to Lead Engine
4. **Lead Engine** validates token using Supabase JWT secret
5. **Lead Engine** processes request and returns results

## 🐛 Troubleshooting

### "Authentication required" error
- Check that `ENABLE_SUPABASE_AUTH=true` in Lead Engine `.env`
- Verify `SUPABASE_JWT_SECRET` matches your Supabase JWT secret
- Ensure frontend is sending the token in headers

### "Connection refused" or timeout
- Verify Lead Engine is running: `curl http://localhost:8000/health`
- Check `LEAD_ENGINE_URL` in main app `.env`
- Ensure Lead Engine port (8000) is accessible

### Leads not appearing in database
- Check that migration `008_lead_engine.sql` was run
- Verify RLS policies allow your user to insert
- Check browser console and backend logs for errors

### Run status stuck at "running"
- Check Lead Engine logs for errors
- Verify API keys (RapidAPI, Yelp, etc.) are configured
- Try a smaller limit or enable `dry_run: true` for testing

## 📝 Next Steps

### Recommended Enhancements:
1. **Export Functionality**: Add CSV/Excel export for leads
2. **Lead Filtering**: Add filters (quality, score, industry)
3. **Bulk Actions**: Select multiple leads for campaigns
4. **Lead Details Modal**: View full lead information
5. **Webhook Support**: Notify on completion instead of polling
6. **Analytics Dashboard**: Show lead generation statistics
7. **Campaign Integration**: Import leads directly to campaigns

### Production Deployment:
1. Deploy Lead Engine as separate service (separate server/subdomain)
2. Use HTTPS for all services
3. Configure CORS properly in Lead Engine
4. Set up monitoring and logging
5. Implement rate limiting per user
6. Add database backups for lead data

## 📚 Related Files

- `backend/lead_engine_service.py` - Backend service wrapper
- `backend/main_api.py` - API routes (lines ~1255-1550)
- `supabase/migrations/008_lead_engine.sql` - Database schema
- `src/utils/leadEngineService.js` - Frontend service
- `src/pages/Leads.jsx` - UI component
- `Outrelix-Scraper/INTEGRATION_GUIDE.md` - Lead Engine documentation

## ✅ Integration Checklist

- [x] Backend service wrapper created
- [x] API routes added to main app
- [x] Database migration created
- [x] Frontend service created
- [x] UI page created
- [x] Navigation added
- [ ] Lead Engine service configured and running
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Supabase auth enabled in Lead Engine
- [ ] Tested end-to-end flow

---

**Questions or Issues?**
- Check Lead Engine logs: `Outrelix-Scraper/output/`
- Check main app backend logs
- Review browser console for frontend errors
- Verify all environment variables are set correctly

