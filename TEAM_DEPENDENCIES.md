# Team Dependencies (Concise)

## Build Sequence (Remaining)
1) **TM1**: Finish auth middleware + auth controllers and plug them into `routes/authRoutes.js` → everyone can protect routes.
2) **TM2**: Build categories/expenses/incomes using auth → unlocks TM3 budgets and provides data for TM4 dashboard.
3) **TM3**: Add investments/goals/budgets (budgets need TM2 categories) → optional data for dashboard.
4) **TM4**: Replace dashboard placeholders with real aggregations using TM2 (and TM3 if ready) data.

## Critical Blocks
- No protected routes until TM1’s auth middleware is in place.
- No budgets without TM2 categories.
- Dashboard depends on TM2 expenses/incomes; investments/goals are optional add-ons.

## Coordination
- Share sample category/expense/income docs early for dashboard testing.
- Use the shared auth middleware on every protected route.
- Short daily sync to clear blockers quickly.
- If blocked: TM2/TM3 can still draft models/controllers and swap them into the route stubs once auth is ready.
