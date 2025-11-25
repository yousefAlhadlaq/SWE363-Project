const Expense = require('../models/expense');
const Category = require('../models/category');

// Get all expenses with optional filters
exports.getAllExpenses = async (req, res) => {
  try {
    const { categoryId, startDate, endDate } = req.query;
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

    res.json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: error.message || 'Error fetching expenses' });
  }
};

// Get a single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId
    }).populate('categoryId', 'name color type');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense by id error:', error);
    res.status(500).json({ error: error.message || 'Error fetching expense' });
  }
};

// Create an expense
exports.createExpense = async (req, res) => {
  try {
    const { categoryId, amount, title, description, date, merchant } = req.body;

    if (!categoryId || !amount || !title || !date) {
      return res.status(400).json({ error: 'categoryId, amount, title, and date are required' });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

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
      title: title.trim(),
      description,
      date,
      merchant
    });

    await expense.populate('categoryId', 'name color type');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: error.message || 'Error creating expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { categoryId, amount, title, description, date, merchant } = req.body;

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

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

    const updates = {};
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (amount !== undefined) updates.amount = amount;
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description;
    if (date !== undefined) updates.date = date;
    if (merchant !== undefined) updates.merchant = merchant;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name color type');

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: error.message || 'Error updating expense' });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: error.message || 'Error deleting expense' });
  }
};
