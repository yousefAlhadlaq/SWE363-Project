# Team Member 2: Categories & Expenses - Simplified Course Project

## Your Role
You handle **categories and expenses** - the core of any finance app!

**Good news**: Most database setup gets done on Day 1 with the whole team! After that, you build your features.

---

## What You're Building (Simple!)

✅ Category CRUD (create, read, update, delete)
✅ Expense CRUD (create, read, update, delete)
✅ Basic expense filtering (by date, category)
✅ Get expenses by category

❌ NO advanced statistics
❌ NO bulk operations
❌ NO SMS parsing
❌ NO recurring transactions
❌ NO export functionality
❌ NO complex aggregations

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
- [ ] Create Category model:
  ```javascript
  // models/Category.js
  {
    userId: ObjectId,
    name: String,
    type: String ('expense' or 'income'),
    color: String,
    icon: String
  }
  ```
- [ ] Create Expense model:
  ```javascript
  // models/Expense.js
  {
    userId: ObjectId,
    categoryId: ObjectId,
    amount: Number,
    title: String,
    description: String,
    date: Date,
    merchant: String
  }
  ```
- [ ] Test: Everyone can connect to database!

**End of Day 1**: Models created, database connected ✅

---

### **Day 2: Category CRUD**

**Your solo work:**
- [ ] Create `controllers/categoryController.js`:
  - [ ] `getAllCategories` - Get all user's categories
  - [ ] `getCategoryById` - Get single category
  - [ ] `createCategory` - Create new category
  - [ ] `updateCategory` - Update category
  - [ ] `deleteCategory` - Delete category
- [ ] Create `routes/categoryRoutes.js`:
  - [ ] GET /api/categories (protected)
  - [ ] GET /api/categories/:id (protected)
  - [ ] POST /api/categories (protected)
  - [ ] PUT /api/categories/:id (protected)
  - [ ] DELETE /api/categories/:id (protected)
- [ ] Register routes in `app.js`
- [ ] Test all category operations with Postman

**End of Day 2**: Category CRUD works ✅

---

### **Day 3: Expense CRUD** ⚠️ IMPORTANT

**Your work:**
- [ ] Create `controllers/expenseController.js`:
  - [ ] `getAllExpenses` - Get all user's expenses
  - [ ] `getExpenseById` - Get single expense
  - [ ] `createExpense` - Create new expense
  - [ ] `updateExpense` - Update expense
  - [ ] `deleteExpense` - Delete expense
- [ ] Create `routes/expenseRoutes.js`:
  - [ ] GET /api/expenses (protected)
  - [ ] GET /api/expenses/:id (protected)
  - [ ] POST /api/expenses (protected)
  - [ ] PUT /api/expenses/:id (protected)
  - [ ] DELETE /api/expenses/:id (protected)
- [ ] **Notify TM3: "Categories ready for budgets!"** 🚨
- [ ] Test all expense operations

**End of Day 3**: Expense CRUD complete, TM3 unblocked ✅

---

### **Day 4: Filtering & Polish**

**Your work:**
- [ ] Add filtering to getAllExpenses:
  - [ ] Filter by date range (?startDate=&endDate=)
  - [ ] Filter by category (?categoryId=)
- [ ] Add `.populate('categoryId')` to expense queries
- [ ] Add input validation:
  - [ ] Amount must be positive
  - [ ] Date required
  - [ ] Category must exist
- [ ] Improve error messages
- [ ] Test all filter combinations

**End of Day 4**: Filtering works ✅

---

### **Days 5-10: Support & Integration**

**Your role:**
- [ ] Day 5: Help TM3 with any category-related issues
- [ ] Day 6: Help TM4 with dashboard (expense data)
- [ ] Days 7-8: Test integration, fix bugs
- [ ] Days 9-10: Help with deployment

**You'll finish early - use your time to help the team!** ✅

---

## Simple Code Examples

### Category Model (Minimal)
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
    required: true,
    trim: true
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
  icon: String
}, {
  timestamps: true
});

// Unique category name per user and type
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
```

### Expense Model (Minimal)
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
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  merchant: String
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
```

