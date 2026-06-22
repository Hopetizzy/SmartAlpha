# Architecture

## Stack

| Layer                          | Tool                     | Purpose                                          |
| ------------------------------ | ------------------------ | ------------------------------------------------ |
| Framework                      | Next.js 16 (App Router)  | Full stack framework, UI, and API routes         |
| Auth                           | InsForge Auth            | Secure user authentication and session management|
| Database & Realtime Backend    | Convex                   | Database, real-time data sync, background jobs   |
| Payments                       | Stripe                   | Subscription billing and payment processing      |
| Telegram Bot Framework         | grammY                   | High-performance Telegram bot                    |
| Blockchain Webhooks (Solana)   | Helius & Alchemy         | Real-time transaction monitoring and data        |
| Styling                        | Tailwind CSS v4          | UI components and styling                        |
| UI Components                  | shadcn/ui                | Accessible, customizable component primitives    |
| Language                       | TypeScript strict        | Throughout                                       |

---

## Folder Structure

```
/
├── AGENTS.md
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout
│   ├── page.tsx                            → Landing Page (Marketing)
│   ├── dashboard/
│   │   └── page.tsx                       → Live Alert Feed & Leaderboard
│   ├── settings/
│   │   └── page.tsx                       → Alert Filters & Telegram connection
│   └── api/
│       └── webhooks/
│           ├── insforge/route.ts          → Syncs users to Convex upon sign up
│           ├── stripe/route.ts            → Handles subscription status updates
│           ├── helius/route.ts            → Processes Solana trades from Helius
│           ├── alchemy/route.ts           → Processes Solana trades from Alchemy
│           └── telegram/route.ts          → Receives commands (/start) via grammY
├── convex/
│   ├── schema.ts                          → Convex database schema
│   ├── users.ts                           → Queries/mutations for users
│   ├── alerts.ts                          → Queries/mutations for alerts
│   ├── wallets.ts                         → Target wallets & leaderboards
│   └── http.ts                            → Optional internal HTTP endpoints
├── bot/
│   ├── index.ts                           → grammY bot initialization
│   ├── commands.ts                        → /start, /account, admin commands
│   └── messenger.ts                       → Logic to format and send alerts
├── components/
│   ├── ui/                                → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── dashboard/
│   │   ├── AlertFeed.tsx
│   │   ├── WalletLeaderboard.tsx
│   │   └── AlertFilters.tsx
│   └── settings/
│       ├── TelegramConnect.tsx
│       ├── SubscriptionManager.tsx
│       └── Watchlist.tsx
├── lib/
│   ├── insforge-client.ts                 → InsForge browser client
│   ├── insforge-server.ts                 → InsForge server client
│   ├── utils.ts                           → Shared utility functions
│   └── tokens.ts                          → Token pricing and enrichment helpers
└── types/
    └── index.ts                           → Global TypeScript types
```

---

## System Boundaries

| Folder        | Owns                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| `app/`        | Pages and Webhook API routes only. No heavy business logic.                                            |
| `convex/`     | All database schemas, queries, and mutations.                                                          |
| `bot/`        | Telegram bot logic (grammY). Parsing commands and formatting messages.                                 |
| `components/` | UI only. No direct API calls, uses Convex hooks (`useQuery`, `useMutation`).                           |
| `lib/`        | Third party client initialisation and shared utilities only.                                           |

---

## Data Flow

### The Watcher (Blockchain to Database)

```
Target Wallet executes a Swap on Solana
        ↓
Helius / Alchemy Webhook triggered
        ↓
POST app/api/webhooks/[provider]/route.ts
        ↓
Extracts token, amount, liquidity
        ↓
Convex Mutation inserts new Alert
        ↓
Dashboard UI updates automatically (via Convex Reactivity)
```

### The Messenger (Alerting Premium Users)

```
New Alert inserted into Convex
        ↓
Convex Action/Worker triggered
        ↓
Fetches all Users where isPremium === true
        ↓
Filters against individual User Alert Settings
        ↓
Calls bot/messenger.ts via grammY
        ↓
Telegram API delivers Push Notification
```

### Authentication & Subscriptions

```
User registers via InsForge Auth
        ↓
InsForge Webhook POSTs to app/api/webhooks/insforge
        ↓
Convex Mutation creates User record

User pays via Stripe Checkout
        ↓
Stripe Webhook POSTs to app/api/webhooks/stripe
        ↓
Convex Mutation updates User (isPremium: true)
```

### Telegram Connection

```
User clicks "Connect" on Dashboard
        ↓
Gets unique connection token
        ↓
User messages Bot: /start <token>
        ↓
Telegram Webhook POSTs to app/api/webhooks/telegram
        ↓
grammY handles command, links chat_id to User in Convex
```

---

## Convex Database Schema

### `users`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| _id                 | Id<"users"> | Convex internal ID                           |
| insforgeId          | string      | Link to InsForge Auth ID                     |
| email               | string      |                                              |
| telegramChatId      | string      | For sending DMs (null if not connected)      |
| isPremium           | boolean     | True if active Stripe subscription           |
| stripeCustomerId    | string      |                                              |
| createdAt           | number      | Unix timestamp                               |

### `alertSettings`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| userId              | Id<"users"> |                                              |
| minLiquidity        | number      | Ignore trades for tokens below this USD val  |
| minVolume           | number      | Ignore trades below this USD val             |
| maxRiskScore        | number      | 0-100 threshold                              |

### `targetWallets`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| _id                 | Id<"wallets">|                                             |
| address             | string      | Solana public key                            |
| label               | string      | e.g., "Whale #1", "High Win Rate"            |
| winRate             | number      | percentage (0-100)                           |
| profitLoss7d        | number      | USD value                                    |

### `watchlists`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| userId              | Id<"users"> |                                              |
| walletAddress       | string      | Custom wallet user is tracking               |
| label               | string      | Custom label                                 |

### `alerts`

| Column              | Type        | Notes                                        |
| ------------------- | ----------- | -------------------------------------------- |
| _id                 | Id<"alerts">|                                              |
| walletAddress       | string      | Which wallet made the trade                  |
| tokenMint           | string      | Token contract address                       |
| tokenSymbol         | string      |                                              |
| type                | string      | "BUY" or "SELL"                              |
| amountUsd           | number      |                                              |
| riskScore           | number      | 0-100 calculated score                       |
| timestamp           | number      |                                              |

---

## Invariants

Rules the AI agent must never violate:

- **Security over Speed**: Never build logic that accepts deposits or handles user trading funds. This is an informational SaaS only.
- **Webhook Integrity**: Every webhook (InsForge, Stripe, Helius, Alchemy, Telegram) MUST implement strict signature verification.
- **Single Bot Paradigm**: Always use one centralized Telegram bot. Do not create separate bots for separate users.
- **Convex Centralization**: All heavy data reads and writes must go through Convex. Do not bypass Convex to store data in external databases.
- **UI Constraints**: No hardcoded hex values or raw Tailwind color classes in components. Use CSS variables from `ui-tokens.md`.
- **Serverless Limits**: Keep webhook processing logic lean. If processing a blockchain event requires complex enrichment, push it to a Convex background action to return a fast 200 OK to Helius/Alchemy.
