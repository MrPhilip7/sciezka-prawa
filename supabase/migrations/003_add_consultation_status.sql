-- Dodaj nowy status 'consultation' do enum bill_status
ALTER TYPE bill_status ADD VALUE IF NOT EXISTS 'consultation';
