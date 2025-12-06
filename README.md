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

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [Tailwind CSS](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)
- **Backend**: [Supabase](https://supabase.com/) (Auth, Database, Edge Functions)
- **Language**: TypeScript
- **Deployment**: [Vercel](https://vercel.com/)

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

## 🔌 API Integration

### Sejm API
Integration with the Polish Parliament (Sejm) API for fetching:
- Legislative processes
- Parliamentary prints (druki)
- Voting records

### ELI API
Integration with European Legislation Identifier for:
- Published acts
- Legal document metadata

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

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin operations) | ✅ Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL (for OAuth redirects) | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key (for AI features) | ⭐ Optional |

> **Uwaga:** Funkcje AI (Prosty Język, Analiza Skutków) działają bez `GEMINI_API_KEY`, ale z ograniczoną funkcjonalnością.

## 📚 Dokumentacja

- 📖 **[Przewodnik Użytkownika](INSTRUKCJA_UZYTKOWNIKA.md)** - Jak korzystać z nowych funkcji
- 🗄️ **[Migracja Bazy Danych](MIGRACJA_BAZY.md)** - Instrukcja aktualizacji schemy DB
- 📡 **[API Documentation](API_DOCUMENTATION.md)** - Dokumentacja endpoint `/api/ai/simple-language`
- ✅ **[Faza 1 - Completed](FAZA1_COMPLETED.md)** - Szczegóły zrealizowanych funkcjonalności
- 📋 **[Wymagania Projektu](pattern/projekt.md)** - Oryginalny dokument z wymaganiami

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
