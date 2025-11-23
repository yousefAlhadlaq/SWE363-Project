# Team Member 4: Dashboard, Integration & Deployment - 10-Day Task List

## Overview
You are the **Integration Lead** and infrastructure specialist. You set up the foundation, build the dashboard, and bring everything together at the end!

**Priority**: HIGHEST on Days 1-2 (you block everyone), then HIGHEST again on Days 7-10 (integration)

---

## Your Role in the Team

### What You're Building:
- **Phase 1 (Days 1-2)**: Express app + all middleware (blocks everyone)
- **Phase 2 (Days 3-6)**: Dashboard analytics + Advisor features
- **Phase 3 (Days 7-10)**: Integration + Deployment (blocks everyone)

### Who Depends on You:
- **EVERYONE**: ⚠️ Blocked until Express app ready (Day 1-2)
- **EVERYONE**: ⚠️ Blocked during integration (Days 7-8)

### Your Dependencies:
- **Day 1-2**: None - you start first
- **Day 3+**:
  - **Team Member 1**: Need auth middleware
  - **Team Member 2**: Need Expense/Income data for dashboard
  - **Team Member 3**: Need Investment data for dashboard

---

## 10-Day Timeline

### **Day 1: Foundation Setup** ⚠️ CRITICAL - You Block Everyone!
**Morning (Work with entire team - 2-3 hours):**
- [ ] Lead team setup session
- [ ] Create complete project structure together
- [ ] Install all dependencies
- [ ] Set up MongoDB Atlas (guide team through this)
- [ ] Create `.env` file
- [ ] Test database connection works

**Your afternoon work (SOLO - This is critical!):**
- [ ] Create `config/database.js`
  ```javascript
  // MongoDB connection with Mongoose
  // Error handling
  // Connection events
  ```
- [ ] Create `server.js`
  ```javascript
  // Load environment variables
  // Connect to database
  // Start Express server
  // Graceful shutdown
  ```
- [ ] Create basic `app.js`
  ```javascript
  // Initialize Express
  // Basic middleware (body-parser, cors, helmet)
  // Health check route
  // Export app
  ```
- [ ] Test: Server runs on port 5000 ✅

**End of Day Actions:**
- [ ] **Share server.js and app.js with team** 🚨
- [ ] Send message: "Express app running, database connected!"
- [ ] Everyone should be able to run `npm run dev`

**End of Day Goal**: Express app running, database connected ✅

---

### **Day 2: Middleware Foundation** ⚠️ CRITICAL
**Morning:**
- [ ] Create `middleware/errorHandler.js`
  ```javascript
  // Global error handler
  // Handle different error types (ValidationError, CastError, etc.)
  // Development vs production errors
  ```
- [ ] Create `middleware/rateLimiter.js`
  ```javascript
  // General API rate limiter
  // Stricter auth rate limiter
  ```
- [ ] Add all middleware to app.js:
  - [ ] CORS (configured for frontend URL)
  - [ ] Helmet (security headers)
  - [ ] Body parser
  - [ ] Rate limiter
  - [ ] Error handler (MUST be last!)

**Afternoon:**
- [ ] Create route scaffolding in app.js:
  ```javascript
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/expenses', require('./routes/expenseRoutes'));
  app.use('/api/incomes', require('./routes/incomeRoutes'));
  app.use('/api/investments', require('./routes/investmentRoutes'));
  app.use('/api/budgets', require('./routes/budgetRoutes'));
  app.use('/api/goals', require('./routes/goalRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  app.use('/api/advisors', require('./routes/advisorRoutes'));
  ```
- [ ] Create 404 handler
- [ ] Test error handling works

**End of Day Actions:**
- [ ] Commit and push all infrastructure code
- [ ] Notify team: "All middleware ready, routes scaffolded"

**End of Day Goal**: Complete Express infrastructure ready ✅

---

### **Day 3: Dashboard Overview**
**Morning (Wait for TM1's auth, TM2's data):**
- [ ] Create `controllers/dashboardController.js`
- [ ] Create `routes/dashboardRoutes.js`
- [ ] Implement getOverview:
  ```javascript
  // GET /api/dashboard/overview
  // Total income (current month)
  // Total expenses (current month)
  // Net balance
  // Total investments value
  // Active budgets count
  // Active goals count
  ```
