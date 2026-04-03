-- =====================================================
-- ELITE LEAD ENGINE: Intelligence Center
-- Persistent Mission History & Search Results
-- =====================================================

-- Table: Lead Missions (Search Log)
CREATE TABLE IF NOT EXISTS lead_missions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    queries JSONB NOT NULL,
    geo TEXT,
    industry TEXT,
    status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'failed', 'partial'
    progress INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: Lead Mission Results (Scraped Leads)
-- Note: This stores the raw captured intelligence for a specific mission
CREATE TABLE IF NOT EXISTS lead_mission_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mission_id UUID REFERENCES lead_missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_data JSONB NOT NULL, -- The elite record (name, website, emails, score, etc.)
    domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast mission lookups
CREATE INDEX idx_lead_missions_user_id ON lead_missions(user_id);
CREATE INDEX idx_lead_missions_created_at ON lead_missions(created_at DESC);

-- Index for lead results retrieval
CREATE INDEX idx_mission_results_mission_id ON lead_mission_results(mission_id);
CREATE INDEX idx_mission_results_domain ON lead_mission_results(domain);

-- Enable RLS
ALTER TABLE lead_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_mission_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own missions" ON lead_missions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON lead_missions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON lead_missions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions" ON lead_missions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own mission results" ON lead_mission_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission results" ON lead_mission_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_lead_missions_updated_at BEFORE UPDATE ON lead_missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
