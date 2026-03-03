# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-06

### ✨ Added - Faza 1

#### Nowe Funkcjonalności
- **Wizualizacja Ścieżki Legislacyjnej** - Graficzny timeline procesu legislacyjnego od współtworzenia do publikacji
  - 11 etapów z kolorowymi ikonami
  - Wyświetlanie dat dla ukończonych etapów
  - Pulsujące animacje dla aktualnego etapu
  - Responsywny design i dark mode
  - Komponent: `src/components/bills/legislative-timeline.tsx`

- **System Prostego Języka (AI)** - Tłumaczenie tekstów prawnych na zrozumiały język
  - 4 tryby: Prosty Język, Analiza Skutków, Streszczenie, Wyjaśnienie
  - Integracja z Google Gemini 2.0 Flash
  - Fallback bez API key
  - Komponent: `src/components/bills/simple-language-helper.tsx`
  - API: `POST /api/ai/simple-language`

#### Nowe Statusy Legislacyjne
- `co_creation` - Współtworzenie (wczesne konsultacje z obywatelami)
- `preconsultation` - Prekonsultacje (przed etapem RCL)

#### Nowe Pola w Bazie Danych
- `bills.rcl_id` - ID projektu w Rządowym Centrum Legislacji
- `bills.consultation_start_date` - Data rozpoczęcia konsultacji
- `bills.consultation_end_date` - Data zakończenia konsultacji
- `bills.consultation_url` - Link do konsultacji społecznych
- `bills.impact_assessment_url` - Link do OSR (Ocena Skutków Regulacji)
- `bills.simple_language_summary` - Cache wyników AI

#### Nowe Zakładki w UI
- **Ścieżka Legislacyjna** - wizualizacja timeline na stronie szczegółów ustawy
- **Prosty Język** - pomoc AI w zrozumieniu dokumentów prawnych

### 📚 Documentation
- Dodano `FAZA1_COMPLETED.md` - szczegółowy opis zrealizowanych funkcjonalności
- Dodano `INSTRUKCJA_UZYTKOWNIKA.md` - przewodnik dla użytkowników końcowych
- Dodano `MIGRACJA_BAZY.md` - instrukcja migracji bazy danych
- Dodano `API_DOCUMENTATION.md` - dokumentacja endpointu prostego języka
- Zaktualizowano `README.md` z nowymi funkcjami i roadmapą

### 🔄 Changed
- Rozszerzono typ `BillStatus` o nowe statusy (`co_creation`, `preconsultation`)
- Zaktualizowano `statusConfig` w komponencie szczegółów ustawy
- Rozszerzono funkcję `getStatusFromStages()` o mapowanie nowych statusów
- Dodano numerację kroków (step numbers) w statusach (0-10 zamiast 0-8)

### 🗄️ Database
- Migracja: `supabase/migrations/001_add_preconsultation_status.sql`
- Nowy enum values w `bill_status`
- 6 nowych kolumn w tabeli `bills`
- Nowy indeks: `idx_bills_rcl_id`

### 🛠️ Technical
- TypeScript types zaktualizowane w `src/types/supabase.ts`
- Dodano wsparcie dla Gemini API (opcjonalne)
- Kompatybilność z WCAG 2.1 AA
- Zgodność z RODO (żadne dane osobowe do AI bez zgody)

### 🎨 UI/UX
- Nowe ikony w timeline (Users, FileText, Building2, Scale, Eye, CheckCircle2)
- Kolorystyka dla nowych statusów (pink dla współtworzenia, violet dla prekonsultacji)
- Responsywny layout dla mobile
- Dark mode support

---

## [1.0.0] - 2025-11-XX

### Initial Release

#### Core Features
- Real-time synchronizacja z API Sejmu RP
- System wyszukiwania i filtrowania ustaw
- System alertów dla użytkowników
- Wizualizacja postępu legislacyjnego (basic timeline)
- Profile użytkowników
- Panel administracyjny
- YouTube live stream detection

#### Tech Stack
- Next.js 15 App Router
- Supabase (Auth + Database)
- TypeScript
- Tailwind CSS + ShadCN UI
- AI Assistant (Gemini)

#### Database Schema
- `bills` - Projekty ustaw
- `bill_events` - Wydarzenia timeline
- `profiles` - Profile użytkowników z rolami
- `user_alerts` - Preferencje powiadomień
- `saved_searches` - Zapisane wyszukiwania
- `activity_logs` - Logi aktywności

#### API Routes
- `/api/admin/sync` - Synchronizacja z Sejm API
- `/api/admin/users` - Zarządzanie użytkownikami
- `/api/youtube-live` - Detekcja live streamów
- `/api/votings/[id]` - Wyniki głosowań
- `/api/ai/chat` - AI Assistant

#### Authentication
- Email/Password auth via Supabase
- Role-based access control (user, moderator, admin, super_admin)
- Row Level Security (RLS) policies

---

## Roadmap

### [1.2.0] - Faza 2 (Planowane - Q1 2025)

#### Planned Features
- [ ] Integracja z RCL (Rządowe Centrum Legislacji)
- [ ] Scraping konsultacji społecznych z BIP
- [ ] Parsowanie i wizualizacja OSR (PDF)
- [ ] Cache'owanie wyników AI w bazie
- [ ] Legislative Train Schedule UI
- [ ] Multi-channel alerts (SMS, push)
- [ ] Public API dla deweloperów

### [1.3.0] - Faza 3 (Przyszłość)

#### Future Plans
- [ ] Mobile app (React Native)
- [ ] Integracja z kalendarzem
- [ ] Advanced analytics dashboard
- [ ] Eksport do PDF/DOCX
- [ ] Wsparcie dla wielu języków
- [ ] Community features (komentarze, dyskusje)

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.1.0 | 2025-12-06 | Faza 1: Ścieżka legislacyjna + Prosty język |
| 1.0.0 | 2025-11-XX | Initial release |

---

## Contributing

See our [Contributing Guidelines](CONTRIBUTING.md) for details on:
- Code style
- Commit messages
- Pull request process
- Issue reporting

---

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

**Questions or suggestions?** Open an issue on GitHub!
