# Ścieżka Prawa - Polish Legislative Tracker

<p align="center">
  <strong>Śledź proces legislacyjny w Polsce</strong>
</p>

<p align="center">
  Platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce. Monitoruj projekty ustaw, otrzymuj powiadomienia i bądź świadomym obywatelem.
</p>

---

## 🚀 Funkcje

### Podstawowe
- **Real-time Bill Updates** - Automatyczne pobieranie danych z API Sejmu i systemu ELI
- **Search and Filter** - Wyszukiwanie ustaw według statusu, ministerstwa, daty
- **Alerts System** - Powiadomienia email o zmianach w śledzonych projektach
- **User Profiles** - Personalizowane konto z zapisanymi wyszukiwaniami

### ✨ NOWE w Fazie 2 (Grudzień 2024) - Integracja RCL
- **🔗 Integracja RCL** - Automatyczne łączenie danych z Rządowego Centrum Legislacji
- **📋 Strona Konsultacji** - Dedykowany widok `/consultations` z aktywnymi konsultacjami i prekonsultacjami
- **🔔 Ulepszone Alerty** - Konfigurowalny system powiadomień (email/push) dla konkretnych ustaw
- **📊 Szczegółowa Ocena Skutków (OSR)** - Wizualizacja wpływu finansowego, społecznego, gospodarczego i środowiskowego
- **🚂 Legislative Train** - Interaktywna wizualizacja ścieżki legislacyjnej na wzór EU Legislative Train Schedule
- **📅 Monitoring Konsultacji** - Śledzenie aktywnych, nadchodzących i zakończonych konsultacji społecznych
- **🎯 Impact Analysis** - Szczegółowa analiza przewidywanych skutków regulacji

### ✨ Faza 1 (6 grudnia 2025)
- **📊 Wizualizacja Ścieżki Legislacyjnej** - Graficzny timeline procesu od współtworzenia do publikacji
- **🗣️ Prosty Język** - AI tłumaczy skomplikowane teksty prawne na zrozumiały język
- **📈 Analiza Skutków** - Pokazuje jak ustawa wpłynie na obywateli, firmy i budżet
- **📝 Streszczenia AI** - Automatyczne generowanie streszczeń projektów ustaw
- **🤝 Prekonsultacje** - Śledzenie etapu konsultacji społecznych przed Sejmem
- **🏛️ Współtworzenie** - Monitoring wczesnych etapów partycypacji obywatelskiej

> Zgodne z ZALECENIEM KOMISJI EUROPEJSKIEJ z dnia 12.12.2023 r. w sprawie zaangażowania obywateli i projekt.md (Ministerstwo Cyfryzacji)

## 🛠️ Tech Stack

