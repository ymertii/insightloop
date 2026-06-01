# InsightLoop

React/Vite frontend with a Supabase-ready backend structure and Vercel deployment config.

## Local Development

```bash
npm install
npm run dev
```

The app runs without Supabase credentials by using local fallback seed data. To connect the real backend, create `.env.local` from `.env.example` and set:

```bash
VITE_SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

## Backend

Supabase SQL lives in:

- `supabase/migrations/20260601000000_initial_insightloop_schema.sql`
- `supabase/seed.sql`

The frontend data access layer is `src/lib/api.ts`. See `docs/backend-structure.md` for the table-to-screen mapping.

## Verification

```bash
npm run lint
npm run build
```

## Deploy

Vercel can build the app with the included `vercel.json`. Add the Supabase environment variables in Vercel before publishing.