- [ ] Use auth middleware to protect route

**Afternoon:**
- [ ] Test dashboard overview with sample data
- [ ] Ask TM2 for sample expense/income
- [ ] Ask TM3 for sample investment
- [ ] Verify calculations are correct

**End of Day Goal**: Dashboard overview working ✅

---

### **Day 4: Dashboard Analytics**
**Morning:**
- [ ] Implement getFinancialStatus:
  ```javascript
  // GET /api/dashboard/financial-status
  // Accept timeRange parameter (week, month, year)
  // Income trends over time
  // Expense trends over time
  // Net cash flow
  // Return time series data
  ```
- [ ] Test with different time ranges

**Afternoon:**
- [ ] Implement getRecentTransactions:
  ```javascript
  // GET /api/dashboard/recent-transactions
  // Merge expenses and incomes
  // Sort by date (newest first)
  // Limit to 10-20 items
  // Include category details
  ```
- [ ] Test recent transactions

**End of Day Goal**: Financial status and recent transactions working ✅

---

### **Day 5: Dashboard Breakdown**
**Morning:**
- [ ] Implement getSpendingBreakdown:
  ```javascript
  // GET /api/dashboard/spending-breakdown
  // Group expenses by category
  // Calculate percentages
  // Identify top categories
  // Return breakdown data
  ```
- [ ] Use MongoDB aggregation
- [ ] Test breakdown calculations

**Afternoon:**
- [ ] Implement getMonthlyComparison:
  ```javascript
  // GET /api/dashboard/monthly-comparison
  // Compare current month vs previous month
  // Income comparison
  // Expense comparison
  // Savings comparison
  ```
- [ ] Test monthly comparison

**End of Day Goal**: All dashboard analytics complete ✅

---

### **Day 6: Advisor Management**
**Morning:**
- [ ] Create Advisor model (`models/Advisor.js`)
  - [ ] userId reference to User
  - [ ] specialization array
  - [ ] bio, rating, totalReviews
  - [ ] availability object (days and hours)
  - [ ] hourlyRate
  - [ ] isActive boolean

**Afternoon:**
- [ ] Create `controllers/advisorController.js`
  - [ ] getAllAdvisors (with filtering)
  - [ ] getAdvisorById
  - [ ] createAdvisorProfile (advisor role only)
  - [ ] updateAdvisorProfile
  - [ ] updateAvailability
- [ ] Create `routes/advisorRoutes.js`
- [ ] Test advisor endpoints

**End of Day Goal**: Advisor management working ✅

---

### **Day 7-8: Integration & Testing** ⚠️ YOU ARE THE LEAD!
**Day 7 Morning:**
- [ ] **Team coordination meeting**
  - [ ] Check all routes are integrated in app.js
  - [ ] Verify all controllers export correctly
  - [ ] Test each route individually

**Day 7 Afternoon:**
- [ ] **Integration testing** (coordinate with team):
  - [ ] Test: Register → Login → Create expense → Dashboard shows it
  - [ ] Test: Create category → Create expense → Filter by category
  - [ ] Test: Create budget → Add expenses → Budget status updates
  - [ ] Test: Create investment → Portfolio calculates correctly
  - [ ] Fix any integration bugs

**Day 8 Morning:**
- [ ] Add database indexes:
  ```javascript
  // In models, add indexes for:
  // - userId on all models
  // - date on expenses/incomes
  // - categoryId on expenses/budgets
  ```
- [ ] Test query performance
- [ ] Add input validation to all endpoints

**Day 8 Afternoon:**
- [ ] Security review:
  - [ ] CORS configured correctly?
  - [ ] Rate limiting working?
  - [ ] Auth middleware on all protected routes?
  - [ ] No sensitive data in responses?
- [ ] Performance optimization:
  - [ ] Add .lean() to read-only queries
  - [ ] Use select() to limit fields
  - [ ] Optimize aggregation pipelines

