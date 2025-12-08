Back-end lives here (Node.js + Express).

Quick start
- Install deps: `npm install`
- Copy env: `cp .env.example .env` and set `MONGODB_URI`, `PORT`, `JWT_SECRET`
- Run dev server: `npm run dev` (default http://localhost:3001)

Mock data note
- Front-end should set `USE_MOCK=false` so data comes from the API, not local mocks.

Data storage
- All persistent data should be read/written via the database (Sprint 3+ goal).

Key pieces
- Server entry: `server.js` (sets up routes, auth middleware, DB connection)
- Auth: JWT-based (`src/middleware/AuthRequirement.js`, `src/auth/jwt.js`)
- Data fetching: `src/data/DataFetcher.js` (quotes, fundamentals, caching, batching)
- Watchlists: stored on the User model (`src/data/users.js`), endpoints in `server.js`
- Notifications: Mongoose model `src/models/Notifications.js`; routes in `server.js`
- Dashboard/Home routes: `src/routes/dashboard.js`, `src/routes/home.js`

Environment variables
- `MONGODB_URI`: MongoDB connection string (Atlas/local)
- `PORT`: Express port (defaults to 3001)
- `JWT_SECRET`: secret for signing/verifying access tokens

Available scripts (package.json)
- `npm run dev`: start backend with nodemon
- `npm test`: run backend tests (supertest/mocha)
