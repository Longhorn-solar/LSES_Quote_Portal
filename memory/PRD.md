# Longhorn Solar - Energy Efficiency Estimator PRD

## Original Problem Statement
Build energy efficiency estimator for Longhorn Solar with:
- Vercel Postgres database (for Vercel deployment)
- Google Auth restricted to specific emails
- AI recommendations via Emergent LLM Key

## Architecture (Vercel-Ready)
- **Framework**: Next.js 14 (App Router)
- **Database**: Vercel Postgres
- **Auth**: Emergent Google OAuth with email whitelist
- **AI**: Emergent LLM Key using gemini-2.0-flash-lite (TODO: migrate to customer key)
- **Styling**: Tailwind CSS

## User Personas
1. **Longhorn Solar Employees** - @longhornsolar.com emails
2. **Admin Users** - richard.balius@gmail.com, richard@rbxvital.com

## Core Requirements
- [x] Google Auth with email whitelist
- [x] Projects Dashboard with search/filter
- [x] 19 energy services configuration
- [x] Summary bid sheet with cost totals
- [x] Technical specs master table
- [x] AI-powered recommendations
- [x] NetSuite CSV export
- [x] Vercel Postgres database

## What's Been Implemented (Jan 31, 2026)
- Converted from FastAPI/MongoDB to Next.js/Vercel Postgres
- All API routes as Next.js App Router endpoints
- Full frontend with TypeScript
- Build passing, ready for Vercel deployment

## Vercel Deployment Steps
1. Push to GitHub using "Save to GitHub"
2. Import to Vercel
3. Create Vercel Postgres database in Storage tab
4. Add EMERGENT_LLM_KEY environment variable
5. Deploy
6. Call POST /api/db/setup once to create tables

## Prioritized Backlog
### P1 (High Priority)
- [ ] Migrate AI to customer's own Gemini API key
- [ ] Better auth flow (fewer screens)

### P2 (Medium Priority)
- [ ] Settings page for API key configuration
- [ ] Project deletion confirmation

## Next Tasks
1. Save to GitHub
2. Deploy to Vercel
3. Create Vercel Postgres database
4. Test full flow
