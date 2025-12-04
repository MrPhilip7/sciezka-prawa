# Ścieżka Prawa - AI Coding Instructions

## Project Overview
Polish Legislative Tracker (Next.js 16 + Supabase) that monitors Sejm/Senat proceedings, syncs bill data from official government APIs, and provides real-time legislative updates with YouTube live stream detection.

## Architecture

### Data Flow
1. **Sejm API → Sync → Supabase**: `/api/admin/sync` fetches from `api.sejm.gov.pl`, maps status based on `ELI`/`passed` fields, stores in `bills` + `bill_events` tables
2. **Server Components → Supabase → Client**: Pages use server-side `createClient()` (`src/lib/supabase/server.ts`) for data fetching
3. **Client Components → Supabase**: Use browser client (`src/lib/supabase/client.ts`) for real-time auth/profile checks

### Key Patterns

**Page Structure** (Server Component + Client Content):
```tsx
// src/app/bills/page.tsx - Server component fetches data
export default async function BillsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: bills } = await supabase.from('bills').select('*')
  return <DashboardLayout user={user}><BillsContent bills={bills} /></DashboardLayout>
}

// src/app/bills/bills-content.tsx - Client component handles UI
'use client'
export function BillsContent({ bills }: Props) { ... }
```

**User Role System** (`src/lib/admin/permissions.ts`):
- Roles: `user`, `moderator`, `admin`, `super_admin`
- Check in API routes: `if (!['admin', 'super_admin'].includes(profile.role))`
- Client-side: Fetch from `profiles` table, show admin UI conditionally

**Bill Status Mapping** (`src/lib/api/sejm.ts`):
```typescript
// Status determined by: ELI field (published), passed field, or stage analysis
'published' | 'rejected' | 'presidential' | 'senate' | 'third_reading' | 'second_reading' | 'committee' | 'first_reading' | 'submitted' | 'draft'
```

## External API Integration

**Sejm API** (`api.sejm.gov.pl`):
- `/sejm/term10/processes` - Legislative processes list
- `/sejm/term10/processes/{number}` - Process details with `stages[]`, `ELI`, `passed`
- `/sejm/term10/committees/{code}/sittings` - Committee meetings with video URLs

**YouTube Live Detection** (`/api/youtube-live`):
- Scrapes `youtube.com/@SejmRP_PL/live` for active streams
- Returns `{ isLive, videoId, title, channelUrl }`

## Database Schema

**Core Tables** (see `supabase/schema.sql`):
- `bills`: Legislative items with `sejm_id`, `status`, `ministry`, `tags[]`
- `bill_events`: Timeline events linked to bills
- `profiles`: User data with `role` enum
- `user_alerts`: Notification preferences per bill

**RLS**: Uses `SUPABASE_SERVICE_ROLE_KEY` for admin sync operations to bypass row-level security.

## Development Commands
```bash
npm run dev          # Start with Turbopack (port 3000)
npm run build        # Production build
```

**Manual Sync**: POST to `/api/admin/sync` (requires authenticated admin user)

## Conventions

### Component Organization
- `/components/ui/` - ShadCN primitives (Button, Card, Badge, etc.)
- `/components/layout/` - Sidebar, Header, MobileNav, DashboardLayout
- `/components/accessibility/` - Contrast modes, font sizes
- `/app/{route}/{route}-content.tsx` - Client component pattern

### Polish Language
- All UI text in Polish
- Status labels: `Opublikowana`, `Senat`, `Komisja`, `I/II/III Czytanie`
- Date formatting: `date-fns` with `{ locale: pl }`

### Styling
- Tailwind CSS with dark mode (`dark:` variants)
- Theme: `ThemeProvider` with `light`/`dark`/`system`
- Accessibility: `AccessibilityProvider` for contrast/font-size modes

## Key Files Reference
- `src/app/api/admin/sync/route.ts` - Bill sync logic, status mapping
- `src/lib/api/sejm.ts` - Sejm API client, `getStatusFromStages()`
- `src/types/supabase.ts` - Generated types including `BillStatus`, `UserRole`
- `src/lib/admin/permissions.ts` - Role-based access helpers
- `supabase/schema.sql` - Database schema with RLS policies
