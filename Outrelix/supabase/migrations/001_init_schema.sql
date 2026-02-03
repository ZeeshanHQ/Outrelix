-- =====================================================
-- OUTRELIX: Elite AI-Powered Sales & Marketing Platform
-- Comprehensive Database Schema
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

-- User subscription tiers
CREATE TYPE subscription_tier AS ENUM (
    'free',
    'starter', 
    'professional',
    'enterprise'
);

-- Campaign status
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'active',
    'paused',
    'completed',
    'archived'
);

-- Lead status
CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'responded',
    'qualified',
    'unqualified',
    'converted',
    'lost'
);

-- Email status
CREATE TYPE email_status AS ENUM (
    'pending',
    'sent',
    'delivered',
    'opened',
    'clicked',
    'replied',
    'bounced',
    'failed'
);

-- Integration types
CREATE TYPE integration_type AS ENUM (
    'gmail',
    'outlook',
    'linkedin',
    'hubspot',
    'salesforce',
    'zapier'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    job_title TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    country TEXT,
    country_code TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    credits_remaining INTEGER DEFAULT 100,
    monthly_email_limit INTEGER DEFAULT 100,
    settings JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations (for team collaboration)
CREATE TABLE organizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization members
CREATE TABLE organization_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- =====================================================
-- CAMPAIGNS & SEQUENCES
-- =====================================================

-- Campaigns
CREATE TABLE campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    industry TEXT,
    target_audience TEXT,
    status campaign_status DEFAULT 'draft',
    settings JSONB DEFAULT '{}',
    ai_suggestions JSONB DEFAULT '[]',
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Email sequences (multi-step campaigns)
CREATE TABLE email_sequences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    delay_days INTEGER DEFAULT 0,
    delay_hours INTEGER DEFAULT 0,
    subject_line TEXT,
    email_template TEXT,
    ai_personalization JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- LEADS & CONTACTS
-- =====================================================

-- Lead sources
CREATE TABLE lead_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'manual', 'import', 'scraper', 'integration'
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads/Contacts
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    company_name TEXT,
    job_title TEXT,
    phone TEXT,
    linkedin_url TEXT,
    website TEXT,
    industry TEXT,
    company_size TEXT,
    location TEXT,
    country TEXT,
    lead_score INTEGER DEFAULT 0,
    status lead_status DEFAULT 'new',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    source_id UUID REFERENCES lead_sources(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    last_contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email, user_id)
);

-- Lead activities (tracking all interactions)
CREATE TABLE lead_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    activity_type TEXT NOT NULL, -- 'email_sent', 'email_opened', 'email_clicked', 'reply_received', 'call_made', 'meeting_scheduled'
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL MANAGEMENT
-- =====================================================

-- Email templates
CREATE TABLE email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]', -- Available variables for personalization
    category TEXT, -- 'cold_outreach', 'follow_up', 'nurture', 'closing'
    industry TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email sends
CREATE TABLE email_sends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES email_sequences(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    personalized_content TEXT,
    status email_status DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    replied_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email tracking events
CREATE TABLE email_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- AI & AUTOMATION
-- =====================================================

-- AI suggestions
CREATE TABLE ai_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    suggestion_type TEXT NOT NULL, -- 'subject_line', 'email_content', 'timing', 'audience', 'personalization'
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0,
    is_applied BOOLEAN DEFAULT FALSE,
    feedback TEXT, -- 'positive', 'negative', 'neutral'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automation rules
CREATE TABLE automation_rules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INTEGRATIONS
-- =====================================================

-- User integrations
CREATE TABLE integrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type integration_type NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    credentials JSONB NOT NULL, -- Encrypted credentials
    settings JSONB DEFAULT '{}',
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE webhooks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of events to listen for
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & REPORTING
-- =====================================================

-- Campaign analytics (aggregated data for performance)
CREATE TABLE campaign_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    meetings_scheduled INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

-- User analytics
CREATE TABLE user_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    campaigns_created INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    leads_added INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

-- Campaigns indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);

-- Leads indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_lead_score ON leads(lead_score);
CREATE INDEX idx_leads_company_name ON leads(company_name);
CREATE INDEX idx_leads_industry ON leads(industry);
CREATE INDEX idx_leads_created_at ON leads(created_at);

-- Email sends indexes
CREATE INDEX idx_email_sends_campaign_id ON email_sends(campaign_id);
CREATE INDEX idx_email_sends_lead_id ON email_sends(lead_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_scheduled_at ON email_sends(scheduled_at);
CREATE INDEX idx_email_sends_sent_at ON email_sends(sent_at);

-- Email events indexes
CREATE INDEX idx_email_events_email_send_id ON email_events(email_send_id);
CREATE INDEX idx_email_events_event_type ON email_events(event_type);
CREATE INDEX idx_email_events_timestamp ON email_events(timestamp);

-- Full-text search indexes
CREATE INDEX idx_leads_search ON leads USING gin(to_tsvector('english', 
    COALESCE(full_name, '') || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(job_title, '')
));

CREATE INDEX idx_campaigns_search ON campaigns USING gin(to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(industry, '')
));

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Organization owners can update" ON organizations
    FOR UPDATE USING (
        owner_id = auth.uid()
    );

