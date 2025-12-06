# 🚀 Quick Start Guide - Ścieżka Prawa

## Dla Użytkowników

### 1. Dostęp do Aplikacji
Otwórz przeglądarkę i wejdź na: `http://localhost:3000` (dev) lub `https://twoja-domena.pl` (prod)

### 2. Znajdź Ustawę
- Użyj wyszukiwarki w górnym menu
- Lub przejdź do **"Wyszukiwarka"** w menu bocznym
- Filtruj po statusie, roku, ministerstwie

### 3. Zobacz Szczegóły
Kliknij na interesującą ustawę, aby zobaczyć:
- **Szczegóły** - opis, metadata, tagi
- **Ścieżka Legislacyjna** 📊 - wizualizacja timeline
- **Historia** - chronologia wydarzeń
- **Prosty Język** 📝 - AI pomoże zrozumieć tekst
- **Głosowania** - wyniki głosowań (jeśli dostępne)

### 4. Śledź Zmiany
- Kliknij ikonę dzwonka 🔔 aby dodać alert
- Otrzymasz powiadomienie gdy zmieni się status

---

## Dla Deweloperów

### Szybka Instalacja

```bash
# 1. Clone repo
git clone https://github.com/yourusername/sciezka-prawa.git
cd sciezka-prawa

# 2. Instaluj dependencies
npm install

# 3. Setup env vars
cp .env.local.example .env.local
# Edytuj .env.local i dodaj klucze Supabase

# 4. Run migrations
# Otwórz Supabase SQL Editor i uruchom:
# - supabase/schema.sql
# - supabase/migrations/001_add_preconsultation_status.sql

# 5. Start dev server
npm run dev

# 6. Otwórz http://localhost:3000
```

### Struktura Komend

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (wymagany Supabase CLI)
supabase db push         # Push migrations
supabase gen types typescript --local > src/types/supabase.ts
```

### Kluczowe Pliki

```
src/
├── app/
│   ├── bills/[id]/                    # Strona szczegółów ustawy
│   │   ├── page.tsx                   # Server component
│   │   └── bill-detail-content.tsx    # Client component
│   └── api/
│       └── ai/simple-language/        # API prostego języka
│
├── components/
│   ├── bills/
│   │   ├── legislative-timeline.tsx   # 📊 Timeline component
│   │   └── simple-language-helper.tsx # 📝 Prosty język
│   └── ui/                            # ShadCN components
│
├── lib/
│   ├── api/sejm.ts                    # Sejm API client
│   └── supabase/                      # Supabase helpers
│
└── types/supabase.ts                  # Generated types
```

---

## Dla Administratorów

### Panel Admina

1. Zaloguj się jako admin
2. Przejdź do **"Admin"** w menu bocznym
3. Dostępne funkcje:
   - **Użytkownicy** - zarządzanie rolami
   - **Sync** - manualna synchronizacja z API Sejmu
   - **Logi** - podgląd aktywności
   - **Ustawienia** - konfiguracja systemu

### Synchronizacja Danych

```bash
# Manualna synchronizacja przez API
POST /api/admin/sync
Authorization: Bearer <user_token>

# Lub przez panel admina:
Admin → Sync → "Synchronizuj teraz"
```

### Zarządzanie Użytkownikami

```sql
-- Zmień rolę użytkownika (w Supabase SQL Editor)
UPDATE profiles
SET role = 'admin'  -- user | moderator | admin | super_admin
WHERE email = 'user@example.com';
```

---

## Testowanie Nowych Funkcji (Faza 1)

### Test 1: Ścieżka Legislacyjna

1. Otwórz dowolną ustawę
2. Przejdź do zakładki **"Ścieżka Legislacyjna"**
3. Sprawdź:
   - ✅ Czy wszystkie 11 etapów jest widocznych
   - ✅ Czy aktualny etap jest podświetlony
   - ✅ Czy ukończone etapy mają zielone checkmarki
   - ✅ Czy daty są wyświetlane poprawnie

### Test 2: Prosty Język

1. Otwórz ustawę z opisem
2. Przejdź do zakładki **"Prosty Język"**
3. Wybierz tryb (np. "Prosty Język")
4. Kliknij "Przetwórz tekst"
5. Sprawdź:
   - ✅ Czy wynik się pojawia (lub fallback message)
   - ✅ Czy możesz przełączyć między trybami
   - ✅ Czy wyniki są cache'owane (szybkie przełączanie)

### Test 3: Nowe Statusy

1. Otwórz Supabase SQL Editor
2. Stwórz testową ustawę:

```sql
INSERT INTO bills (sejm_id, title, status)
VALUES ('TEST-001', 'Test Prekonsultacji', 'preconsultation');
```

3. Sprawdź na stronie czy:
   - ✅ Status wyświetla się jako "Prekonsultacje"
   - ✅ Kolor to violet/fioletowy
   - ✅ Timeline pokazuje prekonsultacje jako aktualny etap

---

## Troubleshooting

### Problem: "Module not found"
```bash
# Usuń node_modules i przeinstaluj
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Supabase connection failed"
```bash
# Sprawdź .env.local
# Upewnij się że klucze są poprawne
# Sprawdź czy Supabase project działa
```

### Problem: "AI nie działa"
```bash
# Jeśli brak GEMINI_API_KEY:
# - Funkcja działa z fallbackiem
# - Dodaj klucz w .env.local:
GEMINI_API_KEY=your_key_here
```

### Problem: "Database migration failed"
```bash
# Sprawdź czy schema jest aktualna
# Zobacz szczegóły w MIGRACJA_BAZY.md
# W razie wątpliwości - rollback i spróbuj ponownie
```

---

## Przydatne Linki

- 📖 [Dokumentacja Użytkownika](INSTRUKCJA_UZYTKOWNIKA.md)
- 🗄️ [Migracja Bazy](MIGRACJA_BAZY.md)
- 📡 [API Docs](API_DOCUMENTATION.md)
- ✅ [Faza 1 Details](FAZA1_COMPLETED.md)
- 🔄 [Changelog](CHANGELOG.md)

---

## Wsparcie

- 🐛 Znalazłeś bug? Otwórz issue na GitHub
- 💡 Masz pomysł? Otwórz discussion
- 📧 Email: support@sciezkaprawa.pl (przykład)

---

**Miłego kodowania! 🦅✨**
