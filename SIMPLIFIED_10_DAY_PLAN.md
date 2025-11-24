# Quroosh Backend - Simplified 10-Day Course Project Plan

## 🎯 Simplified Scope for Course Project

This is a **simplified version** focused on getting core features working quickly. Perfect for a course project!

---

## What We're Cutting (Not Essential for Course)

❌ Email verification
❌ Password reset
❌ Email service
❌ Refresh tokens
❌ Rate limiting
❌ Advanced validation
❌ Admin panel features
❌ Advisor management
❌ File uploads
❌ SMS parsing
❌ Recurring transactions
❌ Complex analytics

---

## What We're Keeping (Core Features)

✅ User registration & login (basic JWT)
✅ Categories (create, list)
✅ Expenses (CRUD + basic filtering)
✅ Incomes (CRUD)
✅ Investments (CRUD + simple portfolio)
✅ Budgets (CRUD + simple status)
✅ Goals (CRUD)
✅ Simple Dashboard (totals only)

---

## Simplified Models

### 1. User (Minimal)
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: 'user'),
  createdAt: Date
}
```

### 2. Category (Simple)
```javascript
{
  userId: ObjectId,
  name: String,
  type: String ('expense' or 'income'),
  color: String
}
```

### 3. Expense (Essential Fields)
```javascript
{
  userId: ObjectId,
  categoryId: ObjectId,
  amount: Number,
  title: String,
  date: Date,
  description: String (optional)
}
```

### 4. Income (Essential Fields)
```javascript
{
  userId: ObjectId,
  amount: Number,
  source: String,
  date: Date
}
```

### 5. Investment (Simplified)
```javascript
{
  userId: ObjectId,
  name: String,
  category: String ('Stock', 'Real Estate', 'Crypto', 'Gold'),
  currentValue: Number,
  purchaseValue: Number,
  date: Date
}
```

### 6. Budget (Simplified)
```javascript
{
  userId: ObjectId,
  categoryId: ObjectId,
  limit: Number,
  period: String ('monthly'),
  startDate: Date
}
```

### 7. Goal (Simplified)
```javascript
{
  userId: ObjectId,
  name: String,
  targetAmount: Number,
  savedAmount: Number,
  deadline: Date
}
```

---

## Simplified API Endpoints (30 total instead of 60+)

### Authentication (3 endpoints)
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Categories (3 endpoints)
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create category
- DELETE `/api/categories/:id` - Delete category

### Expenses (5 endpoints)
- GET `/api/expenses` - Get all expenses (with basic filters)
- GET `/api/expenses/:id` - Get one expense
- POST `/api/expenses` - Create expense
- PUT `/api/expenses/:id` - Update expense
- DELETE `/api/expenses/:id` - Delete expense

### Incomes (4 endpoints)
- GET `/api/incomes` - Get all incomes
- POST `/api/incomes` - Create income
- PUT `/api/incomes/:id` - Update income
- DELETE `/api/incomes/:id` - Delete income

### Investments (4 endpoints)
- GET `/api/investments` - Get all investments
- POST `/api/investments` - Create investment
- PUT `/api/investments/:id` - Update investment
- DELETE `/api/investments/:id` - Delete investment

### Budgets (4 endpoints)
- GET `/api/budgets` - Get all budgets
- POST `/api/budgets` - Create budget
- PUT `/api/budgets/:id` - Update budget
- DELETE `/api/budgets/:id` - Delete budget

### Goals (4 endpoints)
- GET `/api/goals` - Get all goals
- POST `/api/goals` - Create goal
- PUT `/api/goals/:id` - Update goal
- DELETE `/api/goals/:id` - Delete goal

### Dashboard (3 endpoints)
- GET `/api/dashboard/overview` - Simple totals
- GET `/api/dashboard/recent` - Recent 10 transactions
- GET `/api/dashboard/stats` - Basic statistics

---

## 10-Day Simplified Timeline

### **Day 1: Setup (EVERYONE Together - 3-4 hours)**
**All team members work together:**
- [ ] Create project structure
- [ ] Install dependencies: `npm install express mongoose dotenv bcryptjs jsonwebtoken cors`
- [ ] Set up MongoDB Atlas
- [ ] Create `.env` file
- [ ] Create basic `server.js` and `app.js`
- [ ] Test server runs
- [ ] Create User model together
- [ ] Create auth controller together (register, login)
- [ ] **Everyone tests they can register and login** ✅

**Goal**: By end of day, everyone can register and login

---

### **Day 2-3: Individual Work - Models & Basic CRUD**

**Team Member 1** (Auth & User):
- [ ] JWT middleware (reuse from Day 1)
- [ ] GET /api/auth/me endpoint
- [ ] Basic error handling

**Team Member 2** (Categories & Expenses):
- [ ] Category model (simple)
- [ ] Category routes (GET, POST, DELETE)
- [ ] Expense model (simple)
- [ ] Expense routes (all 5 endpoints)
- [ ] Test with Postman

**Team Member 3** (Investments & Goals):
- [ ] Investment model (simplified)
- [ ] Investment routes (all 4 endpoints)
- [ ] Goal model (simple)
- [ ] Goal routes (all 4 endpoints)
- [ ] Test with Postman

**Team Member 4** (Income & Budgets):
- [ ] Income model
- [ ] Income routes (all 4 endpoints)
- [ ] Budget model
- [ ] Budget routes (all 4 endpoints)
- [ ] Test with Postman

**Goal**: All basic CRUD working by end of Day 3

---

### **Day 4: Integration Day**
**Everyone together:**
- [ ] Test complete flow: Register → Login → Create expense → Get expenses
- [ ] Fix any bugs
- [ ] Test all CRUD operations work
- [ ] Make sure auth middleware protects all routes

---

### **Day 5-6: Dashboard & Filtering**

**Team Member 1**:
- [ ] Help others debug issues
- [ ] Review security (passwords hashed, JWT working)

**Team Member 2**:
- [ ] Add expense filtering (by date range, by category)
- [ ] Calculate expense totals
- [ ] Test filtering

**Team Member 3**:
- [ ] Calculate portfolio total (sum of all investment values)
- [ ] Calculate goal progress (savedAmount / targetAmount)
- [ ] Test calculations

**Team Member 4**:
- [ ] Create Dashboard controller
- [ ] GET /api/dashboard/overview:
  ```javascript
  {
    totalIncome: sum of incomes,
    totalExpenses: sum of expenses,
    totalInvestments: sum of investment values,
    activeGoals: count of goals,
    activeBudgets: count of budgets
  }
  ```
- [ ] GET /api/dashboard/recent: Last 10 expenses + incomes
- [ ] Test dashboard

**Goal**: Dashboard shows real data

---

### **Day 7: Polish & Testing**
**Everyone:**
- [ ] Test all endpoints work
- [ ] Add basic validation (amount > 0, required fields)
- [ ] Fix any remaining bugs
- [ ] Test with realistic data
- [ ] Clean up console.logs

---

### **Day 8: Documentation**
**Split work:**
- **TM1 & TM2**: Write README with setup instructions
- **TM3 & TM4**: Create Postman collection with all endpoints
- **Everyone**: Add comments to your code

---

### **Day 9: Deployment**
**TM4 leads, others help:**
- [ ] Deploy to Railway.app (easiest)
- [ ] Set environment variables
- [ ] Test production works
- [ ] Share production URL

---

### **Day 10: Frontend Integration & Demo**
- [ ] Connect frontend to backend
- [ ] Test complete user flow
- [ ] Fix any final bugs
- [ ] Prepare demo/presentation

---

## Simplified File Structure

```
quroosh-backend/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Expense.js
│   │   ├── Income.js
│   │   ├── Investment.js
│   │   ├── Budget.js
│   │   └── Goal.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── expenseController.js
│   │   ├── incomeController.js
│   │   ├── investmentController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── investmentRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── goalRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   └── auth.js (JWT verification only)
│   ├── config/
│   │   └── database.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## Minimal Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**That's it!** No helmet, no rate limiting, no validators, no multer, no email service.

