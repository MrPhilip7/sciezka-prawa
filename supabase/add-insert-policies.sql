-- Add policies for bills table to allow authenticated users to insert/update
-- Run this in Supabase SQL Editor

-- Allow authenticated users to insert bills
CREATE POLICY "Authenticated users can insert bills" ON bills
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update bills
CREATE POLICY "Authenticated users can update bills" ON bills
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert bill events
CREATE POLICY "Authenticated users can insert bill events" ON bill_events
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update bill events
CREATE POLICY "Authenticated users can update bill events" ON bill_events
  FOR UPDATE 
  USING (auth.role() = 'authenticated');
