# Team Member 1: Authentication & User Management - 10-Day Task List

## Overview
You are responsible for building the authentication system and user management features. This is the **MOST CRITICAL** module - everyone depends on you!

**⚠️ CRITICAL**: Your auth middleware is the bottleneck. Prioritize getting it done by Day 2!

---

## Your Role in the Team

### What You're Building:
- User registration & login
- JWT authentication middleware
- User profile management
- Password reset (basic)

### Who Depends on You:
- **Team Member 2**: ⚠️ BLOCKED until auth middleware ready
- **Team Member 3**: ⚠️ BLOCKED until auth middleware ready
- **Team Member 4**: ⚠️ BLOCKED until auth middleware ready

### Your Dependencies:
- **Team Member 4**: Need Express app setup first (Day 1)

---

## 10-Day Timeline

### **Day 1: Setup (Morning with Team)**
**Work together with team (2-3 hours):**
- [ ] Create project structure
- [ ] Install dependencies
- [ ] Set up MongoDB Atlas
- [ ] Create `.env` file
- [ ] Test database connection

**Your afternoon work:**
- [ ] Create User model (`models/User.js`)
  - [ ] Add all fields (fullName, email, password, phoneNumber, address)
  - [ ] Add role field (user, advisor, admin)
  - [ ] Add preferences object
  - [ ] Add password hashing pre-save hook
  - [ ] Add comparePassword method
- [ ] Test User model creation

**End of Day Goal**: User model complete ✅

---

### **Day 2: Authentication Core** ⚠️ CRITICAL DAY
**This is your most important day - everyone is waiting for you!**

**Morning (Priority 1):**
- [ ] Create `utils/tokenGenerator.js`
  - [ ] generateAccessToken(userId)
  - [ ] generateRefreshToken(userId)
- [ ] Create `middleware/auth.js` ⚠️ **MOST CRITICAL**
  ```javascript
  // This is what everyone needs!
  const auth = async (req, res, next) => {
    // Get token from header
    // Verify JWT
    // Add req.userId
    // next()
  };
  ```
- [ ] Test auth middleware works

**Afternoon (Priority 2):**
- [ ] Create `controllers/authController.js`
  - [ ] register function (create user, hash password, return JWT)
  - [ ] login function (check credentials, return JWT)
- [ ] Create `routes/authRoutes.js`
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
- [ ] Test with Postman:
  - [ ] Register new user
  - [ ] Login with credentials
  - [ ] Receive JWT token

**End of Day Actions:**
- [ ] **Share auth middleware file with team** 🚨
- [ ] Send message: "Auth middleware ready in middleware/auth.js"
- [ ] Share example of how to use it

**End of Day Goal**: Auth middleware ready, register/login working ✅

---

### **Day 3: User Profile**

**Morning:**
- [ ] Create `controllers/userController.js`
- [ ] Implement getCurrentUser
  ```javascript
  // GET /api/auth/me
  // Uses auth middleware
  // Returns current user data
  ```
- [ ] Implement getUserProfile
  ```javascript
  // GET /api/users/profile
  // Returns user profile
  ```
- [ ] Test with Postman using JWT token

**Afternoon:**
- [ ] Implement updateUserProfile
  ```javascript
  // PUT /api/users/profile
  // Update name, email, phone, address
  // Handle password change separately
  ```
- [ ] Add validation for profile updates
- [ ] Test profile update

**End of Day Goal**: User profile CRUD complete ✅

---

### **Day 4: Password Management**

**Morning:**
- [ ] Implement forgotPassword
  ```javascript
  // POST /api/auth/forgot-password
  // Generate reset token
  // Save to user (skip email for now)
  // Return token in response (for testing)
  ```
- [ ] Implement resetPassword
  ```javascript
  // POST /api/auth/reset-password
  // Verify reset token
  // Update password
  ```
- [ ] Test password reset flow

**Afternoon:**
- [ ] Create `middleware/adminAuth.js`
  ```javascript
  // Check if user.role === 'admin'
  ```
- [ ] Add input validation to all endpoints
  - [ ] Email format
  - [ ] Password strength (min 8 chars, uppercase, lowercase, number)
  - [ ] Required fields
- [ ] Test validation errors

**End of Day Goal**: Password reset working, validation added ✅

---

### **Day 5: User Preferences & Admin**

**Morning:**
- [ ] Implement updatePreferences
  ```javascript
  // PUT /api/users/preferences
  // Update currency, language, theme, notifications
  ```
- [ ] Test preferences update

**Afternoon:**
- [ ] Implement admin endpoints:
  - [ ] getAllUsers (admin only)
    ```javascript
    // GET /api/users (admin)
    // Pagination: ?page=1&limit=20
    ```
  - [ ] updateUserRole (admin only)
    ```javascript
    // PUT /api/users/:id/role
    // Update user role
    ```
- [ ] Use adminAuth middleware
- [ ] Test with admin user

**End of Day Goal**: Preferences and admin endpoints working ✅

