-- Rzeczywiste projekty ustaw z RCL (legislacja.rcl.gov.pl)
-- Źródło: https://legislacja.rcl.gov.pl/lista?typeId=2
-- Data pobrania: 6 grudnia 2025
-- Uwaga: Statusy "prekonsultacja"/"konsultacja" dodane do testowania forum
--        (RCL wymaga logowania do szczegółów o konsultacjach)

-- Projekt 1: Ustawa o upadłości i restrukturyzacji (prekonsultacje)
INSERT INTO bills (
  sejm_id,
  title,
  description,
  status,
  ministry,
  submission_date,
  last_updated,
  document_type,
  submitter_type,
  category,
  term,
  tags,
  rcl_id,
  consultation_start_date,
  consultation_end_date,
  consultation_url,
  simple_language_summary
) VALUES (
  'UD260',
  'Ustawa o zmianie ustawy – Prawo upadłościowe, ustawy – Prawo restrukturyzacyjne oraz ustawy o Krajowym Rejestrze Zadłużonych',
  'Projekt nowelizacji regulujący procesy upadłościowe i restrukturyzacyjne przedsiębiorstw. Wprowadza zmiany mające na celu usprawnienie i przyspieszenie postępowań.',
  'preconsultation',
  'Minister Sprawiedliwości',
  '2025-12-05',
  NOW(),
  'ustawa',
  'rządowy',
  'prawo_gospodarcze',
  10,
  ARRAY['upadłość', 'restrukturyzacja', 'prawo gospodarcze', 'przedsiębiorcy'],
  'UD260',
  '2025-12-06',
  '2026-01-20',
  'https://legislacja.rcl.gov.pl/projekt/12403260',
  'Zmiany w prawie upadłościowym mają uprościć i przyspieszyć postępowania dla firm w trudnej sytuacji finansowej.'
);

-- Projekt 2: Osobiste konta inwestycyjne (konsultacje)
INSERT INTO bills (
  sejm_id,
  title,
  description,
  status,
  ministry,
  submission_date,
  last_updated,
  document_type,
  submitter_type,
  category,
  term,
  tags,
  rcl_id,
  consultation_start_date,
  consultation_end_date,
  consultation_url,
  simple_language_summary
) VALUES (
  'UD296',
  'Ustawa o osobistych kontach inwestycyjnych',
  'Nowa ustawa wprowadzająca osobiste konta inwestycyjne (OKI) dla obywateli. Ma zachęcić do długoterminowego oszczędzania i inwestowania poprzez preferencje podatkowe.',
  'consultation',
  'Minister Finansów i Gospodarki',
  '2025-12-03',
  NOW(),
  'ustawa',
  'rządowy',
  'finanse',
  10,
  ARRAY['inwestycje', 'oszczędności', 'ulgi podatkowe', 'finanse osobiste'],
  'UD296',
  '2025-12-05',
  '2026-01-31',
  'https://legislacja.rcl.gov.pl/projekt/12403296',
  'Nowe osobiste konta inwestycyjne pozwolą oszczędzać z ulgami podatkowymi. Pieniądze zainwestowane na długi termin będą opodatkowane korzystniej.'
);

-- Projekt 3: Żywienie zbiorowe z żywnością ekologiczną (współtworzenie)
INSERT INTO bills (
  sejm_id,
  title,
  description,
  status,
  ministry,
  submission_date,
  last_updated,
  document_type,
  submitter_type,
  category,
  term,
  tags,
  rcl_id,
  consultation_start_date,
  consultation_end_date,
  consultation_url,
  simple_language_summary
) VALUES (
  'UD303',
  'Ustawa o żywieniu zbiorowym z udziałem żywności ekologicznej',
  'Projekt wprowadzający obowiązek wykorzystywania żywności ekologicznej w żywieniu zbiorowym (szkoły, przedszkola, szpitale). Ma promować zdrowe odżywianie i lokalne produkty.',
  'co_creation',
  'Minister Rolnictwa i Rozwoju Wsi',
  '2025-11-21',
  NOW(),
  'ustawa',
  'rządowy',
  'rolnictwo',
  10,
  ARRAY['żywność ekologiczna', 'szkoły', 'zdrowie', 'żywienie'],
  'UD303',
  '2025-11-25',
  '2026-02-28',
  'https://legislacja.rcl.gov.pl/projekt/12403303',
  'W szkołach, przedszkolach i szpitalach będzie więcej jedzenia eko. Ustawa ma promować zdrową żywność i wspierać lokalnych rolników.'
);

-- Projekt 4: Deregulacja w energetyce (prekonsultacje)
INSERT INTO bills (
  sejm_id,
  title,
  description,
  status,
  ministry,
  submission_date,
  last_updated,
  document_type,
  submitter_type,
  category,
  term,
  tags,
  rcl_id,
  consultation_start_date,
  consultation_end_date,
  consultation_url,
  simple_language_summary
) VALUES (
  'UDER92',
  'Ustawa o zmianie niektórych ustaw w celu dokonania deregulacji w zakresie energetyki',
  'Projekt nowelizacji mający na celu uproszczenie przepisów w sektorze energetycznym. Usuwa zbędne bariery administracyjne i ułatwia inwestycje w odnawialne źródła energii.',
  'preconsultation',
  'Minister Energii',
  '2025-11-28',
  NOW(),
  'ustawa',
  'rządowy',
  'energetyka',
  10,
  ARRAY['energia', 'OZE', 'deregulacja', 'inwestycje'],
  'UDER92',
  '2025-12-01',
  '2026-02-15',
  'https://legislacja.rcl.gov.pl/projekt/12403359',
  'Mniej biurokracji w energetyce. Łatwiej będzie inwestować w panele słoneczne i wiatraki. Ustawa usuwa niepotrzebne wymogi prawne.'
);

-- Projekt 5: Likwidacja barier w JST (konsultacje)
INSERT INTO bills (
  sejm_id,
  title,
  description,
  status,
  ministry,
  submission_date,
  last_updated,
  document_type,
  submitter_type,
  category,
  term,
  tags,
  rcl_id,
  consultation_start_date,
  consultation_end_date,
  consultation_url,
  simple_language_summary
) VALUES (
  'UD309',
  'Ustawa o likwidacji barier utrudniających funkcjonowanie jednostek samorządu terytorialnego',
  'Projekt usuwający przeszkody prawne i administracyjne w działaniu gmin, powiatów i województw. Ma uprościć procedury i zwiększyć efektywność samorządów.',
  'consultation',
  'Minister Spraw Wewnętrznych i Administracji',
  '2025-11-27',
  NOW(),
  'ustawa',
  'rządowy',
  'administracja',
  10,
  ARRAY['samorząd', 'gminy', 'deregulacja', 'administracja'],
  'UD309',
  '2025-12-02',
  '2026-01-20',
  'https://legislacja.rcl.gov.pl/projekt/12403309',
  'Mniej biurokracji dla gmin i powiatów. Samorządy będą mogły sprawniej działać, bo usuniemy niepotrzebne wymogi prawne.'
);

-- Pokaż dodane projekty
SELECT 
  sejm_id as "Numer RCL", 
  title as "Tytuł", 
  status as "Status",
  ministry as "Ministerstwo",
  consultation_start_date as "Start konsultacji",
  consultation_end_date as "Koniec konsultacji"
FROM bills 
WHERE sejm_id IN ('UD260', 'UD296', 'UD303', 'UDER92', 'UD309')
ORDER BY submission_date DESC;
