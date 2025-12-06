-- Check which bills have OSR (Impact Assessment) data

-- Bills with impact_assessment_url
SELECT 
  sejm_id,
  title,
  impact_assessment_url,
  rcl_id,
  consultation_start_date,
  consultation_end_date
FROM bills
WHERE impact_assessment_url IS NOT NULL
ORDER BY created_at DESC;

-- Bills with impact assessment events
SELECT 
  b.sejm_id,
  b.title,
  be.event_date,
  be.description,
  be.details->>'summary' as summary
FROM bills b
JOIN bill_events be ON be.bill_id = b.id
WHERE be.event_type = 'impact_assessment'
ORDER BY be.event_date DESC;

-- Combined view - any bills with OSR data
SELECT DISTINCT
  b.sejm_id,
  b.title,
  b.status,
  b.impact_assessment_url,
  b.rcl_id,
  CASE 
    WHEN b.impact_assessment_url IS NOT NULL THEN 'URL'
    WHEN EXISTS (SELECT 1 FROM bill_events WHERE bill_id = b.id AND event_type = 'impact_assessment') THEN 'Event'
    ELSE 'None'
  END as osr_source
FROM bills b
WHERE b.impact_assessment_url IS NOT NULL
   OR EXISTS (SELECT 1 FROM bill_events WHERE bill_id = b.id AND event_type = 'impact_assessment')
ORDER BY b.created_at DESC;
