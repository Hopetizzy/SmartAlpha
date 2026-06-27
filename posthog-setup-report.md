# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into SmartAlpha, a Solana smart money tracker. The integration covers client-side initialization via `instrumentation-client.ts` (Next.js 15.3+ pattern), a server-side PostHog client for API routes and webhooks, a reverse proxy through Next.js rewrites to reduce ad-blocker interference, user identification on login and signup, and event capture across all key user actions and server-side business operations.

## Events instrumented

| Event Name | Description | File |
|---|---|---|
| `user_signed_up` | Fires when a user successfully completes registration via email/password or OAuth. | `src/components/sign-up-form.tsx` |
| `user_signed_in` | Fires when a user successfully authenticates via email/password sign-in. | `src/components/sign-in-form.tsx` |
| `telegram_connect_initiated` | Fires when a user generates a Telegram sync link to connect their Telegram account. | `src/app/settings/settings-content.tsx` |
| `telegram_disconnected` | Fires when a user disconnects their linked Telegram account from alert notifications. | `src/app/settings/settings-content.tsx` |
| `watchlist_wallet_added` | Fires when a user adds a custom Solana wallet address to their personal watchlist. | `src/app/settings/settings-content.tsx` |
| `watchlist_wallet_removed` | Fires when a user removes a wallet from their personal watchlist. | `src/app/settings/settings-content.tsx` |
| `alert_settings_saved` | Fires when a user saves their alert parameter thresholds (liquidity, volume, risk score). | `src/app/settings/settings-content.tsx` |
| `smart_money_alert_processed` | Server-side: fires when swap transactions from tracked wallets are processed and stored as alerts. | `src/app/api/webhooks/helius/route.ts` |
| `user_synced` | Server-side: fires when a new user account is synced from InsForge into the application database. | `src/app/api/webhooks/insforge/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/481288/dashboard/1756829)
- [New user signups (wizard)](https://us.posthog.com/project/481288/insights/J7xPsVQn)
- [Daily sign-ins (wizard)](https://us.posthog.com/project/481288/insights/gGBJQWR7)
- [Smart money alerts processed (wizard)](https://us.posthog.com/project/481288/insights/eiR1moQ2)
- [Signup to Telegram activation funnel (wizard)](https://us.posthog.com/project/481288/insights/oqwK2ajG)
- [User feature engagement (wizard)](https://us.posthog.com/project/481288/insights/OZpgStYK)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any monorepo/bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
