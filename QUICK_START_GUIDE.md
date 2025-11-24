# Backend Quick Start (Step-by-Step for Beginners)

## 1) Check your tools
- Run `node -v` (should be 18.x or newer).
- Run `npm -v` to confirm npm is installed.
- Decide on MongoDB:
  - Local Mongo: use `mongodb://127.0.0.1:27017/quroosh` and make sure MongoDB service is running.
  - Atlas: grab your connection string from Atlas and replace `<password>` with your real password.

## 2) Install and configure
```bash
cd quroosh-backend
npm install
cp .env.example .env   # copy the sample env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=your_connection_string   # local or Atlas
JWT_SECRET=replace_me                # any random string for now
FRONTEND_URL=http://localhost:5173
```

## 3) Run the server
```bash
npm run dev    # uses nodemon
# or npm start
```
Open http://localhost:5000/api/health and expect `{ "status": "ok" }`. If it fails, recheck `MONGODB_URI` and that Mongo is running.

## 4) Build the features (order)
1. Auth: register/login + JWT middleware (TM1).
2. Categories, Expenses, Incomes using auth (TM2).
3. Optional: Investments, Goals, Budgets (TM3).
4. Dashboard for totals and recent items (TM4).

## 5) Test with Postman/Insomnia
- Register: `POST /api/auth/register` with `{ "name": "Test", "email": "a@b.com", "password": "Pass123!" }`
- Login: `POST /api/auth/login`
- Use the token for protected routes:
  - Header: `Authorization: Bearer <token>`
  - Create expense: `POST /api/expenses`
  - List expenses with filters: `GET /api/expenses?dateFrom=&dateTo=&categoryId=`
  - Dashboard: `GET /api/dashboard/overview`

## 6) Common fixes
- Connection errors → check `MONGODB_URI` and that Mongo is running/accessible.
- 401 errors → ensure the `Authorization: Bearer <token>` header is set and token isn’t expired.
- CORS errors → confirm `FRONTEND_URL` matches your frontend dev URL.
