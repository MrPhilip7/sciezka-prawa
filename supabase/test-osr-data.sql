-- Test OSR (Ocena Skutków Regulacji) Data
-- Run this in Supabase SQL Editor to add test impact assessment data

-- 1. Add impact_assessment_url to first bill
UPDATE bills 
SET impact_assessment_url = 'https://legislacja.rcl.gov.pl/docs/test-osr.pdf',
    rcl_id = 'RCL-TEST-001',
    consultation_start_date = '2024-01-15',
    consultation_end_date = '2024-02-15',
    consultation_url = 'https://legislacja.rcl.gov.pl/projekt/RCL-TEST-001'
WHERE id = (SELECT id FROM bills ORDER BY created_at DESC LIMIT 1)
RETURNING sejm_id, title;

-- 2. Add impact assessment event with detailed data
INSERT INTO bill_events (bill_id, event_type, event_date, description, details)
VALUES (
  (SELECT id FROM bills ORDER BY created_at DESC LIMIT 1),
  'impact_assessment',
  '2024-01-20',
  'Ocena Skutków Regulacji - projekt ustawy',
  jsonb_build_object(
    'summary', 'Ustawa wprowadza nowe regulacje mające na celu uproszczenie procedur administracyjnych. Przewidywane skutki obejmują oszczędności budżetowe oraz zmniejszenie obciążeń biurokratycznych dla obywateli i przedsiębiorstw.',
    'financialImpact', jsonb_build_object(
      'publicBudget', 150000000,
      'citizens', -50,
      'businesses', -5000000,
      'description', 'Oszczędności dla budżetu państwa wyniosą około 150 mln zł rocznie. Obywatele zaoszczędzą średnio 50 zł na osobę, a przedsiębiorstwa zmniejszą koszty administracyjne o 5 mln zł.'
    ),
    'socialImpact', jsonb_build_object(
      'affectedGroups', jsonb_build_array('przedsiębiorcy', 'rodziny', 'osoby niepełnosprawne'),
      'estimatedBeneficiaries', 5000000,
      'description', 'Ustawa bezpośrednio dotknie około 5 milionów osób, w tym przedsiębiorców, rodzin wielodzietnych oraz osób niepełnosprawnych. Efekty będą pozytywne - uproszczenie procedur i zmniejszenie kosztów.'
    ),
    'economicImpact', jsonb_build_object(
      'gdpEffect', 'positive',
      'employmentEffect', 'neutral',
      'description', 'Przewidywany pozytywny wpływ na PKB o około 0.15% w ciągu pierwszych 2 lat. Wpływ na zatrudnienie będzie neutralny.'
    ),
    'environmentalImpact', 'Ustawa nie ma bezpośredniego wpływu na środowisko naturalne. Digitalizacja procesów może przyczynić się do zmniejszenia zużycia papieru.',
    'legalImpact', 'Nowelizacja wymaga zmian w 3 aktach prawnych: ustawie o postępowaniu administracyjnym, ustawie o dostępie do informacji publicznej oraz kodeksie postępowania administracyjnego.'
  )
)
RETURNING event_type, event_date;

-- 3. Verify the data
SELECT 
  b.sejm_id,
  b.title,
  b.impact_assessment_url,
  b.rcl_id,
  b.consultation_start_date,
  b.consultation_end_date,
  COUNT(be.id) as impact_events_count
FROM bills b
LEFT JOIN bill_events be ON be.bill_id = b.id AND be.event_type = 'impact_assessment'
WHERE b.impact_assessment_url IS NOT NULL OR be.id IS NOT NULL
GROUP BY b.id
ORDER BY b.created_at DESC
LIMIT 5;
