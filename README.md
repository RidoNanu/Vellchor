# Vellichor

Poetry app built with React + Vite + Supabase.

## 1. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

You can copy from `.env.example`.

## 2. Start the app

```bash
npm install
npm run dev
```

## 3. Data visibility rules in this app

- Public poems page loads rows where `published = true` only.
- Admin dashboard loads all poems, but requires signing in.
- Comments table uses columns `name` and `content`.

If you inserted a poem row and cannot see it publicly, update that row so `published = true`.

## 4. Supabase RLS notes

With your current policies:

- Public users can read published poems.
- Authenticated users can fully manage poems.
- Anyone can read and insert comments.

If admin still cannot see poems in `/admin/dashboard`, verify you are signed in with a Supabase Auth user.
