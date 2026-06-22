# UI Registry

Living document for Smart Alpha. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:
1. Check if a similar component already exists here.
2. If yes — match its exact classes.
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then add it here.

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### SiteShell

File: [src/components/site-shell.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/site-shell.tsx)
Last updated: 2026-06-22

| Property         | Class                                                      |
| ---------------- | ---------------------------------------------------------- |
| Background       | `bg-background`                                            |
| Border           | none                                                       |
| Border radius    | none                                                       |
| Text — primary   | none (inherits from body)                                  |
| Text — secondary | none                                                       |
| Spacing          | `p-8` (32px padding on main area), `flex flex-col gap-6`  |
| Hover state      | none                                                       |
| Shadow           | none                                                       |
| Accent usage     | none                                                       |

**Pattern notes:**
Encapsulates the standard layout constraints (1440px max width centered, 32px padding). All pages use this wrapper.

---

### Navbar

File: [src/components/layout/Navbar.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/layout/Navbar.tsx)
Last updated: 2026-06-22

| Property         | Class                                                      |
| ---------------- | ---------------------------------------------------------- |
| Background       | `bg-surface`                                               |
| Border           | `border-b border-border`                                   |
| Border radius    | none                                                       |
| Text — primary   | `text-text-primary`                                        |
| Text — secondary | `text-text-secondary`                                      |
| Spacing          | `h-16`, `px-6` (padding), `flex items-center gap-10`       |
| Hover state      | see buttons and links                                      |
| Shadow           | none                                                       |
| Accent usage     | Logo image, `bg-primary` button                            |

**Pattern notes:**
Fixed at 64px (`h-16`) at the top of the screen. Holds the brand, navigation, and user authentication actions.

---

### NavbarLinks

File: [src/components/layout/NavbarLinks.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/layout/NavbarLinks.tsx)
Last updated: 2026-06-22

| Property         | Class                                                      |
| ---------------- | ---------------------------------------------------------- |
| Background       | none                                                       |
| Border           | none                                                       |
| Border radius    | none                                                       |
| Text — primary   | `text-text-primary font-semibold`                          |
| Text — secondary | `text-text-secondary font-medium`                          |
| Spacing          | `gap-8`                                                    |
| Hover state      | `hover:text-text-primary transition-colors`                |
| Shadow           | none                                                       |
| Accent usage     | active link turns to primary text color and bold font      |

**Pattern notes:**
Active link state uses font weight (`font-semibold`) and primary text color change (`text-text-primary`) without underlines.

---

### Footer

File: [src/components/layout/Footer.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/layout/Footer.tsx)
Last updated: 2026-06-22

| Property         | Class                                                      |
| ---------------- | ---------------------------------------------------------- |
| Background       | `bg-surface`                                               |
| Border           | `border-t border-border`                                   |
| Border radius    | none                                                       |
| Text — primary   | none                                                       |
| Text — secondary | `text-text-secondary`                                      |
| Spacing          | `py-8`, `px-6` (padding), `mt-auto` (pushes to bottom)     |
| Hover state      | `hover:underline` (on links)                               |
| Shadow           | none                                                       |
| Accent usage     | Brand attribution link uses `text-text-primary`            |

**Pattern notes:**
Kept compact, aligned horizontally on desktop and stacked vertically on mobile screens.

---

### DashboardPreview

File: [src/components/dashboard-preview.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/dashboard-preview.tsx)
Last updated: 2026-06-22

| Property         | Class                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Background       | `bg-surface` (main), `bg-surface-secondary` (sidebar)                  |
| Border           | `border border-border`, `border-r border-border` (sidebar divider)     |
| Border radius    | `rounded-xl`                                                           |
| Text — primary   | `text-text-primary`                                                    |
| Text — secondary | `text-text-secondary`                                                  |
| Spacing          | `p-6` (sidebar), `p-8` (main), `gap-6` (internal)                      |
| Hover state      | `hover:bg-surface-secondary transition-all` (alert rows and tab buttons)|
| Shadow           | `shadow-xl`                                                            |
| Accent usage     | `text-success` / `text-error` for BUY/SELL badges and risk scores      |

**Pattern notes:**
Simulates real dashboard alerts. Employs `rounded-xl` for cards, clear border separators, and interactive hover feedback.

---

### AuthShell

File: [src/components/auth-shell.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/auth-shell.tsx)
Last updated: 2026-06-22

| Property         | Class                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Background       | `bg-background` (page), `bg-surface` (card)                            |
| Border           | `border border-border` (card)                                          |
| Border radius    | `rounded-2xl`                                                          |
| Text — primary   | `text-text-primary`                                                    |
| Text — secondary | `text-text-secondary`                                                  |
| Spacing          | `p-8` (card padding), `gap-6` (layout gap)                             |
| Hover state      | `hover:bg-surface-secondary` (badge link)                              |
| Shadow           | `shadow-[0_8px_30px_rgba(16,24,40,0.03)]`                              |
| Accent usage     | Radial green and blue background glows, brand logo icon                |

**Pattern notes:**
Standardizes the onboarding and authentication screens. Uses premium radial gradient flows for backgrounds rather than solid colors.

---

### SignInForm / SignUpForm

Files: [src/components/sign-in-form.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/sign-in-form.tsx) / [src/components/sign-up-form.tsx](file:///c:/Users/HP/Desktop/SmartAlpha/src/components/sign-up-form.tsx)
Last updated: 2026-06-22

| Property         | Class                                                                  |
| ---------------- | ---------------------------------------------------------------------- |
| Background       | `bg-surface` (inputs), `bg-primary` (submit button)                    |
| Border           | `border border-border`                                                 |
| Border radius    | `rounded-md` (inputs and buttons)                                      |
| Text — primary   | `text-text-primary`                                                    |
| Text — secondary | `text-text-secondary`                                                  |
| Spacing          | `px-3 py-2` (inputs), `gap-4` (form spacing)                           |
| Hover state      | `hover:opacity-90` (submit buttons)                                    |
| Shadow           | none                                                                   |
| Accent usage     | `focus:border-primary focus:ring-1 focus:ring-primary` (active inputs) |

**Pattern notes:**
Input forms use `rounded-md` borders, clear text sizing, and high-visibility focus states mapped to `--color-primary` (Slate).