**End of Day Goal**: All features integrated and working together ✅

---

### **Day 9: Documentation & Polish**
**Morning:**
- [ ] Create comprehensive README.md:
  ```markdown
  # Quroosh Backend API

  ## Setup Instructions
  ## Environment Variables
  ## API Endpoints
  ## Authentication
  ## Error Handling
  ## Deployment
  ```
- [ ] Document all dashboard endpoints
- [ ] Document all advisor endpoints
- [ ] Add example requests/responses

**Afternoon:**
- [ ] Create Postman collection with ALL endpoints:
  - [ ] Auth endpoints
  - [ ] User endpoints
  - [ ] Category endpoints
  - [ ] Expense/Income endpoints
  - [ ] Investment endpoints
  - [ ] Budget/Goal endpoints
  - [ ] Dashboard endpoints
  - [ ] Advisor endpoints
- [ ] Export and share with team
- [ ] Final bug fixes

**End of Day Goal**: Complete documentation ready ✅

---

### **Day 10: Deployment & Launch** 🚀
**Morning:**
- [ ] Choose deployment platform (Railway recommended)
- [ ] Deploy to Railway:
  1. Sign up at railway.app
  2. Connect GitHub repository
  3. Add environment variables
  4. Deploy
- [ ] OR deploy to Heroku/Render if preferred
- [ ] Verify production environment variables are set
- [ ] Test deployment works

**Afternoon:**
- [ ] Update CORS to allow production frontend URL
- [ ] Test all endpoints on production
- [ ] Help frontend team integrate:
  - [ ] Share production API URL
  - [ ] Help debug any integration issues
  - [ ] Verify frontend can register/login
  - [ ] Verify frontend can create expenses
  - [ ] Verify dashboard shows data
- [ ] Final verification
- [ ] Prepare demo

**End of Day Goal**: Backend deployed and frontend connected ✅

---

## Code Examples

### Express App Setup
```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', rateLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/incomes', require('./routes/incomeRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/advisors', require('./routes/advisorRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Error handler (must be last!)
app.use(errorHandler);

module.exports = app;
```

### Server Setup
```javascript
// server.js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});
```

### Database Configuration
```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Error Handler Middleware
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value.`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
```

### Dashboard Controller
```javascript
// controllers/dashboardController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Investment = require('../models/Investment');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Get dashboard overview
exports.getOverview = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get total income for current month
    const totalIncome = await Income.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total expenses for current month
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(userId),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total investments value
    const investments = await Investment.find({ userId });
    let totalInvestments = 0;
    investments.forEach(inv => {
      totalInvestments += inv.category === 'Real Estate'
        ? inv.currentPrice
        : inv.currentPrice * inv.amountOwned;
    });

    // Get counts
    const activeBudgets = await Budget.countDocuments({ userId });
    const activeGoals = await Goal.countDocuments({
      userId,
      status: 'active'
    });

    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const netBalance = income - expenses;

    res.json({
      income,
      expenses,
      netBalance,
      investments: totalInvestments,
      activeBudgets,
      activeGoals,
      period: 'current_month'
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard overview'
    });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent expenses
    const expenses = await Expense.find({ userId: req.userId })
      .populate('categoryId', 'name color type')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Get recent incomes
    const incomes = await Income.find({ userId: req.userId })
      .populate('categoryId', 'name color type')
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    // Format and merge
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id,
      type: 'expense',
      amount: exp.amount,
      title: exp.title,
      category: exp.categoryId?.name || 'Uncategorized',
      categoryColor: exp.categoryId?.color,
      date: exp.date,
      merchant: exp.merchant
    }));

    const formattedIncomes = incomes.map(inc => ({
      id: inc._id,
      type: 'income',
      amount: inc.amount,
      title: inc.source,
      category: inc.categoryId?.name || 'Income',
      categoryColor: inc.categoryId?.color,
      date: inc.date
    }));

    // Merge and sort
    const transactions = [...formattedExpenses, ...formattedIncomes]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to get recent transactions'
    });
  }
};
```

---

## Deployment Guide

### Option 1: Railway (Recommended - Easiest)

1. **Sign up at railway.app**
2. **New Project → Deploy from GitHub**
3. **Connect your repository**
4. **Add environment variables:**
   - Click "Variables" tab
   - Add all variables from `.env`:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_secret
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=https://your-frontend.vercel.app
     ```
