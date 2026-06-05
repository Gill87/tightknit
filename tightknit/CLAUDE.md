@AGENTS.md

# Project: Tightknit
A mobile-only neighborhood mutual-aid app built for HackDavis. Neighbors post small
help requests and fulfill each other's tasks using a time-based currency ("hours").

## Stack
- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4** — no `tailwind.config.js`; theme configured entirely in
  `app/globals.css` via `@theme inline`
- **Supabase** (auth + Postgres) — browser client: `lib/supabase/client.ts`
  (`getSupabase()`); server client: `lib/supabase/server.ts` (`createSupabaseServer()`)

## Route map
```
/                          → redirects to /auth/sign-in
/auth/sign-up              → registration (email confirmation flow)
/auth/sign-in              → login
/auth/forget-password      → forgot password
/auth/reset-password       → password reset
/auth/callback             → OAuth/email code exchange → /home
/onboarding/location       → step 1: geolocation permission + radius slider
/onboarding/superpowers    → step 2: skills / interests chips
/home                      → feed of nearby open requests + hour balance
/ask                       → post a new help request
/messages                  → conversations
/you                       → profile, balance, history, gift hours
/request/[id]              → request detail + accept CTA
```

## Key data model (Supabase tables)
- **profiles**: `id`, `hour_balance` (numeric hours), `lat`, `lng`, `radius_miles`,
  `username`, `name`
- **listings**: `id`, `posted_by`, `posted_by_name`, `description`,
  `duration_minutes`, `lat`, `lng`, `status` (open/claimed/completed),
  `claimed_by`, `completed_at`, `created_at`

## Architecture patterns
- **`formStyles.ts` per route** — every Tailwind class string lives here; page files
  stay logic-only. Each formStyles exports either named string constants or a const
  object (`tkHome`, `tkRequest`, etc.) plus a local `cn()` helper.
- **`FooterProvider`** — context in `app/(main)/FooterProvider.tsx`. Wraps all main
  routes; call `useFooter().setHidden(true)` inside a page to hide the footer
  (e.g. when a keyboard/input is focused). Footer has 4 tabs: Home, Ask, Messages, You.
- **Supabase singleton** — `getSupabase()` returns a cached browser client; import
  from `@/lib/supabase/client`.

# Mobile-only app
All UI is mobile-only. Design for small screens (≤ 390px wide):
- Constrain content with `max-w-md mx-auto w-full`
- Touch targets must be ≥ 44px tall
- Use `env(safe-area-inset-*)` for edge padding
- No hover-only interactions — use `active:` states instead
- Use `min-h-full` / `min-h-dvh` — never `min-h-screen`

# Color rule
Never hardcode hex values in formStyles. Define every color as a CSS custom property
(--tk-*) in app/globals.css, register it in @theme inline, then reference via the
Tailwind token (e.g. `bg-tk-avatar-warm`).

## Color palette (`app/globals.css`)
All hex values live in `:root` as `--tk-*` vars and are exposed to Tailwind via
`@theme inline` as `--color-tk-*`. Shadows are exposed as `--shadow-tk-*`.

| Token | Hex | Use |
|---|---|---|
| `tk-cream` | `#faf7f0` | page backgrounds |
| `tk-cream-deep` | `#f0e8dc` | input fills, surface cards |
| `tk-forest` | `#1e4034` | primary text, dark elements |
| `tk-forest-soft` | `#2d5a47` | secondary dark |
| `tk-terracotta` | `#c75b42` | CTAs, primary actions, active states |
| `tk-terracotta-hover` | `#b04a33` | button hover |
| `tk-mint` | `#b9d9c8` | light accents |
| `tk-muted` | `#6b7c73` | secondary text, placeholders |
| `tk-border` | `#e5dcd0` | borders, dividers |
| `tk-card` | `#ffffff` | card backgrounds |
| `tk-chip-active` | `#2a2a2a` | active filter chips |
| `tk-blush` | `#fdf5ec` | pill/badge backgrounds |
| `tk-avatar-warm` | `#e8d5c4` | avatar fallback background |

Shadow tokens: `shadow-tk-balance`, `shadow-tk-cta`, `shadow-tk-terracotta-subtle`

## Fonts
Geist Sans (`--font-geist-sans`) and Geist Mono (`--font-geist-mono`) loaded via
`next/font/google` in `app/layout.tsx`. Body defaults to Geist Sans.
