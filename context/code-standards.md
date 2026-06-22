# Code Standards

Implementation rules and conventions for the Smart Alpha project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line.
- **Read context files first** — never assume, always verify against `architecture.md` and `project-overview.md`.
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful.
- **Webhook Reliability** — Webhooks are the lifeblood of this app. They must be fast, verifiable, and never crash silently.
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions.
- **One thing at a time** — complete one feature fully before touching the next.

---

## TypeScript

- Strict mode enabled in `tsconfig.json` — no exceptions.
- Never use `any` — use `unknown` and narrow the type.
- All function parameters and return types must be explicitly typed.
- Use `type` for object shapes and unions — use `interface` only for extendable component props.
- All async functions must have proper error handling.

---

## Next.js 16 Conventions

- App Router only.
- All components are Server Components by default.
- Only add `"use client"` when the component requires state, effects, or browser APIs (e.g., Convex hooks).
- Route handlers live in `app/api/` — specifically `app/api/webhooks/` for external integrations.
- Always read Next.js documentation before implementing any Next.js specific feature — APIs may differ from training data.

---

## Webhook Standards

```typescript
// app/api/webhooks/helius/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Signature ALWAYS
    const authHeader = req.headers.get("authorization");
    if (authHeader !== process.env.HELIUS_WEBHOOK_SECRET) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse payload
    const body = await req.json();

    // 3. Offload heavy processing (e.g., to Convex Action)
    // await convex.mutation(...) or trigger an async worker

    // 4. Return fast 200 OK
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[webhooks/helius]", error);
    // Never expose internals
    return new NextResponse("Internal server error", { status: 500 });
  }
}
```

- Every webhook has a try/catch.
- Every webhook MUST verify the request signature before parsing or processing.
- Errors are logged with the route path as prefix: `[webhooks/provider]`.
- Return a 200 OK as fast as possible to avoid provider timeouts.

---

## File and Folder Naming

- Folders: kebab-case — `alert-feed`, `wallet-leaderboard`.
- Component files: PascalCase — `AlertFeed.tsx`, `WalletLeaderboard.tsx`.
- Convex files: camelCase — `alerts.ts`, `users.ts`.
- API route files: always `route.ts`.
- One component per file — never export multiple components from one file.
- Index files only in `components/ui/` — never barrel export from other folders.

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { useQuery } from "convex/react";

// 2. Internal imports
import { api } from "@/convex/_generated/api";

// 3. Type definitions
type Props = {
  walletAddress: string;
};

// 4. Component
export function ComponentName({ walletAddress }: Props) {
  // hooks
  // state
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports.
- Props type defined directly above the component.
- No inline styles — all styling via Tailwind classes using CSS variables from `ui-tokens.md`.

---

## Error Handling

- Never use empty catch blocks — always log or handle.
- Console errors always include context prefix: `[component/function name]`.
- User-facing errors must be human readable — never expose raw error messages.
- API route errors return `status: 500` with a generic message — never expose internals to webhook providers.

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable                        | Used In                |
| ------------------------------- | ---------------------- |
| `NEXT_PUBLIC_CONVEX_URL`        | Convex Provider        |
| `NEXT_PUBLIC_INSFORGE_URL`      | InsForge Auth          |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | InsForge Auth          |
| `INSFORGE_WEBHOOK_SECRET`       | InsForge Webhook Route |
| `STRIPE_SECRET_KEY`             | Stripe actions         |
| `STRIPE_WEBHOOK_SECRET`         | Stripe Webhook Route   |
| `HELIUS_WEBHOOK_SECRET`         | Helius Webhook Route   |
| `ALCHEMY_WEBHOOK_SECRET`        | Alchemy Webhook Route  |
| `TELEGRAM_BOT_TOKEN`            | grammY Bot             |

`NEXT_PUBLIC_` prefix means the variable is exposed to the browser. Never add `NEXT_PUBLIC_` to secret keys.

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `convex` — Database & Realtime logic
- `@insforge/ssr` — Authentication
- `stripe` — Payments
- `grammy` — Telegram Bot
- `lucide-react` — Icons
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives
- `zod` — Schema validation

Do not install any other packages without updating this list first.
