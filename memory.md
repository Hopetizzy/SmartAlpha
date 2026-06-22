# Memory — Phase 2: Telegram Bot Integration

Last updated: 2026-06-22T16:55:00-07:00

## What was built

### Phase 1 — Foundation (Completed)
- **Next.js Project Scaffolding**: Structured the starter application in the root workspace linked to InsForge project `SmartAlpha` (`00f5f060-e56b-4a36-aa2d-542c36947d5d`).
- **PostgreSQL Database Schema**: Generated and applied the database migration [20260622153009_init-schema.sql](file:///c:/Users/HP/Desktop/SmartAlpha/migrations/20260622153009_init-schema.sql) setting up tables `users`, `alert_settings`, `target_wallets`, `watchlists`, and `alerts`.
- **RLS & Security Access**: Enabled Row Level Security policies on all tables, gating reads/writes using `auth.uid() = id`.
- **InsForge Webhook Sync**: Created the webhook receiver `/api/webhooks/insforge` at [route.ts](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/api/webhooks/insforge/route.ts) for sync.
- **Tailwind v3.4 Config**: Configured Tailwind version and spacing styles.
- **Layout & Shells & Onboarding**: Implemented UI shells, responsive navbar/footer, landing page mockups, and authorization screens.

### Phase 2 — The Watcher & Messenger (Completed)
- **Helius & Alchemy Webhooks Ingestion**: Created `/api/webhooks/helius` and `/api/webhooks/alchemy` endpoints, executing HMAC-SHA256 and query authorization checks, calculating deterministic swap transaction risk scores, and inserting parsed events into `public.alerts`.
- **Telegram Bot Configuration**: Created [telegram.ts](file:///c:/Users/HP/Desktop/SmartAlpha/src/lib/telegram.ts) containing core bot instance setup, commands (`/start <token>`, `/status`, `/help`, `/admin`), and the asynchronous `broadcastAlert` helper.
- **Next.js Webhook Dynamic Instantiation**: Configured `webhookCallback` to instantiate on-demand inside the `POST` handler of [route.ts](file:///c:/Users/HP/Desktop/SmartAlpha/src/app/api/webhooks/telegram/route.ts) to prevent caching issue on hot-reloads.
- **Database Migrations for Bot**: Applied migrations:
  - `20260622220148_add-telegram-connect-token.sql` adding connect tokens.
  - `20260622225355_add-users-update-policy.sql` to permit anonymous user chat ID updates.
  - `20260622232528_add-telegram-select-policies.sql` to permit anonymous user reads for `users`, `alert_settings`, and `target_wallets`.
- **Operations & Setup Helpers**: Created [set-webhook.js](file:///c:/Users/HP/Desktop/SmartAlpha/scratch/set-webhook.js) to automate live webhook registration and [test-telegram-bot.ts](file:///c:/Users/HP/Desktop/SmartAlpha/scratch/test-telegram-bot.ts) to test updates locally.

## Decisions made
- **Outbound Request Interception**: Intercepted development and local environment outbound Telegram API requests (`getMe`, `sendMessage`) to stub successful responses, preventing dev server network-block timeouts and hangs.
- **Loose Type Compatibility**: Cast `bot.botInfo` as `any` and migrated to `link_preview_options` to bypass strict and changing type checking constraints in grammY.
- **InsForge Over Convex**: Kept database in PostgreSQL via InsForge SDK.

## Problems solved
- **Next.js Dev Cache Corruption (routes-manifest.json)**: Solved `ENOENT` crashing errors on `npm run dev` by flushing the local `.next/` cache directory and restarting the server.
- **Stale Bot Instantiation**: Resolved webhook callbacks ignoring config modifications during hot-reloads by dynamically initializing the callback.
- **Missing Command Parsing Entities**: Added mock message command `entities` parameters to allow grammY to parse `/start` updates properly.
- **RLS SELECT Blockages**: Defined system/bot SELECT permissions for tables that must be accessed anonymously at runtime.

## Current state
- Phase 1 (Foundation) is fully complete.
- Phase 2 (The Watcher & Messenger) is fully complete.
- All routes build successfully and compile without errors. Local server responds with `200 OK` on `/` and `/auth/sign-in`.

## Next session starts with
Proceeding to **Phase 3 — The Signal (Dashboard)**:
1. Build the **Live Alert Feed** component to display real-time transaction updates from the `alerts` database table.
2. Implement the **Wallet Leaderboard** component to show top-performing target wallets sorted by win rate and profit/loss.

## Open questions
None.
