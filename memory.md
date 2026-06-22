# Memory — Phase 1: Foundation

Last updated: 2026-06-22T11:36:00-07:00

## What was built

- **Next.js Project Scaffolding**: Structured the starter application in the root workspace linked to InsForge project `SmartAlpha` (`00f5f060-e56b-4a36-aa2d-542c36947d5d`).
- **PostgreSQL Database Schema**: Generated and applied the database migration [20260622153009_init-schema.sql](file:///c:/Users/HP/Desktop/SmartAlpha/migrations/20260622153009_init-schema.sql) setting up:
  - `users` (references `auth.users`)
  - `alert_settings` (user signal filter settings)
  - `target_wallets` (leaderboard tracked address indexes)
  - `watchlists` (user personalized wallet trackers)
  - `alerts` (database swap transaction entries)
- **RLS & Security Access**: Enabled Row Level Security policies on all tables, gating reads/writes using `auth.uid() = id` (or `user_id`).
- **InsForge Webhook Sync**: Created the webhook receiver `/api/webhooks/insforge` at [route.ts](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/api/webhooks/insforge/route.ts) that automatically creates user profiles and establishes default `alert_settings` on registration.
- **Tailwind v3.4 Config**: Locked Tailwind CSS to version 3.4.17 in `package.json` (per user rules) and mapped design system HSL variables to utility classes in [tailwind.config.ts](file:///c:/Users/HP/Desktop/SmartAlpha/tailwind.config.ts) and [globals.css](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/globals.css).
- **Layout & Shells**: Refactored [site-shell.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/site-shell.tsx) to align content spacing to the 32px layout rule. Created [Navbar.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/layout/Navbar.tsx) (with active state tracking) and [Footer.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/layout/Footer.tsx). Added logo tab favicon mapping in [layout.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/layout.tsx).
- **Onboarding Screens**: Updated [auth-shell.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/auth-shell.tsx), [sign-in-form.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/sign-in-form.tsx), and [sign-up-form.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/sign-up-form.tsx) with design system tokens and a premium green-and-blue radial background.
- **Landing Page Mockups**: Programmed the landing page at [page.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/page.tsx) with a subtle watermark backdrop and created [dashboard-preview.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/dashboard-preview.tsx) displaying ticking simulated transactions and interactive configurations.

## Decisions made

- **InsForge Over Convex**: Although context files mentioned Convex, we migrated database operations to InsForge's PostgreSQL database to align with the core rules defined in [AGENTS.md](file:///c:/Users/HP/Desktop/SmartAlpha/AGENTS.md).
- **Webpack Tailwind version**: Adhered to Tailwind 3.4 over v4, matching the configuration settings.
- **Isolated Stacking**: Configured isolation layout scopes for watermark alignments.

## Problems solved

- **Webpack Compilation Crash**: Fixed Next.js runtime import failure `Cannot find module './331.js'` by flushing and rebuilding the local `.next/` cache.
- **Hero Watermark Hidden**: Fixed background watermark logo hiding behind container cards by adding `isolate` class context on the parent section and raising opacity to `0.08` to make it visible.
- **Duplicate Registration Webhooks**: Resolved crash potentials on webhook retries by introducing database checking checkpoints prior to inserts (idempotence).

## Current state

- Phase 1 (Foundation) is fully complete.
- Visual elements are fully registered in [ui-registry.md](file:///c:/Users/HP/Desktop/SmartAlpha/context/ui-registry.md).
- Development server is running and the build completes successfully with 0 errors.

## Next session starts with

Proceeding to **Phase 2 — The Watcher & Messenger**:
1. Create the ingestion endpoints for Helius and Alchemy webhooks at `/api/webhooks/helius` and `/api/webhooks/alchemy`.
2. Implement transaction swap signature parsing, verify credentials, and write mutations that insert these events as `alerts` entries into the database.

## Open questions

None.