### Core Technologies
- **Frontend Framework**: [Next.js 16.0.7](https://nextjs.org/) with App Router & Turbopack
- **Language**: TypeScript 5.x
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)
- **Styling**: PostCSS, CSS Modules
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Row Level Security)
- **Deployment**: [Vercel](https://vercel.com/)

### External APIs & Services

#### 🏛️ Sejm API
**Endpoint**: `https://api.sejm.gov.pl`

Oficjalne API Sejmu RP do pobierania danych legislacyjnych:
- **Procesy legislacyjne** (`/sejm/term{X}/processes`) - Lista i szczegóły procesów w danej kadencji
- **Szczegóły procesu** (`/sejm/term{X}/processes/{number}`) - Pełne dane z etapami, drukmi, ELI
- **Posiedzenia komisji** (`/sejm/term{X}/committees/{code}/sittings`) - Harmonogramy i transmisje
- **Głosowania** (`/sejm/term{X}/votings/{number}`) - Wyniki głosowań sejmowych

**Użyte pola**:
- `stages[]` - Etapy procesu (komisja, czytania, senat)
- `ELI` - European Legislation Identifier (dla publikacji)
- `passed` - Status uchwalenia/odrzucenia
- `videos[]` - Linki do transmisji/nagrań posiedzeń

**Rate Limiting**: Brak oficjalnych limitów, zalecane cache'owanie

#### 📺 YouTube Data API v3
**Scraping**: `https://youtube.com/@SejmRP_PL/live`

Monitorowanie transmisji na żywo z obrad Sejmu:
- **Wykrywanie live streamów** - Sprawdzanie czy trwa transmisja
- **Metadata** - Tytuł transmisji, ID wideo, URL kanału
- **Integracja** - Wyświetlanie statusu "🔴 NA ŻYWO" w dashboardzie

**Endpoint**: `/api/youtube-live`
```typescript
interface YouTubeLiveResponse {
  isLive: boolean
  videoId?: string
  title?: string
  channelUrl?: string
}
```

**Technika**: Web scraping z regex pattern matching (brak wymaganego API key)

#### 📧 Resend API
**Website**: [resend.com](https://resend.com)

System wysyłania powiadomień email:
- **Alerty o zmianach** - Powiadomienia o nowych statusach projektów ustaw
- **Raporty dzienne/tygodniowe** - Digest zmian w śledzonych ustawach
- **Email weryfikacyjny** - Potwierdzenie rejestracji konta
- **Prosty HTML/Markdown** - Czytelne, responsywne szablony

**Limity darmowe**: 100 emaili/dzień, 3000/miesiąc

**Konfiguracja**:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

#### 🤖 Google Gemini AI API
**Model**: `gemini-2.0-flash-exp` (Free Tier)

Funkcje AI do analizy tekstów prawnych:
- **Prosty Język** - Tłumaczenie skomplikowanych przepisów na zrozumiały język
- **Analiza Skutków** - Przewidywanie wpływu na obywateli, firmy, budżet
- **Streszczenia** - Automatyczne generowanie krótkich podsumowań
- **Wyjaśnienia** - Szczegółowe objaśnienia terminów prawniczych

**Limity Free Tier**: 
- 15 zapytań/minutę
- 1500 zapytań/dzień
- 1 milion tokenów/dzień

**Fallback**: Aplikacja działa bez klucza API (z ograniczoną funkcjonalnością)

**Endpoint**: `/api/ai/simple-language`

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier
- **Git Hooks**: Husky (opcjonalnie)
- **Type Safety**: TypeScript strict mode
- **State Management**: React Hooks + Context API
- **Markdown Parsing**: `marked` library
- **Date Handling**: `date-fns` z lokalizacją polską

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sciezka-prawa.git
   cd sciezka-prawa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   GEMINI_API_KEY=your_gemini_api_key  # Opcjonalne - dla funkcji AI
   ```

4. **Set up the database**
   
   Run migrations in your Supabase SQL Editor:
   ```bash
   # 1. Base schema
   # Copy contents from supabase/schema.sql
   
   # 2. Phase 1 migration (NEW!)
   # Copy contents from supabase/migrations/001_add_preconsultation_status.sql
   ```
   
   📖 **Szczegółowa instrukcja:** Zobacz `MIGRACJA_BAZY.md`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication actions
│   ├── alerts/            # Alerts management
│   ├── api/               # API routes
│   ├── bills/             # Bills listing and details
│   ├── dashboard/         # Main dashboard
│   ├── help/              # Help and FAQ
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── profile/           # User profile
│   ├── saved/             # Saved searches
│   └── settings/          # User settings
├── components/
│   ├── layout/            # Layout components (sidebar, header)
│   └── ui/                # ShadCN UI components
├── lib/
│   ├── api/               # External API integrations (Sejm, ELI)
│   ├── supabase/          # Supabase client configuration
│   └── utils.ts           # Utility functions
├── types/
│   └── supabase.ts        # TypeScript types for database
└── middleware.ts          # Auth middleware
```

## 🗄️ Database Schema

The application uses the following main tables:

- **profiles** - User profiles (extends Supabase auth.users)
- **bills** - Legislative bills/projects
- **bill_events** - Timeline events for each bill
- **user_alerts** - User notification preferences
- **saved_searches** - Saved search queries

See `supabase/schema.sql` for the complete schema with RLS policies.

## 🔌 API Integration & Data Flow

### 1. Sejm API Integration
**Implementacja**: `src/lib/api/sejm.ts`

```typescript
// Przykład użycia
const processes = await fetchSejmProcesses(term, limit)
const details = await fetchProcessDetails(term, number)
const votings = await fetchVotingResults(term, number)
```

**Funkcje**:
- `fetchSejmProcesses()` - Pobieranie listy procesów
- `fetchProcessDetails()` - Szczegóły pojedynczego procesu
- `fetchCommitteeSittings()` - Posiedzenia komisji
- `getStatusFromStages()` - Mapowanie etapów na statusy aplikacji

**Mapowanie statusów**:
```typescript
'published'      // ELI field exists
'rejected'       // passed === false
'presidential'   // Stage: prezydent
'senate'         // Stage: senat
'third_reading'  // Stage: III czytanie
'committee'      // Stage: komisja
'first_reading'  // Stage: I czytanie
'submitted'      // Wpłynął do Sejmu
'draft'          // Wstępny projekt
```

### 2. YouTube Live Detection
**Implementacja**: `src/app/api/youtube-live/route.ts`

Sprawdza czy trwa transmisja na żywo:
```typescript
const response = await fetch('https://youtube.com/@SejmRP_PL/live')
const html = await response.text()
const videoIdMatch = html.match(/"videoId":"([^"]+)"/)
```

**Refresh**: Co 30 sekund (polling w komponencie dashboard)

### 3. Resend Email Service
**Implementacja**: `src/lib/email/resend.ts`

```typescript
await sendEmail({
  to: 'user@example.com',
  subject: 'Zmiana statusu projektu ustawy',
  html: generateBillChangeEmail(notification)
})
```

**Typy wiadomości**:
- `bill_change` - Zmiana statusu projektu
- `digest` - Raport zbiorczy (dzienny/tygodniowy)
- `welcome` - Powitanie nowego użytkownika
- `consultation_start` - Rozpoczęcie konsultacji

### 4. Gemini AI Integration
**Implementacja**: `src/app/api/ai/simple-language/route.ts`

```typescript
POST /api/ai/simple-language
{
  "text": "Art. 1. Ustawa reguluje...",
  "mode": "simple" | "impact" | "summary" | "explain"
}
```

**Tryby analizy**:
- `simple` - Prosty język (struktura: Co to oznacza? / Kogo dotyczy? / Przykład)
- `impact` - Analiza skutków (obywatele / firmy / budżet / terminy)
- `summary` - Streszczenie (główne punkty, max 200 słów)
- `explain` - Wyjaśnienie (szczegółowe omówienie z przykładami)

**Obsługa błędów**:
- HTTP 429 (quota exceeded) → Przyjazny komunikat z czasem retry
- Brak API key → Fallback z podstawową funkcjonalnością
- Cache w localStorage → Ograniczenie liczby zapytań

### 5. ELI System Integration
**European Legislation Identifier**: Automatyczne linkowanie opublikowanych ustaw

```typescript
if (bill.eli) {
  const eliUrl = `https://eli.gov.pl/eli/${bill.eli}`
  // Link do oficjalnej publikacji w Dzienniku Ustaw
}
```

### Data Synchronization Flow

```
┌─────────────┐
│  Sejm API   │
└──────┬──────┘
       │ Fetch every 1h (cron)
       ↓
┌─────────────────┐
│ /api/admin/sync │ ← Manual trigger by admin
└──────┬──────────┘
       │ Parse & normalize
       ↓
┌──────────────┐
│  Supabase DB │
│   - bills    │
│   - events   │
└──────┬───────┘
       │ Real-time subscriptions
       ↓
┌──────────────┐
│   Frontend   │
│  (Server     │
│  Components) │
└──────────────┘
```

### API Routes Structure

**Public Endpoints**:
- `GET /api/youtube-live` - Status transmisji live
- `GET /api/calendar` - Wydarzenia legislacyjne
- `GET /api/search/ai` - Wyszukiwanie AI (wymaga auth)
- `POST /api/ai/simple-language` - Analiza AI (wymaga auth)

**Protected Endpoints** (wymagają autentykacji):
- `GET /api/alerts` - Lista alertów użytkownika
- `POST /api/alerts` - Utworzenie nowego alertu
- `GET /api/notifications` - Powiadomienia in-app
- `POST /api/proposals` - Propozycje obywatelskie

**Admin Endpoints** (wymagają roli admin):
- `POST /api/admin/sync` - Ręczna synchronizacja z Sejm API
- `GET /api/admin/logs` - Logi systemowe
- `PATCH /api/admin/users` - Zarządzanie użytkownikami
- `POST /api/admin/settings` - Ustawienia systemu

### Rate Limiting & Caching

**Strategia cache**:
- **Sejm API**: Cache w Supabase (aktualizacja co 1h)
- **YouTube Live**: Cache 30s w komponencie (polling)
- **AI Results**: Cache w localStorage + opcjonalnie DB
- **Static Pages**: ISR (Incremental Static Regeneration) co 60s

**Error Handling**:
- Automatic retry z exponential backoff
- Graceful degradation (fallback do cache)
- User-friendly error messages
- Detailed logging dla adminów

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (format: `https://xxx.supabase.co`) | ✅ Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key (safe for client-side) | ✅ Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key with admin privileges (server-only) | ✅ Yes | - |
| `NEXT_PUBLIC_APP_URL` | Application base URL (for OAuth redirects & emails) | ✅ Yes | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key (get from [AI Studio](https://aistudio.google.com/app/apikey)) | ⭐ Optional | - |
| `RESEND_API_KEY` | Resend API key for email notifications (get from [resend.com](https://resend.com)) | ⭐ Optional | - |
| `CRON_SECRET` | Secret token for securing cron jobs (any random string) | ⭐ Optional | - |

### Required Services Setup

#### 1. Supabase (Required)
1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep secret!**
6. Run SQL migrations from `supabase/schema.sql`

#### 2. Google Gemini AI (Optional - for AI features)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key → `GEMINI_API_KEY`

**Without this key**: AI features show basic text excerpts instead of full analysis

#### 3. Resend Email (Optional - for email notifications)
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys → Create
3. Copy key → `RESEND_API_KEY`

**Without this key**: In-app notifications work, but no emails sent

### Security Notes

⚠️ **Never commit `.env.local` to Git!**

**Public variables** (safe in client-side code):
- `NEXT_PUBLIC_*` - Accessible in browser

**Secret variables** (server-side only):
- `SUPABASE_SERVICE_ROLE_KEY` - Bypasses RLS, keep secure!
- `RESEND_API_KEY` - Can send emails from your domain
- `CRON_SECRET` - Prevents unauthorized cron triggers

### Example `.env.local`

```env
# Supabase Configuration (Required)
## 📊 Statystyki Projektu

- **Komponenty UI**: 45+ (React Server & Client Components)
- **API Endpoints**: 25+ (REST API routes)
- **Tabele w bazie**: 10 (Supabase PostgreSQL)
- **Wspierane statusy**: 12 (od draft do published)
- **Linii kodu**: ~20,000+ (TypeScript)
- **External APIs**: 4 (Sejm, YouTube, Resend, Gemini)
- **Kadencja**: X Kadencja Sejmu RP (2023-2027)
# AI Features (Optional)
GEMINI_API_KEY=AIzaSyCxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Notifications (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Cron Security (Optional)
CRON_SECRET=your-random-secret-string-here
```

> **Tip**: Use `openssl rand -hex 32` to generate secure random strings for `CRON_SECRET`

## 📚 Dokumentacja

## 🙏 Acknowledgments & Credits

### Data Sources
- **[Sejm API](https://api.sejm.gov.pl/)** - Oficjalne API Sejmu RP (dane legislacyjne)
- **[ELI System](https://eli.gov.pl/)** - European Legislation Identifier (publikacje)
- **[YouTube - Sejm RP](https://youtube.com/@SejmRP_PL)** - Transmisje na żywo z obrad

### Technologies & Services
- **[Next.js](https://nextjs.org/)** by Vercel - React framework
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service (PostgreSQL)
- **[ShadCN UI](https://ui.shadcn.com/)** - Accessible component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Resend](https://resend.com/)** - Email delivery service
- **[Google Gemini](https://ai.google.dev/)** - AI language model
- **[Vercel](https://vercel.com/)** - Deployment & hosting platform

### UI Components & Assets
- **Icons**: [Lucide React](https://lucide.dev/) - MIT License
- **Fonts**: [Geist Sans & Geist Mono](https://vercel.com/font) by Vercel
- **Markdown**: [marked](https://marked.js.org/) - Markdown parser
- **Date Formatting**: [date-fns](https://date-fns.org/) with Polish locale

### Legal & Compliance
- **RODO/GDPR** compliant data processing
- **WCAG 2.1** accessibility guidelines (partial)
- Based on **EU Commission Recommendation 2023/2785** on citizen engagement

### Special Thanks
- **Ministerstwo Cyfryzacji** - Za inspirację projektem partycypacji obywatelskiej
- **Sejm RP** - Za udostępnienie otwartych danych
- **Open Source Community** - Za nieocenione narzędzia i bibliotekiinalny dokument z wymaganiami

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🎯 Roadmap

### ✅ Faza 1 (Ukończona - 6 grudnia 2025)
- [x] Wizualizacja ścieżki legislacyjnej
- [x] Prosty język i analiza skutków (AI)
- [x] Statusy prekonsultacji i współtworzenia
- [x] Rozszerzona dokumentacja

### 🚧 Faza 2 (W planach)
- [ ] Integracja z RCL (Rządowe Centrum Legislacji)
- [ ] Agregacja konsultacji społecznych z BIP
- [ ] Parsowanie i wizualizacja OSR
- [ ] Cache'owanie wyników AI w bazie danych
- [ ] Legislative Train Schedule UI (metafora pociągów)

### 🔮 Faza 3 (Przyszłość)
- [ ] Multi-channel alerts (SMS, push notifications)
- [ ] Mobile app (React Native)
- [ ] Public API dla deweloperów
- [ ] Integracja z kalendarzem Google/Outlook
- [ ] System raportowania i analityki

## 📊 Statystyki Projektu

- **Komponenty UI**: 30+
- **API Endpoints**: 15+
- **Tabele w bazie**: 6
- **Wspierane statusy**: 12
- **Linii kodu**: ~15,000

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>Zbudowane z ❤️ dla transparentności i partycypacji obywatelskiej w Polsce</strong>
</p>

<p align="center">
  Zgodne z: <strong>ZALECENIE KOMISJI EUROPEJSKIEJ z dnia 12.12.2023 r.</strong><br>
  <em>w sprawie propagowania zaangażowania obywateli i organizacji społeczeństwa obywatelskiego</em>
</p>

## 🙏 Acknowledgments

- Data from [Sejm API](https://api.sejm.gov.pl/)
- European Legislation Identifier [ELI](https://eli.gov.pl/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)

---

<p align="center">
  Made with ❤️ for transparency in Polish legislation
</p>
