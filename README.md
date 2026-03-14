# MedixPrep

AI-powered EMS certification prep for **NREMT** candidates — built with **protocol-verified guidance**, **FSRS-6 spaced repetition**, and **clinical scenario-style learning**.

> ⚠️ Educational purposes only. Always follow your local EMS protocols and medical direction.

## What it is

MedixPrep is a Next.js app that aims to be “**the UWorld for NREMT**” by combining:

- **ARIA AI Tutor**: protocol-aware tutoring designed to avoid unsafe hallucinations
- **FSRS-6 spaced repetition**: retention-oriented review scheduling
- **Guideline-driven study**: content aligned with **AHA 2025 BLS**
- **Practice questions & explanations**: “UWorld-quality” style question bank + reasoning
- **Analytics**: mastery tracking and retention-focused progress

## Tech stack

- **Framework**: Next.js (App Router) + React
- **Language**: TypeScript
- **Auth / User**: Supabase (SSR + server client)
- **State / Data**: Zustand, TanStack React Query
- **UI**: Tailwind CSS + Radix UI + lucide-react + framer-motion
- **AI SDKs**: OpenAI SDK, Anthropic SDK, `ai`
- **Payments**: Stripe
- **Caching/kv**: Upstash Redis

## App structure (high level)

- `app/` — Next.js App Router pages and API routes
  - `app/page.tsx` — marketing/landing page (pricing, features, CTAs)
  - `app/(dashboard)/...` — authenticated app areas (e.g., dashboard/study)
  - `app/auth/callback/route.ts` — Supabase auth callback handler
- `middleware.ts` — route protection + auth redirects via Supabase SSR cookies
- `components/`, `lib/`, `types/` — shared UI, utilities, and types

## Authentication & protected routes

The app uses Supabase authentication and a middleware gate.

### Protected paths

Unauthenticated users are redirected to `/login` when attempting to access:

- `/dashboard`
- `/study`
- `/api/ai`
- `/api/study`

Authenticated users visiting `/login` or `/signup` are redirected to `/dashboard`.

## Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Set environment variables

Create a `.env.local` with at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

(You may also need additional keys depending on which features you enable: AI providers, Stripe, Upstash, etc.)

### 3) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

```bash
npm run dev     # start dev server
npm run build   # production build
npm run start   # run production server
npm run lint    # run ESLint
```

## Deployment

The repo includes `vercel.json`, and the app is set up in a Vercel-friendly way (Next.js + environment variables).

## License

See `LICENSE`.