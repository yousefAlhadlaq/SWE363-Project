const mongoose = require('mongoose');
const Expense = require('../models/expense');
const Investment = require('../models/Investment');

// Consolidated dashboard metrics for the current month
exports.getOverview = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [monthlyExpenses] = await Expense.aggregate([
      {
        $match: {
          userId: userObjectId,
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = monthlyExpenses?.total || 0;

    // Use currentPrice where available and fall back to buyPrice.
    const investments = await Investment.find({ userId: req.userId });
    const totalInvestments = investments.reduce((sum, investment) => {
      const price = typeof investment.currentPrice === 'number'
        ? investment.currentPrice
        : (typeof investment.buyPrice === 'number' ? investment.buyPrice : 0);
      return sum + price * (investment.amountOwned || 0);
    }, 0);

    // Income tracking not implemented yet; keep zero for now.
    const totalIncome = 0;
    const netBalance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        netBalance,
        totalInvestments,
        period: {
          label: 'current_month',
          start: startOfMonth.toISOString(),
          end: endOfMonth.toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: error.message || 'Failed to load dashboard overview' });
  }
};

// Recent combined cash activity (currently expenses only)
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const expenses = await Expense.find({ userId: req.userId })
      .populate('categoryId', 'name color')
      .sort({ date: -1 })
      .limit(limit);

    const transactions = expenses.map((expense) => ({
      id: expense._id,
      type: 'expense',
      amount: expense.amount,
      title: expense.title,
      category: expense.categoryId?.name || 'Uncategorized',
      categoryColor: expense.categoryId?.color || '#f87171',
      date: expense.date,
      merchant: expense.merchant || null
    }));

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Dashboard recent transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to load recent transactions' });
  }
};
