# Longhorn Solar - Energy Efficiency Estimator

A professional energy efficiency project estimator for Longhorn Solar, built with Next.js and Neon Postgres on Vercel.

> **Version 2.5.2** - Test push Jan 31, 2026

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres (Vercel Storage integration)
- **Auth**: Emergent Google OAuth
- **AI**: Placeholder mode (disabled, future provider-ready)
- **Styling**: Tailwind CSS

## Vercel Deployment Setup

### 1. Push to GitHub
Push this repository to GitHub.

### 2. Import to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project" and import your GitHub repo

### 3. Create Neon Postgres Database
- In your Vercel project, go to **Storage** tab
- Click **Create Database** → **Neon** (Postgres)
- Name it `longhorn-solar-db`
- Vercel will auto-populate the environment variables

### 4. Add Environment Variables
In Vercel project settings → Environment Variables, add:

```
FUTURE_AI_PROVIDER_KEY=your_future_provider_key
```

The app currently runs AI recommendations in placeholder mode and does not use this key yet.
Keep `FUTURE_AI_PROVIDER_KEY` as documentation for future implementation.

(The Postgres variables, including `POSTGRES_URL`, are added automatically when you create the database)

### 5. Initialize Database Tables
Database tables are now auto-created on first authenticated API use.

If you want to force setup manually, you can still call:
```
POST https://your-app.vercel.app/api/db/setup
```

### 6. Configure Auth Redirect (if needed)
The app uses `window.location.origin` for OAuth redirects, so it should work automatically on any domain.

## Authorized Users

Only these emails can access the app:
- Any `@longhornsolar.com` email
- `richard.balius@gmail.com`
- `richard@rbxvital.com`

To add more emails, edit `src/lib/constants.ts`.

## Local Development

```bash
# Install dependencies
yarn install

# Run dev server
yarn dev
```

For local development, the app uses mock database by default. To use real Neon Postgres locally:
1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Pull env vars: `vercel env pull .env.local`
4. Run: `yarn dev`

## Features

- ✅ Google Auth with email whitelist
- ✅ Projects Dashboard with search/filter
- ✅ 19 energy services configuration
- ✅ AI placeholder (future provider integration)
- ✅ NetSuite CSV export
- ✅ Neon Postgres persistence

## TODO

- [ ] Migrate AI to customer's own Gemini API key
- [ ] Add Settings page for API key configuration
