# Team Member 4: Dashboard & Deployment - Simplified Course Project

## Your Role
You are the **Infrastructure Lead**! You set up the foundation that everyone needs, build a simple dashboard, and deploy everything at the end.

**Good news**: Infrastructure work is straightforward for a course project. Once set up, you help with dashboard and deployment!

---

## What You're Building (Simple!)

✅ Express app setup (server, middleware, routes)
✅ Database connection
✅ Basic dashboard (total income, expenses, net balance)
✅ Recent transactions
✅ Deployment to Railway/Heroku

❌ NO complex analytics
❌ NO advisor management
❌ NO rate limiting
❌ NO advanced middleware
❌ NO complex aggregations
❌ NO multi-currency support

---

## 10-Day Simplified Timeline

### **Day 1: Foundation Setup (WITH ENTIRE TEAM - 4 hours)** ⚠️ CRITICAL

**Work together with all 4 team members:**

**Morning (Together - YOU LEAD THIS):**
- [ ] Set up project structure:
  ```bash
  mkdir quroosh-backend
  cd quroosh-backend
  npm init -y
  ```
- [ ] Install dependencies:
  ```bash
  npm install express mongoose dotenv bcryptjs jsonwebtoken cors
  npm install --save-dev nodemon
  ```
- [ ] Set up MongoDB Atlas (guide team through this)
- [ ] Create `.env` file:
  ```
  PORT=5000
  MONGODB_URI=your_mongodb_uri
  JWT_SECRET=your_secret_key
  NODE_ENV=development
  ```
- [ ] Create basic folder structure:
  ```
  quroosh-backend/
  ├── models/
  ├── controllers/
  ├── routes/
  ├── middleware/
  ├── config/
  ├── .env
  ├── server.js
  ├── app.js
  └── package.json
  ```

**Afternoon (Together):**
- [ ] Create `config/database.js` (MongoDB connection)
- [ ] Create `server.js` (starts the server)
- [ ] Create `app.js` (Express app with basic middleware)
- [ ] Test: Run `npm run dev` and see server running on port 5000
- [ ] Everyone works on User model together (TM1 leads)

**End of Day Actions:**
- [ ] **Notify team: "Express app running, database connected!"** 🚨
- [ ] Everyone should be able to run `npm run dev`

**End of Day 1**: Express app running, database connected ✅

---

### **Day 2: Routes Setup**

**Your solo work:**
- [ ] Update `app.js` to register all routes:
  ```javascript
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/categories', require('./routes/categoryRoutes'));
  app.use('/api/expenses', require('./routes/expenseRoutes'));
  app.use('/api/investments', require('./routes/investmentRoutes'));
  app.use('/api/goals', require('./routes/goalRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
  ```
- [ ] Add 404 handler
- [ ] Test health check endpoint works
- [ ] Notify team: "All routes registered in app.js!"

**End of Day 2**: Routes scaffolded ✅

---

### **Day 3: Dashboard Overview**

**Your work (after TM2 has some data):**
- [ ] Create `controllers/dashboardController.js`
- [ ] Create `routes/dashboardRoutes.js`
- [ ] Implement `getOverview`:
  ```javascript
  // GET /api/dashboard/overview
  // Calculate:
  // - Total income (current month)
  // - Total expenses (current month)
  // - Net balance (income - expenses)
  // - Total investments value
  ```
- [ ] Test with Postman using some sample data
- [ ] Ask TM2 to create sample expenses for testing

**End of Day 3**: Dashboard overview works ✅

---

### **Day 4: Recent Transactions**

**Your work:**
- [ ] Implement `getRecentTransactions`:
  ```javascript
  // GET /api/dashboard/recent-transactions
  // Get last 10 expenses
  // Get last 10 incomes
  // Merge and sort by date
  // Return with category details
  ```
- [ ] Test recent transactions endpoint
- [ ] Verify data shows correctly

**End of Day 4**: Recent transactions works ✅

---

### **Days 5-7: Help Team & Integration**

