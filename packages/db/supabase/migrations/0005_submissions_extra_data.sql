-- Add extra_data JSONB column to submissions for structured bot data
-- (services, physical params, languages, etc.)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS extra_data jsonb DEFAULT '{}'::jsonb;
