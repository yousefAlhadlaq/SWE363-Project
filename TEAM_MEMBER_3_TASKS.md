# Team Member 3: Investments & Goals - Simplified Course Project

## Your Role
You handle **investments and financial goals** - important for financial planning!

**Good news**: Most database setup gets done on Day 1 with the whole team! After that, you build your features.

---

## What You're Building (Simple!)

✅ Investment CRUD (stocks, crypto, real estate, gold)
✅ Goal CRUD (financial goals with progress tracking)
✅ Simple portfolio summary (total value, gain/loss)
✅ Update goal progress

❌ NO zakah calculations
❌ NO budget alerts
❌ NO complex portfolio analytics
❌ NO investment history
❌ NO multi-currency support
❌ NO nisab threshold checking

---

## 10-Day Simplified Timeline

### **Day 1: Setup & Models (WITH ENTIRE TEAM - 4 hours)**

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
- [ ] Everyone works on User model together (TM1 leads)
- [ ] Create Investment model:
  ```javascript
  // models/Investment.js
  {
    userId: ObjectId,
    name: String,
    category: String ('Stock', 'Crypto', 'Real Estate', 'Gold'),
    amountOwned: Number,
    buyPrice: Number,
    currentPrice: Number,
    purchaseDate: Date
  }
  ```
- [ ] Create Goal model:
  ```javascript
  // models/Goal.js
  {
    userId: ObjectId,
    name: String,
    targetAmount: Number,
    savedAmount: Number,
    deadline: Date,
    status: String ('in-progress', 'completed')
  }
  ```
- [ ] Test: Everyone can connect to database!

**End of Day 1**: Models created, database connected ✅

---

### **Day 2: Investment CRUD**

**Your solo work:**
- [ ] Create `controllers/investmentController.js`:
  - [ ] `getAllInvestments` - Get all user's investments
  - [ ] `getInvestmentById` - Get single investment
  - [ ] `createInvestment` - Create new investment
  - [ ] `updateInvestment` - Update investment
  - [ ] `deleteInvestment` - Delete investment
- [ ] Create `routes/investmentRoutes.js`:
  - [ ] GET /api/investments (protected)
  - [ ] GET /api/investments/:id (protected)
  - [ ] POST /api/investments (protected)
  - [ ] PUT /api/investments/:id (protected)
  - [ ] DELETE /api/investments/:id (protected)
- [ ] Register routes in `app.js`
- [ ] Test all investment operations with Postman

**End of Day 2**: Investment CRUD works ✅

---

### **Day 3: Goal CRUD**

**Your work:**
- [ ] Create `controllers/goalController.js`:
  - [ ] `getAllGoals` - Get all user's goals
  - [ ] `getGoalById` - Get single goal
  - [ ] `createGoal` - Create new goal
  - [ ] `updateGoal` - Update goal
  - [ ] `deleteGoal` - Delete goal
  - [ ] `updateGoalProgress` - Add money to saved amount
- [ ] Create `routes/goalRoutes.js`:
  - [ ] GET /api/goals (protected)
  - [ ] GET /api/goals/:id (protected)
  - [ ] POST /api/goals (protected)
  - [ ] PUT /api/goals/:id (protected)
  - [ ] DELETE /api/goals/:id (protected)
  - [ ] PATCH /api/goals/:id/progress (protected)
- [ ] Test all goal operations

**End of Day 3**: Goal CRUD complete ✅

---

### **Day 4: Portfolio Summary**

**Your work:**
- [ ] Add `getPortfolioSummary` function:
  - [ ] Calculate total current value
  - [ ] Calculate total invested
  - [ ] Calculate total gain/loss
  - [ ] Group by category
- [ ] Add route: GET /api/investments/portfolio
- [ ] Test portfolio calculations with different investments
- [ ] Add input validation:
  - [ ] Amount must be positive
  - [ ] Prices must be positive

**End of Day 4**: Portfolio summary works ✅

---


## Simple Code Examples

### Investment Model (Minimal)
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
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Stock', 'Crypto', 'Real Estate', 'Gold', 'Other'],
    required: true
  },
  amountOwned: {
    type: Number,
    required: true,
    min: 0
  },
  buyPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Investment', investmentSchema);
```

### Goal Model (Minimal)
```javascript
// models/Goal.js
const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  savedAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
```

### Investment Controller (Simple)
```javascript
// controllers/investmentController.js
const Investment = require('../models/Investment');

