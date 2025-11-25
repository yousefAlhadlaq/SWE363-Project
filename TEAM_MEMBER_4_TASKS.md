# Team Member 4 – Integration & Dashboard (Lightweight)

Focus on wiring things together and keeping the API usable for the frontend.

## Core Tasks
- Express app + server bootstrap are already in place; keep them working.
- Wire auth middleware into routes once TM1 ships it.
- Dashboard routes:
  - `GET /api/dashboard/overview` – totals for income, expenses, and balance.
  - `GET /api/dashboard/recent` – latest combined expenses/incomes.
- Ensure the basic error handler stays consistent.

## Step-by-step Implementation
1) **Server/app readiness**
   - Confirm `npm run dev` works and http://localhost:5000/api/health returns `{ status: "ok" }`.
   - Make sure CORS uses `FRONTEND_URL` from `.env`.
2) **Routing**
   - Keep the existing route stubs mounted in `app.js`.
   - Once TM1 delivers auth middleware, apply it to protected routers (e.g., `router.use(auth)` in each route file).
3) **Dashboard controllers (`src/controllers/dashboardController.js`)**
   - `overview`: query TM2’s Expenses and Income collections for the current user; sum amounts (current month or all) and return `{ incomeTotal, expenseTotal, balance }`.
     - Example with Mongoose:
       ```js
       const incomeTotal = await Income.aggregate([
         { $match: { userId: req.user.id } },
         { $group: { _id: null, total: { $sum: '$amount' } } }
       ]);
       ```
   - `recent`: fetch latest expenses + incomes for the user, merge, sort by date desc, limit ~10; return a unified list with type labels.
4) **Wire dashboard routes (`src/routes/dashboardRoutes.js`)**
   - Import controllers and replace placeholders:
     ```js
     const { overview, recent } = require('../controllers/dashboardController');
     const auth = require('../middleware/auth');
     router.get('/overview', auth, overview);
     router.get('/recent', auth, recent);
     ```
5) **Error handling**
   - Keep the final error middleware in `app.js`.
   - Ensure controllers `next(err)` on unexpected errors; return clear messages/status codes.
6) **Data to expect in MongoDB**
   - You will read from TM2’s `expenses` and `incomes` collections. Example shapes:
     ```json
     { "_id": "64...e1", "userId": "64...u1", "amount": 25.5, "title": "Lunch", "date": "2024-11-26", "categoryId": "64...c1" }
     { "_id": "64...i1", "userId": "64...u1", "amount": 500, "source": "Salary", "date": "2024-11-25" }
     ```

## Integration Checklist
- Routes mounted for auth, categories, expenses, incomes, and dashboard.
- `.env` loaded correctly; CORS allows the frontend URL.
- Health endpoint responds (use for quick smoke tests).

## Nice to Have
- Simple logging for requests in development.
- Small helper to format dashboard numbers/percentages.
- Optional deployment script/notes if time remains.
