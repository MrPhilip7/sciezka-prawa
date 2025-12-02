# Ścieżka Prawa - Polish Legislative Tracker

<p align="center">
  <strong>Śledź proces legislacyjny w Polsce</strong>
</p>

<p align="center">
  Platforma umożliwiająca śledzenie procesu legislacyjnego w Polsce. Monitoruj projekty ustaw, otrzymuj powiadomienia i bądź świadomym obywatelem.
</p>

---

## 🚀 Funkcje

- **Real-time Bill Updates** - Automatyczne pobieranie danych z API Sejmu i systemu ELI
- **Search and Filter** - Wyszukiwanie ustaw według statusu, ministerstwa, daty
- **Interactive Timeline** - Wizualizacja procesu legislacyjnego
- **Alerts System** - Powiadomienia email o zmianach w śledzonych projektach
- **User Profiles** - Personalizowane konto z zapisanymi wyszukiwaniami

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
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL Editor:
   ```bash
   # Copy contents from supabase/schema.sql and run in Supabase SQL Editor
   ```

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

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | Application URL (for OAuth redirects) |

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data from [Sejm API](https://api.sejm.gov.pl/)
- European Legislation Identifier [ELI](https://eli.gov.pl/)
- UI components from [ShadCN UI](https://ui.shadcn.com/)

---

<p align="center">
  Made with ❤️ for transparency in Polish legislation
</p>
