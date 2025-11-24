# Quroosh Backend – Student-Friendly Guide

Simple Express + MongoDB API for a class demo. Focus on working CRUD + auth; keep everything straightforward.

## What We’re Building
- Auth: register, login, protect routes with JWT.
- Expenses/Income with categories: CRUD + filtering per logged-in user.
- Dashboard basics: totals and recent transactions.
- Optional: investments/goals summaries if time allows.

## Prerequisites (check these first)
- Node.js 18+ installed (`node -v` should show 18.x or newer).
- MongoDB connection string:
  - Local: `mongodb://127.0.0.1:27017/quroosh` (needs Mongo running locally), or
  - Cloud: MongoDB Atlas URI from their UI.
- npm available (`npm -v`).
- Postman/Insomnia for testing (optional but recommended).

## Step-by-Step Setup
1) Open a terminal and go to the backend folder:
   ```bash
   cd quroosh-backend
   ```
2) Install packages:
   ```bash
   npm install
   ```
3) Create your env file:
   ```bash
   cp .env.example .env
   ```
   Then fill `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/quroosh   # or your Atlas URI
   JWT_SECRET=replace_me                           # any random string for now
   FRONTEND_URL=http://localhost:5173
   ```
   - If you use Atlas, paste the full URI from Atlas and replace `<password>`.
4) Start Mongo:
   - Local Mongo: ensure the MongoDB service is running (or start `mongod`).
   - Atlas: no local service needed.
5) Run the server:
   ```bash
   npm run dev
   ```
   Open http://localhost:5000/api/health and expect `{ "status": "ok" }`.

## Project Layout (already created)
```
quroosh-backend/
├── src/
│   ├── config/        # db connection (done)
│   ├── middleware/    # auth + errors (auth to be written)
│   ├── models/        # your schemas go here
│   ├── controllers/   # your business logic
│   ├── routes/        # stubs exist, swap in real handlers
│   └── server.js      # entry point (done)
└── .env
```

## Who Builds What (with actions)
- **TM4 – Integration/Dashboard**: Express skeleton, health route, CORS, error handler are done. Next: add auth middleware when TM1 finishes, then build dashboard controllers for totals/recent.
- **TM1 – Auth/Users**: Implement User model + auth controllers, plug them into `routes/authRoutes.js` stubs, and create `middleware/auth.js` to protect routes.
- **TM2 – Categories/Expenses/Income**: Build models + controllers, then replace placeholder handlers in `routes/categoryRoutes.js`, `expenseRoutes.js`, `incomeRoutes.js`. Use TM1’s auth middleware.
- **TM3 – Investments/Goals (optional)**: Build models + controllers, then swap placeholders in `routes/investmentRoutes.js`, `goalRoutes.js`, `budgetRoutes.js`. Budgets depend on TM2 categories.

## Build Order (follow this)
1) TM1: Finish auth middleware + register/login/me controllers; update `authRoutes.js` to call them.
2) TM2: Build categories/expenses/incomes using auth middleware; update their route stubs.
3) TM3: (Optional) Build investments/goals/budgets; update their route stubs.
4) TM4: Wire auth middleware globally, keep error handling, and implement dashboard `overview`/`recent` using TM2 (and TM3) data.
5) Everyone: Test the flow with Postman: register → login → create category → create expense/income → fetch dashboard.

## Must-Have Endpoints (start with these)
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- Categories: `GET/POST/PUT/DELETE /api/categories`.
- Expenses: `GET/POST/PUT/DELETE /api/expenses` (support `dateFrom`, `dateTo`, `categoryId`).
- Income: `GET/POST/PUT/DELETE /api/incomes`.
- Dashboard: `GET /api/dashboard/overview`, `GET /api/dashboard/recent`.

## How to Replace the Stubs
- Each file in `src/routes` currently sends a 501 response.
- Create your controller functions, import them in the route file, and replace the placeholder handlers.
- Example (authRoutes):
  ```js
  const { register, login, me } = require('../controllers/authController');
  router.post('/register', register);
  router.post('/login', login);
  router.get('/me', authMiddleware, me);
  ```

## Testing Basics
- Use Postman/Insomnia:
  1. Register → save token.
  2. Login → save token.
  3. Create category → use token.
  4. Create expense/income → use token.
  5. Get dashboard → verify totals/recent.
- Errors to watch:
  - 401: missing/invalid token (check `Authorization: Bearer <token>`).
  - 400/404: bad input or not found; validate IDs and required fields.

## Notes
- Keep things simple: no production extras (email, rate limiting) unless you finish early.
- Return clear JSON messages when something fails.
- Ask teammates for sample payloads if you need data to test.
