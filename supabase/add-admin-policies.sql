-- Add RLS policies for admin operations on bill_events
-- Run this in Supabase SQL Editor

-- Allow INSERT for anyone (needed for sync operation)
-- In production, this should be restricted to authenticated admins
CREATE POLICY "Allow insert bill_events" ON bill_events
  FOR INSERT WITH CHECK (true);

-- Allow UPDATE for anyone (needed for sync operation)
CREATE POLICY "Allow update bill_events" ON bill_events
  FOR UPDATE USING (true);

-- Allow DELETE for anyone (needed for sync operation)
CREATE POLICY "Allow delete bill_events" ON bill_events
  FOR DELETE USING (true);

-- Same for bills table
CREATE POLICY "Allow insert bills" ON bills
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update bills" ON bills
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete bills" ON bills
  FOR DELETE USING (true);
