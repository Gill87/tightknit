# Tightknit

Tightknit is a neighborhood time-banking app where people trade hours instead of money.
Users can post requests, volunteer to help, chat with neighbors, mark tasks complete together, and track their hour balance.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase Auth + Postgres + Realtime
- Tailwind CSS 4 + custom route-level styles

## Core Product Flow

1. Sign up or sign in.
2. Complete onboarding (location + "superpower" skill).
3. Browse nearby open requests on `Home`.
4. Post a request with a duration on `Ask`.
5. Offer help from a request detail page and start a chat.
6. Both participants acknowledge completion to finalize and apply hour updates.
7. Manage profile, radius, hour gifting, and post history from `You`.

## Main Routes

- `app/auth/*`: auth screens (sign up, sign in, password reset, callbacks)
- `app/onboarding/*`: location and superpower onboarding
- `app/(main)/home`: nearby request feed and hour balance
- `app/(main)/ask`: create a new help request
- `app/(main)/request/[id]`: request detail + "I can help" action
- `app/(main)/messages`: conversation list
- `app/(main)/messages/[room_id]`: real-time chat + completion acknowledgement
- `app/(main)/you`: profile, radius, gifting hours, and history

## Environment Variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_or_publishable_key
```

These are required by:

- `lib/supabase/client.ts` (browser client)
- `lib/supabase/server.ts` and `middleware.ts` (server/middleware auth handling)

## Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Database and Supabase


- The app relies on Supabase tables and RPC/functions referenced throughout the main routes (for example profile search, gifting hours, and listing completion acknowledgement).
- Apply migrations to your Supabase project before testing full flows.

## Available Scripts

- `npm run dev` - start local dev server
- `npm run build` - build for production
- `npm run start` - run production build
- `npm run lint` - run ESLint
