# Team Member 3: Investment, Budget & Goal Management - 10-Day Task List

## Overview
You are responsible for investment tracking, budget management, and financial goals. These are **key financial planning features**!

**Priority**: High - Investments and budgets are core features

---

## Your Role in the Team

### What You're Building:
- Investment portfolio tracking (stocks, real estate, crypto, gold)
- Budget management with alerts
- Financial goal tracking
- Zakah calculations

### Who Depends on You:
- **Team Member 4**: ⚠️ Needs Investment data for Dashboard (Day 5+)

### Your Dependencies:
- **Team Member 1**: ⚠️ BLOCKED until auth middleware ready (Day 2)
- **Team Member 2**: ⚠️ Need Categories for Budgets (Day 3) - BUT can work on Investments/Goals first
- **Team Member 4**: ⚠️ Need Express app setup (Day 1)

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
- [ ] Create Investment model (`models/Investment.js`)
  - [ ] Add userId, name, category (Stock, Real Estate, Crypto, Gold)
  - [ ] Add amountOwned, unitLabel (for stocks, crypto, gold)
  - [ ] Add areaSqm (for real estate)
  - [ ] Add buyPrice, currentPrice, purchaseDate
  - [ ] Add includeInZakah boolean
  - [ ] Add virtual fields (currentValue, gainLoss, percentageChange)
- [ ] Create Budget model (`models/Budget.js`)
  - [ ] Add userId, categoryId (reference to Category)
  - [ ] Add limit, period (weekly, monthly, yearly)
  - [ ] Add startDate, endDate, alertThreshold
- [ ] Create Goal model (`models/Goal.js`)
  - [ ] Add userId, name, targetAmount, savedAmount
  - [ ] Add deadline, priority, status

**End of Day Goal**: All 3 models complete ✅

---

