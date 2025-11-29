const mongoose = require('mongoose');
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

exports.getSummary = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    const trendStart = new Date(now);
    trendStart.setDate(now.getDate() - 13);
    const categoryWindow = new Date(now);
    categoryWindow.setDate(now.getDate() - 90);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      monthlyAgg,
      weeklyAgg,
      categoryAgg,
      trendAgg,
      merchantAgg,
      recentExpenses
    ] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfMonth, $lte: now } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
            largest: { $max: '$amount' }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: startOfWeek, $lte: now } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: categoryWindow, $lte: now } } },
        {
          $group: {
            _id: '$categoryId',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 6 },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } }
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, date: { $gte: trendStart, $lte: now } } },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              day: { $dayOfMonth: '$date' }
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      Expense.aggregate([
        { $match: { userId: userObjectId, merchant: { $nin: [null, ''] } } },
        {
          $group: {
            _id: '$merchant',
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: 5 }
      ]),
      Expense.find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(8)
        .populate('categoryId', 'name color')
    ]);

    const monthTotals = monthlyAgg[0] || { total: 0, count: 0, largest: 0 };
    const weekTotals = weeklyAgg[0] || { total: 0, count: 0 };

    const daysElapsedThisMonth = Math.max(now.getDate(), 1);
    const daysRemaining = Math.max(endOfMonth.getDate() - now.getDate(), 0);

    res.json({
      success: true,
      data: {
        totals: {
          month: {
            total: monthTotals.total,
            transactions: monthTotals.count,
            averageDaily: monthTotals.total / daysElapsedThisMonth,
            projection: monthTotals.total + (monthTotals.total / Math.max(daysElapsedThisMonth, 1)) * daysRemaining,
            largest: monthTotals.largest || 0
          },
          week: {
            total: weekTotals.total || 0,
            transactions: weekTotals.count || 0,
            averageTicket: weekTotals.count ? (weekTotals.total || 0) / weekTotals.count : 0
          }
        },
        categories: categoryAgg.map((item) => ({
          id: item._id,
          name: item.category?.name || 'Uncategorized',
          color: item.category?.color || '#22d3ee',
          total: item.total,
          transactions: item.count
        })),
        trend: trendAgg.map((item) => ({
          date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString(),
          total: item.total
        })),
        merchants: merchantAgg.map((merchant) => ({
          name: merchant._id,
          total: merchant.total,
          transactions: merchant.count
        })),
        recent: recentExpenses.map((expense) => ({
          id: expense._id,
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category: expense.categoryId?.name || 'Uncategorized',
          color: expense.categoryId?.color || '#94a3b8'
        }))
      }
    });
  } catch (error) {
    console.error('Expense summary error:', error);
    res.status(500).json({ error: error.message || 'Error building expense summary' });
  }
};
