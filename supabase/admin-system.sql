-- Admin System for Sciezka Prawa
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. USER ROLES TABLE
-- =====================================================

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Add is_active column to profiles (to ban/suspend users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add last_login column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- =====================================================
-- 2. ADMIN LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'bill', 'user', 'setting', etc.
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON admin_logs(target_type);

-- =====================================================
-- 3. BILLS - ADD HIDDEN COLUMN
-- =====================================================

ALTER TABLE bills ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES auth.users(id);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS hidden_reason TEXT;

-- Add edited_by tracking
ALTER TABLE bills ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES auth.users(id);

-- =====================================================
-- 4. SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (key, value, description)
VALUES 
  ('auto_sync_enabled', 'true', 'Enable automatic synchronization with Sejm API'),
  ('auto_sync_interval', '60', 'Auto-sync interval in minutes'),
  ('maintenance_mode', 'false', 'Enable maintenance mode'),
  ('registration_enabled', 'true', 'Allow new user registrations')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 5. RLS POLICIES FOR ADMIN
-- =====================================================

-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin logs: Only admins can read, only system can insert
CREATE POLICY "Admins can view logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Authenticated users can insert logs" ON admin_logs
  FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- System settings: Everyone can read, only admins can modify
CREATE POLICY "Everyone can view settings" ON system_settings
  FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update bills policy to hide hidden bills from regular users
DROP POLICY IF EXISTS "Bills are viewable by everyone" ON bills;

CREATE POLICY "Bills visible to users" ON bills
  FOR SELECT USING (
    is_hidden = FALSE 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Admins can update bills
CREATE POLICY "Admins can update bills" ON bills
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('moderator', 'admin', 'super_admin')
    )
  );

-- Admins can delete bills
CREATE POLICY "Admins can delete bills" ON bills
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Update profiles policy for admins
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (true);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is at least moderator
CREATE OR REPLACE FUNCTION is_moderator_or_above(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('moderator', 'admin', 'super_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
  user_role_value user_role;
BEGIN
  SELECT role INTO user_role_value FROM profiles WHERE id = user_id;
  RETURN COALESCE(user_role_value, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin action
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action TEXT,
  p_target_type TEXT,
  p_target_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO admin_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), p_action, p_target_type, p_target_id, p_details)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. SET ADMIN FOR filipczer2@gmail.com
-- =====================================================

-- First, update existing profile if exists
UPDATE profiles 
SET role = 'super_admin'
WHERE email = 'filipczer2@gmail.com';

-- If profile doesn't exist yet, we need to wait for user to log in
-- This trigger will set role when the user logs in
CREATE OR REPLACE FUNCTION set_initial_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'filipczer2@gmail.com' THEN
    NEW.role := 'super_admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_admin_on_profile_create ON profiles;
CREATE TRIGGER set_admin_on_profile_create
  BEFORE INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_initial_admin();

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_bills_is_hidden ON bills(is_hidden);
