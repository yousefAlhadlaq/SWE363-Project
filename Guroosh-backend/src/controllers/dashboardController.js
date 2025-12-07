const mongoose = require('mongoose');
const ExternalBankAccount = require('../models/externalBankAccount');
const ExternalStock = require('../models/externalStock');
const ExternalGold = require('../models/externalGold');
const Expense = require('../models/expense');
const Investment = require('../models/Investment');
const axios = require('axios');

const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';
const MAX_RECENT_LIMIT = 50;

// Daily appreciation rate for Real Estate (0.02% per day = ~7.5% per year)
const DAILY_APPRECIATION_RATE = 0.0002; // 0.02%

/**
 * Calculate appreciated value for Real Estate based on days elapsed
 * Formula: newValue = originalValue * (1 + dailyRate) ^ daysElapsed
 */
const calculateAppreciatedValue = (originalValue, purchaseDate) => {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const daysElapsed = Math.floor((now - purchase) / (1000 * 60 * 60 * 24));

  // Apply compound interest formula
  const appreciatedValue = originalValue * Math.pow(1 + DAILY_APPRECIATION_RATE, daysElapsed);

  return Math.round(appreciatedValue * 100) / 100; // Round to 2 decimal places
};

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const categorizeTransaction = (description = '') => {
  const desc = description.toLowerCase();

  if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food') || desc.includes('restaurant')) {
    return 'Groceries';
  }
  if (desc.includes('telecom') || desc.includes('stc') || desc.includes('mobily') || desc.includes('zain') || desc.includes('phone')) {
    return 'Telecom';
  }
  if (desc.includes('transport') || desc.includes('uber') || desc.includes('careem') || desc.includes('gas') || desc.includes('fuel')) {
    return 'Transport';
  }
  if (desc.includes('utility') || desc.includes('electric') || desc.includes('water') || desc.includes('bill')) {
    return 'Utilities';
  }
  if (desc.includes('shop') || desc.includes('store') || desc.includes('mall') || desc.includes('amazon')) {
    return 'Shopping';
  }
  if (desc.includes('health') || desc.includes('pharmacy') || desc.includes('hospital') || desc.includes('doctor')) {
    return 'Healthcare';
  }
  if (desc.includes('entertainment') || desc.includes('movie') || desc.includes('game') || desc.includes('netflix')) {
    return 'Entertainment';
  }

  return 'Other';
};

