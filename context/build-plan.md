# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Environment Setup
Initialize the project with Next.js, Tailwind v4, and shadcn/ui.
**Logic:**
- Clean install Next.js app router.
- Apply tokens from `ui-tokens.md` and establish global CSS.

### 02 Database & Auth Initialization
Set up InsForge Auth and Convex.
**Logic:**
- Configure InsForge Auth clients (`insforge-client.ts` and `insforge-server.ts`).
- Configure Convex provider.
- Implement InsForge Webhook at `/api/webhooks/insforge` to sync users into the Convex `users` table upon registration.

### 03 Landing Page & Shell
Build the marketing landing page and application shell.
**UI:**
- Navbar — Logo, Dashboard, Settings, Login CTA
- Landing Page Hero section — Value proposition, "Start Tracking" button.
- Pricing overview.
**Logic:**
- Unauthenticated users clicking "Dashboard" redirect to InsForge login.

---

## Phase 2 — The Watcher & Messenger

### 04 Blockchain Webhooks (Helius & Alchemy)
Build the ingestion endpoints for Solana trades.
**Logic:**
- Create `/api/webhooks/helius` and `/api/webhooks/alchemy`.
- Implement signature verification for both endpoints.
- Parse payload (Swap events) and extract token mint, amount, liquidity.
- Push parsed events via Convex Mutation to `alerts` table.

### 05 Telegram Bot (grammY)
Set up the messaging infrastructure.
**Logic:**
- Initialize grammY instance.
- Build `/api/webhooks/telegram` to receive updates.
- Implement `/start <token>` command logic to link a Telegram `chat_id` to a Convex user profile.
- Create a Convex action/worker that triggers when a new alert is added to send DMs to premium users.

---

## Phase 3 — The Signal (Dashboard)

### 06 Live Alert Feed
Build the core value feature: real-time alerts on the web dashboard.
**UI:**
- Feed table displaying Token Symbol, Trade Type (Buy/Sell), Amount, Risk Score, Timestamp, and links to DexScreener.
**Logic:**
- Use Convex `useQuery` to stream the latest `alerts` from the database in real-time.

### 07 Wallet Leaderboard
Display the performance of tracked "Smart Money" wallets.
**UI:**
- Leaderboard table showing Wallet Alias/Address, Win Rate, and 7-day P/L.
**Logic:**
- Fetch data from Convex `targetWallets` table.

---

## Phase 4 — Personalization

### 08 Alert Filters
Allow users to reduce noise.
**UI:**
- Settings page section: Minimum Liquidity Input, Minimum Volume Input, Max Risk Score slider.
**Logic:**
- Save user preferences to Convex `alertSettings`.
- Update the Telegram Bot broadcasting logic to respect these filters before sending a DM.

### 09 Personal Watchlists
Let users track their own custom wallets.
**UI:**
- Input to add Solana Address and a custom Label.
- List of currently tracked personal wallets.
**Logic:**
- Save to Convex `watchlists` table.

---

## Phase 5 — Monetization

### 10 Stripe Integration
Implement subscription billing.
**UI:**
- "Subscribe to Premium" button on the dashboard for free users.
- "Manage Billing" button for premium users.
**Logic:**
- Create Stripe Checkout Sessions.
- Build `/api/webhooks/stripe` to handle `checkout.session.completed` and `customer.subscription.deleted`.
- Update Convex user profile `isPremium` status based on Stripe webhooks.
- Gate the Telegram Bot alerts and advanced dashboard features so only `isPremium === true` users have access.

---

## Feature Count

| Phase                           | Features |
| ------------------------------- | -------- |
| Phase 1 — Foundation            | 3        |
| Phase 2 — Watcher & Messenger   | 2        |
| Phase 3 — The Signal            | 2        |
| Phase 4 — Personalization       | 2        |
| Phase 5 — Monetization          | 1        |
| **Total**                       | **10**   |
