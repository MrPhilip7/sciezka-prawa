-- Real Polish Legislative Data - X Kadencja Sejmu (2023-2025)
-- Run this after schema.sql to populate with real bills

-- Clear existing sample data
DELETE FROM bill_events;
DELETE FROM bills;

-- Insert real bills from Sejm X kadencji
INSERT INTO bills (sejm_id, title, description, status, ministry, submission_date, external_url, document_type) VALUES

-- Ustawy budżetowe i finansowe
('10-125', 'Rządowy projekt ustawy budżetowej na rok 2024', 
'Projekt ustawy budżetowej określający dochody i wydatki państwa na rok 2024. Obejmuje plany finansowe jednostek budżetowych, dotacje, subwencje oraz wydatki na programy rządowe.',
'published', 'Ministerstwo Finansów', '2023-12-19', 
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebsiegProc.xsp?nr=125', 'ustawa_budzetowa'),

('10-1749', 'Rządowy projekt ustawy budżetowej na rok 2026',
'Projekt ustawy budżetowej na rok 2026 określający planowane dochody i wydatki państwa, wraz ze strategią zarządzania długiem publicznym.',
'committee', 'Ministerstwo Finansów', '2025-09-30',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1749', 'ustawa_budzetowa'),

('10-1750', 'Rządowy projekt ustawy o szczególnych rozwiązaniach służących realizacji ustawy budżetowej na rok 2026',
'Projekt ustawy okołobudżetowej zawierający przepisy niezbędne do prawidłowej realizacji ustawy budżetowej na rok 2026.',
'committee', 'Ministerstwo Finansów', '2025-09-30',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1750', 'projekt_ustawy'),

-- Komisje śledcze
('10-56', 'Poselski projekt uchwały w sprawie powołania Komisji Śledczej do zbadania legalności działań w zakresie legalizacji pobytu cudzoziemców (Komisja ds. wiz)',
'Projekt uchwały powołującej komisję śledczą do zbadania legalności, prawidłowości oraz celowości działań w zakresie legalizacji pobytu cudzoziemców na terytorium RP w okresie od 1 stycznia 2019 r. do 20 listopada 2023 r.',
'published', NULL, '2023-11-22',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=56', 'projekt_uchwaly'),

('10-57', 'Poselski projekt uchwały w sprawie powołania Komisji Śledczej ds. Pegasusa',
'Projekt uchwały powołującej komisję śledczą do zbadania legalności czynności operacyjno-rozpoznawczych z wykorzystaniem oprogramowania Pegasus przez służby specjalne, Policję i organy kontroli skarbowej w okresie od 16 listopada 2015 r. do 20 listopada 2023 r.',
'published', NULL, '2023-11-22',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=57', 'projekt_uchwaly'),

('10-58', 'Poselski projekt uchwały w sprawie powołania Komisji Śledczej ds. wyborów kopertowych',
'Projekt uchwały powołującej komisję śledczą do zbadania legalności działań podjętych w celu przygotowania i przeprowadzenia wyborów Prezydenta RP w 2020 roku w formie głosowania korespondencyjnego.',
'published', NULL, '2023-11-22',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=58', 'projekt_uchwaly'),

-- Ustawy podatkowe
('10-599', 'Poselski projekt ustawy o zmianie ustawy o podatku dochodowym od osób fizycznych',
'Projekt nowelizacji ustawy o PIT wprowadzający zmiany w zakresie opodatkowania dochodów osób fizycznych.',
'committee', 'Ministerstwo Finansów', '2024-07-05',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=599', 'projekt_ustawy'),

('10-659', 'Poselski projekt ustawy o zmianie ustawy o podatku akcyzowym',
'Projekt nowelizacji ustawy o podatku akcyzowym modyfikujący stawki i zasady opodatkowania wyrobów akcyzowych.',
'committee', 'Ministerstwo Finansów', '2024-07-19',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=659', 'projekt_ustawy'),

('10-1232', 'Rządowy projekt ustawy o zmianie ustawy o podatku od towarów i usług',
'Projekt nowelizacji ustawy o VAT dostosowujący polskie przepisy do wymogów prawa unijnego oraz wprowadzający uproszczenia dla przedsiębiorców.',
'senate', 'Ministerstwo Finansów', '2025-05-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1232', 'projekt_ustawy'),

('10-1233', 'Rządowy projekt ustawy o zmianie ustawy o podatku dochodowym od osób prawnych',
'Projekt nowelizacji ustawy o CIT wprowadzający zmiany w zasadach opodatkowania przedsiębiorstw.',
'senate', 'Ministerstwo Finansów', '2025-05-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1233', 'projekt_ustawy'),

-- Prawo cywilne i rodzinne
('10-227', 'Rządowy projekt ustawy o zmianie ustawy - Kodeks cywilny oraz ustawy o kredycie konsumenckim',
'Projekt nowelizacji Kodeksu cywilnego w zakresie umów konsumenckich i kredytów, wzmacniający ochronę konsumentów.',
'published', 'Ministerstwo Sprawiedliwości', '2024-03-05',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=227', 'projekt_ustawy'),

('10-1234', 'Rządowy projekt ustawy o zmianie ustawy - Kodeks rodzinny i opiekuńczy',
'Projekt nowelizacji Kodeksu rodzinnego i opiekuńczego wprowadzający zmiany w zakresie opieki nad dziećmi i władzy rodzicielskiej.',
'committee', 'Ministerstwo Sprawiedliwości', '2025-05-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1234', 'projekt_ustawy'),

('10-1425', 'Rządowy projekt ustawy o zmianie ustawy - Kodeks cywilny',
'Projekt nowelizacji Kodeksu cywilnego wprowadzający zmiany w prawie zobowiązań i prawie rzeczowym.',
'committee', 'Ministerstwo Sprawiedliwości', '2025-06-25',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1425', 'projekt_ustawy'),

-- Zdrowie
('10-185', 'Rządowy projekt ustawy o zmianie ustawy - Prawo farmaceutyczne',
'Projekt nowelizacji Prawa farmaceutycznego wprowadzający zmiany w zasadach obrotu produktami leczniczymi.',
'published', 'Ministerstwo Zdrowia', '2024-01-29',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=185', 'projekt_ustawy'),

('10-1266', 'Rządowy projekt ustawy o zmianie ustawy - Prawo farmaceutyczne',
'Kolejna nowelizacja Prawa farmaceutycznego dostosowująca przepisy do regulacji unijnych.',
'committee', 'Ministerstwo Zdrowia', '2025-05-13',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1266', 'projekt_ustawy'),

('10-1483', 'Rządowy projekt ustawy o zmianie ustawy o świadczeniach opieki zdrowotnej finansowanych ze środków publicznych',
'Projekt nowelizacji ustawy o świadczeniach opieki zdrowotnej wprowadzający zmiany w zasadach finansowania i organizacji opieki zdrowotnej.',
'third_reading', 'Ministerstwo Zdrowia', '2025-07-09',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1483', 'projekt_ustawy'),

-- Obronność i bezpieczeństwo
('10-1270', 'Rządowy projekt ustawy o zmianie ustawy o obronie Ojczyzny oraz niektórych innych ustaw',
'Projekt nowelizacji ustawy o obronie Ojczyzny wprowadzający zmiany w systemie obronnym państwa, w tym dotyczące służby wojskowej i rezerw.',
'published', 'Ministerstwo Obrony Narodowej', '2025-05-14',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1270', 'projekt_ustawy'),

('10-1280', 'Rządowy projekt ustawy o zmianie ustawy o weteranach działań poza granicami państwa',
'Projekt nowelizacji ustawy o weteranach rozszerzający uprawnienia i świadczenia dla weteranów misji zagranicznych.',
'published', 'Ministerstwo Obrony Narodowej', '2025-05-20',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1280', 'projekt_ustawy'),

-- Cyfryzacja i e-administracja
('10-1241', 'Rządowy projekt ustawy o zmianie ustawy o aplikacji mObywatel oraz niektórych innych ustaw',
'Projekt nowelizacji ustawy o aplikacji mObywatel rozszerzający funkcjonalności aplikacji i zakres dokumentów elektronicznych.',
'committee', 'Ministerstwo Cyfryzacji', '2025-05-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1241', 'projekt_ustawy'),

('10-1238', 'Rządowy projekt ustawy o krajowym systemie certyfikacji cyberbezpieczeństwa',
'Projekt ustawy ustanawiającej krajowy system certyfikacji cyberbezpieczeństwa zgodny z regulacjami unijnymi.',
'committee', 'Ministerstwo Cyfryzacji', '2025-05-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1238', 'projekt_ustawy'),

('10-1374', 'Rządowy projekt ustawy o zmianie ustawy o informatyzacji działalności podmiotów realizujących zadania publiczne',
'Projekt nowelizacji ustawy o informatyzacji wprowadzający zmiany w zakresie e-usług publicznych i interoperacyjności systemów.',
'committee', 'Ministerstwo Cyfryzacji', '2025-06-13',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1374', 'projekt_ustawy'),

-- Rolnictwo
('10-1009', 'Rządowy projekt ustawy o zmianie ustawy o Planie Strategicznym dla Wspólnej Polityki Rolnej na lata 2023-2027',
'Projekt nowelizacji ustawy o Planie Strategicznym WPR wprowadzający zmiany w systemie dopłat i wsparcia dla rolników.',
'published', 'Ministerstwo Rolnictwa i Rozwoju Wsi', '2025-02-06',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1009', 'projekt_ustawy'),

('10-1428', 'Rządowy projekt ustawy o zmianie ustawy o zwrocie podatku akcyzowego zawartego w cenie oleju napędowego wykorzystywanego do produkcji rolnej',
'Projekt nowelizacji ustawy zwiększającej limity zwrotu podatku akcyzowego dla rolników.',
'third_reading', 'Ministerstwo Rolnictwa i Rozwoju Wsi', '2025-07-07',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1428', 'projekt_ustawy'),

-- Środowisko
('10-1447', 'Rządowy projekt ustawy o zmianie ustawy o ochronie przyrody',
'Projekt nowelizacji ustawy o ochronie przyrody wprowadzający zmiany w zasadach ochrony gatunkowej i obszarowej.',
'committee', 'Ministerstwo Klimatu i Środowiska', '2025-07-02',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1447', 'projekt_ustawy'),

-- Finanse publiczne - kryptoaktywa
('10-1424', 'Rządowy projekt ustawy o rynku kryptoaktywów',
'Projekt ustawy kompleksowo regulującej rynek kryptoaktywów w Polsce, implementującej rozporządzenie MiCA.',
'committee', 'Ministerstwo Finansów', '2025-06-26',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1424', 'projekt_ustawy'),

-- Pomoc powodzianom
('10-669', 'Poselski projekt ustawy o szczególnych rozwiązaniach związanych ze wsparciem finansowym dla poszkodowanych przez powódź w 2024 roku',
'Projekt ustawy wprowadzającej specjalne rozwiązania pomocowe dla osób i podmiotów poszkodowanych przez powódź we wrześniu 2024 roku.',
'published', NULL, '2024-09-17',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=669', 'projekt_ustawy'),

-- Prawo pracy
('10-318', 'Rządowy projekt ustawy o zmianie ustawy - Kodeks pracy',
'Projekt nowelizacji Kodeksu pracy wprowadzający zmiany w zakresie czasu pracy i urlopów.',
'published', 'Ministerstwo Rodziny, Pracy i Polityki Społecznej', '2024-04-18',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=318', 'projekt_ustawy'),

('10-1446', 'Rządowy projekt ustawy o zmianie ustawy o emeryturach i rentach z Funduszu Ubezpieczeń Społecznych',
'Projekt nowelizacji ustawy emerytalnej wprowadzający zmiany w zasadach waloryzacji i przyznawania świadczeń.',
'third_reading', 'Ministerstwo Rodziny, Pracy i Polityki Społecznej', '2025-07-02',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1446', 'projekt_ustawy'),

-- Budownictwo
('10-444', 'Komisyjny projekt ustawy o zmianie ustawy - Prawo budowlane',
'Projekt nowelizacji Prawa budowlanego upraszczający procedury budowlane i wprowadzający cyfryzację procesów.',
'committee', NULL, '2024-05-09',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=444', 'projekt_ustawy'),

('10-1379', 'Rządowy projekt ustawy o zmianie ustawy - Prawo budowlane oraz niektórych innych ustaw',
'Kolejna nowelizacja Prawa budowlanego wprowadzająca dalsze uproszczenia i zmiany proceduralne.',
'committee', 'Ministerstwo Rozwoju i Technologii', '2025-06-17',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1379', 'projekt_ustawy'),

-- Sądownictwo
('10-908', 'Poselski projekt ustawy o zmianie ustawy o Instytucie Pamięci Narodowej - Komisji Ścigania Zbrodni przeciwko Narodowi Polskiemu oraz ustawy - Kodeks karny',
'Projekt nowelizacji ustawy o IPN wprowadzający zmiany w zakresie ścigania zbrodni komunistycznych.',
'committee', NULL, '2024-12-03',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=908', 'projekt_ustawy'),

('10-1678', 'Rządowy projekt ustawy o zmianie ustawy - Prawo o ustroju sądów powszechnych',
'Projekt nowelizacji ustawy o ustroju sądów powszechnych wprowadzający zmiany organizacyjne i proceduralne.',
'third_reading', 'Ministerstwo Sprawiedliwości', '2025-09-03',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1678', 'projekt_ustawy'),

-- Media
('10-1488', 'Poselski projekt ustawy o zniesieniu opłat abonamentowych i likwidacji TVP Info',
'Projekt ustawy znoszący obowiązek opłacania abonamentu RTV oraz likwidujący kanał TVP Info.',
'committee', NULL, '2025-06-25',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1488', 'projekt_ustawy'),

-- Ukraina
('10-1492', 'Rządowy projekt ustawy o zmianie ustawy o pomocy obywatelom Ukrainy w związku z konfliktem zbrojnym na terytorium tego państwa',
'Projekt nowelizacji ustawy o pomocy uchodźcom z Ukrainy przedłużający i modyfikujący zasady wsparcia.',
'published', 'Ministerstwo Spraw Wewnętrznych i Administracji', '2025-07-10',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1492', 'projekt_ustawy'),

-- Ruch drogowy
('10-1677', 'Rządowy projekt ustawy o zmianie ustawy - Prawo o ruchu drogowym oraz niektórych innych ustaw',
'Projekt nowelizacji Prawa o ruchu drogowym wprowadzający zmiany w zakresie bezpieczeństwa i organizacji ruchu.',
'committee', 'Ministerstwo Infrastruktury', '2025-09-03',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1677', 'projekt_ustawy'),

-- Mniejszości narodowe
('10-1346', 'Poselski projekt ustawy o zmianie ustawy o mniejszościach narodowych i etnicznych oraz o języku regionalnym',
'Projekt nowelizacji ustawy o mniejszościach narodowych rozszerzający prawa mniejszości i użycie języków regionalnych.',
'committee', NULL, '2025-05-21',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1346', 'projekt_ustawy'),

-- Asystencja osobista
('10-1929', 'Rządowy projekt ustawy o asystencji osobistej osób z niepełnosprawnościami',
'Projekt ustawy wprowadzającej systemowe rozwiązania w zakresie asystencji osobistej dla osób z niepełnosprawnościami.',
'first_reading', 'Ministerstwo Rodziny, Pracy i Polityki Społecznej', '2025-11-04',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1929', 'projekt_ustawy'),

-- Akcyza
('10-1930', 'Rządowy projekt ustawy o zmianie ustawy o podatku akcyzowym',
'Projekt nowelizacji ustawy akcyzowej dostosowujący stawki i zasady opodatkowania do wymogów unijnych.',
'third_reading', 'Ministerstwo Finansów', '2025-11-04',
'https://www.sejm.gov.pl/Sejm10.nsf/PrzebiegProc.xsp?nr=1930', 'projekt_ustawy');

-- Insert bill events for selected bills
-- Ustawa budżetowa 2024
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2023-12-19', 'Projekt wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-125';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2023-12-20', 'Pierwsze czytanie na posiedzeniu Sejmu'
FROM bills WHERE sejm_id = '10-125';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', '2023-12-20', 'Skierowano do Komisji Finansów Publicznych'
FROM bills WHERE sejm_id = '10-125';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'published', '2024-01-18', 'Ustawa została opublikowana w Dzienniku Ustaw'
FROM bills WHERE sejm_id = '10-125';

-- Komisja śledcza ds. Pegasusa
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2023-11-22', 'Projekt wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-57';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2023-12-06', 'Pierwsze czytanie projektu uchwały'
FROM bills WHERE sejm_id = '10-57';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'published', '2024-01-19', 'Uchwała została podjęta - komisja powołana'
FROM bills WHERE sejm_id = '10-57';

-- Ustawa o obronie Ojczyzny
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2025-05-14', 'Projekt rządowy wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2025-06-04', 'Pierwsze czytanie na posiedzeniu Sejmu'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', '2025-06-04', 'Skierowano do Komisji Obrony Narodowej'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_report', '2025-06-09', 'Komisja przedstawiła sprawozdanie'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'second_reading', '2025-06-11', 'Drugie czytanie na posiedzeniu Sejmu'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'third_reading', '2025-06-12', 'Trzecie czytanie - ustawa uchwalona'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'senate', '2025-06-26', 'Senat rozpatrzył ustawę'
FROM bills WHERE sejm_id = '10-1270';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'published', '2025-07-15', 'Ustawa została opublikowana'
FROM bills WHERE sejm_id = '10-1270';

-- Ustawa budżetowa 2026
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2025-09-30', 'Projekt rządowy wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-1749';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2025-10-08', 'Pierwsze czytanie projektu budżetu'
FROM bills WHERE sejm_id = '10-1749';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', '2025-10-08', 'Skierowano do Komisji Finansów Publicznych'
FROM bills WHERE sejm_id = '10-1749';

-- Pomoc powodzianom
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2024-09-17', 'Pilny projekt poselski wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-669';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2024-09-18', 'Pierwsze czytanie - tryb pilny'
FROM bills WHERE sejm_id = '10-669';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'second_reading', '2024-09-19', 'Drugie czytanie'
FROM bills WHERE sejm_id = '10-669';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'third_reading', '2024-09-20', 'Trzecie czytanie - ustawa uchwalona'
FROM bills WHERE sejm_id = '10-669';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'published', '2024-09-27', 'Ustawa opublikowana w trybie pilnym'
FROM bills WHERE sejm_id = '10-669';

-- Kryptoaktywa
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2025-06-26', 'Projekt rządowy wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-1424';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2025-07-10', 'Pierwsze czytanie projektu'
FROM bills WHERE sejm_id = '10-1424';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', '2025-07-10', 'Skierowano do Komisji Finansów Publicznych'
FROM bills WHERE sejm_id = '10-1424';

-- Asystencja osobista
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2025-11-04', 'Projekt rządowy wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-1929';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2025-11-19', 'Pierwsze czytanie projektu'
FROM bills WHERE sejm_id = '10-1929';

-- Ustawa o VAT
INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'submitted', '2025-05-06', 'Projekt rządowy wpłynął do Sejmu'
FROM bills WHERE sejm_id = '10-1232';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'first_reading', '2025-06-04', 'Pierwsze czytanie'
FROM bills WHERE sejm_id = '10-1232';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'committee_referral', '2025-06-04', 'Skierowano do komisji'
FROM bills WHERE sejm_id = '10-1232';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'second_reading', '2025-06-11', 'Drugie czytanie'
FROM bills WHERE sejm_id = '10-1232';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'third_reading', '2025-06-12', 'Trzecie czytanie - uchwalono'
FROM bills WHERE sejm_id = '10-1232';

INSERT INTO bill_events (bill_id, event_type, event_date, description)
SELECT id, 'senate', '2025-06-26', 'Przekazano do Senatu'
FROM bills WHERE sejm_id = '10-1232';
