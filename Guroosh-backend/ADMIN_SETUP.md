# Admin Setup & Usage Guide

## Admin User Credentials

**Email**: `admin@quroosh.com`
**Password**: `Admin123!`
**Role**: `admin`

---

## Creating Admin User

To create or update the admin user, run:

```bash
cd quroosh-backend
node scripts/createAdmin.js
```

This script will:
- Create a new admin user if none exists
- Update an existing user to admin role if the email already exists
- Set `isEmailVerified` to `true` (no verification needed for admin)

---

## Using Admin Authorization

### Available Middleware

The system provides three authorization middleware functions:

1. **`auth`** - Basic authentication (any logged-in user)
2. **`adminAuth`** - Admin-only access
3. **`advisorAuth`** - Advisor or admin access

### Import Middleware

```javascript
const { auth, adminAuth, advisorAuth } = require('../middleware/auth');
```

### Protecting Routes

#### Example 1: Admin-Only Route

```javascript
// Only admins can access this route
router.get('/admin/users', auth, adminAuth, async (req, res) => {
  // req.user contains the full user object
  // This code only runs if user.role === 'admin'
});
```

#### Example 2: Advisor or Admin Route

```javascript
// Advisors and admins can access
router.get('/advisor/clients', auth, advisorAuth, async (req, res) => {
  // This code runs if user.role === 'advisor' OR user.role === 'admin'
});
```

#### Example 3: Any Authenticated User

```javascript
// Any logged-in user can access
router.get('/profile', auth, async (req, res) => {
  // req.userId contains the user's ID
});
```

### Important Notes

1. **Always use `auth` first**, then add `adminAuth` or `advisorAuth`
   ```javascript
   // ✅ Correct
   router.get('/admin/route', auth, adminAuth, controller);

   // ❌ Wrong - adminAuth needs auth to run first
   router.get('/admin/route', adminAuth, controller);
   ```

2. **Error Responses**:
   - No token: `401 Unauthorized - "No token provided"`
   - Invalid token: `401 Unauthorized - "Invalid token"`
   - Not admin: `403 Forbidden - "Access denied. Admin privileges required."`
   - Not advisor: `403 Forbidden - "Access denied. Advisor privileges required."`

3. **User Object**: When using `adminAuth` or `advisorAuth`, the full user object is available at `req.user`

---

## Testing Admin Routes

### 1. Login as Admin

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quroosh.com","password":"Admin123!"}'
```

Response will include a token:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "role": "admin",
    ...
  }
}
```

### 2. Use Token in Admin Requests

```bash
curl -X GET http://localhost:5001/api/admin/route \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Example: Creating an Admin Route

### Step 1: Create Controller

```javascript
// src/controllers/adminController.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Step 2: Create Routes

```javascript
// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin privileges
router.get('/users', auth, adminAuth, adminController.getAllUsers);

module.exports = router;
```

### Step 3: Register Routes in app.js

```javascript
// src/app.js
app.use('/api/admin', require('./routes/adminRoutes'));
```

---

## User Roles

- **`user`** - Regular user (default)
- **`advisor`** - Financial advisor
- **`admin`** - Administrator (full access)

---

## Security Best Practices

1. ✅ Always verify user role on the backend (never trust frontend)
2. ✅ Use `auth` middleware before `adminAuth` or `advisorAuth`
3. ✅ Never expose sensitive operations without proper authorization
4. ✅ Log admin actions for audit trails
5. ❌ Never hardcode admin credentials in code
6. ❌ Never skip email verification for regular users (only admin)

---

## Troubleshooting

### "Access denied. Admin privileges required"
- Make sure you're logged in as admin
- Verify the token is being sent correctly
- Check that the user's role is actually 'admin' in the database

### "No token provided"
- Include the Authorization header: `Authorization: Bearer YOUR_TOKEN`

### Admin user not working after creation
- Restart the backend server after running the createAdmin script
- Verify the user exists in MongoDB with role='admin'