**Your role:**
- [ ] Day 5: Help teammates with any issues
- [ ] Day 6: Test all routes together
- [ ] Day 7: **Integration Day** - Lead team testing:
  - [ ] Test: Register → Login → Create expense → Dashboard shows it
  - [ ] Test: Create category → Create expense with category
  - [ ] Test: Create investment → Dashboard shows total value
  - [ ] Fix any bugs found during testing

**End of Day 7**: All features integrated ✅

---

### **Day 8-9: Documentation & Polish**

**Your work:**
- [ ] Create simple README.md:
  ```markdown
  # Quroosh Backend API

  ## Setup
  1. Clone repository
  2. npm install
  3. Create .env file
  4. npm run dev

  ## Environment Variables
  - PORT
  - MONGODB_URI
  - JWT_SECRET

  ## API Endpoints
  [List all endpoints]
  ```
- [ ] Test all endpoints one final time
- [ ] Fix any remaining bugs
- [ ] Help team prepare for deployment

**End of Day 9**: Documentation complete ✅

---

### **Day 10: Deployment** 🚀

**Morning:**
- [ ] Sign up at railway.app (recommended) or render.com
- [ ] Deploy backend:
  1. Connect GitHub repository
  2. Add environment variables
  3. Deploy
- [ ] Get production URL (e.g., https://quroosh-backend.up.railway.app)
- [ ] Test production deployment

**Afternoon:**
- [ ] Share production URL with team
- [ ] Test all endpoints in production
- [ ] Help frontend team connect to backend
- [ ] Verify end-to-end works
- [ ] Prepare demo

**End of Day 10**: Deployed and working! ✅

---

## Simple Code Examples

### Database Configuration
```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### Express App (Simple)
```javascript
// app.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

module.exports = app;
```

### Dashboard Controller (Simple)
```javascript
// controllers/dashboardController.js
const Expense = require('../models/Expense');
const Investment = require('../models/Investment');
const mongoose = require('mongoose');

// Get dashboard overview
exports.getOverview = async (req, res) => {
  try {
    const userId = req.userId;

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total expenses this month
    const expenseResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
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

    const totalExpenses = expenseResult[0]?.total || 0;

    // Total investments value
    const investments = await Investment.find({ userId });
    let totalInvestments = 0;

    investments.forEach(inv => {
      totalInvestments += inv.currentPrice * inv.amountOwned;
    });

    // For now, set income to 0 (can be enhanced later)
    const totalIncome = 0;
    const netBalance = totalIncome - totalExpenses;

    res.json({
      totalIncome,
      totalExpenses,
      netBalance,
      totalInvestments,
      period: 'current_month'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent transactions
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent expenses
    const expenses = await Expense.find({ userId: req.userId })
      .populate('categoryId', 'name color')
      .sort({ date: -1 })
      .limit(limit);

    // Format expenses
    const transactions = expenses.map(exp => ({
      id: exp._id,
      type: 'expense',
      amount: exp.amount,
      title: exp.title,
      category: exp.categoryId?.name || 'Uncategorized',
      categoryColor: exp.categoryId?.color,
      date: exp.date,
      merchant: exp.merchant
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Dashboard Routes (Simple)
```javascript
// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/overview', auth, dashboardController.getOverview);
router.get('/recent-transactions', auth, dashboardController.getRecentTransactions);

module.exports = router;
```

### package.json Scripts
```json
{
  "name": "quroosh-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "mongoose": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
```

---

## Testing with Postman

### 1. Health Check
```
GET http://localhost:5000/api/health

Expected: 200, { "status": "OK" }
```

### 2. Dashboard Overview
```
GET http://localhost:5000/api/dashboard/overview
Authorization: Bearer <your-token>

Expected: 200, overview object with totals
```

### 3. Recent Transactions
```
GET http://localhost:5000/api/dashboard/recent-transactions
Authorization: Bearer <your-token>

Expected: 200, array of recent transactions
```

---

## Deployment to Railway (Recommended)

### Step-by-Step:

1. **Sign up at railway.app**

2. **New Project → Deploy from GitHub**
   - Connect your GitHub account
   - Select your backend repository

3. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. **Deploy**
   - Railway will automatically detect Node.js
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete

5. **Get Your URL**
   - Copy the deployment URL (e.g., `https://quroosh-backend.up.railway.app`)
   - Share with frontend team

6. **Test Production**
   ```
   GET https://quroosh-backend.up.railway.app/api/health
   Expected: 200, { "status": "OK" }
   ```

---

## Alternative: Deploy to Render

1. Sign up at render.com
2. New Web Service → Connect repository
3. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Add all variables
4. Deploy
5. Get URL and test

---

## Checklist

### Day 1 (WITH TEAM):
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] MongoDB Atlas set up
- [ ] Server runs on port 5000
- [ ] Database connects successfully
- [ ] **Team can run npm run dev** 🚨

### Day 2:
- [ ] All routes registered in app.js
- [ ] 404 handler works
- [ ] Health check endpoint works

### Day 3:
- [ ] Dashboard overview endpoint works
- [ ] Calculations are correct

### Day 4:
- [ ] Recent transactions endpoint works
- [ ] Data format is correct

### Day 7:
- [ ] Integration testing complete
- [ ] All endpoints work together
- [ ] Bugs fixed

### Day 10:
- [ ] Backend deployed to production
- [ ] Environment variables set
- [ ] Frontend can connect
- [ ] End-to-end works

---

## Common Issues

### Server won't start?
Check: Is MongoDB Atlas IP allowlist set to 0.0.0.0/0 (allow all)?

### Routes not working?
Check: Did you register them in app.js?

### Dashboard returns 0 for everything?
Check: Do you have sample data in database?

### CORS errors on frontend?
Check: Is cors middleware added in app.js?

### Deployment failing?
Check: Are all environment variables set in Railway/Render?

---

## Priority

**P0 (Must Do):**
- Express app setup ✅ (Day 1)
- Database connection ✅ (Day 1)
- Routes registration ✅ (Day 2)
- Dashboard overview ✅ (Day 3)
- Deployment ✅ (Day 10)

**P1 (Should Do):**
- Recent transactions ✅
- Integration testing ✅
- Documentation ✅

**P2 (Nice to Have):**
- Better error messages
- Additional dashboard features

---

## Communication

### Day 1 End:
```
"@team Express app is ready! 🎉

✅ Server running on port 5000
✅ Database connected
✅ Test: GET http://localhost:5000/api/health

Everyone can now:
1. git pull
2. npm install
3. Add .env file with your MongoDB URI
4. npm run dev

Start building your routes!"
```

### Day 2 End:
```
"@team All routes are registered in app.js! 🎉

You can now create your route files:
- routes/authRoutes.js (TM1)
- routes/categoryRoutes.js (TM2)
- routes/expenseRoutes.js (TM2)
- routes/investmentRoutes.js (TM3)
- routes/goalRoutes.js (TM3)

They'll automatically work!"
```

### Day 10:
```
"@team Backend is LIVE! 🚀

Production URL: https://quroosh-backend.up.railway.app

Frontend team can now:
1. Update API base URL to production URL
2. Test all features
3. Let me know if anything breaks!

Great work everyone!"
```

---

## Tips

1. **Day 1 is critical** - Make sure everyone can run the server
2. **Keep it simple** - No fancy middleware for course project
3. **Test early** - Health check endpoint first
4. **Help others** - You're the integration lead
5. **Document as you go** - Makes deployment easier

---

## Success = Deployed Backend

Your work is successful if:
- ✅ Everyone can run the server on Day 1
- ✅ Dashboard shows correct data
- ✅ Backend is deployed to production
- ✅ Frontend can connect and work

**You're the foundation - keep it simple and solid!** 🚀

---

**Remember**: This is a course project. Working deployment > Complex features! 🎓
