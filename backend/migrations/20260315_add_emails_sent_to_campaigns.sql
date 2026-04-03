-- Migration to add tracking columns to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS emails_sent INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS total_emails INTEGER DEFAULT 0;
