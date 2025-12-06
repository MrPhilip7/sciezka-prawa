# Forum Konsultacji - Dokumentacja

## 📋 Przegląd

Zaimplementowano **funkcjonalność forum konsultacji** zgodnie z wymaganiami Ministerstwa Cyfryzacji. Użytkownicy mogą teraz:
- ✅ Komentować projekty ustaw w fazie prekonsultacji/konsultacji
- ✅ Odpowiadać na komentarze innych użytkowników (wątki dyskusji)
- ✅ Edytować swoje komentarze
- ✅ Usuwać swoje komentarze
- ✅ Czytać komentarze innych użytkowników (publiczne)

---

## 🎯 Gdzie znajduje się forum?

Forum konsultacji jest dostępne jako **zakładka "Konsultacje"** na stronie szczegółów każdej ustawy:

1. Przejdź do `/bills` (lista ustaw)
2. Kliknij na dowolną ustawę
3. Wybierz zakładkę **"Konsultacje"** (ikona MessageSquare 💬)

---

## 🗄️ Struktura bazy danych

### Tabela: `consultation_comments`
```sql
- id (UUID, primary key)
- bill_id (UUID, foreign key -> bills.id)
- user_id (UUID, foreign key -> auth.users.id)
- parent_comment_id (UUID, foreign key -> consultation_comments.id)
- content (TEXT, NOT NULL)
- is_edited (BOOLEAN, default: false)
- edited_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### Tabela: `consultation_comment_reactions`
```sql
- id (UUID, primary key)
- comment_id (UUID, foreign key -> consultation_comments.id)
- user_id (UUID, foreign key -> auth.users.id)
- reaction_type (TEXT: 'like' | 'support' | 'insightful')
- created_at (TIMESTAMPTZ)
- UNIQUE(comment_id, user_id)
```

### Indeksy (dla wydajności)
- `idx_consultation_comments_bill_id` - zapytania po bill_id
- `idx_consultation_comments_user_id` - zapytania po user_id
- `idx_consultation_comments_parent` - budowanie wątków
- `idx_consultation_comments_created` - sortowanie chronologiczne

---

## 🔒 Bezpieczeństwo (RLS Policies)

### `consultation_comments`
- **SELECT**: Publiczne (wszyscy mogą czytać)
- **INSERT**: Tylko zalogowani użytkownicy
- **UPDATE**: Tylko właściciel komentarza
- **DELETE**: Tylko właściciel komentarza

### `consultation_comment_reactions`
- **SELECT**: Publiczne
- **INSERT**: Tylko zalogowani użytkownicy
- **DELETE**: Tylko właściciel reakcji

---

## 📡 API Endpoints

### `GET /api/consultation-comments?billId={uuid}`
Pobiera komentarze dla konkretnej ustawy.

**Odpowiedź:**
```json
{
  "comments": [
    {
      "id": "uuid",
      "bill_id": "uuid",
      "user_id": "uuid",
      "parent_comment_id": "uuid | null",
      "content": "Treść komentarza",
      "is_edited": false,
      "created_at": "2025-12-06T...",
      "profile": {
        "full_name": "Jan Kowalski",
        "avatar_url": "https://..."
      },
      "reactions": [
        { "reaction_type": "like", "count": 5 }
      ],
      "replies": [...]
    }
  ]
}
```

### `POST /api/consultation-comments`
Dodaje nowy komentarz.

**Body:**
```json
{
  "billId": "uuid",
  "content": "Treść komentarza (10-5000 znaków)",
  "parentCommentId": "uuid | null"
}
```

**Walidacja:**
- Długość: 10-5000 znaków
- Wymaga zalogowania

### `PATCH /api/consultation-comments?commentId={uuid}`
Edytuje istniejący komentarz (tylko właściciel).

**Body:**
```json
{
  "content": "Nowa treść (10-5000 znaków)"
}
```

### `DELETE /api/consultation-comments?commentId={uuid}`
Usuwa komentarz (tylko właściciel). Usuwa również wszystkie odpowiedzi (CASCADE).

---

## 🎨 Komponenty

### `<ConsultationForum>` 
**Lokalizacja:** `src/components/bills/consultation-forum.tsx`

**Props:**
```typescript
{
  billId: string          // UUID projektu ustawy
  billTitle: string       // Tytuł ustawy (do wyświetlenia)
  billStatus: BillStatus  // Status ustawy
  isLoggedIn: boolean     // Czy użytkownik jest zalogowany
}
```

**Funkcjonalności:**
- ✅ Wyświetlanie komentarzy w strukturze drzewa (wątki)
- ✅ Formularz dodawania komentarza
- ✅ Odpowiadanie na komentarze (nested replies)
- ✅ Edycja własnych komentarzy
- ✅ Usuwanie własnych komentarzy
- ✅ Wyświetlanie liczby reakcji
- ✅ Awatary użytkowników (inicjały jako fallback)
- ✅ Relatywne timestampy (formatDistanceToNow)
- ✅ Walidacja długości (10-5000 znaków)

**Ograniczenia dostępu:**
Forum jest aktywne tylko dla ustaw o statusie:
- `co_creation` (Współtworzenie)
- `preconsultation` (Prekonsultacje)
- `consultation` (Konsultacje)

Dla innych statusów wyświetla się komunikat:
> "Konsultacje społeczne nie są obecnie dostępne dla tego projektu."

---

## 🚀 Uruchomienie migracji

### Opcja 1: Panel Supabase (zalecane)
1. Otwórz: https://supabase.com/dashboard/project/bzlnghsejbnoefcstjap
2. Przejdź do **SQL Editor**
3. Kliknij **New Query**
4. Wklej zawartość: `supabase/migrations/002_add_consultation_comments.sql`
5. Kliknij **Run** (Ctrl+Enter)

### Opcja 2: Supabase CLI
```bash
supabase migration up
```

---

## 📝 Testowanie

### Scenariusz testowy 1: Dodanie komentarza
1. Zaloguj się jako użytkownik
2. Przejdź do projektu ustawy o statusie `preconsultation`
3. Kliknij zakładkę "Konsultacje"
4. Wpisz komentarz (min. 10 znaków)
5. Kliknij "Wyślij komentarz"
6. ✅ Komentarz pojawia się na liście

### Scenariusz testowy 2: Odpowiedź na komentarz
1. Kliknij "Odpowiedz" pod istniejącym komentarzem
2. Wpisz odpowiedź
3. Kliknij "Wyślij odpowiedź"
4. ✅ Odpowiedź pojawia się jako zagnieżdżona (wcięta)

### Scenariusz testowy 3: Edycja komentarza
1. Kliknij "Edytuj" pod swoim komentarzem
2. Zmień treść
3. Kliknij "Zapisz"
4. ✅ Komentarz zaktualizowany, pokazuje "(edytowany)"

### Scenariusz testowy 4: Usunięcie komentarza
1. Kliknij "Usuń" pod swoim komentarzem
2. Potwierdź akcję
3. ✅ Komentarz znika (wraz z odpowiedziami)

### Scenariusz testowy 5: Brak dostępu dla niezalogowanych
1. Wyloguj się
2. Przejdź do zakładki "Konsultacje"
3. ✅ Wyświetla się komunikat: "Musisz być zalogowany..."

---

## 📦 Pliki utworzone/zmodyfikowane

### Nowe pliki:
- ✅ `supabase/migrations/002_add_consultation_comments.sql` - Migracja bazy danych
- ✅ `src/app/api/consultation-comments/route.ts` - API endpoints (GET/POST/PATCH/DELETE)
- ✅ `src/components/bills/consultation-forum.tsx` - Komponent UI forum
- ✅ `FORUM_KONSULTACJI.md` - Dokumentacja (ten plik)

### Zmodyfikowane pliki:
- ✅ `src/types/supabase.ts` - Dodano typy `ConsultationComment`, `ConsultationCommentReaction`
- ✅ `src/app/bills/[id]/bill-detail-content.tsx` - Dodano zakładkę "Konsultacje"

---

## 🔮 Przyszłe ulepszenia (opcjonalne)

1. **Reakcje na komentarze** - implementacja like/support/insightful (tabela już istnieje)
2. **Powiadomienia email** - alert gdy ktoś odpowie na Twój komentarz
3. **Moderacja** - flagowanie nieodpowiednich komentarzy przez adminów
4. **Eksport komentarzy** - pobierz wszystkie komentarze jako PDF/CSV (dla rządu)
5. **Statystyki** - liczba komentarzy, najpopularniejsze tematy
6. **Rich text editor** - formatowanie tekstu (pogrubienie, linki, listy)
7. **Załączniki** - możliwość dodawania dokumentów do komentarzy
8. **Wersjonowanie** - historia edycji komentarza

---

## 📞 Wsparcie techniczne

W razie problemów sprawdź:
1. Czy migracja została wykonana (tabele istnieją w Supabase)
2. Czy typy TypeScript są zaktualizowane (`npx tsc --noEmit`)
3. Czy RLS policies są włączone (panel Supabase → Authentication → Policies)
4. Logi serwera deweloperskiego (`npm run dev`)
5. Logi przeglądarki (F12 → Console)

---

## ✅ Status implementacji

- [x] Baza danych (tabele, indeksy, RLS)
- [x] API endpoints (GET/POST/PATCH/DELETE)
- [x] Komponent UI (ConsultationForum)
- [x] Integracja w stronę szczegółów ustawy
- [x] Typy TypeScript
- [x] Walidacja danych
- [x] Bezpieczeństwo (auth, RLS)
- [x] Obsługa błędów
- [x] UI/UX (awatary, timestampy, nested replies)
- [x] Dokumentacja

**Data ukończenia:** 6 grudnia 2025  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)
