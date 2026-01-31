# Longhorn Solar - Energy Efficiency Estimator PRD

## Original Problem Statement
Rebuild the Energy Efficiency Estimator app for Longhorn Solar with:
- MongoDB database for data persistence
- Google Auth restricted to specific emails
- AI recommendations (migrate from Gemini to cost-effective solution later)

## Architecture
- **Frontend**: React 18 + Tailwind CSS (CDN) + React Router
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (test_database)
- **Auth**: Emergent Google OAuth with email whitelist
- **AI**: Emergent LLM Key using gemini-2.0-flash-lite (TODO: migrate to customer's own key)

## User Personas
1. **Longhorn Solar Employees** - @longhornsolar.com emails
2. **Admin Users** - richard.balius@gmail.com, richard@rbvital.com

## Core Requirements
- [x] Google Auth with email whitelist
- [x] Projects Dashboard with search/filter
- [x] 19 energy services (Solar, HVAC, Insulation, etc.)
- [x] Detailed service configuration forms
- [x] Summary bid sheet with cost totals
- [x] Technical specs master table
- [x] AI-powered recommendations
- [x] NetSuite CSV export

## What's Been Implemented (Jan 31, 2026)
- Full backend API with MongoDB persistence
- Google OAuth with email restriction
- All CRUD operations for projects and bids
- AI recommendations via Emergent LLM Key
- Frontend with all views working
- All tests passing

## Prioritized Backlog
### P0 (Critical)
- None

### P1 (High Priority)
- [ ] Migrate AI to customer's own Gemini API key (cost reduction)
- [ ] Add "Settings" page for API key configuration

### P2 (Medium Priority)
- [ ] Add project deletion confirmation modal
- [ ] Add pagination for large project lists
- [ ] Replace Tailwind CDN with production build

### P3 (Low Priority)
- [ ] Add PDF export option
- [ ] Dark mode toggle
- [ ] Email notifications for status changes

## Next Tasks
1. User to create dev branch for feature work
2. Implement customer API key settings page
3. Add more robust error handling