---

### **Day 6: Polish & Edge Cases**

**Morning:**
- [ ] Add rate limiting to auth routes
  ```javascript
  // 5 login attempts per 15 minutes
  ```
- [ ] Improve error messages
- [ ] Add account lockout after failed logins (optional)

**Afternoon:**
- [ ] Test edge cases:
  - [ ] Register with existing email
  - [ ] Login with wrong password
  - [ ] Access protected route without token
  - [ ] Access with expired token
  - [ ] Access admin route as regular user
- [ ] Fix any bugs found

**End of Day Goal**: All edge cases handled ✅

---

### **Day 7-8: Integration & Bug Fixes**

**Work with team:**
- [ ] Help others test their protected routes
- [ ] Fix any auth-related bugs
- [ ] Test complete user flow:
  - [ ] Register → Login → Update profile → Logout
- [ ] Add any missing validation
- [ ] Review security:
  - [ ] Passwords properly hashed? ✅
  - [ ] JWT secret secure? ✅
  - [ ] No sensitive data in responses? ✅

**End of Day Goal**: Auth system fully integrated ✅

---

### **Day 9: Documentation**

- [ ] Document all auth endpoints in README:
  - [ ] POST /api/auth/register
  - [ ] POST /api/auth/login
  - [ ] GET /api/auth/me
  - [ ] POST /api/auth/forgot-password
  - [ ] POST /api/auth/reset-password
  - [ ] PUT /api/users/profile
  - [ ] PUT /api/users/preferences
  - [ ] GET /api/users (admin)
  - [ ] PUT /api/users/:id/role (admin)

- [ ] Create example requests for each endpoint
- [ ] Document how to use auth middleware
- [ ] Add your endpoints to team Postman collection

**End of Day Goal**: Documentation complete ✅

---

### **Day 10: Final Testing & Support**

- [ ] Final testing of all auth endpoints
- [ ] Help team with frontend integration
- [ ] Fix any last-minute auth bugs
- [ ] Verify deployment works with auth

**End of Day Goal**: Auth system production-ready ✅

---

## Code Examples

### User Model
```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phoneNumber: String,
  address: String,
  role: {
    type: String,
    enum: ['user', 'advisor', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'English' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      transactionAlerts: { type: Boolean, default: true },
      budgetReminders: { type: Boolean, default: true },
      investmentUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive data from JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', userSchema);
```

### Auth Middleware (CRITICAL!)
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = auth;
```

### Auth Controller
```javascript
// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phoneNumber, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      phoneNumber,
      address
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
};
```

### Routes
```javascript
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
```

---

## Manual Testing with Postman

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "address": "123 Main St"
}

Expected: 201 status, token, user object
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Expected: 200 status, token, user object
```

### 3. Get Current User (Protected Route)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>

Expected: 200 status, user object
```

### 4. Test Without Token (Should Fail)
```
GET http://localhost:5000/api/auth/me

Expected: 401 status, "No token provided"
```

---

## Critical Checklist

### By End of Day 2 (MUST COMPLETE):
- [ ] User model created and working
- [ ] Register endpoint working
- [ ] Login endpoint working
- [ ] JWT tokens generated correctly
- [ ] **Auth middleware exported and shared with team** ⚠️

### By End of Day 4:
- [ ] User profile endpoints working
- [ ] Password reset working
- [ ] Input validation added

### By End of Day 6:
- [ ] Admin endpoints working
- [ ] All edge cases handled
- [ ] Security reviewed

### By End of Day 9:
- [ ] All endpoints documented
- [ ] Postman collection created
- [ ] Team can integrate with auth

---

## Communication

### Share with Team (End of Day 2):
```
"@team Auth middleware is ready! 🎉

File: middleware/auth.js

Usage:
const auth = require('./middleware/auth');
router.get('/protected', auth, controller.method);

The middleware adds req.userId to the request.

Example in routes/authRoutes.js

Test token: [paste a test token]
"
```

---

## Dependencies

```bash
npm install bcryptjs jsonwebtoken
```

---

## Common Issues

### Issue: JWT Token Invalid
**Solution**: Check JWT_SECRET is set in `.env`

### Issue: Password Not Hashing
**Solution**: Check pre-save hook in User model

### Issue: Can't Login After Register
**Solution**: Make sure password is being hashed, check comparePassword method

---

## Priority Matrix

**P0 (Critical - Must Do):**
- User model
- Register/Login
- Auth middleware ⚠️ MOST IMPORTANT
- Get current user

**P1 (High - Should Do):**
- User profile updates
- Password reset
- Input validation

**P2 (Medium - Nice to Have):**
- Admin endpoints
- User preferences
- Rate limiting

**P3 (Low - Skip if Needed):**
- Email verification
- Account lockout
- Social auth

---

**Remember**: You're on the critical path. If you fall behind, everyone falls behind. Communicate early if you're stuck! 🚨

**Your success = Team's success!** 💪