const fetchFromCentralBank = async (endpoint, userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_API}/${endpoint}/${userId}`);
    return response.data;
  } catch (error) {
    console.log(`Central Bank ${endpoint} fetch failed:`, error.message);
    return null;
  }
};

// GET /api/dashboard - Main dashboard data (combined from all sources)
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    const [
      expensesFromDB,
      investmentsFromDB,
      centralBankAccounts,
      centralBankStocks,
      centralBankGold,
      localAccounts
    ] = await Promise.all([
      Expense.find({ userId }).sort({ date: -1 }).limit(50),
      Investment.find({ userId }),
      fetchFromCentralBank('accounts', userId),
      fetchFromCentralBank('stocks', userId),
      fetchFromCentralBank('gold_value', userId),
      ExternalBankAccount.find({ userId })
    ]);

    const accounts = centralBankAccounts?.accounts || [];
    const localAccountByNumber = new Map(
      (localAccounts || []).map(acc => [acc.accountNumber, acc])
    );
    const stockPortfolios = centralBankStocks?.portfolios || [];
    const stockSummary = centralBankStocks?.summary || { totalValue: 0, totalGainLoss: 0 };
    const goldData = centralBankGold?.gold;

    let totalBalance = 0;
    let weeklySpend = 0;
    let monthlySpend = 0;
    let creditCardDue = 0;
    const allTransactions = [];
    const merchantSpending = {};
    const categorySpending = {};
    const weeklyChartData = [0, 0, 0, 0, 0, 0, 0];

    const startOfWeek = getStartOfWeek();
    const startOfMonth = getStartOfMonth();
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const processedAccounts = [];

    if (Array.isArray(accounts)) {
      accounts.forEach(account => {
        const balance = account.balance || 0;
        totalBalance += balance;

        const localMatch =
          localAccountByNumber.get(account.accountNumber) ||
          localAccountByNumber.get(account.id) ||
          null;

        const accountName =
          account.accountName ||
          localMatch?.accountName ||
          '';

        processedAccounts.push({
          id: account.id || account._id,
          bank: account.bank,
          bankLogo: account.bankLogo || localMatch?.bankLogo,
          accountNumber: account.accountNumber,
          accountName: accountName,
          accountType: account.accountType,
          balance,
          currency: account.currency || 'SAR',
          createdAt: account.createdAt,
        });

        if (account.accountType === 'Credit') {
          creditCardDue += Math.abs(balance);
        }

        const transactions = account.billing?.transactions || account.transactions || [];
        transactions.forEach(tx => {
          const txData = tx.toObject ? tx.toObject() : tx;
          allTransactions.push({
            ...txData,
            accountId: account._id,
            bank: account.bank,
            accountNumber: account.accountNumber,
            source: 'bank',
          });

          if (tx.type === 'payment') {
            const txDate = new Date(tx.date);

            if (txDate >= oneWeekAgo) {
              weeklySpend += tx.amount;
            }

            if (txDate >= startOfWeek) {
              weeklyChartData[txDate.getDay()] += tx.amount;
            }

            if (txDate >= startOfMonth) {
              monthlySpend += tx.amount;
            }

            const merchant = tx.merchant || tx.description || 'Unknown';
            merchantSpending[merchant] = (merchantSpending[merchant] || 0) + tx.amount;

            const category = tx.category || categorizeTransaction(tx.description);
            categorySpending[category] = (categorySpending[category] || 0) + tx.amount;
          }
        });
      });
    }

    // Include any locally stored accounts not present from central bank
    if (Array.isArray(localAccounts)) {
      localAccounts.forEach(localAcc => {
        const alreadyIncluded = processedAccounts.some(
          acc => acc.accountNumber === localAcc.accountNumber
        );
        if (alreadyIncluded) return;

        const balance = localAcc.balance || 0;
        totalBalance += balance;

        processedAccounts.push({
          id: localAcc._id,
          bank: localAcc.bank,
          bankLogo: localAcc.bankLogo,
          accountNumber: localAcc.accountNumber,
          accountName: localAcc.accountName,
          accountType: localAcc.accountType,
          balance,
          currency: localAcc.currency || 'SAR',
          createdAt: localAcc.createdAt
        });
      });
    }

    expensesFromDB.forEach(expense => {
      const txDate = new Date(expense.date);

      allTransactions.push({
        _id: expense._id,
        type: 'payment',
        amount: expense.amount,
        description: expense.description || expense.category,
        date: expense.date,
        source: 'expense',
      });

      if (txDate >= oneWeekAgo) {
        weeklySpend += expense.amount;
      }

      if (txDate >= startOfWeek) {
        weeklyChartData[txDate.getDay()] += expense.amount;
      }

      if (txDate >= startOfMonth) {
        monthlySpend += expense.amount;
      }

      const category = expense.category || categorizeTransaction(expense.description);
      categorySpending[category] = (categorySpending[category] || 0) + expense.amount;

      if (expense.merchant) {
        merchantSpending[expense.merchant] = (merchantSpending[expense.merchant] || 0) + expense.amount;
      }
    });

    let investmentsTotal = stockSummary.totalValue || 0;
    if (goldData) {
      investmentsTotal += goldData.investmentValue || (goldData.amountOunces * goldData.currentPrice) || 0;
    }
    investmentsFromDB.forEach(inv => {
      let currentPrice = inv.currentPrice || 0;

      // Apply daily appreciation to Real Estate
      if (inv.category === 'Real Estate') {
        const basePrice = inv.buyPrice || inv.currentPrice;
        if (basePrice) {
          currentPrice = calculateAppreciatedValue(basePrice, inv.purchaseDate || inv.createdAt);
        }
      }

      const currentValue = currentPrice * (inv.amountOwned || 1);
      investmentsTotal += currentValue;

      allTransactions.push({
        _id: inv._id,
        description: inv.category === 'Stock'
          ? `Bought ${inv.amountOwned} shares of ${inv.name}`
          : inv.category === 'Real Estate'
            ? `Invested in ${inv.name}`
            : inv.category === 'Gold'
              ? `Bought ${inv.amountOwned}g of gold`
              : inv.category === 'Crypto'
                ? `Purchased ${inv.amountOwned} ${inv.name}`
                : `Invested in ${inv.name}`,
        amount: currentValue,
        date: inv.purchaseDate || inv.createdAt,
        type: 'investment',
        category: inv.category,
        source: 'investment',
      });
    });

    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    let topMerchant = { name: 'None', amount: 0 };
    Object.entries(merchantSpending).forEach(([name, amount]) => {
      if (amount > topMerchant.amount) {
        topMerchant = { name, amount };
      }
    });

    const totalCategorySpend = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    let sortedCategories = Object.entries(categorySpending)
      .map(([label, value]) => ({
        label,
        value: Math.round((value / (totalCategorySpend || 1)) * 100),
        amount: value,
      }))
      .sort((a, b) => b.amount - a.amount);

    if (sortedCategories.length > 5) {
      const top5 = sortedCategories.slice(0, 5);
      const others = sortedCategories.slice(5);
      const otherAmount = others.reduce((sum, item) => sum + item.amount, 0);
      const otherValue = others.reduce((sum, item) => sum + item.value, 0);
      sortedCategories = [...top5, { label: 'Other', value: otherValue, amount: otherAmount }];
    }

    const latestUpdates = allTransactions.slice(0, 10).map(tx => ({
      id: tx._id || tx.id,
      merchant: tx.description || 'Transaction',
      amount: tx.amount,
      timestamp: tx.date,
      method: tx.type === 'investment' ? `Investment · ${tx.category}` : tx.type,
      status: tx.type === 'investment' ? 'investment' : (tx.type === 'deposit' || tx.type === 'transfer_in' ? 'in' : 'out'),
      bank: tx.bank || (tx.type === 'investment' ? 'Investment' : 'Expense'),
      source: tx.source,
      category: tx.category,
    }));

    const weeklyChart = [
      { label: 'Sun', value: weeklyChartData[0] },
      { label: 'Mon', value: weeklyChartData[1] },
      { label: 'Tue', value: weeklyChartData[2] },
      { label: 'Wed', value: weeklyChartData[3] },
      { label: 'Thu', value: weeklyChartData[4] },
      { label: 'Fri', value: weeklyChartData[5] },
      { label: 'Sat', value: weeklyChartData[6] },
    ];

    const formattedStocks = stockPortfolios.map(portfolio => ({
      bank: portfolio.bank,
      brokerage: portfolio.brokerage,
      stocks: portfolio.stocks,
      totalValue: portfolio.stocks.reduce((sum, s) => sum + s.currentValue, 0),
    }));

    const formattedGold = goldData ? {
      amountOunces: goldData.amountOunces,
      purchasePrice: goldData.purchasePrice,
      currentPrice: goldData.currentPrice,
      investmentValue: goldData.investmentValue,
      gainLoss: goldData.gainLoss,
      gainLossPct: goldData.gainLossPct,
    } : null;

    // ✅ Detect if user is new (no accounts, no transactions, no expenses)
    const hasNoAccounts = processedAccounts.length === 0;
    const hasNoTransactions = allTransactions.length === 0;
    const hasNoExpenses = expensesFromDB.length === 0;
    const isNewUser = hasNoAccounts && hasNoTransactions && hasNoExpenses;

    console.log(`📊 Dashboard summary: ${processedAccounts.length} accounts, ${allTransactions.length} transactions, isNewUser=${isNewUser}`);

    res.json({
      success: true,
      data: {
        totalBalance,
        weeklySpend,
        monthlySpend,
        creditCardDue,
        investmentsTotal,
        accounts: processedAccounts,
        accountCount: processedAccounts.length,
        stocks: formattedStocks,
        stockSummary,
        gold: formattedGold,
        latestUpdates,
        topMerchant,
        categoryBreakdown: sortedCategories,
        weeklyChart,
        dailySpendLimit: 1000,
        remainingLimit: Math.max(0, 1000 - (weeklySpend / 7)),
        isNewUser, // ✅ NEW: Flag for empty states
        hasNoAccounts, // ✅ NEW: For conditional rendering
        hasNoTransactions, // ✅ NEW: For conditional rendering
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
};

// GET /api/dashboard/accounts - Get all linked accounts (from local DB)
exports.getLinkedAccounts = async (req, res) => {
  try {
    const userId = req.userId;
    const accounts = await ExternalBankAccount.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        accounts: accounts.map(acc => ({
          id: acc._id,
          bank: acc.bank,
          bankLogo: acc.bankLogo,
          accountNumber: acc.accountNumber,
          accountName: acc.accountName,
          accountType: acc.accountType,
          balance: acc.balance,
          currency: acc.currency,
          totalDeposits: acc.totalDeposits,
          totalPayments: acc.totalPayments,
          createdAt: acc.createdAt,
        })),
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      }
    });
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch linked accounts' });
  }
};

// GET /api/dashboard/investments - Get all investments (stocks, gold)
exports.getInvestments = async (req, res) => {
  try {
    const userId = req.userId;

    const [centralBankStocks, centralBankGold] = await Promise.all([
      fetchFromCentralBank('stocks', userId),
      fetchFromCentralBank('gold_value', userId),
    ]);

    const localStocks = await ExternalStock.find({ userId });
    const localGold = await ExternalGold.findOne({ userId });
    let investments = await Investment.find({ userId });

    // Apply daily appreciation to Real Estate investments
    investments = investments.map(inv => {
      const invObj = inv.toObject();

      if (invObj.category === 'Real Estate') {
        const basePrice = invObj.buyPrice || invObj.currentPrice;
        if (basePrice) {
          invObj.currentPrice = calculateAppreciatedValue(basePrice, invObj.purchaseDate || invObj.createdAt);
        }
      }
      return invObj;
    });

    const stockData = centralBankStocks || {
      portfolios: localStocks.map(s => ({
        symbol: s.symbol,
        name: s.name,
        shares: s.shares,
        purchasePrice: s.purchasePrice,
        currentPrice: s.currentPrice,
        currentValue: s.shares * s.currentPrice,
      })),
      summary: {
        totalValue: localStocks.reduce((sum, s) => sum + (s.shares * s.currentPrice), 0),
      }
    };

    const goldData = centralBankGold?.gold || localGold;

    res.json({
      success: true,
      data: {
        stocks: stockData,
        gold: goldData,
        otherInvestments: investments,
        totalValue: (stockData.summary?.totalValue || 0) +
          (goldData?.investmentValue || 0) +
          (goldData?.investmentValue || 0) +
          investments.reduce((sum, inv) => sum + ((inv.currentPrice || 0) * (inv.amountOwned || 1)), 0),
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch investments' });
  }
};

// GET /api/dashboard/updates - Get latest updates/transactions
exports.getLatestUpdates = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit, 10) || 20;

    const allTransactions = [];

    const localAccounts = await ExternalBankAccount.find({ userId });
    localAccounts.forEach(account => {
      account.transactions.forEach(tx => {
        allTransactions.push({
          id: tx._id,
          merchant: tx.description || 'Transaction',
          amount: tx.amount,
          timestamp: tx.date,
          method: tx.type,
          status: tx.type === 'deposit' || tx.type === 'transfer_in' ? 'in' : 'out',
          bank: account.bank,
          accountNumber: account.accountNumber,
          accountId: account._id,
          source: 'bank',
        });
      });
    });

    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(limit);
    expenses.forEach(expense => {
      allTransactions.push({
        id: expense._id,
        merchant: expense.description || expense.title || 'Expense',
        amount: expense.amount,
        timestamp: expense.date,
        method: 'expense',
        status: 'out',
        source: 'expense',
      });
    });

    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedTransactions = allTransactions.slice(0, limit);

    res.json({
      success: true,
      data: {
        updates: limitedTransactions,
        total: allTransactions.length,
      }
    });
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch latest updates' });
  }
};

// GET /api/dashboard/stats - Get spending statistics
exports.getSpendingStats = async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'weekly';

    const accounts = await ExternalBankAccount.find({ userId });
    const expenses = await Expense.find({ userId });

    let startDate;
    const now = new Date();

    switch (period) {
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'weekly':
      default: {
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        break;
      }
    }

    let totalSpend = 0;
    let totalIncome = 0;
    const categorySpending = {};

    accounts.forEach(account => {
      const transactions = account.transactions || [];
      transactions.forEach(tx => {
        const txDate = new Date(tx.date);
        if (txDate >= startDate) {
          if (tx.type === 'payment') {
            totalSpend += tx.amount;
            const category = tx.category || categorizeTransaction(tx.description);
            categorySpending[category] = (categorySpending[category] || 0) + tx.amount;
          } else if (tx.type === 'deposit' || tx.type === 'transfer_in') {
            totalIncome += tx.amount;
          }
        }
      });
    });

    expenses.forEach(expense => {
      const txDate = new Date(expense.date);
      if (txDate >= startDate) {
        totalSpend += expense.amount;
        const category = expense.category || 'Other';
        categorySpending[category] = (categorySpending[category] || 0) + expense.amount;
      }
    });

    const categoryBreakdown = Object.entries(categorySpending).map(([label, amount]) => ({
      label,
      amount,
      percentage: Math.round((amount / (totalSpend || 1)) * 100),
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      data: {
        period,
        totalSpend,
        totalIncome,
        netFlow: totalIncome - totalSpend,
        categoryBreakdown,
      }
    });
  } catch (error) {
    console.error('Error fetching spending stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch spending stats' });
  }
};

// GET /api/dashboard/overview - Aggregated monthly metrics (admin + user)
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
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalExpenses = monthlyExpenses?.total || 0;

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
      { $group: { _id: null, total: { $sum: '$transactions.amount' } } }
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

// GET /api/dashboard/recent-transactions - condensed recent items
exports.getRecentTransactions = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, MAX_RECENT_LIMIT);
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

    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Dashboard recent transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to load recent transactions' });
  }
};
