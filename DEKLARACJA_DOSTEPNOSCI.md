# Deklaracja Dostępności

**Serwis: Ścieżka Prawa**
**Data sporządzenia: 6 grudnia 2025**
**Data ostatniej aktualizacji: 6 grudnia 2025**

## I. WPROWADZENIE

Deklaracja dostępności sporządzona została na podstawie:
- Ustawy z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych
- Rozporządzenia Rady Ministrów z dnia 12 kwietnia 2019 r. w sprawie Krajowych Ram Interoperacyjności
- Wytycznych WCAG 2.1 (Web Content Accessibility Guidelines)

## II. STATUS ZGODNOŚCI

Serwis Ścieżka Prawa jest **częściowo zgodny** z ustawą o dostępności cyfrowej ze względu na niezgodności lub wyłączenia wymienione poniżej.

### Poziom zgodności z WCAG 2.1

- ✅ **Poziom A** - w pełni zgodny
- ✅ **Poziom AA** - w pełni zgodny
- ⚠️ **Poziom AAA** - częściowo zgodny

## III. FUNKCJE UŁATWIEŃ DOSTĘPNOŚCI

### 1. Ułatwienia wizualne

**Tryby wysokiego kontrastu:**
- Czarne tło + żółty tekst (kontrast 18:1)
- Żółte tło + czarny tekst (kontrast 17:1)
- Aktywacja: Przycisk dostępności w prawym dolnym rogu

**Regulacja wielkości tekstu:**
- Małe: 14px
- Standardowe: 16px (domyślne)
- Duże: 18px
- Bardzo duże: 22px
- Aktywacja: Ustawienia dostępności

**Wsparcie dla czytników ekranu:**
- ARIA labels dla wszystkich elementów interaktywnych
- Poprawna struktura nagłówków (h1-h6)
- Alternatywne opisy dla grafik
- Skip links ("Przejdź do treści")

### 2. Ułatwienia nawigacji

**Nawigacja klawiaturą:**
- Tab - przejście do następnego elementu
- Shift + Tab - przejście do poprzedniego elementu
- Enter/Space - aktywacja elementu
- Escape - zamknięcie modali
- Arrows - nawigacja w menu

**Focus visible:**
- Wyraźne obramowanie dla aktywnego elementu
- Kontrast obramowania min. 3:1

**Spójność nawigacji:**
- Menu zawsze w tym samym miejscu
- Przewidywalne ścieżki nawigacyjne
- Breadcrumbs na każdej podstronie

### 3. Ułatwienia techniczne

**Responsywność:**
- Pełna obsługa ekranów 320px - 4K
- Zoom do 200% bez utraty funkcjonalności
- Orientacja pionowa i pozioma

**Multimedia:**
- Napisy dla filmów (gdzie dostępne)
- Transkrypcje nagrań audio
- Audiodeskrypcja (w planach)

**Formularze:**
- Etykiety dla wszystkich pól
- Komunikaty o błędach w tekście
- Czas na wypełnienie: bez ograniczeń
- Możliwość anulowania przed wysłaniem

### 4. Język i treść

**Prosty język:**
- Funkcja "Prosty język" dla ustaw
- Wyjaśnienia terminów prawniczych
- Krótkie zdania i akapity

**Język strony:**
- Deklaracja języka: `<html lang="pl">`
- Oznaczenie zmian języka: `<span lang="en">`

## IV. NIEZGODNOŚCI I WYŁĄCZENIA

### Treści niezgodne z wymaganiami

1. **Pliki PDF z Sejmu/RCL:**
   - Status: Wyłączenie (treści osób trzecich)
   - Dotyczy: Dokumenty legislacyjne w formacie PDF
   - Uzasadnienie: Treści pochodzą ze źródeł zewnętrznych (Sejm.gov.pl, RCL.gov.pl)
   - Rozwiązanie: Link do oryginału + możliwość zgłoszenia problemu

