# Team Member 1 – Auth & Users

You own login, tokens, and user data. Everyone else needs your JWT middleware.

## Deliverables
- User model with hashed passwords and `comparePassword` helper.
- Auth controllers wired into existing route stubs (`routes/authRoutes.js`).
- JWT auth middleware that sets `req.user` (id + email/role).
- Optional: password reset token endpoints.

## Step-by-step Implementation
0) **Database prep**
   - Confirm `MONGODB_URI` points to your DB (local or Atlas). All users will be in the `users` collection.
1) **Create the User model (`src/models/User.js`)**
   - Import bcrypt: `const bcrypt = require('bcryptjs');`.
   - Fields: `name`, `email` (unique, lowercase), `password`, `role` (`user|admin`), `createdAt`.
   - Pre-save hook: if `this.isModified('password')`, hash with `bcrypt.hash(password, saltRounds)`.
   - Instance method: `user.comparePassword(candidate)` returns `bcrypt.compare(candidate, this.password)`.
   - Add `select: false` on password so it’s excluded unless explicitly selected.
2) **Create token helper (`src/utils/tokens.js`)**
   - Export `signToken(payload)` using `jsonwebtoken.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })`.
3) **Build auth middleware (`src/middleware/auth.js`)**
   - Read `Authorization` header. Expect `Bearer <token>`.
   - If missing → `401`.
   - Verify with `JWT_SECRET`; on success set `req.user = { id, role }`; on failure → `401`.
   - `next()` to continue.
4) **Write controllers (`src/controllers/authController.js`)**
   - `register(req, res)`: validate name/email/password; check email unique; create user (hash happens in model); create token; respond `{ token, user: { id, name, email, role } }`.
   - `login(req, res)`: find user by email; `comparePassword`; if ok return token + user; else `401`.
   - `me(req, res)`: use `req.user.id` to fetch user (exclude password) and return it.
5) **Wire routes (`src/routes/authRoutes.js`)**
   - Replace stubs with controllers + middleware:
     ```js
     const { register, login, me } = require('../controllers/authController');
     const auth = require('../middleware/auth');
     router.post('/register', register);
     router.post('/login', login);
     router.get('/me', auth, me);
     ```
6) **Admin check (optional) (`src/middleware/requireAdmin.js`)**
   - Middleware: if `req.user.role !== 'admin'` return `403`; else `next()`.
7) **Validation tips**
   - Email format: simple regex or `express-validator`.
   - Password rules: min length (e.g., 8), mix of letters/numbers.
   - On validation failure return `400` with a clear message.
8) **Sample Mongo document (what you should see)**
   ```json
   {
     "_id": "64...ef",
     "name": "Alice",
     "email": "a@b.com",
     "password": "<hashed>",   // never plain text
     "role": "user",
     "createdAt": "2024-11-25T12:00:00Z"
   }
   ```

## How to Build It
1) **Model (`models/User.js`)**
   - Fields: name, email (unique), password (hashed), role (`user|admin`), createdAt.
   - Pre-save: hash password if modified.
   - Method: `user.comparePassword(candidate)`.
2) **Token helpers (`utils/tokens.js`)**
   - `signToken(payload)` using `JWT_SECRET` and expiry.
3) **Middleware (`middleware/auth.js`)**
   - Read `Authorization: Bearer <token>`, verify, attach `req.user = { id, role }`, call `next()`.
4) **Controllers (`controllers/authController.js`)**
   - `register`: validate, create user, return token + user basics.
   - `login`: find by email, `comparePassword`, return token + user basics.
   - `me`: return current user (without password).
5) **Routes (`routes/authRoutes.js`)**
   - Fill the existing stub handlers for `POST /register`, `POST /login`, `GET /me` to call your controllers.
6) **Admin check (optional)**
   - `middleware/requireAdmin.js` checks `req.user.role === 'admin'`.

## Quick Test Flow (Postman)
1. Register: `POST /api/auth/register` → body `{ "name": "Alice", "email": "a@b.com", "password": "Pass123!" }` → expect token.
2. Login: `POST /api/auth/login` with same creds → expect token.
3. Me: `GET /api/auth/me` with header `Authorization: Bearer <token>` → expect user info (no password).

## Integration Notes
- Export the middleware so TM2/TM3/TM4 can protect their routes.
- Return clean errors (`401` for missing/invalid token, `400` for bad input).
- Keep responses small: `{ token, user: { id, name, email, role } }`.
