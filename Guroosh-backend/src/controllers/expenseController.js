const mongoose = require('mongoose');
const Expense = require('../models/expense');
const Category = require('../models/category');
const Account = require('../models/account');
const Budget = require('../models/budget');
const { createTransactionNotification } = require('../utils/notificationHelper');

const PERIOD_IN_DAYS = {
  weekly: 7,
  monthly: 30,
  yearly: 365
};

const resolveBudgetWindow = (budget) => {
  const now = new Date();
  if (budget.period === 'custom' && budget.endDate) {
    return { start: new Date(budget.startDate), end: new Date(budget.endDate) };
  }

  const increment = PERIOD_IN_DAYS[budget.period] || 30;
  let currentStart = new Date(budget.startDate);
  let currentEnd = new Date(currentStart);
  currentEnd.setDate(currentEnd.getDate() + increment);

  while (currentEnd <= now) {
    currentStart = new Date(currentEnd);
    currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + increment);
  }

  return { start: currentStart, end: currentEnd };
};

const getBudgetStatus = async (budget, userId) => {
  const { start, end } = resolveBudgetWindow(budget);
  const categoryObjectId = new mongoose.Types.ObjectId(
    typeof budget.categoryId === 'object' ? budget.categoryId._id || budget.categoryId : budget.categoryId
  );
  const [agg] = await Expense.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        categoryId: categoryObjectId,
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

  const spent = agg?.total || 0;
  const percentage = budget.limit ? Math.min((spent / budget.limit) * 100, 999) : 0;
  const state = percentage >= 100 ? 'exceeded' : percentage >= budget.alertThreshold ? 'warning' : 'ok';
  return { budgetId: budget._id, spent, percentage: Number(percentage.toFixed(1)), state };
};

const collectBudgetStatuses = async (userId, categoryId) => {
  const filterCategoryId = typeof categoryId === 'object' ? categoryId._id || categoryId : categoryId;
  const budgets = await Budget.find({ userId, categoryId: filterCategoryId, isActive: true });
  if (!budgets.length) return [];
  const statuses = await Promise.all(budgets.map((budget) => getBudgetStatus(budget, userId)));
  const now = new Date();
  await Promise.all(
    statuses.map((status, index) => {
      if (status.state !== 'ok') {
        budgets[index].lastTriggeredAt = now;
        return budgets[index].save();
      }
      return null;
    })
  );
  return statuses;
};

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
      .populate('accountId', 'name type')
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
    }).populate('categoryId', 'name color type').populate('accountId', 'name type');

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
    const { categoryId, accountId, amount, title, description, date, merchant } = req.body;

    if (!categoryId || !accountId || !amount || !title || !date) {
      return res.status(400).json({ error: 'categoryId, accountId, amount, title, and date are required' });
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

    if (!category.isActive) {
      return res.status(400).json({ error: 'This category is disabled. Enable it before adding expenses.' });
    }

    const account = await Account.findOne({ _id: accountId, userId: req.userId, status: 'active' });
    if (!account) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    // Check if account has sufficient balance
    const currentBalance = Number(account.balance || 0);
    const expenseAmount = Number(amount);
    if (currentBalance < expenseAmount) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        message: `Account "${account.name}" has SAR ${currentBalance.toLocaleString()} but expense requires SAR ${expenseAmount.toLocaleString()}`
      });
    }

    const expense = await Expense.create({
      userId: req.userId,
      categoryId,
      accountId,
      amount,
      title: title.trim(),
      description,
      date,
      merchant
    });

    await expense.populate('categoryId', 'name color type');

    // Deduct expense amount from account balance
    account.balance = currentBalance - expenseAmount;
    await account.save();

    // ✅ Create notification for expense
    console.log('📤 [EXPENSE] Calling createTransactionNotification for expense:', {
      userId: req.userId,
      amount: Number(amount),
      merchant: merchant || title,
      accountName: account.name || account.bank || 'Unknown'
    });

    try {
      await createTransactionNotification(req.userId, {
        amount: Number(amount),
        type: 'payment', // Expense is an outgoing payment
        accountName: account.name || account.bank || 'Unknown',
        transactionId: expense._id.toString(),
        merchant: merchant || title,
        method: 'Expense'
      });
      console.log('✅ [EXPENSE] Notification call completed for expense');
    } catch (notifError) {
      console.error('⚠️ [EXPENSE] Notification failed, but expense created successfully:', notifError.message);
      // Don't throw - let expense creation succeed even if notification fails
    }

    const budgetStatus = await collectBudgetStatuses(req.userId, categoryId);

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expense,
      budgets: budgetStatus
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: error.message || 'Error creating expense' });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { categoryId, accountId, amount, title, description, date, merchant } = req.body;

    if (amount !== undefined && Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const previousAccountId = expense.accountId.toString();
    const previousAmount = expense.amount;

    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, userId: req.userId, type: 'expense' });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (!category.isActive) {
        return res.status(400).json({ error: 'Cannot assign disabled category' });
      }
      expense.categoryId = categoryId;
    }

    if (accountId) {
      const account = await Account.findOne({ _id: accountId, userId: req.userId, status: 'active' });
      if (!account) {
        return res.status(404).json({ error: 'Account not found or inactive' });
      }
      expense.accountId = accountId;
    }

    if (amount !== undefined) expense.amount = amount;
    if (title !== undefined) expense.title = title.trim();
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;
    if (merchant !== undefined) expense.merchant = merchant;

    await expense.save();

    // Adjust account balances based on changes
    const newAccountId = expense.accountId.toString();
    const newAmount = expense.amount;

    if (previousAccountId !== newAccountId) {
      // Refund previous account, deduct from new account
      await Account.findOneAndUpdate({ _id: previousAccountId, userId: req.userId }, { $inc: { balance: previousAmount } });
      await Account.findOneAndUpdate({ _id: newAccountId, userId: req.userId }, { $inc: { balance: -newAmount } });
    } else if (previousAmount !== newAmount) {
      // Same account, just adjust the difference
      const diff = newAmount - previousAmount;
      await Account.findOneAndUpdate({ _id: newAccountId, userId: req.userId }, { $inc: { balance: -diff } });
    }

    await expense.populate('categoryId', 'name color type');

    const budgetStatus = await collectBudgetStatuses(req.userId, expense.categoryId._id || expense.categoryId);

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: expense,
      budgets: budgetStatus
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

    // Refund the expense amount back to the account
    await Account.findOneAndUpdate(
      { _id: expense.accountId, userId: req.userId },
      { $inc: { balance: expense.amount } }
    );

    const budgetStatus = await collectBudgetStatuses(req.userId, expense.categoryId);

    res.json({
      success: true,
      message: 'Expense deleted successfully',
      budgets: budgetStatus
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

    const budgets = await Budget.find({ userId: req.userId, isActive: true })
      .populate('categoryId', 'name color');
    const budgetStatuses = await Promise.all(budgets.map((budget) => getBudgetStatus(budget, req.userId)));

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
        })),
        budgetAlerts: budgets.map((budget, index) => ({
          id: budget._id,
          category: budget.categoryId?.name || 'Uncategorized',
          limit: budget.limit,
          state: budgetStatuses[index]?.state || 'ok',
          percentage: budgetStatuses[index]?.percentage || 0,
          spent: budgetStatuses[index]?.spent || 0
        }))
      }
    });
  } catch (error) {
    console.error('Expense summary error:', error);
    res.status(500).json({ error: error.message || 'Error building expense summary' });
  }
};
