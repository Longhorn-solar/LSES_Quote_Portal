# Longhorn Solar - Energy Efficiency Estimator

A professional energy efficiency project estimator for Longhorn Solar, built with Next.js and Vercel Postgres.

> **Version 2.5.1** - Updated Jan 31, 2026

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres
- **Auth**: Emergent Google OAuth
- **AI**: Emergent LLM Key (Gemini)
- **Styling**: Tailwind CSS

## Vercel Deployment Setup

### 1. Push to GitHub
Push this repository to GitHub.

### 2. Import to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project" and import your GitHub repo

### 3. Create Vercel Postgres Database
- In your Vercel project, go to **Storage** tab
- Click **Create Database** → **Postgres**
- Name it `longhorn-solar-db`
- Vercel will auto-populate the environment variables

### 4. Add Environment Variables
In Vercel project settings → Environment Variables, add:

```
EMERGENT_LLM_KEY=sk-emergent-cC12c4014A4A880B25
```

(The Postgres variables are added automatically when you create the database)

### 5. Initialize Database Tables
After first deployment, call this endpoint once to create tables:
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

For local development, the app uses mock database by default. To use real Vercel Postgres locally:
1. Install Vercel CLI: `npm i -g vercel`
2. Link project: `vercel link`
3. Pull env vars: `vercel env pull .env.local`
4. Run: `yarn dev`

## Features

- ✅ Google Auth with email whitelist
- ✅ Projects Dashboard with search/filter
- ✅ 19 energy services configuration
- ✅ AI-powered recommendations
- ✅ NetSuite CSV export
- ✅ Vercel Postgres persistence

## TODO

- [ ] Migrate AI to customer's own Gemini API key
- [ ] Add Settings page for API key configuration
