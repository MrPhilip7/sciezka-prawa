-- Polish Legislative Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for bill status
CREATE TYPE bill_status AS ENUM (
  'draft',
  'submitted',
  'first_reading',
  'committee',
  'second_reading',
  'third_reading',
  'senate',
  'presidential',
  'published',
  'rejected'
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sejm_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status bill_status DEFAULT 'draft',
  ministry TEXT,
  submission_date DATE,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  external_url TEXT,
  document_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bill events table (for timeline)
CREATE TABLE bill_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User alerts table
CREATE TABLE user_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bill_id)
);

-- Saved searches table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  filters JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_ministry ON bills(ministry);
CREATE INDEX idx_bills_submission_date ON bills(submission_date);
CREATE INDEX idx_bills_sejm_id ON bills(sejm_id);
CREATE INDEX idx_bill_events_bill_id ON bill_events(bill_id);
CREATE INDEX idx_bill_events_event_date ON bill_events(event_date);
CREATE INDEX idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX idx_user_alerts_bill_id ON user_alerts(bill_id);
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Bills: Everyone can read bills
CREATE POLICY "Bills are viewable by everyone" ON bills
  FOR SELECT USING (true);

-- Bill events: Everyone can read bill events
CREATE POLICY "Bill events are viewable by everyone" ON bill_events
  FOR SELECT USING (true);

-- User alerts: Users can only see and manage their own alerts
CREATE POLICY "Users can view their own alerts" ON user_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alerts" ON user_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON user_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts" ON user_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Saved searches: Users can only see and manage their own saved searches
CREATE POLICY "Users can view their own saved searches" ON saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches" ON saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON saved_searches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_alerts_updated_at
  BEFORE UPDATE ON user_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert some sample data for testing
INSERT INTO bills (sejm_id, title, description, status, ministry, submission_date, external_url, document_type)
VALUES
  ('DRUK-001', 'Ustawa o zmianie ustawy o podatku dochodowym od osób fizycznych', 'Projekt ustawy wprowadzający zmiany w systemie podatkowym dla osób fizycznych, w tym nowe progi podatkowe i ulgi.', 'committee', 'Ministerstwo Finansów', '2024-01-15', 'https://www.sejm.gov.pl/druki/001', 'projekt_ustawy'),
  ('DRUK-002', 'Ustawa o ochronie środowiska naturalnego', 'Kompleksowy projekt ustawy dotyczący ochrony środowiska, w tym nowe regulacje dotyczące emisji CO2.', 'second_reading', 'Ministerstwo Klimatu i Środowiska', '2024-02-20', 'https://www.sejm.gov.pl/druki/002', 'projekt_ustawy'),
  ('DRUK-003', 'Ustawa o cyfryzacji administracji publicznej', 'Projekt ustawy mający na celu modernizację usług publicznych i wprowadzenie e-urzędu.', 'first_reading', 'Ministerstwo Cyfryzacji', '2024-03-10', 'https://www.sejm.gov.pl/druki/003', 'projekt_ustawy'),
  ('DRUK-004', 'Ustawa budżetowa na rok 2025', 'Projekt ustawy budżetowej określający dochody i wydatki państwa na rok 2025.', 'senate', 'Ministerstwo Finansów', '2024-09-30', 'https://www.sejm.gov.pl/druki/004', 'ustawa_budzetowa'),
  ('DRUK-005', 'Ustawa o systemie oświaty', 'Nowelizacja ustawy o systemie oświaty wprowadzająca zmiany w programie nauczania.', 'published', 'Ministerstwo Edukacji Narodowej', '2024-04-05', 'https://www.sejm.gov.pl/druki/005', 'projekt_ustawy'),
  ('DRUK-006', 'Ustawa o służbie zdrowia', 'Projekt ustawy reformujący system ochrony zdrowia w Polsce.', 'draft', 'Ministerstwo Zdrowia', '2024-11-01', 'https://www.sejm.gov.pl/druki/006', 'projekt_ustawy');

-- Insert sample bill events
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', submission_date, 'Projekt ustawy został złożony do Sejmu'
FROM bills WHERE sejm_id = 'DRUK-001';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', submission_date + INTERVAL '14 days', 'Odbyło się pierwsze czytanie projektu'
FROM bills WHERE sejm_id = 'DRUK-001';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', submission_date + INTERVAL '21 days', 'Projekt skierowany do komisji sejmowej'
FROM bills WHERE sejm_id = 'DRUK-001';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', submission_date, 'Projekt ustawy został złożony do Sejmu'
FROM bills WHERE sejm_id = 'DRUK-002';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', submission_date + INTERVAL '10 days', 'Odbyło się pierwsze czytanie projektu'
FROM bills WHERE sejm_id = 'DRUK-002';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'second_reading', submission_date + INTERVAL '45 days', 'Odbyło się drugie czytanie projektu'
FROM bills WHERE sejm_id = 'DRUK-002';
