# Roadmap

Personal interactive roadmap and progress tracking for learning goals and professional development.

Track weighted progress across projects, sections, and steps. Log study time manually, visualize your path, and see how far you've come.

## Tech stack

- Next.js (App Router) + TypeScript + React
- Tailwind CSS + shadcn/ui
- Framer Motion + dnd-kit
- TanStack Query
- Zod + React Hook Form
- Supabase (PostgreSQL) — optional; local storage works out of the box
- Vercel

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo data loads automatically on first visit (stored in `localStorage`).

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

When unset, the app runs fully on browser local storage.

## Supabase setup

1. Create a Supabase project.
2. Run migrations from `supabase/migrations/`.
3. Set environment variables above.
4. (Optional) Enable email auth and RLS policies are already defined in the migration.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest unit tests |

## Architecture

```
lib/domain/       — types, weighted progress, time formatting, validation
lib/storage/      — localStorage persistence
lib/supabase/     — Supabase client (when configured)
providers/        — app data context, theme, react-query
components/       — UI, layout, project workspace
app/(app)/        — dashboard, projects, activity, settings
supabase/         — SQL migrations
tests/            — domain unit tests
```

Progress and time totals are **derived** from steps and time logs — not stored redundantly.

## Vercel deployment

1. Push to GitHub.
2. Import project in Vercel.
3. Add Supabase env vars (optional).
4. Deploy — Next.js builds with zero config.

CI runs lint, typecheck, tests, and build via GitHub Actions.

## Post-MVP (deferred)

- Live study timer with pause/resume
- Automatic TimeLog from timer sessions
- Roadmap import / templates
- Richer analytics