CREATE POLICY "Users can create organizations" ON organizations
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON campaigns
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create campaigns" ON campaigns
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own campaigns" ON campaigns
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own campaigns" ON campaigns
    FOR DELETE USING (user_id = auth.uid());

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create leads" ON leads
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own leads" ON leads
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own leads" ON leads
    FOR DELETE USING (user_id = auth.uid());

-- Similar policies for other tables...
-- (Additional policies would be added here for all tables)

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    lead_record RECORD;
BEGIN
    SELECT * INTO lead_record FROM leads WHERE id = lead_id;
    
    -- Base score from company size
    CASE lead_record.company_size
        WHEN '1-10' THEN score := score + 10;
        WHEN '11-50' THEN score := score + 20;
        WHEN '51-200' THEN score := score + 30;
        WHEN '201-1000' THEN score := score + 40;
        WHEN '1000+' THEN score := score + 50;
    END CASE;
    
    -- Score from job title
    IF lead_record.job_title ILIKE '%ceo%' OR lead_record.job_title ILIKE '%founder%' THEN
        score := score + 30;
    ELSIF lead_record.job_title ILIKE '%director%' OR lead_record.job_title ILIKE '%vp%' THEN
        score := score + 25;
    ELSIF lead_record.job_title ILIKE '%manager%' THEN
        score := score + 15;
    END IF;
    
    -- Score from email engagement
    SELECT COUNT(*) INTO score FROM email_events ee
    JOIN email_sends es ON ee.email_send_id = es.id
    WHERE es.lead_id = lead_id AND ee.event_type IN ('opened', 'clicked');
    
    RETURN GREATEST(0, LEAST(100, score));
END;
$$ LANGUAGE plpgsql;

-- Function to get campaign performance metrics
CREATE OR REPLACE FUNCTION get_campaign_metrics(campaign_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_sent INTEGER;
    total_delivered INTEGER;
    total_opened INTEGER;
    total_clicked INTEGER;
    total_replies INTEGER;
BEGIN
    SELECT 
        COUNT(*) FILTER (WHERE status = 'sent'),
        COUNT(*) FILTER (WHERE status = 'delivered'),
        COUNT(*) FILTER (WHERE status = 'opened'),
        COUNT(*) FILTER (WHERE status = 'clicked'),
        COUNT(*) FILTER (WHERE status = 'replied')
    INTO total_sent, total_delivered, total_opened, total_clicked, total_replies
    FROM email_sends 
    WHERE campaign_id = get_campaign_metrics.campaign_id;
    
    result := jsonb_build_object(
        'total_sent', total_sent,
        'total_delivered', total_delivered,
        'total_opened', total_opened,
        'total_clicked', total_clicked,
        'total_replies', total_replies,
        'delivery_rate', CASE WHEN total_sent > 0 THEN (total_delivered::DECIMAL / total_sent * 100) ELSE 0 END,
        'open_rate', CASE WHEN total_delivered > 0 THEN (total_opened::DECIMAL / total_delivered * 100) ELSE 0 END,
        'click_rate', CASE WHEN total_delivered > 0 THEN (total_clicked::DECIMAL / total_delivered * 100) ELSE 0 END,
        'reply_rate', CASE WHEN total_delivered > 0 THEN (total_replies::DECIMAL / total_delivered * 100) ELSE 0 END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample email templates
INSERT INTO email_templates (name, subject, content, category, industry, is_public) VALUES
('Cold Outreach - Tech', 'Quick question about your {company_name} growth', 
'Hi {first_name},

I noticed {company_name} has been growing rapidly in the {industry} space. 

I have a simple strategy that helped similar companies increase their lead generation by 40% in just 30 days.

Would you be interested in a quick 15-minute call to discuss?

Best regards,
{your_name}', 'cold_outreach', 'Technology', true),

('Follow-up - General', 'Following up on my previous email', 
'Hi {first_name},

I wanted to follow up on my previous email about {topic}.

I understand you''re probably busy, but I believe this could really help {company_name} achieve {goal}.

Would you be available for a brief call this week?

Best,
{your_name}', 'follow_up', 'General', true);

-- =====================================================
-- COMPLETION
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a view for dashboard metrics
CREATE VIEW dashboard_metrics AS
SELECT 
    p.id as user_id,
    COUNT(DISTINCT c.id) as total_campaigns,
    COUNT(DISTINCT l.id) as total_leads,
    COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'sent') as emails_sent,
    COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'replied') as replies_received,
    AVG(l.lead_score) as avg_lead_score
FROM profiles p
LEFT JOIN campaigns c ON p.id = c.user_id
LEFT JOIN leads l ON p.id = l.user_id
LEFT JOIN email_sends es ON c.id = es.campaign_id
GROUP BY p.id;

COMMENT ON DATABASE postgres IS 'Outrelix - Elite AI-Powered Sales & Marketing Platform Database';