### **Day 2: Controllers & Routes Setup**
**Morning (Wait for TM1's auth middleware):**
- [ ] Review TM1's auth middleware when ready
- [ ] Create `controllers/investmentController.js`
  - [ ] getAllInvestments function (filter by userId)
  - [ ] getInvestmentById function
- [ ] Create `controllers/goalController.js`
  - [ ] getAllGoals function
  - [ ] getGoalById function

**Afternoon (After TM1 shares auth):**
- [ ] Create `routes/investmentRoutes.js`
  - [ ] GET /api/investments (protected)
  - [ ] GET /api/investments/:id (protected)
  - [ ] POST /api/investments (protected)
- [ ] Create `routes/goalRoutes.js`
  - [ ] GET /api/goals (protected)
  - [ ] POST /api/goals (protected)
- [ ] Test with Postman (using JWT token from TM1)

**End of Day Goal**: Can retrieve and create investments/goals ✅

---

### **Day 3: Investment & Goal CRUD**
**Morning:**
- [ ] Complete Investment controller:
  - [ ] createInvestment (handle different types)
    ```javascript
    // Validate Real Estate: needs areaSqm
    // Validate others: needs amountOwned
    ```
  - [ ] updateInvestment (recalculate values)
  - [ ] deleteInvestment
- [ ] Add investment routes:
  - [ ] PUT /api/investments/:id
  - [ ] DELETE /api/investments/:id
- [ ] Test all investment types (Stock, Real Estate, Crypto, Gold)

**Afternoon:**
- [ ] Complete Goal controller:
  - [ ] createGoal
  - [ ] updateGoal (auto-update status if target reached)
  - [ ] deleteGoal
  - [ ] updateGoalProgress (PATCH /api/goals/:id/progress)
- [ ] Add goal routes:
  - [ ] PUT /api/goals/:id
  - [ ] DELETE /api/goals/:id
  - [ ] PATCH /api/goals/:id/progress
- [ ] Test goal CRUD

**End of Day Goal**: Investment & Goal CRUD complete ✅

---

### **Day 4: Budget Management** (After TM2 completes categories)
**Morning:**
- [ ] Create `controllers/budgetController.js`
- [ ] Implement budget CRUD:
  - [ ] getAllBudgets (with category details)
  - [ ] getBudgetById
  - [ ] createBudget (verify category exists)
  - [ ] updateBudget
  - [ ] deleteBudget
- [ ] Create `routes/budgetRoutes.js`
  - [ ] All CRUD routes (protected)
- [ ] Test budget endpoints

**Afternoon:**
- [ ] Implement getBudgetStatus:
  ```javascript
  // GET /api/budgets/status
  // Calculate spent amount for each budget
  // Compare with limit
  // Check if exceeds alertThreshold
  // Return status for all budgets
  ```
- [ ] Test budget status calculations
- [ ] Test with various expense amounts

**End of Day Goal**: Budget CRUD and status complete ✅

---

### **Day 5: Portfolio & Analytics**
**Morning:**
- [ ] Implement getPortfolioSummary:
  ```javascript
  // GET /api/investments/portfolio
  // Calculate total portfolio value
  // Group by category
  // Calculate overall gain/loss
  // Calculate percentage distribution
  ```
- [ ] Add investment filtering:
  - [ ] Filter by category
  - [ ] Sort by value, performance, date
- [ ] Test portfolio calculations

**Afternoon:**
- [ ] Implement getGoalStatistics:
  ```javascript
  // GET /api/goals/stats
  // Total saved across all goals
  // Average completion percentage
  // Goals on track vs behind
  // Completed goals count
  ```
- [ ] Test goal statistics
- [ ] Add progress calculation helpers

**End of Day Goal**: Portfolio and goal analytics complete ✅

---

### **Day 6: Zakah Calculation**
**Morning:**
- [ ] Create `utils/zakahCalculator.js`
  ```javascript
  // Calculate zakah on investments
  // Support category filtering
  // 2.5% rate on zakatable wealth
  ```
- [ ] Implement calculateZakah function:
  - [ ] Filter by includeInZakah flag
  - [ ] Allow category selection
  - [ ] Calculate current values
  - [ ] Apply 2.5% rate
  - [ ] Return breakdown by investment

**Afternoon:**
- [ ] Create zakah endpoint:
  ```javascript
  // GET /api/investments/zakah
  // Optional: ?categories=Stock,Gold
  // Return zakahBase, zakahAmount, breakdown
  ```
- [ ] Test zakah calculations:
  - [ ] All investments
  - [ ] Selected categories only
  - [ ] Verify 2.5% calculation
- [ ] Add zakah to portfolio response

**End of Day Goal**: Zakah calculator working ✅

---

### **Day 7-8: Integration & Bug Fixes**
**Work with team:**
- [ ] Test budget → category relationship (with TM2)
- [ ] Test budget → expense relationship (with TM2)
- [ ] Test investment data in dashboard (with TM4)
- [ ] Fix any integration bugs
- [ ] Add input validation:
  - [ ] Amounts must be positive
  - [ ] Prices must be positive
  - [ ] Real Estate must have area
  - [ ] Others must have amountOwned
- [ ] Optimize queries (add indexes)

**Specific tests:**
- [ ] Create budget → Add expenses → Check budget status
- [ ] Create investments → Calculate portfolio → Calculate zakah
- [ ] Create goal → Update progress → Auto-complete when target reached
- [ ] Update investment prices → Verify portfolio value updates

**End of Day Goal**: All integrations working ✅

---

### **Day 9: Documentation**
- [ ] Document all endpoints in README:

  **Investments:**
  - [ ] GET /api/investments
  - [ ] GET /api/investments/:id
  - [ ] POST /api/investments
  - [ ] PUT /api/investments/:id
  - [ ] DELETE /api/investments/:id
  - [ ] GET /api/investments/portfolio
  - [ ] GET /api/investments/zakah

  **Budgets:**
  - [ ] GET /api/budgets
  - [ ] GET /api/budgets/:id
  - [ ] POST /api/budgets
  - [ ] PUT /api/budgets/:id
  - [ ] DELETE /api/budgets/:id
  - [ ] GET /api/budgets/status

  **Goals:**
  - [ ] GET /api/goals
  - [ ] GET /api/goals/:id
  - [ ] POST /api/goals
  - [ ] PUT /api/goals/:id
  - [ ] DELETE /api/goals/:id
  - [ ] PATCH /api/goals/:id/progress
  - [ ] GET /api/goals/stats

- [ ] Document zakah calculation logic
- [ ] Add examples for each investment type
- [ ] Add to team Postman collection

**End of Day Goal**: Documentation complete ✅

---

### **Day 10: Final Testing & Support**
- [ ] Final testing of all endpoints
- [ ] Test with frontend team
- [ ] Verify portfolio calculations are accurate
- [ ] Verify zakah calculations are correct
- [ ] Fix any last-minute bugs

**End of Day Goal**: Investment/Budget/Goal system production-ready ✅

---

## Code Examples

### Investment Model
```javascript
// models/Investment.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Investment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  category: {
    type: String,
    enum: ['Stock', 'Real Estate', 'Crypto', 'Gold', 'Bonds', 'Other'],
    required: [true, 'Category is required']
  },
  // For stocks, crypto, gold
  amountOwned: {
    type: Number,
    min: [0, 'Amount owned cannot be negative']
  },
  unitLabel: {
    type: String,
    trim: true
  },
  // For real estate
  areaSqm: {
    type: Number,
    min: [0, 'Area cannot be negative']
  },
  // Common fields
  buyPrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Buy price cannot be negative']
  },
  currentPrice: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Current price cannot be negative']
  },
  purchaseDate: Date,
  notes: String,
  includeInZakah: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for current value
investmentSchema.virtual('currentValue').get(function() {
  if (this.category === 'Real Estate') {
    return this.currentPrice;
  }
  return this.currentPrice * (this.amountOwned || 0);
});

// Virtual for gain/loss
investmentSchema.virtual('gainLoss').get(function() {
  const current = this.currentValue;
  const purchase = this.category === 'Real Estate'
    ? this.buyPrice
    : this.buyPrice * (this.amountOwned || 0);
  return current - purchase;
});

// Virtual for percentage change
investmentSchema.virtual('percentageChange').get(function() {
  const purchase = this.category === 'Real Estate'
    ? this.buyPrice
    : this.buyPrice * (this.amountOwned || 0);
  if (purchase === 0) return 0;
  return ((this.gainLoss / purchase) * 100).toFixed(2);
});

// Enable virtuals in JSON
investmentSchema.set('toJSON', { virtuals: true });
investmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Investment', investmentSchema);
```

### Investment Controller
```javascript
// controllers/investmentController.js
const Investment = require('../models/Investment');

// Create investment
exports.createInvestment = async (req, res) => {
  try {
    const {
      name,
      category,
      amountOwned,
      unitLabel,
      areaSqm,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes,
      includeInZakah
    } = req.body;

    // Validate based on category
    if (category === 'Real Estate') {
      if (!areaSqm || areaSqm <= 0) {
        return res.status(400).json({
          error: 'Area in square meters is required for real estate'
        });
      }
    } else {
      if (!amountOwned || amountOwned <= 0) {
        return res.status(400).json({
          error: 'Amount owned is required for this investment type'
        });
      }
    }

    const investment = await Investment.create({
      userId: req.userId,
      name,
      category,
      amountOwned,
      unitLabel,
      areaSqm,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes,
      includeInZakah
    });

    res.status(201).json({
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    console.error('Create investment error:', error);
    res.status(500).json({ error: 'Failed to create investment' });
  }
};

// Get portfolio summary
exports.getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId });

    let totalValue = 0;
    let totalInvested = 0;
    const byCategory = {};

    investments.forEach(inv => {
      const currentVal = inv.category === 'Real Estate'
        ? inv.currentPrice
        : inv.currentPrice * inv.amountOwned;

      const invested = inv.category === 'Real Estate'
        ? inv.buyPrice
        : inv.buyPrice * inv.amountOwned;

      totalValue += currentVal;
      totalInvested += invested;

      if (!byCategory[inv.category]) {
        byCategory[inv.category] = {
          value: 0,
          invested: 0,
          count: 0,
          percentage: 0
        };
      }

      byCategory[inv.category].value += currentVal;
      byCategory[inv.category].invested += invested;
      byCategory[inv.category].count += 1;
    });

    // Calculate percentages
    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].percentage = totalValue > 0
        ? ((byCategory[cat].value / totalValue) * 100).toFixed(2)
        : 0;
    });

    const totalGainLoss = totalValue - totalInvested;
    const percentageChange = totalInvested > 0
      ? ((totalGainLoss / totalInvested) * 100).toFixed(2)
      : 0;

    res.json({
      totalValue,
      totalInvested,
      totalGainLoss,
      percentageChange,
      investmentCount: investments.length,
      byCategory
    });
  } catch (error) {
    console.error('Portfolio summary error:', error);
    res.status(500).json({ error: 'Failed to get portfolio summary' });
  }
};
```

### Zakah Calculator Utility
```javascript
// utils/zakahCalculator.js

/**
 * Calculate Zakah on investments
 * Zakah rate is 2.5% of zakatable wealth
 */
exports.calculateZakah = (investments, selectedCategories = null) => {
  let zakahBase = 0;
  const breakdown = [];

  investments.forEach(investment => {
    // Skip if not marked for zakah
    if (!investment.includeInZakah) return;

    // Skip if category not selected
    if (selectedCategories && !selectedCategories.includes(investment.category)) {
      return;
    }

    const currentValue = investment.category === 'Real Estate'
      ? investment.currentPrice
      : investment.currentPrice * investment.amountOwned;

    zakahBase += currentValue;

    breakdown.push({
      name: investment.name,
      category: investment.category,
      value: currentValue,
      zakahAmount: currentValue * 0.025
    });
  });

  const zakahAmount = zakahBase * 0.025; // 2.5%

  return {
    zakahBase,
    zakahAmount,
    rate: 2.5,
    breakdown,
    totalInvestments: breakdown.length
  };
};

/**
 * Check if wealth meets nisab threshold
 * Nisab is approximately 85 grams of gold
 */
exports.meetsNisab = (totalWealth, goldPricePerGram) => {
  const nisabInGold = 85; // grams
  const nisabValue = nisabInGold * goldPricePerGram;
  return {
    meetsNisab: totalWealth >= nisabValue,
    nisabValue,
    difference: totalWealth - nisabValue
  };
};
```

### Budget Model
```javascript
// models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  limit: {
    type: Number,
    required: [true, 'Budget limit is required'],
    min: [0, 'Budget limit cannot be negative']
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: Date,
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80 // Alert when 80% of budget is used
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate budgets
budgetSchema.index({ userId: 1, categoryId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
```

### Budget Controller
```javascript
// controllers/budgetController.js
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Get budget status
exports.getBudgetStatus = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId })
      .populate('categoryId', 'name color type');

    const budgetStatuses = await Promise.all(budgets.map(async (budget) => {
      // Calculate date range based on period
      const now = new Date();
      let startDate = budget.startDate;
      let endDate = budget.endDate || now;

      // Calculate spent amount for this budget
      const expenses = await Expense.aggregate([
        {
          $match: {
            userId: req.userId,
            categoryId: budget.categoryId._id,
            date: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      const spent = expenses[0]?.totalSpent || 0;
      const remaining = budget.limit - spent;
      const percentageUsed = budget.limit > 0
        ? ((spent / budget.limit) * 100).toFixed(2)
        : 0;

      const isOverBudget = spent > budget.limit;
      const isNearLimit = percentageUsed >= budget.alertThreshold;

      return {
        budgetId: budget._id,
        category: budget.categoryId.name,
        categoryColor: budget.categoryId.color,
        limit: budget.limit,
        spent,
        remaining,
        percentageUsed: parseFloat(percentageUsed),
        period: budget.period,
        startDate,
        endDate,
        isOverBudget,
        isNearLimit,
        alertThreshold: budget.alertThreshold
      };
    }));

    res.json({ budgets: budgetStatuses });
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({ error: 'Failed to get budget status' });
  }
};
```

---

## Manual Testing with Postman

### 1. Create Stock Investment
```
POST http://localhost:5000/api/investments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Apple Stock",
  "category": "Stock",
  "amountOwned": 10,
  "unitLabel": "shares",
  "buyPrice": 150,
  "currentPrice": 180,
  "purchaseDate": "2024-01-15",
  "includeInZakah": true
}

Expected: 201, investment with virtuals (currentValue, gainLoss)
```

### 2. Create Real Estate Investment
```
POST http://localhost:5000/api/investments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Apartment",
  "category": "Real Estate",
  "areaSqm": 120,
  "buyPrice": 500000,
  "currentPrice": 550000,
  "purchaseDate": "2023-06-01"
}

Expected: 201, real estate investment
```

### 3. Get Portfolio Summary
```
GET http://localhost:5000/api/investments/portfolio
Authorization: Bearer <token>

Expected: 200, portfolio summary with totals and breakdown by category
```

### 4. Calculate Zakah
```
GET http://localhost:5000/api/investments/zakah
Authorization: Bearer <token>

Expected: 200, zakah calculation with breakdown
```

### 5. Calculate Zakah for Specific Categories
```
GET http://localhost:5000/api/investments/zakah?categories=Stock,Gold
Authorization: Bearer <token>

Expected: 200, zakah only for selected categories
```

### 6. Create Budget
```
POST http://localhost:5000/api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "65abc123...",
  "limit": 1000,
  "period": "monthly",
  "startDate": "2024-11-01",
  "alertThreshold": 80
}

Expected: 201, budget object
```

### 7. Get Budget Status
```
GET http://localhost:5000/api/budgets/status
Authorization: Bearer <token>

Expected: 200, array of budget statuses with spent/remaining amounts
```

### 8. Create Goal
```
POST http://localhost:5000/api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "savedAmount": 2000,
  "deadline": "2025-12-31",
  "priority": "high"
}

Expected: 201, goal object
```

### 9. Update Goal Progress
```
PATCH http://localhost:5000/api/goals/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500
}

Expected: 200, updated goal (savedAmount increased by 500)
```

---

## Critical Checklist

### By End of Day 1:
- [ ] Investment, Budget, Goal models created

### By End of Day 2:
- [ ] Can create and retrieve investments
- [ ] Can create and retrieve goals

### By End of Day 4:
- [ ] Budget CRUD complete
- [ ] Budget status calculations working

### By End of Day 6:
- [ ] Portfolio summary working
- [ ] **Zakah calculator working** ⚠️ Important feature!

### By End of Day 9:
- [ ] All endpoints documented
- [ ] Postman collection complete

---

## Priority Matrix

**P0 (Critical - Must Do):**
- Investment CRUD
- Portfolio summary
- Budget CRUD
- Goal CRUD

**P1 (High - Should Do):**
- Budget status calculations
- Zakah calculation ⚠️ Core Islamic finance feature
- Goal progress tracking
- Portfolio analytics

**P2 (Medium - Nice to Have):**
- Advanced filtering
- Investment performance charts
- Goal statistics
- Budget alerts

**P3 (Low - Skip if Needed):**
- Nisab threshold checking
- Multi-currency support
- Investment history tracking

---

**Remember**: Zakah calculation is a unique Islamic finance feature - make sure it's accurate! 📊

**Your work enables financial planning!** 💰
