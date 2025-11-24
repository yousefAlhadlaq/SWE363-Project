# Team Member 1: Authentication - Simplified Course Project

## Your Role
You handle **user authentication** - register, login, and protecting routes with JWT.

**Good news**: Most of this gets done on Day 1 with the whole team! After that, you just polish and help others.

---

## What You're Building (Simple!)

✅ User registration
✅ User login
✅ JWT authentication middleware
✅ Get current user endpoint
✅ Basic error handling

❌ NO email verification
❌ NO password reset
❌ NO refresh tokens
❌ NO rate limiting
❌ NO admin features

---

## 10-Day Simplified Timeline

### **Day 1: Auth Setup (WITH ENTIRE TEAM - 4 hours)**

**Work together with all 4 team members:**

**Morning (Together):**
- [ ] Set up project structure
- [ ] Install dependencies:
  ```bash
  npm install express mongoose dotenv bcryptjs jsonwebtoken cors
  npm install --save-dev nodemon
  ```
- [ ] Set up MongoDB Atlas
- [ ] Create `.env` file
- [ ] Create `server.js` and `app.js`

**Afternoon (Together):**
- [ ] User model
- [ ] Auth controller (register, login)
- [ ] Auth middleware (JWT)
- [ ] Test: Everyone can register and login

**Details:**
- Create simple User model (`models/User.js`):
  ```javascript
  {
    fullName: String,
    email: String (unique),
    password: String (hashed),
    role: String (default: 'user')
  }
  ```
- Create auth controller with `register` and `login` functions
- Create JWT middleware (`middleware/auth.js`)

**End of Day 1**: Basic auth working for everyone ✅

---

### **Day 2: Polish & Error Handling**

**Your solo work:**
- [ ] Add `GET /api/auth/me` endpoint (get current user)
- [ ] Improve error messages:
  - [ ] "Email already exists" for duplicate registration
  - [ ] "Invalid credentials" for wrong login
  - [ ] "No token provided" for missing auth
  - [ ] "Invalid token" for bad token
- [ ] Test all error scenarios with Postman
- [ ] Make sure passwords are hashing correctly

**End of Day 2**: Auth is polished ✅

---

### **Day 3: Help Others**

**Your work:**
- [ ] Review your code, add comments
- [ ] Help Team Member 2 with any auth middleware issues
- [ ] Help Team Member 3 with any auth middleware issues
- [ ] Help Team Member 4 with any auth middleware issues
- [ ] Test that all routes are properly protected

**End of Day 3**: Everyone's routes are protected ✅

---

### **Days 4-10: Support & Integration**

**Your role:**
- [ ] Day 4: Help with integration testing
- [ ] Days 5-6: Help with dashboard if needed
- [ ] Days 7-8: Help with documentation
- [ ] Days 9-10: Help with deployment

**You're done early - use your time to help the team!** ✅

---

## Simple Code Examples

### User Model (Minimal)
```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Auth Controller (Simple)
```javascript
// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Create user
    const user = await User.create({ fullName, email, password });

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Auth Middleware (Simple)
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Routes (Simple)
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

## Testing with Postman

### 1. Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@test.com",
  "password": "password123"
}

Expected: 201, token + user object
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@test.com",
  "password": "password123"
}

Expected: 200, token + user object
```

### 3. Get Current User (Protected)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-token-here>

Expected: 200, user object
```

### 4. Test Without Token (Should Fail)
```
GET http://localhost:5000/api/auth/me

Expected: 401, "No token provided"
```

---

## Checklist

### Day 1 (WITH TEAM):
- [ ] User model created
- [ ] Register endpoint works
- [ ] Login endpoint works
- [ ] JWT tokens generated
- [ ] Auth middleware works
- [ ] **Everyone on team can register/login**

### Day 2:
- [ ] GET /api/auth/me works
- [ ] Good error messages
- [ ] Tested all scenarios

### Day 3:
- [ ] Helped others protect their routes
- [ ] All routes use auth middleware
- [ ] Code is commented

---

## Common Issues

### Password not hashing?
Check the `pre('save')` hook in User model

### Token invalid?
Make sure JWT_SECRET is set in `.env`

### Can't login after register?
Check that password comparison works

### Routes not protected?
Make sure to use `auth` middleware:
```javascript
router.get('/protected', auth, controller.method);
```

---

## Priority

**P0 (Must Do):**
- Register ✅
- Login ✅
- JWT middleware ✅
- Get current user ✅

**P1 (Should Do):**
- Error handling ✅
- Help teammates ✅

**P2 (Nice to Have):**
- Code comments
- Extra validation

---

## Tips

1. **Day 1 is critical** - Make sure everyone understands auth
2. **Keep it simple** - Don't over-engineer
3. **Test early** - Use Postman after each endpoint
4. **Help others** - You'll finish before others, so help!
5. **Document** - Add comments explaining JWT flow

---

## Success = Everyone Can Auth

Your work is successful if:
- ✅ Any team member can register
- ✅ Any team member can login
- ✅ Any team member can protect their routes
- ✅ Tokens work correctly

**You're the foundation - keep it simple and solid!** 🔐

---

**Remember**: This is a course project. Simple working auth > Complex broken auth! 🎓
