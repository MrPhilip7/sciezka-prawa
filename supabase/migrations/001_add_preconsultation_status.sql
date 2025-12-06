-- Migration: Add preconsultation and co-creation statuses
-- Phase 1: Legislative Timeline Enhancement

-- Add new statuses to bill_status enum
ALTER TYPE bill_status ADD VALUE IF NOT EXISTS 'preconsultation';
ALTER TYPE bill_status ADD VALUE IF NOT EXISTS 'co_creation';

-- Add new fields to bills table for preconsultation phase
ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS rcl_id TEXT,
  ADD COLUMN IF NOT EXISTS consultation_start_date DATE,
  ADD COLUMN IF NOT EXISTS consultation_end_date DATE,
  ADD COLUMN IF NOT EXISTS consultation_url TEXT,
  ADD COLUMN IF NOT EXISTS impact_assessment_url TEXT,
  ADD COLUMN IF NOT EXISTS simple_language_summary TEXT;

-- Create index for RCL ID
CREATE INDEX IF NOT EXISTS idx_bills_rcl_id ON bills(rcl_id);

-- Add new event types for preconsultation
COMMENT ON COLUMN bill_events.event_type IS 
  'Event types: preconsultation_start, preconsultation_end, consultation_start, consultation_end, submitted, first_reading, committee, second_reading, third_reading, senate_received, senate_approved, senate_rejected, presidential_signature, published, rejected';
