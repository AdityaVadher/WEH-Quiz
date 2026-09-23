# WEH Founder Quiz

A live multiplayer founder-guessing quiz with a public player screen and a password-protected host console.

## Stack

- Next.js App Router on Vercel
- Supabase Postgres
- Drizzle ORM with the Supabase transaction pooler
- Tailwind CSS and shadcn/ui

## Features

- Players join using room code `WEH-742` and a display name.
- Each player can submit only one answer per question.
- Earlier clues award more points.
- The live leaderboard includes only joined players.
- The host console can reveal clues and answers, jump between questions, move backward, reset one question, or reset the whole quiz.
- Host controls are protected by an environment-variable password.

## 1. Create the Supabase database

Create a Supabase project, then apply the migration in:

`supabase/migrations/20260923080648_founder_quiz_schema.sql`

You can paste the migration into the Supabase SQL Editor, or use the CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

The migration enables Row Level Security and revokes browser roles from all quiz tables. The app accesses Postgres only through its server-side API routes.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` for local development. Set the same variables in Vercel for Production, Preview, and Development:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
HOST_PASSWORD=replace-with-a-long-random-host-password
```

Use the **Transaction pooler** connection string from Supabase's Connect panel. If the database password contains reserved URL characters, use the connection string supplied by Supabase rather than assembling it manually.

## 3. Run locally

```bash
npm install
npm run dev
```

Open:

- Player game: `http://localhost:3000`
- Host console: `http://localhost:3000/host`

## 4. Deploy to Vercel

1. Import this GitHub repository into Vercel.
2. Keep the detected framework as **Next.js**.
3. Add `DATABASE_URL` and `HOST_PASSWORD` in Project Settings → Environment Variables.
4. Deploy.

The player game will be available at the deployment root and the protected host console at `/host`.

## Commands

```bash
npm run dev       # local Next.js development
npm run lint      # ESLint
npm run build     # production build
npm run start     # run the production build
npm run db:generate
```