// Get all investments
exports.getAllInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId })
      .sort({ purchaseDate: -1 });

    res.json({ investments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single investment
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create investment
exports.createInvestment = async (req, res) => {
  try {
    const {
      name,
      category,
      amountOwned,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes
    } = req.body;

    const investment = await Investment.create({
      userId: req.userId,
      name,
      category,
      amountOwned,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes
    });

    res.status(201).json({
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update investment
exports.updateInvestment = async (req, res) => {
  try {
    const {
      name,
      category,
      amountOwned,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes
    } = req.body;

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, category, amountOwned, buyPrice, currentPrice, purchaseDate, notes },
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({
      message: 'Investment updated successfully',
      investment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
      const currentValue = inv.currentPrice * inv.amountOwned;
      const investedValue = inv.buyPrice * inv.amountOwned;

      totalValue += currentValue;
      totalInvested += investedValue;

      if (!byCategory[inv.category]) {
        byCategory[inv.category] = {
          value: 0,
          count: 0
        };
      }

      byCategory[inv.category].value += currentValue;
      byCategory[inv.category].count += 1;
    });

    const totalGainLoss = totalValue - totalInvested;

    res.json({
      totalValue,
      totalInvested,
      totalGainLoss,
      investmentCount: investments.length,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Goal Controller (Simple)
```javascript
// controllers/goalController.js
const Goal = require('../models/Goal');

// Get all goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId })
      .sort({ deadline: 1 });

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single goal
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ goal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline } = req.body;

    const goal = await Goal.create({
      userId: req.userId,
      name,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline
    });

    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline, status } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, targetAmount, savedAmount, deadline, status },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Add to saved amount
    goal.savedAmount += amount;

    // Auto-complete if target reached
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json({
      message: 'Goal progress updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes (Simple)
```javascript
// routes/investmentRoutes.js
const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const auth = require('../middleware/auth');

router.get('/', auth, investmentController.getAllInvestments);
router.get('/portfolio', auth, investmentController.getPortfolioSummary);
router.get('/:id', auth, investmentController.getInvestmentById);
router.post('/', auth, investmentController.createInvestment);
router.put('/:id', auth, investmentController.updateInvestment);
router.delete('/:id', auth, investmentController.deleteInvestment);

module.exports = router;
```

```javascript
// routes/goalRoutes.js
const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const auth = require('../middleware/auth');

router.get('/', auth, goalController.getAllGoals);
router.get('/:id', auth, goalController.getGoalById);
router.post('/', auth, goalController.createGoal);
router.put('/:id', auth, goalController.updateGoal);
router.delete('/:id', auth, goalController.deleteGoal);
router.patch('/:id/progress', auth, goalController.updateGoalProgress);

module.exports = router;
```

### Register Routes in app.js
```javascript
// app.js
const investmentRoutes = require('./routes/investmentRoutes');
const goalRoutes = require('./routes/goalRoutes');

app.use('/api/investments', investmentRoutes);
app.use('/api/goals', goalRoutes);
```

---

## Testing with Postman

### 1. Create Investment
```
POST http://localhost:5000/api/investments
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Apple Stock",
  "category": "Stock",
  "amountOwned": 10,
  "buyPrice": 150,
  "currentPrice": 180,
  "purchaseDate": "2024-01-15",
  "notes": "Tech stock investment"
}

Expected: 201, investment object
```

### 2. Get All Investments
```
GET http://localhost:5000/api/investments
Authorization: Bearer <your-token>

Expected: 200, array of investments
```

### 3. Get Portfolio Summary
```
GET http://localhost:5000/api/investments/portfolio
Authorization: Bearer <your-token>

Expected: 200, portfolio summary with totals and breakdown by category
```

### 4. Create Goal
```
POST http://localhost:5000/api/goals
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "savedAmount": 2000,
  "deadline": "2025-12-31"
}

Expected: 201, goal object
```

### 5. Update Goal Progress
```
PATCH http://localhost:5000/api/goals/:id/progress
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "amount": 500
}

Expected: 200, updated goal (savedAmount increased by 500)
```

---

## Checklist

### Day 1 (WITH TEAM):
- [ ] Investment model created
- [ ] Goal model created
- [ ] Database connected

### Day 2:
- [ ] Investment CRUD complete
- [ ] All investment routes working
- [ ] Tested with Postman

### Day 3:
- [ ] Goal CRUD complete
- [ ] All goal routes working
- [ ] Goal progress update works

### Day 4:
- [ ] Portfolio summary working
- [ ] Calculations verified
- [ ] Input validation added

---

## Common Issues

### Investment value calculation wrong?
Check: currentPrice * amountOwned = currentValue

### Portfolio not showing all investments?
Make sure you're filtering by userId

### Goal not auto-completing?
Check if savedAmount >= targetAmount in updateGoalProgress

### Can't update investment?
Make sure investment belongs to the logged-in user

---

## Priority

**P0 (Must Do):**
- Investment CRUD ✅
- Goal CRUD ✅
- Portfolio summary ✅

**P1 (Should Do):**
- Input validation ✅
- Error handling ✅
- Goal progress update ✅

**P2 (Nice to Have):**
- Better error messages
- Code comments
- Additional calculations

---

## Tips

1. **Keep calculations simple** - Just basic math, no complex formulas
2. **Test portfolio math** - Verify totals are correct
3. **Auto-complete goals** - When savedAmount >= targetAmount
4. **Help TM4** - They need your investment data for dashboard
5. **Start with one investment type** - Get it working, then add others

---

## Success = Working Portfolio

Your work is successful if:
- ✅ Investments can be created for different types
- ✅ Portfolio shows total value correctly
- ✅ Goals can track progress
- ✅ TM4 can fetch investment data for dashboard

**You enable financial planning - keep it simple and accurate!** 💰

---

**Remember**: This is a course project. Simple working features > Complex broken calculations! 🎓
