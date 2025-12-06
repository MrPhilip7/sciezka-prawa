# Mechanizmy Partycypacyjne - Dokumentacja

Implementacja punktu 10 z dokumentu `projekt.md` - mechanizmy partycypacyjne zgodnie z zaleceniem UE z 12.12.2023.

## 📋 Spis treści

1. [Przegląd funkcji](#przegląd-funkcji)
2. [Architektura bazy danych](#architektura-bazy-danych)
3. [API Endpoints](#api-endpoints)
4. [Komponenty UI](#komponenty-ui)
5. [Integracja](#integracja)
6. [Instrukcje wdrożenia](#instrukcje-wdrożenia)

## Przegląd funkcji

### 1. Ankiety i sondy w konsultacjach (`consultation_surveys`)
- Tworzenie ankiet przez administratorów
- 5 typów pytań: jednokrotny wybór, wielokrotny wybór, tekst, ocena (1-5), tak/nie
- Anonimowe i nazwane odpowiedzi
- Ograniczenia czasowe i ilościowe
- Statystyki odpowiedzi

### 2. Głosowania na propozycje zmian (`amendment_proposals`)
- Obywatele mogą zgłaszać propozycje zmian w ustawach
- 3 typy głosów: popieram, sprzeciwiam się, neutralny
- Próg głosów do akceptacji (domyślnie 100)
- Statusy: szkic, głosowanie, zaakceptowana, odrzucona, wdrożona
- Komentarze do głosów

### 3. Warsztaty online (`consultation_workshops`)
- Planowanie i zarządzanie warsztatami konsultacyjnymi
- Rejestracja uczestników z limitem miejsc
- Integracja z videokonferencjami (link do spotkania)
- Śledzenie uczestnictwa

### 4. Collaborative editing (`collaborative_notes`)
- Współpraca nad dokumentami podczas warsztatów
- Wersjonowanie zmian
- Śledzenie ostatniego edytora

### 5. Repozytorium dobrych praktyk (`best_practices`)
- Gromadzenie skutecznych metod konsultacji
- Kategorie: consultation, participation, transparency, accessibility, communication
- Metryki sukcesu (JSON)
- Weryfikacja przez administratorów

## Architektura bazy danych

### Migracja: `005_add_participation_mechanisms.sql`

**Tabele główne:**
```sql
consultation_surveys          -- Ankiety
survey_questions              -- Pytania w ankietach
survey_responses              -- Odpowiedzi użytkowników
survey_answers                -- Odpowiedzi na pytania

amendment_proposals           -- Propozycje zmian
proposal_votes                -- Głosy na propozycje

consultation_workshops        -- Warsztaty
workshop_participants         -- Uczestnicy warsztatów
collaborative_notes           -- Notatki ze współpracy

best_practices                -- Dobre praktyki
```

**Enums:**
- `survey_question_type`: single_choice, multiple_choice, text, rating, yes_no
- `survey_status`: draft, active, closed, archived
- `proposal_status`: draft, voting, accepted, rejected, implemented
- `vote_type`: support, oppose, neutral
- `workshop_status`: scheduled, in_progress, completed, cancelled
- `practice_category`: consultation, participation, transparency, accessibility, communication

**Row Level Security:**
- Wszyscy użytkownicy mogą czytać aktywne ankiety i propozycje
- Tylko zalogowani mogą odpowiadać i głosować
- Administratorzy zarządzają ankietami i warsztatami
- Uczestnicy warsztatów mogą edytować notatki współpracy

## API Endpoints

### Ankiety

#### `GET /api/surveys?billId={id}`
Pobiera listę ankiet dla ustawy.
```json
[
  {
    "id": "uuid",
    "title": "Opinia o projekcie",
    "description": "Twoja opinia jest ważna",
    "status": "active",
    "starts_at": "2025-12-06T00:00:00Z",
    "ends_at": "2026-01-06T00:00:00Z",
    "is_anonymous": false,
    "response_count": 42,
    "created_by_profile": { "full_name": "Jan Kowalski" }
  }
]
```

#### `GET /api/surveys?surveyId={id}`
Pobiera szczegóły ankiety z pytaniami.
```json
{
  "id": "uuid",
  "title": "Opinia o projekcie",
  "questions": [
    {
      "id": "uuid",
      "question_text": "Czy popierasz tę zmianę?",
      "question_type": "yes_no",
      "is_required": true,
      "order_index": 0
    }
  ],
  "response_count": 42
}
```

#### `POST /api/surveys`
Tworzy nową ankietę (tylko admini).
```json
{
  "billId": "uuid",
  "title": "Nowa ankieta",
  "description": "Opis ankiety",
  "startsAt": "2025-12-06T00:00:00Z",
  "endsAt": "2026-01-06T00:00:00Z",
  "isAnonymous": false,
  "questions": [
    {
      "questionText": "Pytanie 1",
      "questionType": "single_choice",
      "isRequired": true,
      "options": ["Opcja A", "Opcja B", "Opcja C"]
    }
  ]
}
```

#### `POST /api/surveys/respond`
Przesyła odpowiedzi na ankietę.
```json
{
  "surveyId": "uuid",
  "isAnonymous": false,
  "answers": [
    {
      "questionId": "uuid",
      "answerText": "Moja odpowiedź"
    },
    {
      "questionId": "uuid",
      "selectedOptions": ["Opcja A", "Opcja C"]
    },
    {
      "questionId": "uuid",
      "ratingValue": 4
    }
  ]
}
```

### Propozycje zmian

#### `GET /api/proposals?billId={id}`
Pobiera propozycje dla ustawy.
```json
[
  {
    "id": "uuid",
    "title": "Zmiana art. 5",
    "description": "Propozycja zmiany...",
    "status": "voting",
    "vote_threshold": 100,
    "author": { "full_name": "Jan Kowalski" },
    "vote_counts": {
      "support": 75,
      "oppose": 10,
      "neutral": 5,
      "total": 90
    }
  }
]
```

#### `POST /api/proposals`
Tworzy nową propozycję (zalogowani użytkownicy).
```json
{
  "billId": "uuid",
  "title": "Propozycja zmiany art. 5",
  "description": "Szczegółowy opis proponowanej zmiany (min 50 znaków)",
  "proposedText": "Nowe brzmienie przepisu",
  "rationale": "Uzasadnienie",
  "voteThreshold": 100
}
```

#### `POST /api/proposals/vote`
Głosuje na propozycję.
```json
{
  "proposalId": "uuid",
  "vote": "support",
  "comment": "Zgadzam się, ponieważ..."
}
```

#### `PATCH /api/proposals?proposalId={id}`
Aktualizuje status propozycji (tylko admini).
```json
{
  "status": "accepted"
}
```

## Komponenty UI

### `<SurveyViewer />`
**Lokalizacja:** `src/components/bills/survey-viewer.tsx`

Interaktywny formularz ankiety z walidacją i wizualizacją postępu.

**Props:**
```typescript
interface SurveyViewerProps {
  surveyId: string
  onComplete?: () => void
}
```

**Funkcje:**
- Dynamiczne renderowanie pytań według typu
- Walidacja wymaganych pól
- Wizualizacja ilości odpowiedzi
- Potwierdzenie wysłania

### `<ProposalList />`
**Lokalizacja:** `src/components/bills/proposal-list.tsx`

Lista propozycji zmian z formularzem zgłaszania i głosowaniem.

**Props:**
```typescript
interface ProposalListProps {
  billId: string
  isLoggedIn: boolean
}
```

**Funkcje:**
- Formularz zgłaszania propozycji (min 10/50 znaków)
- Karty propozycji z autorami i datami
- Pasek postępu do progu głosów
- Przyciski głosowania (Popieram/Neutralny/Sprzeciwiam się)
- Dialog z pełnymi szczegółami propozycji
- Statusy: szkic, głosowanie, zaakceptowana, odrzucona, wdrożona

## Integracja

### Strona szczegółów ustawy
**Plik:** `src/app/bills/[id]/bill-detail-content.tsx`

Dodano 3 nowe zakładki:
1. **Forum** - Komentarze (istniejący `ConsultationForum`)
2. **Ankiety** - Nowy komponent z listą ankiet
3. **Propozycje** - Nowy komponent `ProposalList`

**Zakładki dostępne dla:**
- Forum: Tylko zalogowani
- Ankiety: Tylko zalogowani
- Propozycje: Wszyscy (ale głosowanie tylko dla zalogowanych)

### Strona konsultacji
**Plik:** `src/app/consultations/page.tsx`

Istniejąca strona z listą ustaw w fazie konsultacji. Można rozszerzyć o:
- Widget pokazujący aktywne ankiety
- Najpopularniejsze propozycje zmian
- Nadchodzące warsztaty

## Instrukcje wdrożenia

### Krok 1: Wykonaj migrację bazy danych

```powershell
# W Supabase SQL Editor wklej zawartość pliku:
# supabase/migrations/005_add_participation_mechanisms.sql
```

### Krok 2: Sprawdź typy TypeScript

Plik `src/types/supabase.ts` został zaktualizowany o nowe typy:
- `SurveyQuestionType`
- `SurveyStatus`
- `ProposalStatus`
- `VoteType`
- `WorkshopStatus`
- `PracticeCategory`

### Krok 3: Test funkcjonalności

#### Test ankiet:
1. Zaloguj się jako admin
2. Utwórz ankietę przez API: `POST /api/surveys`
3. Zaloguj się jako użytkownik
4. Otwórz stronę ustawy → zakładka "Ankiety"
5. Wypełnij i wyślij ankietę

#### Test propozycji:
1. Zaloguj się jako użytkownik
2. Otwórz stronę ustawy → zakładka "Propozycje"
3. Zgłoś propozycję zmiany (min 10/50 znaków)
4. Zagłosuj na swoją lub cudzą propozycję
5. Admin może zmienić status na "accepted"

### Krok 4: Dane testowe (opcjonalnie)

```sql
-- Przykładowa ankieta
INSERT INTO consultation_surveys (bill_id, title, description, status, created_by, is_anonymous)
VALUES (
  '(wybierz bill_id z tabeli bills)',
  'Opinia o projekcie ustawy',
  'Podziel się swoją opinią na temat proponowanych zmian',
  'active',
  '(wybierz profile_id admina)',
  false
);

-- Pytania do ankiety
INSERT INTO survey_questions (survey_id, question_text, question_type, is_required, order_index, options)
VALUES 
  ('(survey_id z poprzedniego INSERT)', 'Czy popierasz ten projekt?', 'yes_no', true, 0, NULL),
  ('(survey_id)', 'Która zmiana jest najważniejsza?', 'single_choice', true, 1, '["Art. 5", "Art. 12", "Art. 23"]'::jsonb),
  ('(survey_id)', 'Dodatkowe uwagi', 'text', false, 2, NULL);
```

## Zgodność z wymogami UE

### Zalecenie Komisji Europejskiej (12.12.2023)

✅ **Zaangażowanie obywateli** - Ankiety i propozycje pozwalają na bezpośredni udział  
✅ **Organizacje społeczeństwa obywatelskiego** - Forum i warsztaty  
✅ **Procesy kształtowania polityki** - Propozycje zmian z głosowaniem  
✅ **Skuteczne uczestnictwo** - Mechanizmy głosowania i konsultacji  
✅ **Transparentność** - Publiczny dostęp do propozycji i wyników ankiet  
✅ **Demokratyczne innowacje** - Collaborative editing, warsztaty online  

## Rozszerzenia przyszłościowe

### Planowane funkcje:
1. **Export wyników ankiet** (CSV, PDF)
2. **Dashboard statystyk** dla administratorów
3. **Powiadomienia o nowych propozycjach** (email, push)
4. **Integracja z videokonferencjami** (Zoom, Teams)
5. **AI moderacja** propozycji i komentarzy
6. **Gamifikacja** - punkty za udział w konsultacjach
7. **API publiczne** dla zewnętrznych aplikacji
8. **Mobilna aplikacja** z push notifications

## Wsparcie techniczne

**Pliki do przejrzenia:**
- Migracja: `supabase/migrations/005_add_participation_mechanisms.sql`
- API ankiet: `src/app/api/surveys/route.ts`
- API odpowiedzi: `src/app/api/surveys/respond/route.ts`
- API propozycji: `src/app/api/proposals/route.ts`
- API głosowania: `src/app/api/proposals/vote/route.ts`
- Komponent ankiet: `src/components/bills/survey-viewer.tsx`
- Komponent propozycji: `src/components/bills/proposal-list.tsx`
- Integracja: `src/app/bills/[id]/bill-detail-content.tsx`
- Typy: `src/types/supabase.ts`

**Dokumentacja projektowa:** `pattern/projekt.md` (punkt 10)
