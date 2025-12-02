-- Add new columns for improved filtering
-- Run this in your Supabase SQL Editor

-- Add submitter_type column (typ wnioskodawcy)
ALTER TABLE bills ADD COLUMN IF NOT EXISTS submitter_type TEXT;

-- Add category column (kategoria tematyczna)
ALTER TABLE bills ADD COLUMN IF NOT EXISTS category TEXT;

-- Add term column (kadencja sejmu)
ALTER TABLE bills ADD COLUMN IF NOT EXISTS term INTEGER DEFAULT 10;

-- Add tags column (tagi/słowa kluczowe) as array
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add submission_year column for easier filtering
ALTER TABLE bills ADD COLUMN IF NOT EXISTS submission_year INTEGER;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bills_submitter_type ON bills(submitter_type);
CREATE INDEX IF NOT EXISTS idx_bills_category ON bills(category);
CREATE INDEX IF NOT EXISTS idx_bills_term ON bills(term);
CREATE INDEX IF NOT EXISTS idx_bills_submission_year ON bills(submission_year);
CREATE INDEX IF NOT EXISTS idx_bills_tags ON bills USING GIN(tags);

-- Update RLS policies to allow updates on new columns (already covered by existing policies)

-- Update existing bills to extract year from submission_date
UPDATE bills 
SET submission_year = EXTRACT(YEAR FROM submission_date)::INTEGER
WHERE submission_date IS NOT NULL AND submission_year IS NULL;
