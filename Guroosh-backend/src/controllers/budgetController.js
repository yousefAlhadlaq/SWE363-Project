const mongoose = require('mongoose');
const Budget = require('../models/budget');
const Category = require('../models/category');
const Expense = require('../models/expense');

const PERIOD_IN_DAYS = {
  weekly: 7,
  monthly: 30,
  yearly: 365
};

const resolveCycleWindow = (budget) => {
  const now = new Date();
  if (budget.period === 'custom' && budget.endDate) {
    return { start: new Date(budget.startDate), end: new Date(budget.endDate) };
  }

  const startDate = new Date(budget.startDate);
  const incrementDays = PERIOD_IN_DAYS[budget.period] || 30;
  let cycleStart = new Date(startDate);
  let cycleEnd = new Date(cycleStart);
  cycleEnd.setDate(cycleEnd.getDate() + incrementDays);

  while (cycleEnd <= now) {
    cycleStart = new Date(cycleEnd);
    cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleEnd.getDate() + incrementDays);
  }

  return { start: cycleStart, end: cycleEnd };
};

const buildBudgetStatus = async (budget, userId) => {
  const { start, end } = resolveCycleWindow(budget);
  const [spentAgg] = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        categoryId: new mongoose.Types.ObjectId(budget.categoryId),
        date: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  const spent = spentAgg?.total || 0;
  const percentage = budget.limit ? Math.min((spent / budget.limit) * 100, 999) : 0;
  let state = 'ok';
  if (percentage >= 100) {
    state = 'exceeded';
  } else if (percentage >= budget.alertThreshold) {
    state = 'warning';
  }

  return {
    budgetId: budget._id,
    spent,
    percentage: Number(percentage.toFixed(1)),
    state,
    window: { start, end }
  };
};

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('categoryId', 'name color isActive');

    const statuses = await Promise.all(budgets.map((budget) => buildBudgetStatus(budget, req.userId)));
    const response = budgets.map((budget, index) => ({
      ...budget.toObject(),
      status: statuses[index]
    }));

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch budgets' });
  }
};

exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.userId })
      .populate('categoryId', 'name color isActive');

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const status = await buildBudgetStatus(budget, req.userId);
    res.json({ success: true, data: { ...budget.toObject(), status } });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch budget' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { categoryId, limit, period = 'monthly', startDate, endDate, alertThreshold = 80, notes } = req.body;

    if (!categoryId || limit === undefined || limit === null) {
      return res.status(400).json({ error: 'Category and limit are required' });
    }

    if (Number(limit) <= 0) {
      return res.status(400).json({ error: 'Limit must be positive' });
    }

    const category = await Category.findOne({ _id: categoryId, userId: req.userId });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    if (!category.isActive) {
      return res.status(400).json({ error: 'Cannot assign a budget to a disabled category' });
    }

    const existing = await Budget.findOne({ userId: req.userId, categoryId, period, isActive: true });
    if (existing) {
      return res.status(400).json({ error: 'A budget already exists for this category and period' });
    }

    if (period === 'custom' && !endDate) {
      return res.status(400).json({ error: 'Custom budgets require an end date' });
    }

    const budget = await Budget.create({
      userId: req.userId,
      categoryId,
      limit,
      period,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      alertThreshold,
      notes
    });

    const status = await buildBudgetStatus(budget, req.userId);
    res.status(201).json({ success: true, message: 'Budget created successfully', data: { ...budget.toObject(), status } });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: error.message || 'Failed to create budget' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const updates = {};
    const { limit, period, startDate, endDate, alertThreshold, notes, isActive } = req.body;

    if (limit !== undefined) {
      if (Number(limit) <= 0) {
        return res.status(400).json({ error: 'Limit must be positive' });
      }
      updates.limit = limit;
    }

    if (period) updates.period = period;
    if (startDate) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
    if (alertThreshold !== undefined) updates.alertThreshold = alertThreshold;
    if (notes !== undefined) updates.notes = notes;
    if (isActive !== undefined) updates.isActive = isActive;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const status = await buildBudgetStatus(budget, req.userId);
    res.json({ success: true, message: 'Budget updated successfully', data: { ...budget.toObject(), status } });
  } catch (error) {
    console.error('Update budget error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Another active budget exists for this category and period' });
    }
    res.status(500).json({ error: error.message || 'Failed to update budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget removed successfully' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete budget' });
  }
};

exports.getBudgetAlerts = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.userId, isActive: true });
    const statuses = await Promise.all(budgets.map((budget) => buildBudgetStatus(budget, req.userId)));
    const alerts = budgets
      .map((budget, index) => ({ budget, status: statuses[index] }))
      .filter((item) => item.status.state !== 'ok');

    res.json({
      success: true,
      data: alerts.map((item) => ({
        budgetId: item.budget._id,
        categoryId: item.budget.categoryId,
        state: item.status.state,
        percentage: item.status.percentage,
        spent: item.status.spent
      }))
    });
  } catch (error) {
    console.error('Budget alerts error:', error);
    res.status(500).json({ error: error.message || 'Failed to load budget alerts' });
  }
};

module.exports = exports;
