# Quick Integration Reference

## 🚀 Fastest Way to Integrate

### 1. Enable Supabase Auth (2 minutes)

In Lead Engine `.env`:
```env
ENABLE_SUPABASE_AUTH=true
SUPABASE_JWT_SECRET=your_supabase_jwt_secret_from_dashboard
```

### 2. Test Connection (1 minute)

```javascript
// In your main app
const token = await supabase.auth.getSession().then(s => s.session.access_token)

const res = await fetch('http://localhost:8000/health')
console.log(await res.json())  // {"status": "ok"}
```

### 3. Start a Run (Copy-Paste Ready)

```javascript
async function generateLeads(queries, geo, category) {
  const { data: { session } } = await supabase.auth.getSession()
  
  // Start run
  const runRes = await fetch('http://localhost:8000/runs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      queries,
      geo,
      category,
      limit: 100,
      dry_run: false
    })
  })
  
  const run = await runRes.json()
  console.log('Run ID:', run.run_id)
  
  // Poll for completion
  while (true) {
    const statusRes = await fetch(`http://localhost:8000/runs/${run.run_id}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    })
    const status = await statusRes.json()
    
    console.log(`Progress: ${(status.progress * 100).toFixed(0)}% - ${status.stage}`)
    
    if (status.status === 'completed') {
      // Get leads
      const leadsRes = await fetch(`http://localhost:8000/runs/${run.run_id}/leads`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      const leads = await leadsRes.json()
      return leads.items
    }
    
    if (status.status === 'failed') {
      throw new Error(status.message)
    }
    
    await new Promise(r => setTimeout(r, 2000))  // Wait 2 seconds
  }
}

// Use it
const leads = await generateLeads('roofing contractors', 'California', 'Construction')
console.log('Found', leads.length, 'leads')
```

---

## 📋 All Endpoints (Quick Reference)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Health check |
| POST | `/runs` | ✅ | Start lead generation |
| GET | `/runs/{id}` | ✅ | Get run status |
| GET | `/runs/{id}/summary` | ✅ | Get stats |
| GET | `/runs/{id}/leads` | ✅ | Get leads data |
| POST | `/runs/{id}/export` | ✅ | Export CSV/Excel |
| GET | `/runs` | ✅ | List all runs |
| DELETE | `/runs/{id}` | ✅ | Delete run |
| GET | `/usage/stats` | ✅ | Your usage |
| GET | `/usage/all` | ✅ Admin | All users usage |

---

## 🔑 Authentication Headers

**Supabase Token (Recommended):**
```
Authorization: Bearer <supabase_access_token>
```

**API Key:**
```
X-API-Key: <api_key>
```

---

## ⚠️ Common Issues

**"Authentication required"**
→ Check `ENABLE_SUPABASE_AUTH=true` in Lead Engine `.env`

**"Too many requests"**
→ Wait 60 seconds or increase `API_RATE_LIMIT_PER_MIN`

**CORS errors**
→ Add CORS middleware (see `INTEGRATION_GUIDE.md`)

---

## 📖 Full Guide

See `INTEGRATION_GUIDE.md` for complete details.

