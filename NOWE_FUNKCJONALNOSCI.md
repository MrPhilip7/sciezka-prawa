# Nowe Funkcjonalności - Integracja RCL i Rozszerzone Monitorowanie

> Implementacja zgodna z wymaganiami projektu "Ścieżka Prawa - Legislative Train Schedule"

## 📋 Przegląd

Zgodnie z dokumentem `projekt.md`, zaimplementowano kompleksowe rozwiązanie do monitorowania prac legislacyjnych, które integruje:

1. **Rządowe Centrum Legislacji (RCL)** - prekonsultacje i konsultacje
2. **Portal Sejmu** - śledzenie procesów legislacyjnych
3. **System alertów** - powiadomienia dla użytkowników
4. **Wizualizacja OSR** - Ocena Skutków Regulacji
5. **Legislative Train** - wizualna ścieżka legislacyjna

---

## 🚀 Nowe Funkcje

### 1. Strona Konsultacji i Prekonsultacji (`/consultations`)

**Lokalizacja:** `src/app/consultations/`

**Funkcjonalność:**
- ✅ Wyświetlanie aktywnych konsultacji społecznych
- ✅ Wyświetlanie aktywnych prekonsultacji
- ✅ Kalendarz nadchodzących konsultacji
- ✅ Historia zakończonych konsultacji
- ✅ Filtry: typ (prekonsultacje/konsultacje), ministerstwo
- ✅ Statystyki: liczba aktywnych, nadchodzących, zakończonych
- ✅ Linki do uczestnictwa w konsultacjach
- ✅ Informacje o okresie trwania

**Pliki:**
- `src/app/consultations/page.tsx` - Server Component
- `src/app/consultations/consultations-content.tsx` - Client Component z UI

**Jak używać:**
```typescript
// Automatyczne pobieranie danych z Supabase
// Filtrowanie po statusie: co_creation, preconsultation, consultation
// Wyświetlanie dat rozpoczęcia i zakończenia
```

---

### 2. Rozszerzona Integracja RCL

**Lokalizacja:** `src/lib/api/rcl-enhanced.ts`

**Funkcjonalność:**
- ✅ Scraping projektów z RCL
- ✅ Pobieranie informacji o konsultacjach
- ✅ Parsowanie Oceny Skutków Regulacji (OSR)
- ✅ Identyfikacja prekonsultacji
- ✅ Śledzenie statusów projektów

**API Endpoint:** `/api/admin/sync-rcl-enhanced`

**Metoda:** POST (wymaga uprawnień admina)

**Funkcje:**
```typescript
// Pobierz projekty z RCL
const projects = await scrapeEnhancedRCLProjects()

// Pobierz konsultacje
const consultations = await getEnhancedConsultations()

// Parsuj OSR
const impact = await parseEnhancedImpactAssessment(url)
```

**Synchronizacja:**
```bash
POST /api/admin/sync-rcl-enhanced
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "results": {
    "rclProjects": 45,
    "consultations": 12,
    "impactAssessments": 8,
    "billsUpdated": 23,
    "billsCreated": 5,
    "errors": []
  }
}
```

---

### 3. System Alertów dla Użytkowników

**Lokalizacja:** 
- `src/app/api/alerts/route.ts` - API
- `src/components/bills/alert-button.tsx` - Komponent UI

**Funkcjonalność:**
- ✅ Tworzenie alertów dla konkretnych ustaw
- ✅ Konfiguracja powiadomień email/push
- ✅ Zarządzanie (włącz/wyłącz/usuń)
- ✅ Wyświetlanie aktywnych alertów użytkownika

**API Endpoints:**

**GET** `/api/alerts` - Pobierz alerty użytkownika
```json
{
  "alerts": [
    {
      "id": "uuid",
      "bill_id": "uuid",
      "is_active": true,
      "notify_email": true,
      "notify_push": false,
      "bills": {
        "id": "uuid",
        "title": "Ustawa o...",
        "status": "committee",
        "ministry": "Ministerstwo Cyfryzacji"
      }
    }
  ]
}
```

**POST** `/api/alerts` - Utwórz alert
```json
{
  "billId": "uuid",
  "notifyEmail": true,
  "notifyPush": false
}
```

**DELETE** `/api/alerts?billId={id}` - Usuń alert

**Użycie w komponencie:**
```tsx
import { AlertButton } from '@/components/bills/alert-button'

<AlertButton 
  billId={bill.id} 
  billTitle={bill.title}
  variant="default" // lub "icon-only"
/>
```

---

### 4. Wizualizacja Oceny Skutków Regulacji (OSR)

**Lokalizacja:** `src/components/bills/impact-assessment-enhanced.tsx`

**Funkcjonalność:**
- ✅ Szczegółowa analiza wpływu finansowego
  - Budżet państwa
  - Wpływ na obywateli
  - Wpływ na przedsiębiorców
