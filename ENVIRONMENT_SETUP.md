# Environment Variables for Outrelix

## Required Environment Variables

### Supabase Configuration
```bash
# Supabase Project URL
REACT_APP_SUPABASE_URL=https://bfoggljxtwoloxthtocy.supabase.co

# Supabase Anon Key
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDM2MTYsImV4cCI6MjA2NTQ3OTYxNn0.aNc3yGc5KEVWyTUZzVuCLyALdnZgkFfs83IaI5cctcA

# Supabase Service Role Key (for backend)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmb2dnbGp4dHdvbG94dGh0b2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTkwMzYxNiwiZXhwIjoyMDY1NDc5NjE2fQ.tb8-UDuye8roMeCwW0YqgjBbodo3x4Bwe_o0JM87kkM
```

### Backend API Configuration
```bash
# Backend API URL (Render deployment)
REACT_APP_BACKEND_API_URL=https://outrelix-backend.onrender.com

# Alternative backend URL (if needed)
REACT_APP_BACKEND_URL=https://outrelix-backend.onrender.com
```

### Email Service (Resend API)
```bash
# Resend API Key for OTP emails
RESEND_API_KEY=your_resend_api_key_here

# Resend Domain
RESEND_DOMAIN=cavexa.online

# Sender Email
SENDER_EMAIL=noreply@cavexa.online
```

## Where to Place Environment Variables

### Frontend (Vercel)
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all `REACT_APP_*` variables

### Backend (Render)
1. Go to your Render dashboard
2. Select your service
3. Go to Environment tab
4. Add all backend environment variables

### Local Development
Create a `.env` file in the project root:
```bash
# Copy the variables above and add your actual values
REACT_APP_SUPABASE_URL=https://bfoggljxtwoloxthtocy.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_BACKEND_API_URL=http://localhost:8000
# ... etc
```

## Supabase Edge Functions

The analyzer feature uses Supabase Edge Functions. To deploy:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref bfoggljxtwoloxthtocy`
4. Deploy function: `supabase functions deploy fetch_page`

## Database Migrations

To apply the analyzer feature migration:

1. Run: `supabase db push`
2. Or manually run the SQL from `supabase/migrations/004_analyzer_feature.sql`

## Testing the Analyzer Feature

1. Ensure all environment variables are set
2. Deploy the Supabase Edge Function
3. Run the database migration
4. Test by navigating to `/dashboard` and clicking "Website Analyzer" in the sidebar
5. Enter a URL like `https://example.com` and click "Analyze"
