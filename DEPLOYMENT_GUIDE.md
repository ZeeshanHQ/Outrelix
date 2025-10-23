# 🚀 OUTRELIX - Elite AI-Powered Sales & Marketing Platform
## Complete Supabase Setup & Deployment Guide

### 📋 Prerequisites
Before proceeding, ensure you have:
- [ ] A Supabase account (https://supabase.com)
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Vercel account (for frontend deployment)
- [ ] Render account (for backend deployment)

---

## 🔧 Step 1: Supabase Project Setup

### 1.1 Create New Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `outrelix-production`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Get Project Credentials
Once created, go to **Settings > API** and copy:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 1.3 Configure Authentication
1. Go to **Authentication > Providers**
2. Enable **Google** provider:
   - Add your Google OAuth credentials
   - Set redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
3. Configure **Email** settings:
   - Enable email confirmations
   - Customize email templates

---

## 🗄️ Step 2: Database Schema Setup

### 2.1 Run Initial Migration
1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the contents of `supabase/migrations/001_init_schema.sql`
3. Paste and run the migration
4. Copy the contents of `supabase/migrations/002_ai_functions.sql`
5. Paste and run the second migration

### 2.2 Verify Schema
Check that these tables were created:
- ✅ `profiles`
- ✅ `organizations`
- ✅ `campaigns`
- ✅ `leads`
- ✅ `email_templates`
- ✅ `email_sends`
- ✅ `ai_suggestions`
- ✅ `integrations`

---

## 🔐 Step 3: Environment Variables Setup

### 3.1 Frontend Environment (.env.production)
Create `.env.production` in your project root:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (will be updated after Render deployment)
REACT_APP_API_URL=https://your-backend-url.onrender.com

# Optional: Analytics, Error Tracking
REACT_APP_ANALYTICS_ID=your-analytics-id
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### 3.2 Backend Environment Variables
For your backend deployment on Render, you'll need:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# External APIs
OPENAI_API_KEY=your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
```

---

## 🎨 Step 4: Frontend Deployment (Vercel)

### 4.1 Prepare for Deployment
1. Remove the proxy from `package.json`:
   ```json
   {
     "proxy": "http://127.0.0.1:5000"  // Remove this line
   }
   ```

2. Update API calls to use environment variables:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   ```

### 4.2 Deploy to Vercel
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
6. Add environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_API_URL` (update after backend deployment)
7. Click "Deploy"

### 4.3 Configure Custom Domain (Optional)
1. In Vercel dashboard, go to your project
2. Click "Domains"
3. Add your custom domain
4. Update Supabase redirect URLs

---

## ⚙️ Step 5: Backend Deployment (Render)

### 5.1 Prepare Backend
1. Create `requirements.txt` with all Python dependencies
2. Create `render.yaml` for deployment configuration
3. Update CORS settings to allow your Vercel domain

### 5.2 Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `outrelix-backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main_api:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from Step 3.2
6. Click "Create Web Service"

---

## 🔄 Step 6: Integration & Testing

### 6.1 Update Frontend API URL
1. Get your Render backend URL
2. Update `REACT_APP_API_URL` in Vercel environment variables
3. Redeploy frontend

### 6.2 Test Authentication Flow
1. Visit your Vercel frontend URL
2. Test email signup/signin
3. Test Google OAuth
4. Verify user profiles are created in Supabase

### 6.3 Test Core Features
- ✅ User registration/login
- ✅ Campaign creation
- ✅ Lead management
- ✅ Email sending
- ✅ Analytics dashboard

---

## 🚀 Step 7: Production Optimizations

### 7.1 Database Optimizations
1. Set up database backups
2. Configure connection pooling
3. Set up monitoring alerts

### 7.2 Security Enhancements
1. Enable Row Level Security (RLS) policies
2. Set up API rate limiting
3. Configure CORS properly
4. Enable SSL/TLS

### 7.3 Performance Monitoring
1. Set up error tracking (Sentry)
2. Configure analytics (Google Analytics)
3. Monitor API response times
4. Set up uptime monitoring

---

## 📊 Step 8: Advanced Features Setup

### 8.1 AI Integration
1. Set up OpenAI API key
2. Configure AI email generation
3. Enable lead scoring automation

### 8.2 Email Deliverability
1. Configure SPF/DKIM records
2. Set up dedicated IP (if needed)
3. Monitor email reputation

### 8.3 Integrations
1. Gmail API setup
2. LinkedIn API integration
3. CRM integrations (HubSpot, Salesforce)

---

## 🔧 Troubleshooting

### Common Issues:

**1. CORS Errors**
- Ensure backend CORS includes your Vercel domain
- Check environment variables are set correctly

**2. Authentication Issues**
- Verify Supabase project settings
- Check OAuth redirect URLs
- Ensure email templates are configured

**3. Database Connection Issues**
- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure service role key is correct

**4. Build Failures**
- Check all dependencies are in package.json
- Verify environment variables are set
- Check build logs for specific errors

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review Vercel/Render deployment logs
3. Test locally with production environment variables
4. Check browser console for frontend errors

---

## 🎉 Success Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed successfully
- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Render
- [ ] Authentication working (email + Google)
- [ ] API communication working
- [ ] Core features tested
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Security measures implemented

**🎊 Congratulations! Your Outrelix platform is now live and ready to scale!**