### Category Controller (Simple)
```javascript
// controllers/categoryController.js
const Category = require('../models/Category');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.userId });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single category
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, type, color, icon } = req.body;

    // Check if category already exists
    const existing = await Category.findOne({
      userId: req.userId,
      name,
      type
    });

    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = await Category.create({
      userId: req.userId,
      name,
      type,
      color,
      icon
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, color, icon },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Expense Controller (Simple)
```javascript
// controllers/expenseController.js
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Get all expenses with filtering
exports.getAllExpenses = async (req, res) => {
  try {
    const { categoryId, startDate, endDate } = req.query;

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

    const expenses = await Expense.find(query)
      .populate('categoryId', 'name color type')
      .sort({ date: -1 });

    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('categoryId', 'name color type');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const { categoryId, amount, title, description, date, merchant } = req.body;

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
      merchant
    });

    await expense.populate('categoryId', 'name color type');

    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { categoryId, amount, title, description, date, merchant } = req.body;

    // If categoryId provided, verify it exists
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.userId,
        type: 'expense'
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { categoryId, amount, title, description, date, merchant },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color type');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      message: 'Expense updated successfully',
      expense
    });
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

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Routes (Simple)
```javascript
// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.get('/', auth, categoryController.getAllCategories);
router.get('/:id', auth, categoryController.getCategoryById);
router.post('/', auth, categoryController.createCategory);
router.put('/:id', auth, categoryController.updateCategory);
router.delete('/:id', auth, categoryController.deleteCategory);

module.exports = router;
```

```javascript
// routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.get('/', auth, expenseController.getAllExpenses);
router.get('/:id', auth, expenseController.getExpenseById);
router.post('/', auth, expenseController.createExpense);
router.put('/:id', auth, expenseController.updateExpense);
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;
```

### Register Routes in app.js
```javascript
// app.js
const categoryRoutes = require('./routes/categoryRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
```

---

## Testing with Postman

### 1. Create Category
```
POST http://localhost:5000/api/categories
Authorization: Bearer <your-token>
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
Authorization: Bearer <your-token>

Expected: 200, array of categories
```

### 3. Create Expense
```
POST http://localhost:5000/api/expenses
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "categoryId": "673abc123...",
  "amount": 45.50,
  "title": "Lunch",
  "description": "Team lunch",
  "date": "2024-11-23",
  "merchant": "Restaurant XYZ"
}

Expected: 201, expense object with category populated
```

### 4. Get Expenses with Filters
```
GET http://localhost:5000/api/expenses?startDate=2024-11-01&endDate=2024-11-30
Authorization: Bearer <your-token>

Expected: 200, filtered expenses array
```

### 5. Get Expenses by Category
```
GET http://localhost:5000/api/expenses?categoryId=673abc123...
Authorization: Bearer <your-token>

Expected: 200, expenses for that category
```

---

## Checklist

### Day 1 (WITH TEAM):
- [ ] Category model created
- [ ] Expense model created
- [ ] Database connected

### Day 2:
- [ ] Category CRUD complete
- [ ] All category routes working
- [ ] Tested with Postman

### Day 3:
- [ ] Expense CRUD complete
- [ ] All expense routes working
- [ ] **Notified TM3 that categories are ready** 🚨

### Day 4:
- [ ] Filtering by date works
- [ ] Filtering by category works
- [ ] Input validation added

---

## Common Issues

### Category already exists error?
Check the unique index - it's per user, name, AND type

### Can't create expense?
Make sure the category exists and is type='expense'

### Expense not showing category?
Use `.populate('categoryId', 'name color type')`

### Filter not working?
Check date format: `new Date(dateString)` in query

---

## Priority

**P0 (Must Do):**
- Category CRUD ✅ (blocks TM3!)
- Expense CRUD ✅
- Basic filtering ✅

**P1 (Should Do):**
- Input validation ✅
- Error handling ✅

**P2 (Nice to Have):**
- Better error messages
- Code comments

---

## Communication

### Notify TM3 (End of Day 3):
```
"@TM3 Categories are ready! 🎉

You can now create budgets with categories.

Endpoints:
- GET /api/categories (get all your categories)
- POST /api/categories (create new)

Each category has:
- _id (use this for budget.categoryId)
- name
- type ('expense' or 'income')
- color

Example: GET http://localhost:5000/api/categories
Copy a category _id to use in your budget!"
```

---

## Tips

1. **Day 3 is critical** - Finish categories so TM3 can do budgets
2. **Keep it simple** - Just basic CRUD, no fancy features
3. **Test early** - Use Postman after each controller
4. **Populate categories** - Always show category details with expenses
5. **Help TM3 & TM4** - They need your data for their features

---

## Success = TM3 Can Use Categories

Your work is successful if:
- ✅ Categories can be created
- ✅ Expenses can be created with categories
- ✅ TM3 can fetch categories for budgets
- ✅ TM4 can fetch expenses for dashboard

**You're the data foundation - keep it simple and solid!** 📊

---

**Remember**: This is a course project. Simple working CRUD > Complex broken features! 🎓
