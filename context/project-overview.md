# Project Overview

## About the Project

Smart Alpha is a Solana-based "Smart Money" tracking SaaS platform. It monitors the blockchain in real-time for trades executed by highly profitable wallets and sends instant alerts to users via a Telegram bot. Subscribers access a web dashboard to configure their personal alert filters, track the performance of these "smart" wallets, and manage their own custom watchlists.

The platform is designed to provide actionable intelligence with low latency, helping users make informed trading decisions without the noise typical of social media hype.

---

## The Problem It Solves

Memecoin and crypto trading is highly volatile, and by the time a token reaches mainstream social media, the most profitable entry points have passed. 

Smart Alpha eliminates the "blind following" problem by providing a deterministic, data-driven approach. By tracking wallets with proven win rates in real-time, users can identify high-conviction trades instantly. The platform filters out the noise (e.g., low liquidity, high-risk contracts) and delivers high-signal alerts directly to the user's phone, acting as a real-time decision support system.

---

## Pages

```
/                  → Landing Page (Marketing, value props, pricing, hero section)
/dashboard         → Live Alert Feed, Wallet Leaderboard, Dashboard Stats
/settings          → Alert filters, Personal Watchlists, Telegram connection
/api/webhooks/*    → Webhook endpoints (Helius, Alchemy, Stripe, InsForge, Telegram)
```

---

## Navigation

Top navbar. Clean and minimal.

```
Dashboard    Settings    [User Profile Dropdown]
```

Full width layout on all pages. Minimalist, premium data-dense aesthetic.

---

## Core User Flow

### Landing Page
- Hero section explaining the value proposition.
- Pricing overview.
- Logged in users → redirect to dashboard
- Logged out users → Sign in / Sign up CTA

### Onboarding
- User signs up via InsForge Auth (Google, GitHub, Email).
- InsForge Webhook creates the user in the Convex database.
- On login → redirect to `/dashboard`.
- If Telegram is not connected, the dashboard shows a persistent banner instructing them to connect via the bot.

### Connecting Telegram
- User goes to settings or clicks the banner.
- User clicks "Connect Telegram" and gets a unique token.
- User messages the bot with `/start <token>`.
- Telegram Webhook receives the command, validates the token, and links their `chat_id` to their Convex profile.

### Subscription (Stripe)
- User pays for subscription via Stripe checkout.
- Stripe Webhook receives `checkout.session.completed` and sets `isPremium: true` in the user's Convex profile.
- Only premium users receive real-time Telegram alerts and have full access to dashboard features.

### The Watcher (Webhooks)
- Helius and Alchemy Webhooks monitor the Solana blockchain for target wallet transactions.
- When a target wallet makes a swap, the webhook hits the Next.js API.
- The API processes the swap, filters it based on predefined rules (e.g., minimum liquidity, token validity), and saves the alert to Convex.

### Telegram Alerting
- When a new alert is saved to Convex, a background worker or Convex mutation triggers the Telegram Bot (built with grammY).
- The bot iterates through premium users, respects their individual filters, and sends a formatted message (with a calculated Risk Score) directly via DM.

### Dashboard Usage
- User views the **Live Alert Feed** to verify trade details, see historical context, and get direct links to DexScreener/Birdeye.
- User views the **Wallet Leaderboard** to see the 7-day P/L of the wallets being tracked, building trust in the signals.
- User configures **Alert Filters** (e.g., "Only alert me if liquidity > $20k") to reduce noise.
- User adds their own wallets to a **Personal Watchlist** for custom tracking.

---

## Data Architecture

### Convex Real-Time Database
- Central source of truth for Users, Subscriptions, Alerts, Target Wallets, and Watchlists.
- Reactivity means the dashboard updates instantly when a new alert is saved.

### Single Centralized Bot
- One Telegram bot handles all users via Direct Messages (DMs).
- No separate channels or group chats. Access is tied strictly to the user's `isPremium` status in Convex.

---

## Features In Scope

- Next.js web application with a premium, dynamic UI.
- Landing page to convert visitors into subscribers.
- Authentication via InsForge Auth.
- Payments and Subscriptions via Stripe Checkout and Customer Portal.
- Real-time Blockchain monitoring via Helius and Alchemy Webhooks.
- Telegram Bot built with grammY for pushing alerts directly to users.
- Convex database for storing all user, wallet, and alert data.
- Live Alert Feed and Wallet Leaderboard on the dashboard.
- Alert filters based on liquidity, volume, and risk thresholds.
- Personal Watchlists for users to track specific custom wallets.
- Risk Score calculation for every alert (based on liquidity, concentration, contract age).

---

## Features Out of Scope

- Auto-trading or executing trades on behalf of the user.
- Holding user funds or taking deposits (strictly a subscription SaaS).
- Complex custom Admin UI (the Convex Dashboard will serve as the initial admin panel, alongside an internal Admin Bot command set).
- Multi-user teams or enterprise accounts.
- iOS or Android mobile applications.

---

## Target User

A crypto trader or memecoin investor who:
- Is tired of losing money to social media hype and delayed signals.
- Wants a data-driven approach to tracking profitable wallets.
- Values low-latency alerts directly to their phone.
- Wants the ability to customize what alerts they receive to avoid noise.

---

## Success Criteria

- Webhooks process trades and alert the Telegram bot within milliseconds.
- Signal-to-Noise ratio is high: users only receive alerts for meaningful trades.
- UI feels highly premium, responsive, and data-dense.
- Users can sign up on the landing page, pay via Stripe, link their Telegram, and receive an alert seamlessly.
- Subscriptions are securely gated (if payment fails, alerts stop immediately).