5. **Deploy automatically happens**
6. **Get deployment URL** (e.g., `https://quroosh-backend.up.railway.app`)

### Option 2: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create quroosh-backend

# Add MongoDB addon OR use external MongoDB Atlas
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set FRONTEND_URL=your_frontend_url

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Option 3: Render

1. Sign up at render.com
2. New Web Service → Connect repository
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Add environment variables
5. Deploy

---

## Testing Checklist

### Day 1-2: Infrastructure
- [ ] Server starts on port 5000
- [ ] Database connects successfully
- [ ] Health check endpoint works
- [ ] All middleware loads without errors

### Day 3-6: Features
- [ ] Dashboard overview returns correct data
- [ ] Recent transactions merge expenses and incomes
- [ ] Spending breakdown calculates percentages
- [ ] Advisor CRUD works

### Day 7-8: Integration
- [ ] Complete user flow: Register → Login → Create expense → Dashboard
- [ ] All routes return proper status codes
- [ ] Error handling works for invalid data
- [ ] CORS allows frontend requests
- [ ] Rate limiting prevents abuse

### Day 9-10: Deployment
- [ ] Production deployment successful
- [ ] All environment variables set
- [ ] Frontend can connect to backend
- [ ] No CORS errors
- [ ] All endpoints work in production

---

## Critical Checklist

### By End of Day 1 (CRITICAL):
- [ ] **Express app running** ⚠️
- [ ] **Database connected** ⚠️
- [ ] **Team can run `npm run dev`** ⚠️

### By End of Day 2 (CRITICAL):
- [ ] **All middleware ready** ⚠️
- [ ] **Routes scaffolded in app.js** ⚠️
- [ ] **Error handling works** ⚠️

### By End of Day 6:
- [ ] Dashboard complete
- [ ] Advisor management working

### By End of Day 8 (CRITICAL):
- [ ] **All features integrated** ⚠️
- [ ] **Team testing complete** ⚠️

### By End of Day 10 (CRITICAL):
- [ ] **Deployed to production** ⚠️
- [ ] **Frontend connected** ⚠️

---

## Communication Protocol

### Day 1 End:
```
"@team Express app is ready! 🎉

✅ Server running on port 5000
✅ Database connected
✅ Health check: GET http://localhost:5000/api/health

Everyone can now:
1. git pull
2. npm install
3. Add .env file
4. npm run dev

Start building your routes!"
```

### Day 2 End:
```
"@team Infrastructure complete! 🎉

✅ All middleware ready
✅ Error handling setup
✅ CORS configured
✅ All routes scaffolded in app.js

You can now create your route files and they'll automatically work!"
```

### Day 7:
```
"@team Integration Day! 🚀

Please test:
1. All your endpoints work
2. Error handling is consistent
3. No missing validation
4. CORS allows frontend

Let's meet at 2 PM to test together."
```

---

## Priority Matrix

**P0 (Critical - Must Do):**
- Express app setup ⚠️ Day 1
- All middleware ⚠️ Day 2
- Dashboard overview
- Integration ⚠️ Days 7-8
- Deployment ⚠️ Day 10

**P1 (High - Should Do):**
- Dashboard analytics
- Recent transactions
- Error handling polish
- Documentation

**P2 (Medium - Nice to Have):**
- Advisor management
- Monthly comparison
- Advanced analytics

**P3 (Low - Skip if Needed):**
- Advisor ratings
- Complex reporting
- Extra statistics

---

## Final Notes

**Remember**:
- You block everyone on Day 1-2 - be fast and clear!
- You coordinate integration on Days 7-8 - be organized!
- You handle deployment on Day 10 - be thorough!
- **Communication is critical** - keep team updated!

**Your role is to make everyone else successful!** 🚀

**You're the glue that holds the project together!** 💪
