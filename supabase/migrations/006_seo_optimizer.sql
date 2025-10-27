-- SEO Optimizer Feature Migration
-- Creates tables for SEO optimization results and user settings

-- Table to store SEO optimization results
CREATE TABLE IF NOT EXISTS seo_optimizations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT,
    input_text TEXT NOT NULL,
    optimized_text TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[] DEFAULT '{}',
    word_count INTEGER DEFAULT 0,
    seo_score INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store SEO optimizer settings per user
CREATE TABLE IF NOT EXISTS seo_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    max_optimizations_per_day INTEGER DEFAULT 10,
    optimization_count INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_optimizations_user_id ON seo_optimizations(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_optimizations_created_at ON seo_optimizations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_settings_user_id ON seo_settings(user_id);

-- Function to check daily SEO optimization limit
CREATE OR REPLACE FUNCTION check_daily_seo_limit(uid UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (SELECT optimization_count FROM seo_settings WHERE user_id = uid),
        0
    );
$$;

-- Function to increment SEO optimization count
CREATE OR REPLACE FUNCTION increment_seo_count(uid UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    INSERT INTO seo_settings (user_id, optimization_count, last_reset_at)
    VALUES (uid, 1, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        optimization_count = seo_settings.optimization_count + 1,
        updated_at = NOW();
$$;

-- Function to reset daily counts (can be called by cron job)
CREATE OR REPLACE FUNCTION reset_daily_seo_counts()
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    UPDATE seo_settings 
    SET optimization_count = 0, last_reset_at = NOW()
    WHERE last_reset_at < CURRENT_DATE;
$$;

-- Enable Row Level Security
ALTER TABLE seo_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seo_optimizations
CREATE POLICY "Users can view their own SEO optimizations"
    ON seo_optimizations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SEO optimizations"
    ON seo_optimizations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO optimizations"
    ON seo_optimizations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEO optimizations"
    ON seo_optimizations FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for seo_settings
CREATE POLICY "Users can view their own SEO settings"
    ON seo_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own SEO settings"
    ON seo_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEO settings"
    ON seo_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON seo_optimizations TO authenticated;
GRANT ALL ON seo_settings TO authenticated;
GRANT EXECUTE ON FUNCTION check_daily_seo_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_seo_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_daily_seo_counts() TO authenticated;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_seo_optimizations_updated_at
    BEFORE UPDATE ON seo_optimizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
