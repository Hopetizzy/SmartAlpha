# Library Docs

Project-specific usage patterns for every third party library in this project. Read the relevant section before implementing any feature that touches these libraries.

---

## Convex

Convex is our primary database and real-time backend. 

### Queries and Mutations

- Always define schemas in `convex/schema.ts`.
- Queries run on the frontend and are reactive. Use `useQuery` for any data that should update live (e.g., Live Alert Feed).
- Mutations modify data. Use `useMutation` to handle user input (e.g., saving an alert filter).
- Background processes (e.g., Webhooks calling Convex) should use the HTTP endpoint integration or internal Actions.

### Auth Integration

- We use InsForge for auth.
- Use `ctx.auth.getUserIdentity()` inside Convex functions to securely identify the caller.
- Never rely on the client to pass the `userId` as an argument if it can be securely inferred from the auth context.

---

## InsForge Auth

InsForge Auth handles all user authentication.

### Client vs Server
Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

### Syncing Users to Convex
- Do not manually create users in the client.
- Rely on the InsForge Webhook (`/api/webhooks/insforge`) triggering on user signup.
- The webhook MUST verify the signature before executing a Convex mutation to insert the user record.

---

## Stripe

Stripe handles recurring subscriptions.

### Stripe Webhooks
- Webhook endpoint: `/api/webhooks/stripe`
- Handle events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`.
- **Signature Verification**: Always verify `stripe.webhooks.constructEvent` using the `STRIPE_WEBHOOK_SECRET`.
- After verification, trigger a Convex mutation to toggle `isPremium` status on the user profile.

---

## grammY (Telegram Bot)

We use grammY to power the Telegram bot.

### Webhook Mode vs Polling
- In production, we run grammY in **webhook mode**, not polling.
- The webhook endpoint is `/api/webhooks/telegram`.
- When users type commands (like `/start <token>`), the Next.js API route handles the payload via grammY's webhook adapter.

### Bot Logic Rules
- Only one centralized bot instance. Do not manage separate tokens per user.
- Bot actions (e.g., broadcasting alerts) should be triggered by Convex actions/workers iterating through premium users.
- Use Telegram Inline Keyboards for user interaction within the chat where appropriate.

---

## Helius & Alchemy

These services push on-chain Solana data to our system.

### Webhook Processing
- Endpoints: `/api/webhooks/helius` and `/api/webhooks/alchemy`.
- Both endpoints receive high-volume transaction data (Swap events).
- **CRITICAL**: Respond with a 200 OK as fast as possible to prevent the provider from dropping the webhook or retrying unnecessarily.
- **CRITICAL**: Implement provider-specific signature verification (e.g., Helius `authHeader`, Alchemy HMAC signature).
- Hand off complex parsing, filtering, and database inserts to a background process or asynchronous Convex mutation.

---

## Tailwind CSS v4

- We define tokens via `@theme` in `app/globals.css`.
- Do not use a `tailwind.config.ts` file for colors or design tokens.
- Never use raw Tailwind color classes (e.g., `text-blue-500`). Always use the mapped semantic tokens (e.g., `text-info`).
