# Integracja RCL i OSR - Dokumentacja

## Przegląd

Dodano integrację z **Rządowym Centrum Legislacji (RCL)** oraz parser **Oceny Skutków Regulacji (OSR)** zgodnie z wymaganiami z pliku `projekt.md`.

## Nowe funkcjonalności

### 1. Integracja z RCL

#### Źródło danych
- **RCL Portal**: `https://legislacja.rcl.gov.pl`
- **Konsultacje**: Lista prekonsultacji i konsultacji społecznych
- **Projekty rządowe**: Projekty ustaw przed wpłynięciem do Sejmu

#### Nowe pola w bazie danych
```sql
rcl_id TEXT                    -- Identyfikator projektu w RCL
consultation_start_date DATE   -- Data rozpoczęcia konsultacji
consultation_end_date DATE     -- Data zakończenia konsultacji
consultation_url TEXT          -- Link do konsultacji
impact_assessment_url TEXT     -- Link do dokumentu OSR
simple_language_summary TEXT   -- Skrócone podsumowanie (AI)
```

#### API Endpoints

**Synchronizacja RCL**
```
GET /api/admin/sync-rcl
```
- Pobiera projekty z RCL
- Dopasowuje do ustaw w Sejmie (podobieństwo tytułów)
- Aktualizuje pola: `rcl_id`, daty konsultacji, URL-e
- Wymaga: admin/super_admin

**Parsowanie OSR**
```
POST /api/admin/parse-osr
Body: { url: string, billId?: string }
```
- Parsuje dokument PDF/HTML z oceną skutków
- Ekstrahuje dane strukturalne (koszty, wpływ społeczny, etc.)
- Opcjonalnie zapisuje do bazy dla konkretnej ustawy
- Wymaga: admin/super_admin/moderator

### 2. Ocena Skutków Regulacji (OSR)

#### Parser OSR
Lokalizacja: `src/lib/api/rcl.ts`

**Wspierane formaty:**
- PDF (z biblioteką `pdf-parse`)
- HTML

**Ekstrahowane dane:**
```typescript
{
  financialImpact: {
    publicBudget: number      // w zł (auto-konwersja mln/mld)
    citizens: number          // koszt dla obywateli
    businesses: number        // koszt dla firm
  },
  socialImpact: {
    affectedGroups: string[]  // dotknięte grupy społeczne
    description: string
    estimatedBeneficiaries: number
  },
  economicImpact: {
    gdpEffect: 'positive'|'negative'|'neutral'
    employmentEffect: 'positive'|'negative'|'neutral'
    description: string
  },
  environmentalImpact: string,
  legalImpact: string
}
```

**Algorytm parsowania:**
1. Pobierz dokument (PDF lub HTML)
2. Konwertuj do tekstu
3. Regex dla kwot: `/budżet[^\d]*([-+]?\d+[,.]?\d*)\s*(mln|miliard|tys\.?)/gi`
4. Wykryj słowa kluczowe dla grup społecznych
5. Analiza sentimentu dla wpływu na PKB/zatrudnienie
6. Ekstrakcja sekcji: streszczenie, skutki środowiskowe, prawne

#### Komponent wizualizacji
Lokalizacja: `src/components/bills/impact-assessment-viewer.tsx`

**Funkcje:**
- Kolorowe karty dla skutków finansowych (zielony/czerwony)
- Ikony dla kategorii (💰 finanse, 👥 społeczne, 🏢 gospodarcze, 🍃 środowisko, ⚖️ prawo)
- Badge'e dla wpływu (pozytywny/negatywny/neutralny)
- Formatowanie kwot (tys./mln/mld zł)
- Link do pełnego dokumentu OSR

### 3. UI - Nowa zakładka "Ocena Skutków (OSR)"

**Widoczność:**
- Zakładka pojawia się tylko jeśli:
  - Istnieje `impact_assessment_url` LUB
  - Są dane OSR w bazie (event typu `impact_assessment`)

**Zawartość:**
1. **Wizualizacja OSR** - `ImpactAssessmentViewer`
   - Streszczenie
   - Skutki finansowe (budżet, obywatele, firmy)
   - Skutki społeczne (grupy, beneficjenci)
   - Skutki gospodarcze (PKB, zatrudnienie)
   - Skutki środowiskowe
   - Skutki prawne

2. **Informacje o konsultacjach**
   - Daty trwania konsultacji
   - Link do strony konsultacji na RCL
   - Identyfikator RCL

## Przykład użycia

### 1. Synchronizacja danych RCL (manual)
```bash
curl -X GET https://sciezka-prawa.vercel.app/api/admin/sync-rcl \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Parsowanie konkretnego OSR
```bash
curl -X POST https://sciezka-prawa.vercel.app/api/admin/parse-osr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://legislacja.rcl.gov.pl/docs/osr_12345.pdf",
    "billId": "uuid-of-bill"
  }'
```

### 3. Wyświetlanie OSR w UI
```tsx
<ImpactAssessmentViewer 
  data={{
    url: "https://legislacja.rcl.gov.pl/docs/osr_12345.pdf",
    summary: "Ustawa wprowadza nowe obowiązki...",
    financialImpact: {
      publicBudget: 150000000,  // 150 mln zł
      citizens: -50,             // -50 zł na obywatela
      businesses: 500000000      // 500 mln zł dla firm
    },
    socialImpact: {
      affectedGroups: ["przedsiębiorcy", "rodziny"],
      estimatedBeneficiaries: 500000
    },
    economicImpact: {
      gdpEffect: 'positive',
      employmentEffect: 'neutral',
      description: "Wzrost PKB o 0.2%"
    }
  }}
  billTitle="Ustawa o..."
/>
```

## Automatyzacja

### Cron Job (zalecane)
Dodaj endpoint do cron jobs (np. Vercel Cron):

```typescript
// src/app/api/cron/sync-rcl/route.ts
export async function GET() {
  // Call sync-rcl
  // Run daily at 3 AM
}
```

Vercel config:
```json
{
  "crons": [{
    "path": "/api/cron/sync-rcl",
    "schedule": "0 3 * * *"
  }]
}
```

## Ograniczenia i TODO

### Aktualne ograniczenia:
1. **RCL nie ma publicznego API** - używamy scrapingu (może być niestabilne)
2. **Parser OSR jest heurystyczny** - może nie wykryć wszystkich danych
3. **Dopasowanie RCL→Sejm** - oparte na podobieństwie tytułów (50% threshold)

### Przyszłe usprawnienia:
- [ ] OCR dla skanowanych PDF-ów (Tesseract.js)
- [ ] AI do analizy OSR (GPT-4 Vision dla tabel)
- [ ] Webhook od RCL przy nowych konsultacjach
- [ ] Cache parsowanych OSR w Redis
- [ ] Dashboard dla urzędników z stats
- [ ] Export OSR do PDF/Excel

## Zgodność z wymaganiami

✅ **Punkt 1 (RCL Integration)**
- Integracja z rcl.gov.pl
- Monitoring prekonsultacji
- Pola w bazie: `rcl_id`, daty konsultacji, URL-e

✅ **Punkt 2 (OSR)**
- Parser dokumentów PDF/HTML
- Wizualizacja skutków (finansowe, społeczne, gospodarcze)
- Dostęp do pełnego dokumentu
- Analiza kosztów i korzyści

## Support

Pytania? Problemy?
- Issues: GitHub repo
- Docs: `/docs/rcl-osr.md` (ten plik)
- Code: `src/lib/api/rcl.ts`, `src/components/bills/impact-assessment-viewer.tsx`
