# Przewodnik Administratora - Nowe Funkcje RCL

## 🎯 Szybki Start

### Krok 1: Synchronizacja Danych z RCL

Po zalogowaniu jako administrator:

1. Przejdź do panelu admina: `/admin`
2. Znajdź sekcję "Synchronizacja RCL"
3. Kliknij "Synchronizuj dane z RCL"

**LUB** użyj API bezpośrednio:

```bash
curl -X POST http://localhost:3000/api/admin/sync-rcl-enhanced \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Krok 2: Sprawdź Wyniki

Po synchronizacji zobaczysz raport:

```json
{
  "success": true,
  "results": {
    "rclProjects": 45,        // Znalezione projekty RCL
    "consultations": 12,      // Znalezione konsultacje
    "impactAssessments": 8,   // Pobrane OSR
    "billsUpdated": 23,       // Zaktualizowane ustawy
    "billsCreated": 5,        // Nowe projekty
    "errors": []              // Ewentualne błędy
  }
}
```

---

## 📋 Częstotliwość Synchronizacji

### Zalecane harmonogramy:

- **Produkcja:** Raz dziennie (rano)
- **Development:** Raz na tydzień
- **Po zmianach w RCL:** Natychmiast

### Automatyzacja (opcjonalnie):

Dodaj cron job w Vercel lub użyj `/api/cron/sync-rcl`:

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/sync-rcl",
      "schedule": "0 6 * * *"  // Codziennie o 6:00
    }
  ]
}
```

---

## 🔍 Weryfikacja Danych

### 1. Sprawdź Konsultacje

```sql
-- W Supabase SQL Editor
SELECT 
  sejm_id,
  title,
  status,
  consultation_start_date,
  consultation_end_date,
  consultation_url
FROM bills
WHERE status IN ('preconsultation', 'consultation', 'co_creation')
ORDER BY consultation_start_date DESC;
```

### 2. Sprawdź Powiązania RCL

```sql
SELECT 
  COUNT(*) as total,
  COUNT(rcl_id) as with_rcl_id,
  COUNT(impact_assessment_url) as with_osr
FROM bills;
```

### 3. Sprawdź Logi Wydarzeń

```sql
SELECT 
  event_type,
  COUNT(*) as count
FROM bill_events
WHERE event_type IN ('consultation_started', 'preconsultation_started', 'impact_assessment')
GROUP BY event_type;
```

---

## ⚙️ Konfiguracja Zaawansowana

### 1. Timeout Synchronizacji

W `src/app/api/admin/sync-rcl-enhanced/route.ts`:

```typescript
export const maxDuration = 300 // 5 minut (max dla Vercel Pro)
```

### 2. Limity API

Domyślnie:
- Cache RCL: 30 minut (`revalidate: 1800`)
- Cache konsultacji: 15 minut (`revalidate: 900`)

Zmień w `src/lib/api/rcl-enhanced.ts`:

```typescript
next: { revalidate: 3600 } // 1 godzina
```

### 3. Scraping RCL

⚠️ **Ważne:** RCL nie ma oficjalnego API. Używamy web scrapingu.

**Co może się zepsuć:**
- Zmiana struktury HTML strony RCL
- Zmiana URL-i konsultacji
- Blokowanie IP przez RCL (rate limiting)

**Rozwiązanie:**
1. Sprawdź `src/lib/api/rcl-enhanced.ts`
2. Zaktualizuj selektory CSS/cheerio
3. Dodaj User-Agent headers

---

## 🛠️ Troubleshooting

### Problem: Synchronizacja nie znajduje projektów

**Możliwe przyczyny:**
1. Zmienił się HTML strony RCL
2. RCL jest niedostępne
3. Timeout

**Rozwiązanie:**
```typescript
// Testuj ręcznie scraping
const projects = await scrapeEnhancedRCLProjects()
console.log('Found projects:', projects.length)

// Sprawdź czy RCL odpowiada
fetch('https://legislacja.rcl.gov.pl/projects.html')
  .then(r => console.log('Status:', r.status))
```

### Problem: Duplikaty projektów

**Rozwiązanie:**
```sql
-- Znajdź duplikaty
SELECT rcl_id, COUNT(*) 
FROM bills 
WHERE rcl_id IS NOT NULL
GROUP BY rcl_id 
HAVING COUNT(*) > 1;

-- Usuń duplikaty (pozostaw najnowszy)
DELETE FROM bills 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM bills 
  GROUP BY rcl_id
);
```

### Problem: Brak dat konsultacji

**Przyczyna:** Nie wszystkie projekty mają jeszcze ustalone daty

**Rozwiązanie:** Normalne. Synchronizacja zaktualizuje dane gdy będą dostępne.

---

