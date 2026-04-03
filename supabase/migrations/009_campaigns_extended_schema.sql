-- =====================================================
-- Migration 009: Extend campaigns table schema
-- Adds missing columns used by the backend API
-- =====================================================

-- Add new valid values to the campaign_status enum
-- We use a workaround since ALTER TYPE ADD VALUE can't be in a transaction block
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'campaign_status'::regtype AND enumlabel = 'processing'
    ) THEN
        ALTER TYPE campaign_status ADD VALUE 'processing';
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'campaign_status'::regtype AND enumlabel = 'ready'
    ) THEN
        ALTER TYPE campaign_status ADD VALUE 'ready';
    END IF;
END
$$;

-- Add missing columns to campaigns table
ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS goal TEXT,
    ADD COLUMN IF NOT EXISTS email_template TEXT,
    ADD COLUMN IF NOT EXISTS email_subject TEXT,
    ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS positive_replies INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_emails INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS csv_uploaded BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_campaigns_status_user ON campaigns(user_id, status);
