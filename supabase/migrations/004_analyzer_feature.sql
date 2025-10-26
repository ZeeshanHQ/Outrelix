-- =====================================================
-- OUTRELIX: App / Website Analyzer Feature
-- =====================================================

-- Table to store analyzer results
CREATE TABLE analyzer_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    summary TEXT,
    improvement_suggestions JSONB DEFAULT '[]',
    suggested_keywords TEXT[] DEFAULT '{}',
    extracted_content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store analyzer settings per user
CREATE TABLE analyzer_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    max_analysis_per_day INTEGER DEFAULT 10,
    analysis_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analyzer_results_user_id ON analyzer_results(user_id);
CREATE INDEX idx_analyzer_results_url ON analyzer_results(url);
CREATE INDEX idx_analyzer_results_created_at ON analyzer_results(created_at DESC);
CREATE INDEX idx_analyzer_results_user_created ON analyzer_results(user_id, created_at DESC);

CREATE INDEX idx_analyzer_settings_user_id ON analyzer_settings(user_id);

-- Enable RLS
ALTER TABLE analyzer_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzer_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own analyzer results" ON analyzer_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyzer results" ON analyzer_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyzer results" ON analyzer_results
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyzer settings" ON analyzer_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own analyzer settings" ON analyzer_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyzer settings" ON analyzer_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE TRIGGER update_analyzer_results_updated_at BEFORE UPDATE ON analyzer_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyzer_settings_updated_at BEFORE UPDATE ON analyzer_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check and reset daily analysis count
CREATE OR REPLACE FUNCTION check_daily_analysis_limit(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    settings_record RECORD;
    can_analyze BOOLEAN;
    remaining_analyses INTEGER;
BEGIN
    -- Get or create settings
    SELECT * INTO settings_record FROM analyzer_settings WHERE user_id = p_user_id;
    
    IF NOT FOUND THEN
        -- Create default settings
        INSERT INTO analyzer_settings (user_id) VALUES (p_user_id)
        RETURNING * INTO settings_record;
    END IF;
    
    -- Check if we need to reset the counter (new day)
    IF settings_record.last_reset_at::DATE < CURRENT_DATE THEN
        UPDATE analyzer_settings 
        SET analysis_count = 0, last_reset_at = NOW()
        WHERE user_id = p_user_id;
        remaining_analyses := settings_record.max_analysis_per_day;
        can_analyze := TRUE;
    ELSE
        remaining_analyses := settings_record.max_analysis_per_day - settings_record.analysis_count;
        can_analyze := remaining_analyses > 0;
    END IF;
    
    RETURN jsonb_build_object(
        'can_analyze', can_analyze,
        'remaining_analyses', remaining_analyses,
        'max_per_day', settings_record.max_analysis_per_day
    );
END;
$$ LANGUAGE plpgsql;

-- Function to increment analysis count
CREATE OR REPLACE FUNCTION increment_analysis_count(p_user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE analyzer_settings 
    SET analysis_count = analysis_count + 1
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_daily_analysis_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_analysis_count(UUID) TO authenticated;

COMMENT ON TABLE analyzer_results IS 'Stores app/website analysis results for users';
COMMENT ON TABLE analyzer_settings IS 'Stores user-specific analyzer settings and limits';