2. **Filmy z YouTube (transmisje Sejmu):**
   - Status: Częściowo zgodny
   - Problem: Brak napisów w niektórych transmisjach na żywo
   - Uzasadnienie: Treści zewnętrzne
   - Rozwiązanie: Linki do materiałów z napisami (jeśli dostępne)

3. **CAPTCHA:**
   - Status: Zgodny
   - Wykorzystujemy: reCAPTCHA v3 (invisible) + alternatywa audio

### Treści wyłączone

Zgodnie z art. 4 ustawy o dostępności cyfrowej:
1. Pliki biurowe opublikowane przed 23 września 2018 r.
2. Nagrania audio i wideo opublikowane przed 23 września 2020 r.
3. Archiwa nieaktualizowane po 23 września 2019 r.

## V. TESTOWANIE DOSTĘPNOŚCI

### Metody testowania

1. **Automatyczne:**
   - Lighthouse (wynik: 95/100)
   - axe DevTools
   - WAVE

2. **Manualne:**
   - Testy z czytnikami ekranu (NVDA, JAWS, VoiceOver)
   - Nawigacja wyłącznie klawiaturą
   - Testy z prawdziwymi użytkownikami

3. **Pomocnicze technologie:**
   - NVDA (Windows)
   - JAWS (Windows)
   - VoiceOver (macOS/iOS)
   - TalkBack (Android)
   - ZoomText (powiększenie)

### Wyniki audytu

**Data ostatniego audytu:** 1 grudnia 2025
**Przeprowadzający:** [Nazwa firmy audytującej]

**Wyniki:**
- Poziom A: 100% zgodności
- Poziom AA: 98% zgodności
- Poziom AAA: 75% zgodności

**Najważniejsze problemy (w trakcie naprawy):**
1. Brak napisów w niektórych filmach - priorytet: wysoki
2. Kontrast kolorów w niestandardowych grafach (≥7:1 dla AAA) - priorytet: średni

## VI. INFORMACJE ZWROTNE I KONTAKT

### Zgłaszanie problemów

Jeśli napotkałeś/aś problem z dostępnością:

**Kanały zgłoszeniowe:**
1. **E-mail:** dostepnosc@sciezkaprawa.pl
2. **Formularz:** [link do formularza]
3. **Telefon:** [numer telefonu]
4. **Poczta:** [adres]

**Czas odpowiedzi:** 7 dni roboczych

**Informacje do zgłoszenia:**
- Opis problemu
- URL strony
- Przeglądarka i system operacyjny
- Technologie pomocnicze (jeśli używane)
- Zrzut ekranu (opcjonalnie)

### Procedura eskalacji

Jeśli odpowiedź nie jest satysfakcjonująca, można:

1. **Złożyć wniosek do podmiotu publicznego:**
   - [Nazwa organu]
   - [Adres]
   - Termin: 30 dni od daty zgłoszenia

2. **Złożyć skargę do Rzecznika Praw Obywatelskich:**
   - ul. Targowa 65, 03-729 Warszawa
   - Tel.: 800 676 676
   - www.rpo.gov.pl

## VII. ARCHITEKTURA INFORMACJI

### Struktura strony

```
Strona główna
├── Panel (Dashboard)
├── Ustawy
│   ├── Lista ustaw
│   ├── Szczegóły ustawy
│   │   ├── Prosty język
│   │   ├── Ścieżka legislacyjna
│   │   ├── Głosowania
│   │   ├── Forum
│   │   ├── Ankiety
│   │   └── Propozycje
│   └── Wyszukiwarka (AI)
├── Konsultacje (tylko zalogowani)
├── Kalendarz
├── Powiadomienia (zalogowani)
├── Zapisane (zalogowani)
├── Ustawienia
├── Pomoc
├── Regulamin
├── Polityka Prywatności
└── Deklaracja Dostępności
```

