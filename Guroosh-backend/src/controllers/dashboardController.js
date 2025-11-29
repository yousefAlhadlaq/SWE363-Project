const mongoose = require('mongoose');
const Expense = require('../models/expense');
const Investment = require('../models/Investment');
const ExternalBankAccount = require('../models/externalBankAccount');

// Consolidated dashboard metrics for the current month
exports.getOverview = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.userId);
    const isAdmin = req.user?.role === 'admin';
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const matchFilter = {
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      },
      ...(isAdmin ? {} : { userId: userObjectId })
    };

    const [monthlyExpenses] = await Expense.aggregate([
      {
        $match: matchFilter
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
    const investments = await Investment.find(isAdmin ? {} : { userId: req.userId });
    const totalInvestments = investments.reduce((sum, investment) => {
      const price = typeof investment.currentPrice === 'number'
        ? investment.currentPrice
        : (typeof investment.buyPrice === 'number' ? investment.buyPrice : 0);
      return sum + price * (investment.amountOwned || 0);
    }, 0);

    const incomePipeline = [
      { $match: isAdmin ? {} : { userId: userObjectId } },
      { $unwind: '$transactions' },
      {
        $match: {
          'transactions.date': { $gte: startOfMonth, $lte: endOfMonth },
          'transactions.type': { $in: ['deposit', 'transfer_in'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$transactions.amount' }
        }
      }
    ];

    const [incomeAggregate] = await ExternalBankAccount.aggregate(incomePipeline);
    const totalIncome = incomeAggregate?.total || 0;
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
    const isAdmin = req.user?.role === 'admin';

    let expenseQuery = Expense.find(isAdmin ? {} : { userId: req.userId })
      .populate('categoryId', 'name color')
      .sort({ date: -1 })
      .limit(limit);

    if (isAdmin) {
      expenseQuery = expenseQuery.populate('userId', 'fullName email');
    }

    const expenses = await expenseQuery;

    const transactions = expenses.map((expense) => ({
      id: expense._id,
      type: 'expense',
      amount: expense.amount,
      title: expense.title,
      category: expense.categoryId?.name || 'Uncategorized',
      categoryColor: expense.categoryId?.color || '#f87171',
      date: expense.date,
      merchant: expense.merchant || null,
      owner: isAdmin ? (expense.userId?.fullName || 'User') : undefined
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