## 📊 Monitoring

### Metryki do śledzenia:

1. **Sukces synchronizacji**
   - Liczba zaktualizowanych projektów
   - Liczba błędów

2. **Jakość danych**
   - % projektów z RCL ID
   - % projektów z OSR
   - % projektów z datami konsultacji

3. **Aktywność użytkowników**
   - Liczba aktywnych alertów
   - Wyświetlenia strony konsultacji

### Dashboard Query:

```sql
-- Podsumowanie danych RCL
SELECT 
  'Total Bills' as metric,
  COUNT(*) as value
FROM bills
UNION ALL
SELECT 
  'With RCL ID',
  COUNT(*)
FROM bills
WHERE rcl_id IS NOT NULL
UNION ALL
SELECT 
  'With Consultations',
  COUNT(*)
FROM bills
WHERE consultation_url IS NOT NULL
UNION ALL
SELECT 
  'Active Consultations',
  COUNT(*)
FROM bills
WHERE status IN ('preconsultation', 'consultation')
  AND consultation_end_date > NOW();
```

---

## 🔐 Bezpieczeństwo

### Uprawnienia

Synchronizacja wymaga roli `admin` lub `super_admin`:

```sql
-- Sprawdź admini
SELECT 
  p.id,
  p.email,
  p.role,
  p.created_at
FROM profiles p
WHERE role IN ('admin', 'super_admin');
```

### Nadanie uprawnień:

```sql
-- Nadaj rolę admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@example.com';
```

### Rate Limiting

Zalecane w produkcji:

```typescript
// middleware.ts lub route.ts
import { ratelimit } from '@/lib/ratelimit'

const limit = ratelimit({
  interval: '1h',
  limit: 10, // 10 synców na godzinę
})
```

---

## 📈 Best Practices

### 1. Przed Synchronizacją

- ✅ Sprawdź połączenie z RCL
- ✅ Upewnij się że Supabase jest dostępne
- ✅ Zrób backup (jeśli pierwsza synchronizacja)

### 2. Po Synchronizacji

- ✅ Sprawdź logi błędów
- ✅ Zweryfikuj dane w Supabase
- ✅ Przetestuj stronę `/consultations`

### 3. W Produkcji

- ✅ Ustaw monitoring (Sentry, LogRocket)
- ✅ Skonfiguruj alerty email przy błędach
- ✅ Regularnie sprawdzaj jakość danych

---

## 🚨 Ostrzeżenia

### ⚠️ Web Scraping RCL

**Problem:** RCL może zmienić strukturę strony bez ostrzeżenia

**Rozwiązanie:**
1. Monitoruj błędy synchronizacji
2. Regularnie testuj scraping
3. Rozważ kontakt z RCL o oficjalne API

### ⚠️ Limity Vercel

**Hobby Plan:**
- Max duration: 10s
- Max cron: 1 job

**Pro Plan:**
- Max duration: 300s (5 min)
- Max cron: 12 jobs

**Dla dużych synchronizacji:** Rozważ background jobs (Inngest, Trigger.dev)

### ⚠️ RODO i Dane Osobowe

- ✅ Nie przechowuj danych osobowych z konsultacji
- ✅ Alerty użytkowników - zgodnie z polityką prywatności
- ✅ Możliwość usunięcia konta i danych

---

## 📞 Wsparcie

### Logi Debugowania

```typescript
// W przeglądarce (devtools)
localStorage.setItem('DEBUG', 'rcl:*')

// W konsoli Next.js
DEBUG=rcl:* npm run dev
```

### Testowanie API

```bash
# Test sync
curl -X POST http://localhost:3000/api/admin/sync-rcl-enhanced \
  -H "Cookie: YOUR_SESSION_COOKIE"

# Test alerts
curl http://localhost:3000/api/alerts \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

### Przywracanie Danych

```sql
-- Backup przed pierwszą synchronizacją
CREATE TABLE bills_backup AS 
SELECT * FROM bills;

-- Przywróć jeśli coś poszło nie tak
TRUNCATE bills;
INSERT INTO bills SELECT * FROM bills_backup;
```

---

## ✅ Checklist Wdrożenia

- [ ] Zainstalowano `cheerio` (`npm install cheerio`)
- [ ] Zweryfikowano uprawnienia admina
- [ ] Uruchomiono pierwszą synchronizację testowo
- [ ] Sprawdzono dane w `/consultations`
- [ ] Przetestowano alerty użytkowników
- [ ] Skonfigurowano cron (opcjonalnie)
- [ ] Ustawiono monitoring błędów
- [ ] Zaktualizowano dokumentację użytkownika

---

**Ostatnia aktualizacja:** Grudzień 2024  
**Wersja:** 1.0