---

## Simplified Code Examples

### Minimal User Model
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Simple Auth Controller
```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await User.create({ fullName, email, password });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(201).json({ token, user: { id: user._id, fullName, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, fullName: user.fullName, email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Simple Auth Middleware
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Simple Expense Model
```javascript
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true, min: 0 },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
```

### Simple Expense Controller
```javascript
const Expense = require('../models/Expense');

// Get all expenses (with optional date filter)
exports.getAllExpenses = async (req, res) => {
  try {
    const { startDate, endDate, categoryId } = req.query;
    const query = { userId: req.userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (categoryId) {
      query.categoryId = categoryId;
    }

    const expenses = await Expense.find(query)
      .populate('categoryId', 'name color')
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      userId: req.userId
    });
    res.status(201).json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Simple Dashboard Controller
```javascript
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Investment = require('../models/Investment');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

exports.getOverview = async (req, res) => {
  try {
    // Simple aggregations
    const expenses = await Expense.find({ userId: req.userId });
    const incomes = await Income.find({ userId: req.userId });
    const investments = await Investment.find({ userId: req.userId });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);

    const activeBudgets = await Budget.countDocuments({ userId: req.userId });
    const activeGoals = await Goal.countDocuments({ userId: req.userId });

    res.json({
      totalExpenses,
      totalIncome,
      netBalance: totalIncome - totalExpenses,
      totalInvestments,
      activeBudgets,
      activeGoals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(10)
      .populate('categoryId', 'name color');

    const incomes = await Income.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(10);

    const transactions = [
      ...expenses.map(e => ({ ...e.toObject(), type: 'expense' })),
      ...incomes.map(i => ({ ...i.toObject(), type: 'income' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## Simplified .env File

```env
# Just 3 variables!
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quroosh
JWT_SECRET=your_random_secret_key_here
```

---

## Success Criteria (Course Project)

**Must Have** ✅:
- [ ] User can register and login
- [ ] User can create, view, edit, delete expenses
- [ ] User can create, view categories
- [ ] Dashboard shows totals
- [ ] Backend deployed and accessible
- [ ] Frontend can connect and use API

**Nice to Have** (if time permits):
- [ ] Expense filtering by date
- [ ] Investments CRUD
- [ ] Budgets CRUD
- [ ] Goals CRUD

---

## Quick Deployment (Railway - 5 minutes)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Sign up with GitHub
4. Click "New Project" → "Deploy from GitHub repo"
5. Select your repository
6. Add environment variables (MONGODB_URI, JWT_SECRET)
7. Deploy! ✅

---

## Tips for Course Project Success

1. **Start simple** - Get auth working first, then add features
2. **Test as you go** - Use Postman after building each endpoint
3. **Commit often** - Push to GitHub daily
4. **Help each other** - Pair program if stuck
5. **Don't over-engineer** - Simple code that works > complex code that doesn't
6. **Focus on core features** - Better to have 5 features working perfectly than 10 half-working

---

## What If We Fall Behind?

### Priority 1 (Must Complete):
- Auth (register, login)
- Expenses CRUD
- Dashboard (simple totals)

### Priority 2 (Should Complete):
- Categories
- Incomes
- Basic filtering

### Priority 3 (If Time Permits):
- Investments
- Budgets
- Goals

---

## Estimated Time Per Feature

- **Auth**: 4-6 hours
- **One CRUD resource**: 2-3 hours
- **Dashboard**: 2-3 hours
- **Deployment**: 1-2 hours
- **Frontend integration**: 2-4 hours

**Total realistic time**: 30-40 hours (spread over 10 days = 3-4 hours/day per person)

---

**Remember**: This is a course project, not a startup! The goal is to learn and demonstrate you can build a functional full-stack app. Keep it simple! 🎓

**Good luck!** 🚀
