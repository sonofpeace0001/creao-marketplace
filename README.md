# CREAO Marketplace

A marketplace for shippable landing pages and components — modeled on [21st.dev](https://21st.dev/community/components), built to fill the gap it leaves: 21st.dev only ships tiny React/Tailwind UI snippets. This ships full, framework-agnostic, production-ready **pages**, not just components, with a live interactive preview, one-click code copy, and — for every seeded item — **the exact AI prompt that generated it**, so anyone can regenerate or customize it via [CREAO's own agent](https://agent.creao.ai/@Sonofpeace). No other component marketplace ships that.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind v4, backed by Supabase (Postgres + Auth + Storage).

## Seeded content

Seeded at launch with the 100 pages from [creao-landing-page-pack](https://github.com/sonofpeace0001/creao-landing-page-pack) (live at [creao-landing-page-pack.vercel.app](https://creao-landing-page-pack.vercel.app)) — those pages stay hosted there; this app links out to them (`source_type = 'external_url'`) rather than duplicating their HTML into Supabase.

## Data model

- `profiles` — one per creator, auto-created on signup.
- `items` — unified table for both `kind = 'component'` and `kind = 'page'` listings, discriminated `category` (saas / local_service / retail / real_estate / institutions / portfolio_creative), price-ready (`price_cents`) but no payment integration wired yet.
- `categories` — small lookup/reference table.
- `purchases` — schema only; no checkout flow in this version.

See `supabase/migrations/` for the full schema and RLS policies, and `supabase/seed/seed_creao_pack.ts` for the one-time script that seeded the 100 pack pages.

## What's live in this version

- Browse/search/filter (kind, category, theme, free vs. paid)
- Item detail page: live sandboxed iframe preview, full HTML source viewer with copy, and — for pack items — the original AI prompt with its own copy button
- Email/password auth (Supabase Auth)
- Creator dashboard: publish a new item (paste HTML + upload a thumbnail), edit metadata, delete

## Explicitly not in this version

Live Stripe/crypto checkout, one-click hosted deploy-per-item, ratings/reviews, teams/orgs, a CLI installer, GitHub OAuth, admin moderation. `price_cents` and the `purchases` table exist so a payment integration is a schema-free follow-up, not a migration.

## Local development

```bash
npm install
npm run dev
```

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`).