- ✅ Analiza wpływu społecznego
  - Grupy dotknięte
  - Pozytywne/negatywne skutki
  - Ocena równości
- ✅ Analiza wpływu gospodarczego
  - Wpływ na PKB
  - Zatrudnienie
  - Konkurencyjność
- ✅ Analiza wpływu środowiskowego
  - Klimat
  - Różnorodność biologiczna
  - Zużycie zasobów
- ✅ Analiza wpływu prawnego
  - Konfliktujące regulacje
  - Obciążenia administracyjne
  - Potencjał uproszczenia

**Użycie:**
```tsx
import { ImpactAssessmentViewer } from '@/components/bills/impact-assessment-enhanced'

<ImpactAssessmentViewer 
  impactData={parsedOSR}
  impactUrl={bill.impact_assessment_url}
/>
```

---

### 5. Legislative Train - Wizualizacja Ścieżki Legislacyjnej

**Lokalizacja:** `src/components/bills/legislative-train-enhanced.tsx`

**Funkcjonalność:**
- ✅ Wizualna reprezentacja etapów legislacyjnych (styl pociągu)
- ✅ Podświetlenie obecnego etapu
- ✅ Wskaźnik postępu
- ✅ Timeline konsultacji
- ✅ Ikony statusów (zakończone/aktywne/przyszłe)
- ✅ Animacje i efekty wizualne

**Etapy:**
1. Współtworzenie (co_creation)
2. Prekonsultacje (preconsultation)
3. Projekt (draft)
4. Konsultacje (consultation)
5. Złożony (submitted)
6. I Czytanie (first_reading)
7. Komisja (committee)
8. II Czytanie (second_reading)
9. III Czytanie (third_reading)
10. Senat (senate)
11. Prezydent (presidential)
12. Opublikowana (published)

**Użycie:**
```tsx
import { LegislativeTrain, LegislativeTrainCompact } from '@/components/bills/legislative-train-enhanced'

// Pełna wersja
<LegislativeTrain 
  currentStatus={bill.status}
  events={billEvents}
  consultationStartDate={bill.consultation_start_date}
  consultationEndDate={bill.consultation_end_date}
/>

// Kompaktowa wersja (do list)
<LegislativeTrainCompact currentStatus={bill.status} />
```

---

## 🔧 Wymagania Techniczne

### Zależności

Dodane do `package.json`:
```json
{
  "dependencies": {
    "cheerio": "^1.0.0-rc.12",
    "date-fns": "^3.0.0",
    "sonner": "^1.0.0"
  }
}
```

### Instalacja

```bash
npm install cheerio
```

---

## 📊 Baza Danych

### Istniejące Tabele (wykorzystywane)

**`bills`** - rozszerzona o:
```sql
rcl_id TEXT, -- ID projektu w RCL
consultation_start_date TIMESTAMPTZ,
consultation_end_date TIMESTAMPTZ,
consultation_url TEXT,
impact_assessment_url TEXT,
simple_language_summary TEXT
```

**`user_alerts`** - wykorzystywana bez zmian:
```sql
CREATE TABLE user_alerts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  bill_id UUID REFERENCES bills(id),
  is_active BOOLEAN DEFAULT TRUE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_push BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**`bill_events`** - nowe typy wydarzeń:
- `consultation_started`
- `preconsultation_started`
- `consultation_ended`
- `impact_assessment`

---

## 🎯 Zgodność z Wymaganiami Projektu

### ✅ Funkcje Zrealizowane

| Wymaganie | Status | Implementacja |
|-----------|--------|---------------|
| Integracja RCL | ✅ | `src/lib/api/rcl-enhanced.ts` |
| Integracja Sejm | ✅ | Istniejące `src/lib/api/sejm.ts` |
| Prekonsultacje | ✅ | Status `preconsultation` + strona `/consultations` |
| Konsultacje | ✅ | Status `consultation` + filtrowanie |
| Alerty użytkowników | ✅ | API `/api/alerts` + `AlertButton` |
| Ocena Skutków Regulacji | ✅ | `ImpactAssessmentViewerEnhanced` |
| Wizualizacja ścieżki | ✅ | `LegislativeTrain` (Legislative Train Schedule) |
| Prosty język | ✅ | Istniejące `SimpleLanguageHelper` |
| Impact Analysis | ✅ | Szczegółowa wizualizacja OSR |

### 📝 Elementy zgodne z projekt.md

1. **"Połączenie RCL z portalem sejmowym"** - ✅ Sync API łączy dane z obu źródeł
2. **"Funkcje takie jak Vigilex"** - ✅ System alertów i monitoringu
3. **"Łatwo dostępne konsultacje"** - ✅ Dedykowana strona `/consultations`
4. **"Legislative Train Schedule"** - ✅ Wizualna metafora pociągu z etapami
5. **"Impact analysis"** - ✅ Szczegółowa wizualizacja OSR z kategoriami
6. **"Transparentność procesów"** - ✅ Pełna widoczność etapów i dat
7. **"Zaangażowanie obywateli"** - ✅ Linki do konsultacji, alerty

---

## 🚦 Jak Uruchomić

### 1. Synchronizacja danych RCL

```bash
# W panelu admina lub przez API
POST /api/admin/sync-rcl-enhanced
```

### 2. Dostęp do nowych funkcji

- **Konsultacje:** `http://localhost:3000/consultations`
- **Alerty:** Dostępne na stronach ustaw (przycisk "Ustaw alert")
- **Legislative Train:** Automatycznie na stronie szczegółów ustawy

