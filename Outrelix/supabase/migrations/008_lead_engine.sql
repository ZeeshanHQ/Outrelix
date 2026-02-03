-- =====================================================
-- LEAD ENGINE INTEGRATION
-- Tables for storing Lead Engine runs and results
-- =====================================================

-- Lead generation runs from Lead Engine service
CREATE TABLE IF NOT EXISTS lead_runs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    engine_run_id TEXT NOT NULL UNIQUE,  -- The run_id from Lead Engine service
    queries TEXT NOT NULL,
    geo TEXT NOT NULL,
    category TEXT,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued, running, completed, failed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb  -- Store additional run metadata
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lead_runs_user_id ON lead_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_runs_engine_run_id ON lead_runs(engine_run_id);
CREATE INDEX IF NOT EXISTS idx_lead_runs_status ON lead_runs(status);
CREATE INDEX IF NOT EXISTS idx_lead_runs_created_at ON lead_runs(created_at DESC);

-- Lead results from Lead Engine runs
CREATE TABLE IF NOT EXISTS lead_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    run_id UUID NOT NULL,
    company_name TEXT,
    domain TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    score INTEGER DEFAULT 0,  -- Lead score 0-100
    quality TEXT,  -- high, medium, low
    industry TEXT,
    employees INTEGER,
    source TEXT,  -- Google Maps, Yelp, etc.
    email_valid BOOLEAN,
    ai_insights TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,  -- Store additional lead data
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint only if it doesn't exist
DO $$
BEGIN
    -- Check if constraint with this specific name exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lead_results_run_id_fkey'
    ) THEN
        -- Check if any FK constraint exists on this column (might have different name)
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid
            JOIN pg_namespace n ON t.relnamespace = n.oid
            WHERE n.nspname = 'public'
            AND t.relname = 'lead_results'
            AND c.contype = 'f'
            AND EXISTS (
                SELECT 1 FROM pg_attribute a 
                WHERE a.attrelid = t.oid 
                AND a.attnum = ANY(c.conkey)
                AND a.attname = 'run_id'
            )
        ) THEN
            -- No constraint exists, add it
            ALTER TABLE lead_results 
            ADD CONSTRAINT lead_results_run_id_fkey 
            FOREIGN KEY (run_id) REFERENCES lead_runs(id) ON DELETE CASCADE;
        END IF;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Constraint already exists (any error), silently ignore
        NULL;
END $$;

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_lead_results_run_id ON lead_results(run_id);
CREATE INDEX IF NOT EXISTS idx_lead_results_email ON lead_results(email);
CREATE INDEX IF NOT EXISTS idx_lead_results_domain ON lead_results(domain);
CREATE INDEX IF NOT EXISTS idx_lead_results_score ON lead_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_results_quality ON lead_results(quality);
CREATE INDEX IF NOT EXISTS idx_lead_results_created_at ON lead_results(created_at DESC);

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on lead_runs
DROP TRIGGER IF EXISTS update_lead_runs_updated_at ON lead_runs;
CREATE TRIGGER update_lead_runs_updated_at
    BEFORE UPDATE ON lead_runs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - safe to run multiple times
DO $$
BEGIN
    -- Enable RLS if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'lead_runs' 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE lead_runs ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'lead_results' 
        AND n.nspname = 'public'
        AND c.relrowsecurity = true
    ) THEN
        ALTER TABLE lead_results ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- RLS Policies for lead_runs
DROP POLICY IF EXISTS "Users can view their own lead runs" ON lead_runs;
CREATE POLICY "Users can view their own lead runs"
    ON lead_runs FOR SELECT
    USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own lead runs" ON lead_runs;
CREATE POLICY "Users can insert their own lead runs"
    ON lead_runs FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own lead runs" ON lead_runs;
CREATE POLICY "Users can update their own lead runs"
    ON lead_runs FOR UPDATE
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete their own lead runs" ON lead_runs;
CREATE POLICY "Users can delete their own lead runs"
    ON lead_runs FOR DELETE
    USING (auth.uid()::text = user_id::text);

-- RLS Policies for lead_results
DROP POLICY IF EXISTS "Users can view leads from their runs" ON lead_results;
CREATE POLICY "Users can view leads from their runs"
    ON lead_results FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lead_runs
            WHERE lead_runs.id = lead_results.run_id
            AND lead_runs.user_id::text = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can insert leads for their runs" ON lead_results;
CREATE POLICY "Users can insert leads for their runs"
    ON lead_results FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM lead_runs
            WHERE lead_runs.id = lead_results.run_id
            AND lead_runs.user_id::text = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can update leads from their runs" ON lead_results;
CREATE POLICY "Users can update leads from their runs"
    ON lead_results FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM lead_runs
            WHERE lead_runs.id = lead_results.run_id
            AND lead_runs.user_id::text = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Users can delete leads from their runs" ON lead_results;
CREATE POLICY "Users can delete leads from their runs"
    ON lead_results FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM lead_runs
            WHERE lead_runs.id = lead_results.run_id
            AND lead_runs.user_id::text = auth.uid()::text
        )
    );

-- Function to get user's lead run statistics (CREATE OR REPLACE makes it idempotent)
CREATE OR REPLACE FUNCTION get_user_lead_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_runs', COUNT(*),
        'completed_runs', COUNT(*) FILTER (WHERE status = 'completed'),
        'running_runs', COUNT(*) FILTER (WHERE status = 'running'),
        'failed_runs', COUNT(*) FILTER (WHERE status = 'failed'),
        'total_leads', (
            SELECT COUNT(*) FROM lead_results
            WHERE run_id IN (SELECT id FROM lead_runs WHERE user_id = p_user_id)
        ),
        'high_quality_leads', (
            SELECT COUNT(*) FROM lead_results
            WHERE run_id IN (SELECT id FROM lead_runs WHERE user_id = p_user_id)
            AND quality = 'high'
        )
    ) INTO stats
    FROM lead_runs
    WHERE user_id = p_user_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

