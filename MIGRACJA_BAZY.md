# 🗄️ Instrukcja Migracji Bazy Danych - Faza 1

## Przegląd

Ta migracja dodaje wsparcie dla:
- Nowych statusów legislacyjnych (prekonsultacje, współtworzenie)
- Pól związanych z konsultacjami społecznymi
- Pól dla RCL (Rządowe Centrum Legislacji)
- Analizy skutków regulacji
- Cache'owania prostego języka

---

## Krok 1: Wykonaj Migrację SQL

### Metoda A: Supabase Dashboard (Zalecana)

1. Otwórz Supabase Dashboard
2. Przejdź do **SQL Editor**
3. Skopiuj zawartość pliku `supabase/migrations/001_add_preconsultation_status.sql`
4. Wklej do editora SQL
5. Kliknij **"Run"**

### Metoda B: Supabase CLI

```bash
# W terminalu w głównym katalogu projektu
supabase db push
```

---

## Krok 2: Sprawdź Migrację

### Sprawdź nowy enum

```sql
-- Powinien zawierać: co_creation, preconsultation
SELECT enum_range(NULL::bill_status);
```

Oczekiwany wynik:
```
{co_creation,preconsultation,draft,submitted,first_reading,committee,second_reading,third_reading,senate,presidential,published,rejected}
```

### Sprawdź nowe kolumny

```sql
-- Sprawdź strukturę tabeli bills
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bills'
AND column_name IN (
  'rcl_id',
  'consultation_start_date',
  'consultation_end_date',
  'consultation_url',
  'impact_assessment_url',
  'simple_language_summary'
);
```

Oczekiwane kolumny:
- `rcl_id` (text, nullable)
- `consultation_start_date` (date, nullable)
- `consultation_end_date` (date, nullable)
- `consultation_url` (text, nullable)
- `impact_assessment_url` (text, nullable)
- `simple_language_summary` (text, nullable)

### Sprawdź indeksy

```sql
-- Sprawdź czy indeks dla rcl_id istnieje
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'bills'
AND indexname = 'idx_bills_rcl_id';
```

---

## Krok 3: Testuj Nowe Pola

### Test 1: Dodaj ustawę z prekonsultacjami

```sql
INSERT INTO bills (
  sejm_id,
  title,
  status,
  consultation_start_date,
  consultation_end_date,
  consultation_url
) VALUES (
  'TEST-001',
  'Testowa ustawa z prekonsultacjami',
  'preconsultation',
  '2024-01-01',
  '2024-01-31',
  'https://example.com/konsultacje'
);
```

### Test 2: Aktualizuj istniejącą ustawę

```sql
UPDATE bills
SET
  status = 'preconsultation',
  consultation_start_date = '2024-01-15',
  consultation_end_date = '2024-02-15'
WHERE sejm_id = 'UD123'; -- Zamień na prawdziwy ID
```

### Test 3: Query z nowymi polami

```sql
SELECT 
  sejm_id,
  title,
  status,
  consultation_start_date,
  consultation_end_date,
  rcl_id
FROM bills
WHERE status IN ('co_creation', 'preconsultation')
ORDER BY consultation_start_date DESC
LIMIT 10;
```

---

## Krok 4: Aktualizuj TypeScript Types

Typy są już zaktualizowane w `src/types/supabase.ts`, ale jeśli potrzebujesz je wygenerować ponownie:

```bash
# Jeśli używasz Supabase CLI
supabase gen types typescript --local > src/types/supabase.ts
```

---

## Rollback (Cofnięcie Migracji)

Jeśli coś poszło nie tak, możesz cofnąć zmiany:

```sql
-- UWAGA: To usunie nowe statusy i kolumny!

-- 1. Usuń nowe kolumny
ALTER TABLE bills 
  DROP COLUMN IF EXISTS rcl_id,
  DROP COLUMN IF EXISTS consultation_start_date,
  DROP COLUMN IF EXISTS consultation_end_date,
  DROP COLUMN IF EXISTS consultation_url,
  DROP COLUMN IF EXISTS impact_assessment_url,
  DROP COLUMN IF EXISTS simple_language_summary;

-- 2. Cofnij statusy do poprzedniego stanu
-- UWAGA: PostgreSQL nie pozwala na usunięcie wartości z enum
-- Musisz stworzyć nowy enum i przebudować tabelę
-- To jest destruktywna operacja - zrób backup!

CREATE TYPE bill_status_old AS ENUM (
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

ALTER TABLE bills 
  ALTER COLUMN status TYPE bill_status_old 
  USING status::text::bill_status_old;

DROP TYPE bill_status;
ALTER TYPE bill_status_old RENAME TO bill_status;
```

---

## Troubleshooting

### Problem: "type already exists"

**Rozwiązanie:**
```sql
-- Sprawdź czy typ istnieje
SELECT typname FROM pg_type WHERE typname = 'bill_status';

-- Jeśli istnieje, możesz dodać wartości ręcznie
-- (ale to wymaga przebudowania tabeli)
```

### Problem: "column already exists"

**Rozwiązanie:**
```sql
-- Sprawdź istniejące kolumny
SELECT column_name FROM information_schema.columns
WHERE table_name = 'bills';

-- Jeśli kolumna istnieje, pomiń jej tworzenie
-- lub użyj IF NOT EXISTS w ALTER TABLE
```

### Problem: "index already exists"

**Rozwiązanie:**
```sql
-- Sprawdź istniejące indeksy
SELECT indexname FROM pg_indexes WHERE tablename = 'bills';

-- Usuń stary indeks jeśli potrzeba
DROP INDEX IF EXISTS idx_bills_rcl_id;
-- Potem stwórz na nowo
```

---

## Weryfikacja Końcowa

Po zakończeniu migracji, sprawdź:

### ✅ Checklist

- [ ] Enum `bill_status` zawiera `co_creation` i `preconsultation`
- [ ] Tabela `bills` ma 6 nowych kolumn
- [ ] Indeks `idx_bills_rcl_id` istnieje
- [ ] Aplikacja Next.js się kompiluje bez błędów
- [ ] TypeScript types są zaktualizowane
- [ ] Istniejące dane nie zostały uszkodzone

### Polecenia weryfikacyjne

```sql
-- Sprawdź liczbę kolumn
SELECT COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_name = 'bills';
-- Powinno być więcej niż wcześniej (+6)

-- Sprawdź czy dane są OK
SELECT COUNT(*) as total_bills,
       COUNT(DISTINCT status) as unique_statuses
FROM bills;

-- Sprawdź czy RLS nadal działa
SELECT * FROM bills LIMIT 1;
-- Jeśli działa bez błędów, RLS jest OK
```

---

## Backup

**ZAWSZE** rób backup przed migracją!

### W Supabase Dashboard:
1. Settings → Database
2. Database Backups
3. Create backup

### Ręczny backup:
```bash
# Jeśli masz dostęp do psql
pg_dump -h your-db-host -U postgres -d your-db > backup_before_migration.sql
```

---

## Kontakt

W razie problemów:
- Sprawdź logi Supabase
- Sprawdź logi Next.js (`npm run dev`)
- Skontaktuj się z zespołem deweloperskim

---

**Data:** 6 grudnia 2025  
**Wersja migracji:** 001  
**Status:** ✅ Przetestowana
