# Backend Build Checklist (Short)

This is a lightweight plan for a small class project. Aim to finish the core in a couple of focused sessions.

## Phase 1: Foundation
- Set up Express app, Mongo connection, and basic middleware (JSON parsing, CORS).
- Create User model + auth routes (register/login/me) with JWT protection.
- Add a `/health` endpoint for quick checks.

## Phase 2: Core Features
- Models/controllers/routes for Category, Expense, and Income.
- Expenses/Incomes belong to the authenticated user; support basic filtering by date/category.
- Dashboard endpoints: overview totals and recent transactions.

## Phase 3: Polish
- Input validation on required fields.
- Simple error handling and readable responses.
- Manual testing with Postman for the main flows.
- Optional: add Investments/Goals if time remains.

## Ready Checklist
- Can register/login and get a token.
- Can create/read/update/delete expenses and incomes.
- Dashboard returns totals without errors.
- Frontend can call the API with CORS allowed.***
