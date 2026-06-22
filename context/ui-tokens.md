# UI Tokens

Design tokens for Smart Alpha. All colors, typography, spacing, and component values extracted for the dashboard. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-primary` → `bg-primary`, `text-primary`, `border-primary`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Never — hardcoded hex values
className="bg-[#F6F7FB] text-[#101828]"

// Never — raw Tailwind color classes
className="bg-blue-500 text-gray-600"
```

---

## globals.css — Complete Token Definition

```css
@import "tailwindcss";

@theme {
  /* Font */
  --font-sans: "Inter", sans-serif;

  /* Page and surface backgrounds */
  --color-background: #f6f7fb;
  --color-surface: #ffffff;
  --color-surface-secondary: #f9fafb;
  --color-surface-tertiary: #f2f5f7;

  /* Borders */
  --color-border: #e7eaf3;
  --color-border-light: #e5e7eb;

  /* Text */
  --color-text-primary: #101828;
  --color-text-secondary: #6a7282;
  --color-text-muted: #99a1af;
  --color-text-dark: #364153;

  /* Primary Accent — Slate/Dark */
  --color-primary: #101828;
  --color-primary-foreground: #ffffff;

  /* Success — Green (Profit / Low Risk) */
  --color-success: #10b981;
  --color-success-dark: #009966;
  --color-success-light: #d0fae5;
  --color-success-lightest: #ecfdf5;
  --color-success-foreground: #007a55;

  /* Info — Blue */
  --color-info: #61a8ff;
  --color-info-light: #dbeafe;
  --color-info-lightest: #eff6ff;

  /* Warning — Orange (Medium Risk) */
  --color-warning: #ff8904;
  --color-warning-foreground: #ffffff;

  /* Error — Red (Loss / High Risk) */
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-error-foreground: #b91c1c;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## Color Usage Guide

### Page Layout

| Element           | Token                  |
| ----------------- | ---------------------- |
| Page background   | `bg-background`        |
| Card / surface    | `bg-surface`           |
| Secondary surface | `bg-surface-secondary` |
| Default border    | `border-border`        |

### Typography

| Element                | Token                           |
| ---------------------- | ------------------------------- |
| Headings, primary text | `text-text-primary` (#101828)   |
| Secondary text, labels | `text-text-secondary` (#6A7282) |
| Placeholder, muted     | `text-text-muted` (#99A1AF)     |

### Risk Score Colors

Numeric indicators accompanied by a color:

| Score Range | Color  | Token                                  |
| ----------- | ------ | -------------------------------------- |
| 0-30        | Green  | `text-success`                         |
| 31-70       | Orange | `text-warning`                         |
| 71-100      | Red    | `text-error`                           |

### Profit / Loss Colors

| Type  | Background           | Text                       |
| ----- | -------------------- | -------------------------- |
| Profit| `bg-success-lightest`| `text-success-foreground`  |
| Loss  | `bg-error-light`     | `text-error-foreground`    |

### Trade Type Badges

| Type | Background            | Text                      |
| ---- | --------------------- | ------------------------- |
| BUY  | `bg-success-lightest` | `text-success-foreground` |
| SELL | `bg-error-light`      | `text-error-foreground`   |

---

## Typography

| Element              | Size | Weight | Line height | Color token           |
| -------------------- | ---- | ------ | ----------- | --------------------- |
| Stat number          | 30px | 600    | 36px        | `text-text-primary`   |
| Section heading      | 16px | 600    | 24px        | `text-text-primary`   |
| Card label           | 14px | 500    | 20px        | `text-text-secondary` |
| Body text            | 14px | 500    | 20px        | `text-text-primary`   |
| Trend badge text     | 12px | 500    | 16px        | `text-success-dark`   |
| Timestamp / muted    | 12px | 400    | 16px        | `text-text-muted`     |

---

## Spacing

| Token       | Value      | Usage                 |
| ----------- | ---------- | --------------------- |
| `gap-1`     | 4px        | Tight inline gaps     |
| `gap-2`     | 8px        | Badge and tag gaps    |
| `gap-3`     | 12px       | Form field gaps       |
| `gap-4`     | 16px       | Section internal gaps |
| `gap-6`     | 24px       | Between sections      |
| `gap-8`     | 32px       | Page section gaps     |
| `p-4`       | 16px       | Card padding          |
| `p-6`       | 24px       | Large card padding    |
| `px-4 py-2` | 16px / 8px | Button padding        |
| `px-2 py-0.5`| 8px / 2px | Badge padding         |

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens.
- Font is Inter — always import via next/font/google, never use a fallback system font.
- Never use raw Tailwind color classes like `bg-blue-500` or `text-gray-600` — use project tokens only.
- All borders default to `--border` (#E7EAF3) — never use `border-gray-*`.
