# Team Member 3 – Investments, Budgets, Goals (Optional Extras)

Build these only after auth + categories exist. Keep schemas lean.

## Deliverables
- Investment model + CRUD.
- Goal model + CRUD.
- Budget model + CRUD that references TM2’s categories.
- Optional helpers: portfolio summary, zakah calculation.
- Replace the placeholders in the existing route stubs with real handlers.

## How to Build It (step-by-step)
0) **Database prep**
   - Collections will be `investments`, `goals`, `budgets`. Ensure auth and categories are in place for references.
1) **Models (`src/models/Investment.js`, `Goal.js`, `Budget.js`)**
   - Investment: fields `userId`, `name`, `type` (`stock|realestate|crypto|gold|other`), `amountOwned`/`units`, `buyPrice`, `currentPrice`, `purchaseDate`, `includeInZakah`; add virtual/helper `currentValue = amountOwned * currentPrice`.
   - Goal: fields `userId`, `name`, `targetAmount`, `savedAmount`, `deadline`, `status`.
   - Budget: fields `userId`, `categoryId` (must belong to user), `limit`, `period` (`monthly|weekly|yearly`), `startDate`, `endDate`.
2) **Controllers (`src/controllers/investmentController.js`, etc.)**
   - List: `find({ userId: req.user.id })`.
   - Create/Update: validate required fields per type; recompute derived fields (e.g., current value) before saving.
   - Delete: ensure ownership: `findOneAndDelete({ _id: id, userId })`; if missing → `404`.
   - Optional summaries: totals per type; simple zakah = `includeInZakah ? currentValue * 0.025 : 0`.
3) **Routes (`src/routes/investmentRoutes.js`, `goalRoutes.js`, `budgetRoutes.js`)**
   - Add auth middleware: `router.use(auth);`.
   - Replace placeholders with controller calls for `GET/POST/PUT/DELETE`.
4) **Validation Tips**
   - Ensure `categoryId` (for budgets) exists and belongs to the user (use TM2’s categories).
   - Numbers > 0 where relevant; dates valid ISO strings.
5) **Sample Mongo documents**
   - Investment:
     ```json
     { "_id": "64...iv", "userId": "64...u1", "name": "AAPL", "type": "stock", "amountOwned": 10, "buyPrice": 150, "currentPrice": 170, "purchaseDate": "2024-10-01", "includeInZakah": true }
     ```
   - Goal:
     ```json
     { "_id": "64...g1", "userId": "64...u1", "name": "Vacation", "targetAmount": 2000, "savedAmount": 500, "deadline": "2025-06-01", "status": "in-progress" }
     ```
   - Budget:
     ```json
     { "_id": "64...b1", "userId": "64...u1", "categoryId": "64...c1", "limit": 300, "period": "monthly", "startDate": "2024-11-01", "endDate": "2024-11-30" }
     ```

## Quick Test Flow (Postman)
1. Login to get token.
2. Create a goal and update progress via PUT.
3. Create an investment with type-specific fields; verify current value math.
4. Create a budget using an existing category; list budgets and confirm category populated.

## Integration Notes
- Share a simple portfolio summary (totals by type) for TM4’s dashboard if time allows.
- Keep calculations basic; avoid over-engineering—just provide the data the dashboard needs.
