# Team Member 2: Expense, Income & Category Management - 10-Day Task List

## Overview
You are responsible for expense tracking, income management, and category features. This is **core functionality** for the finance app!

**Priority**: Second highest - Categories are needed by Team Member 3 for budgets

---

## Your Role in the Team

### What You're Building:
- Category management (CRUD)
- Expense tracking (CRUD + filtering + statistics)
- Income tracking (CRUD + statistics)

### Who Depends on You:
- **Team Member 3**: ⚠️ Needs Categories for Budgets (Day 3)
- **Team Member 4**: ⚠️ Needs Expense/Income data for Dashboard (Day 4+)

### Your Dependencies:
- **Team Member 1**: ⚠️ BLOCKED until auth middleware ready (Day 2)
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
- [ ] Create Category model (`models/Category.js`)
  - [ ] Add userId, name, type (expense/income)
  - [ ] Add color, icon, enabled fields
  - [ ] Add compound unique index (userId + name + type)
- [ ] Create Expense model (`models/Expense.js`)
  - [ ] Add userId, categoryId, amount, title, description
  - [ ] Add date, merchant, paymentMethod
  - [ ] Add indexes for userId and date
- [ ] Create Income model (`models/Income.js`)
  - [ ] Add userId, categoryId (optional), amount, source
  - [ ] Add date, description

**End of Day Goal**: All 3 models complete ✅

---

