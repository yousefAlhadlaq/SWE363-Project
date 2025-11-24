# Team Member 2 – Categories, Expenses, Income

You own money flows. Use TM1’s auth middleware on every route.

## Deliverables
- Models for Category, Expense, Income (all tied to `userId`).
- Controllers for CRUD and filters, wired into existing route stubs.
- Expense/Income list endpoints with basic filters.

## How to Build It (step-by-step)
0) **Database prep**
   - Confirm `MONGODB_URI` works. Collections will be `categories`, `expenses`, `incomes`.
1) **Models (`src/models/Category.js`, `Expense.js`, `Income.js`)**
   - Category: fields `userId` (ObjectId), `name`, `type` (`expense|income`), optional `color/icon`; add unique index on `{ userId, name, type }`.
   - Expense: fields `userId`, `categoryId`, `amount`, `title`, `date`, optional `merchant/notes`; add index on `{ userId, date }`.
   - Income: fields `userId`, optional `categoryId`, `amount`, `source`, `date`.
2) **Controllers (`src/controllers/categoryController.js`, etc.)**
   - List: `find({ userId: req.user.id })`.
   - Create: validate required fields; for expenses/incomes ensure category belongs to the user (if provided).
   - Update/Delete: first `findOne({ _id: id, userId })`; if not found → `404`.
   - Filters: support `dateFrom`, `dateTo`, `categoryId` query params; build a `filters` object and pass to `find`.
3) **Routes (`src/routes/categoryRoutes.js`, `expenseRoutes.js`, `incomeRoutes.js`)**
   - Require auth middleware at top: `const auth = require('../middleware/auth'); router.use(auth);`
   - Replace placeholder handlers with controller calls, e.g.:
     ```js
     router.get('/', getAllExpenses);
     router.post('/', createExpense);
     router.put('/:id', updateExpense);
     router.delete('/:id', deleteExpense);
     ```
4) **Validation Tips**
   - Check amounts are numbers > 0; dates are valid ISO strings.
   - Ensure `categoryId` is a valid ObjectId and belongs to the current user when used.
   - On bad input return `400` with a clear message; on not found return `404`.
5) **Sample Mongo documents**
   - Category:
     ```json
     { "_id": "64...c1", "userId": "64...u1", "name": "Food", "type": "expense" }
     ```
   - Expense:
     ```json
     { "_id": "64...e1", "userId": "64...u1", "categoryId": "64...c1", "amount": 25.5, "title": "Lunch", "date": "2024-11-26" }
     ```
   - Income:
     ```json
     { "_id": "64...i1", "userId": "64...u1", "amount": 500, "source": "Salary", "date": "2024-11-25" }
     ```

## Quick Test Flow (Postman)
1. Login to get token from TM1.
2. Create a category: `POST /api/categories` with token.
3. Create an expense/income using that category.
4. List expenses with `?dateFrom=&dateTo=&categoryId=`; confirm only your data returns.

## Integration Notes
- Coordinate sample expense/income docs for TM4’s dashboard queries.
- Keep queries scoped: `find({ userId: req.user.id })`.
- Emit consistent shapes (e.g., `{ id, amount, title, date, category }`) so the dashboard can render easily.