### 3. Nawigacja

Nowy element menu: **"Konsultacje"** (ikona MessageSquare)

---

## 📖 Przykłady Użycia

### Sprawdź aktywne konsultacje

```typescript
// Server Component
const { data: consultations } = await supabase
  .from('bills')
  .select('*')
  .eq('status', 'consultation')
  .gte('consultation_end_date', new Date().toISOString())
```

### Utwórz alert dla ustawy

```typescript
// Client Component
const response = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    billId: 'uuid',
    notifyEmail: true,
    notifyPush: false,
  }),
})
```

### Wyświetl ścieżkę legislacyjną

```tsx
<LegislativeTrain 
  currentStatus="committee"
  events={events}
  consultationStartDate="2024-01-15"
  consultationEndDate="2024-02-15"
/>
```

---

## 🔐 Bezpieczeństwo i Uprawnienia

### Synchronizacja RCL
- Wymaga roli: `admin` lub `super_admin`
- Endpoint: `/api/admin/sync-rcl-enhanced`

### Alerty użytkowników
- Wymaga: Zalogowany użytkownik
- RLS: Użytkownik widzi tylko swoje alerty

### Konsultacje
- Dostęp: Publiczny (widok), wymaga logowania (alerty)

---

## 📈 Metryki i Monitoring

### Statystyki konsultacji

```typescript
const stats = {
  active: activeBills.length,
  upcoming: upcomingBills.length,
  preconsultations: bills.filter(b => b.status === 'preconsultation').length,
  completed: completedBills.length,
}
```

### Logi synchronizacji

```
[RCL Enhanced Sync] Starting comprehensive RCL sync...
[RCL Enhanced Sync] Found 45 RCL projects
[RCL Enhanced Sync] Found 12 consultations
[RCL Enhanced Sync] Updated bill: sejm/10/123
[RCL Enhanced Sync] Created new bill from RCL: rcl-2024-001
[RCL Enhanced Sync] Sync completed: { billsUpdated: 23, billsCreated: 5 }
```

---

## 🐛 Troubleshooting

### Problem: Brak danych RCL
**Rozwiązanie:** Uruchom sync: `POST /api/admin/sync-rcl-enhanced`

### Problem: Alerty nie działają
**Rozwiązanie:** Sprawdź czy użytkownik jest zalogowany i ma profil w tabeli `profiles`

### Problem: Brak konsultacji
**Rozwiązanie:** Upewnij się, że projekty mają ustawione daty konsultacji

---

## 📚 Dokumentacja Powiązana

- `projekt.md` - Wymagania projektu
- `FAZA1_COMPLETED.md` - Historia implementacji fazy 1
- `API_DOCUMENTATION.md` - Dokumentacja API
- `INSTRUKCJA_UZYTKOWNIKA.md` - Instrukcja dla użytkowników

---

## 🎨 Zgodność UI/UX

### Design System
- Zgodne z ShadCN UI
- Dark mode support
- Accessibility features (WCAG 2.1)
- Responsive design (mobile, tablet, desktop)

### Kolory statusów
- **Współtworzenie:** Indigo
- **Prekonsultacje:** Violet
- **Konsultacje:** Blue
- **Komisja:** Purple
- **Opublikowana:** Green

---

## 🔮 Przyszłe Rozszerzenia

1. **Automatyczne powiadomienia email** - Cron job do wysyłki alertów
2. **Push notifications** - Web Push API
3. **Export do PDF/CSV** - Raporty OSR
4. **Integracja z Kalendarzem** - Synchronizacja dat konsultacji
5. **AI summaries** - Podsumowania OSR przez Gemini
6. **Porównywanie ustaw** - Side-by-side comparison
7. **Mapy wpływu** - Wizualizacja geograficzna
8. **API publiczne** - REST API dla partnerów

---

## 👥 Kontakt

W razie pytań dotyczących nowych funkcjonalności, sprawdź:
1. Ten plik README
2. Komentarze w kodzie
3. TypeScript types w plikach

---

**Wersja:** 2.0.0  
**Data:** Grudzień 2024  
**Status:** ✅ Zaimplementowano zgodnie z wymaganiami projekt.md