### **Day 2: Controllers & Routes Setup**
**Morning (Wait for TM1's auth middleware):**
- [ ] Review TM1's auth middleware when ready
- [ ] Create `controllers/categoryController.js`
  - [ ] getAllCategories function (filter by userId)
  - [ ] getCategoryById function
- [ ] Create `controllers/expenseController.js`
  - [ ] getAllExpenses function (basic)
  - [ ] getExpenseById function

**Afternoon (After TM1 shares auth):**
- [ ] Create `routes/categoryRoutes.js`
  - [ ] GET /api/categories (protected with auth)
  - [ ] GET /api/categories/:id (protected)
  - [ ] POST /api/categories (protected)
- [ ] Create `routes/expenseRoutes.js`
  - [ ] GET /api/expenses (protected)
  - [ ] POST /api/expenses (protected)
- [ ] Test with Postman (using JWT token from TM1)

**End of Day Goal**: Can retrieve and create categories/expenses ✅

---

### **Day 3: Complete Category & Expense CRUD** ⚠️ IMPORTANT
**Morning:**
- [ ] Complete Category controller:
  - [ ] createCategory (check for duplicates)
  - [ ] updateCategory
  - [ ] deleteCategory (check if in use)
  - [ ] toggleCategoryStatus (enable/disable)
- [ ] Add category routes:
  - [ ] PUT /api/categories/:id
  - [ ] DELETE /api/categories/:id
  - [ ] PATCH /api/categories/:id/toggle
- [ ] Test all category operations

**Afternoon:**
- [ ] Complete Expense controller:
  - [ ] createExpense (validate category exists)
  - [ ] updateExpense
  - [ ] deleteExpense
- [ ] Add expense routes:
  - [ ] PUT /api/expenses/:id
  - [ ] DELETE /api/expenses/:id
- [ ] **Notify TM3: "Categories ready for budgets!"** 🚨

**End of Day Goal**: Category & Expense CRUD complete ✅

---

### **Day 4: Expense Filtering & Income**
**Morning:**
- [ ] Add expense filtering to getAllExpenses:
  - [ ] Filter by date range (?startDate=&endDate=)
  - [ ] Filter by category (?categoryId=)
  - [ ] Filter by amount range (?minAmount=&maxAmount=)
  - [ ] Search by merchant/description (?search=)
  - [ ] Add pagination (?page=1&limit=20)
- [ ] Test all filter combinations

**Afternoon:**
- [ ] Create `controllers/incomeController.js`
  - [ ] getAllIncomes (with filtering)
  - [ ] getIncomeById
  - [ ] createIncome
  - [ ] updateIncome
  - [ ] deleteIncome
- [ ] Create `routes/incomeRoutes.js`
  - [ ] All CRUD routes (protected)
- [ ] Test income endpoints

**End of Day Goal**: Filtering works, Income CRUD complete ✅

---

### **Day 5: Statistics & Analytics**
**Morning:**
- [ ] Implement getExpenseStatistics:
  ```javascript
  // GET /api/expenses/stats
  // Total expenses
  // Average expense
  // Expenses by category (aggregation)
  // Top merchants
  ```
- [ ] Use MongoDB aggregation pipeline
- [ ] Test statistics endpoint

**Afternoon:**
- [ ] Implement getIncomeStatistics:
  ```javascript
  // GET /api/incomes/stats
  // Total income
  // Average income
  // Income by source
  ```
- [ ] Implement getCategoryStatistics:
  ```javascript
  // GET /api/categories/stats
  // Total spending per category
  // Category usage count
  ```
- [ ] Test all statistics endpoints

**End of Day Goal**: All statistics working ✅

---

### **Day 6: Advanced Features & Polish**
**Morning:**
- [ ] Add bulk expense creation:
  ```javascript
  // POST /api/expenses/bulk
  // Create multiple expenses at once
  ```
- [ ] Add expense search functionality
- [ ] Add sorting options (by date, amount, merchant)

**Afternoon:**
- [ ] Add input validation to all endpoints:
  - [ ] Amount must be positive
  - [ ] Date required
  - [ ] Category must exist
  - [ ] Required fields validation
- [ ] Improve error messages
- [ ] Test edge cases

**End of Day Goal**: Advanced features working, validation added ✅

---

### **Day 7-8: Integration & Bug Fixes**
**Work with team:**
- [ ] Test category → expense relationship
- [ ] Test category → budget relationship (with TM3)
- [ ] Test expense data in dashboard (with TM4)
- [ ] Fix any integration bugs
- [ ] Add missing validation
- [ ] Optimize queries (add .lean() where appropriate)

**Specific tests:**
- [ ] Create category → Create expense with that category
- [ ] Delete category with expenses (should fail or handle gracefully)
- [ ] Filter expenses by date range (last 30 days)
- [ ] Get statistics for current month

**End of Day Goal**: All integrations working ✅

---

### **Day 9: Documentation**
- [ ] Document all endpoints in README:

  **Categories:**
  - [ ] GET /api/categories
  - [ ] GET /api/categories/:id
  - [ ] POST /api/categories
  - [ ] PUT /api/categories/:id
  - [ ] DELETE /api/categories/:id
  - [ ] PATCH /api/categories/:id/toggle
  - [ ] GET /api/categories/stats

  **Expenses:**
  - [ ] GET /api/expenses (with all filters)
  - [ ] GET /api/expenses/:id
  - [ ] POST /api/expenses
  - [ ] PUT /api/expenses/:id
  - [ ] DELETE /api/expenses/:id
  - [ ] GET /api/expenses/stats
  - [ ] POST /api/expenses/bulk

  **Incomes:**
  - [ ] GET /api/incomes
  - [ ] POST /api/incomes
  - [ ] PUT /api/incomes/:id
  - [ ] DELETE /api/incomes/:id
  - [ ] GET /api/incomes/stats

- [ ] Add examples for each endpoint
- [ ] Add to team Postman collection

**End of Day Goal**: Documentation complete ✅

---

### **Day 10: Final Testing & Support**
- [ ] Final testing of all endpoints
- [ ] Test with frontend team
- [ ] Fix any last-minute bugs
- [ ] Verify data appears correctly in dashboard

**End of Day Goal**: Expense/Income system production-ready ✅

---

## Code Examples

### Category Model
```javascript
// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true
  },
  color: {
    type: String,
    default: '#22d3ee'
  },
  icon: String,
  enabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Unique category name per user and type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
```

### Expense Model
```javascript
// models/Expense.js
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  date: {
    type: Date,
    required: true,
    index: true
  },
  merchant: String,
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'pos'],
    default: 'cash'
  }
}, {
  timestamps: true
});

// Index for efficient date queries
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
```

### Expense Controller with Filtering
```javascript
// controllers/expenseController.js
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Get all expenses with filters
exports.getAllExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      categoryId,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search
    } = req.query;

    // Build query
    const query = { userId: req.userId };

    if (categoryId) {
      query.categoryId = categoryId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const expenses = await Expense.find(query)
      .populate('categoryId', 'name color type')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Expense.countDocuments(query);

    res.json({
      expenses,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalExpenses: count
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to retrieve expenses' });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { categoryId, amount, title, description, date, merchant, paymentMethod } = req.body;

    // Verify category exists and belongs to user
    const category = await Category.findOne({
      _id: categoryId,
      userId: req.userId,
      type: 'expense'
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const expense = await Expense.create({
      userId: req.userId,
      categoryId,
      amount,
      title,
      description,
      date,
      merchant,
      paymentMethod
    });

    await expense.populate('categoryId', 'name color type');

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

// Get expense statistics
exports.getExpenseStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { userId: req.userId };

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    // Total and average
    const totals = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // By category
    const byCategory = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$categoryId',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          color: '$category.color',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Top merchants
    const topMerchants = await Expense.aggregate([
      { $match: { ...matchStage, merchant: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$merchant',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      total: totals[0]?.totalAmount || 0,
      average: totals[0]?.averageAmount || 0,
      count: totals[0]?.count || 0,
      byCategory,
      topMerchants
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};
```

---

## Manual Testing with Postman

### 1. Create Category
```
POST http://localhost:5000/api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Food & Dining",
  "type": "expense",
  "color": "#22d3ee"
}

Expected: 201, category object
```

### 2. Get All Categories
```
GET http://localhost:5000/api/categories
Authorization: Bearer <token>

Expected: 200, array of categories
```

### 3. Create Expense
```
POST http://localhost:5000/api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "65abc123...",
  "amount": 45.50,
  "title": "Lunch",
  "description": "Team lunch",
  "date": "2024-11-23",
  "merchant": "Restaurant XYZ",
  "paymentMethod": "card"
}

Expected: 201, expense object with category populated
```

### 4. Get Expenses with Filters
```
GET http://localhost:5000/api/expenses?startDate=2024-11-01&endDate=2024-11-30&categoryId=65abc123
Authorization: Bearer <token>

Expected: 200, filtered expenses array
```

### 5. Get Expense Statistics
```
GET http://localhost:5000/api/expenses/stats?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer <token>

Expected: 200, statistics object
```

---

## Critical Checklist

### By End of Day 1:
- [ ] Category, Expense, Income models created

### By End of Day 2:
- [ ] Can create and retrieve categories
- [ ] Can create and retrieve expenses

### By End of Day 3 (IMPORTANT):
- [ ] **All category CRUD complete** ⚠️
- [ ] **Notify TM3 categories are ready**
- [ ] Expense CRUD complete

### By End of Day 5:
- [ ] Income CRUD complete
- [ ] All statistics endpoints working

### By End of Day 9:
- [ ] All endpoints documented
- [ ] Postman collection complete

---

## Communication

### Notify TM3 (End of Day 3):
```
"@TM3 Categories are ready! 🎉

You can now link budgets to categories.

Endpoint: POST /api/categories
Get all: GET /api/categories

Each category has:
- _id (use this for budget.categoryId)
- name
- type ('expense' or 'income')
- userId

Example category ID: 65abc123...
"
```

---

## Dependencies

Already installed in main project, but you'll use:
```javascript
mongoose
express-validator
```

---

## Priority Matrix

**P0 (Critical - Must Do):**
- Category CRUD ⚠️ Blocks TM3
- Expense CRUD
- Basic filtering
- Income CRUD

**P1 (High - Should Do):**
- Expense statistics
- Income statistics
- Advanced filtering
- Search functionality

**P2 (Medium - Nice to Have):**
- Bulk operations
- Category statistics
- Sorting options

**P3 (Low - Skip if Needed):**
- SMS parsing
- Recurring transactions
- Export functionality

---

**Remember**: Your categories block TM3's budget work. Prioritize getting categories done by Day 3! 🚨

**Your data powers the dashboard!** 📊
