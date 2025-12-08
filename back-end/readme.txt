Back-end lives here (Node.js + Express).

Quick start
- Install deps: `npm install`
- Copy env: `cp .env.example .env` and set `MONGODB_URI`, `PORT`, `JWT_SECRET`
- Run dev server: `npm run dev` (default http://localhost:3001)

Mock data note
- Front-end should set `USE_MOCK=false` so data comes from the API, not local mocks.

Data storage
- All persistent data should be read/written via the database (Sprint 3+ goal).