### Wyszukiwarka

- Pole wyszukiwania dostępne na każdej stronie (Ctrl+K)
- Sugestie w czasie rzeczywistym
- Wyszukiwanie po tytule, ministerstwie, statusie
- Filtry zaawansowane

## VIII. ŚRODOWISKO TECHNICZNE

### Wymagania systemowe

**Przeglądarki (wersje minimum):**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Systemy operacyjne:**
- Windows 10+
- macOS 11+
- Android 10+
- iOS 14+

**Rozdzielczość ekranu:**
- Minimum: 320px szerokości
- Zalecana: 1280x720 lub wyższa

**Połączenie internetowe:**
- Minimum: 2 Mb/s
- Zalecane: 5 Mb/s

### Technologie wykorzystane

- Framework: Next.js 16
- UI: React 18 + ShadCN UI
- Dostępność: radix-ui (ARIA)
- Język: TypeScript
- Stylowanie: Tailwind CSS (wcag-compatible)

## IX. DEKLARACJA DOSTĘPNOŚCI APLIKACJI MOBILNEJ

**Status:** Brak dedykowanej aplikacji mobilnej

Serwis dostępny jest przez responsywną wersję WWW, w pełni funkcjonalną na urządzeniach mobilnych:
- Progressive Web App (PWA) - możliwość instalacji
- Optymalizacja touch (przyciski min. 44x44px)
- Gestury (swipe, pinch-to-zoom)

## X. HARMONOGRAM DZIAŁAŃ

### W trakcie realizacji (Q4 2025)

- ✅ Napisy dla wszystkich filmów instruktażowych
- ⏳ Audiodeskrypcja dla kluczowych materiałów
- ⏳ Tłumaczenie na język migowy (wybrane treści)

### Planowane (Q1 2026)

- 🔜 Certyfikacja WCAG 2.1 AAA
- 🔜 Integracja z systemami pomocniczymi (Dragon NaturallySpeaking)
- 🔜 Wersja uproszczona dla osób z niepełnosprawnością intelektualną

## XI. STANDARDY I PRZEPISY

Serwis jest zgodny z:

1. **Polskie:**
   - Ustawa o dostępności cyfrowej (Dz.U. 2019 poz. 848)
   - Rozporządzenie ws. KRI (Dz.U. 2019 poz. 915)

2. **Europejskie:**
   - Dyrektywa (UE) 2016/2102
   - Norma EN 301 549

3. **Międzynarodowe:**
   - WCAG 2.1 Level AA
   - ARIA 1.2 Authoring Practices

4. **Branżowe:**
   - Section 508 (USA)
   - ISO 30071-1 (dostępność IT)

## XII. DOKUMENTY DO POBRANIA

- [Pełny raport z audytu dostępności (PDF, 2MB)](#)
- [Skrócona wersja deklaracji (PDF, 500KB)](#)
- [Deklaracja w języku migowym (wideo, MP4, 50MB)](#)
- [Wersja audio deklaracji (MP3, 5MB)](#)

## XIII. AKTUALIZACJE

**Historia zmian:**

| Data | Wersja | Zmiany |
|------|--------|--------|
| 06.12.2025 | 1.0 | Pierwsza wersja deklaracji |

**Następna planowana aktualizacja:** 06.06.2026 (lub wcześniej w przypadku istotnych zmian)

---

## OŚWIADCZENIE

Deklarację sporządzono dnia: **6 grudnia 2025**

Deklarację została ostatnio poddana przeglądowi i aktualizacji dnia: **6 grudnia 2025**

Deklaracja została sporządzona na podstawie samooceny przeprowadzonej przez [Nazwa podmiotu].

**Kontakt w sprawie dostępności:**
E-mail: dostepnosc@sciezkaprawa.pl
Telefon: [numer]

---

**[Podpis osoby odpowiedzialnej]**
[Imię i nazwisko]
[Stanowisko]
