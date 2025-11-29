const ExternalBankAccount = require('../models/externalBankAccount');
const ExternalStock = require('../models/externalStock');
const ExternalGold = require('../models/externalGold');
const Expense = require('../models/expense');
const Investment = require('../models/Investment');
const axios = require('axios');

// Central Bank API URL
const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';

// Helper: Get start of week (Sunday)
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day;
  return new Date(now.setDate(diff));
};

// Helper: Get start of month
const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Helper: Categorize transaction
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

// Fetch data from Central Bank mock server
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

    // Fetch data from multiple sources in parallel
    const [
      expensesFromDB,
      investmentsFromDB,
      centralBankAccounts,
      centralBankStocks,
      centralBankGold,
    ] = await Promise.all([
      // Local database
      Expense.find({ userId }).sort({ date: -1 }).limit(50),
      Investment.find({ userId }),
      // Central Bank mock server (PRIMARY SOURCE - used by all team members)
      fetchFromCentralBank('accounts', userId),
      fetchFromCentralBank('stocks', userId),
      fetchFromCentralBank('gold_value', userId),
    ]);

    // Use Central Bank as primary source (for team collaboration)
    const accounts = centralBankAccounts?.accounts || [];
    const stockPortfolios = centralBankStocks?.portfolios || [];
    const stockSummary = centralBankStocks?.summary || { totalValue: 0, totalGainLoss: 0 };
    const goldData = centralBankGold?.gold;

    console.log('📊 Dashboard Data Debug:');
    console.log('  - User ID:', userId);
    console.log('  - Accounts from Central Bank:', accounts.length);
    console.log('  - Accounts data:', JSON.stringify(accounts, null, 2));

    // Calculate totals
    let totalBalance = 0;
    let weeklySpend = 0;
    let monthlySpend = 0;
    let creditCardDue = 0;
    const allTransactions = [];
    const merchantSpending = {};
    const categorySpending = {};
    const weeklyChartData = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

    const startOfWeek = getStartOfWeek();
    const startOfMonth = getStartOfMonth();
    
    // Rolling 7-day window for "Weekly Spend" scalar
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    // Process bank accounts
    const processedAccounts = [];

    // Handle accounts from Central Bank (array format)
    if (Array.isArray(accounts)) {
      accounts.forEach(account => {
        const balance = account.balance || 0;
        totalBalance += balance;

        processedAccounts.push({
          id: account.id || account._id,
          bank: account.bank,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: balance,
          currency: account.currency || 'SAR',
          createdAt: account.createdAt,
        });

        // Check if credit card
        if (account.accountType === 'Credit') {
          creditCardDue += Math.abs(balance);
        }

        // Process transactions from account (Central Bank stores them in billing.transactions)
        const transactions = account.billing?.transactions || account.transactions || [];
        transactions.forEach(tx => {
          // Convert Mongoose subdocument to plain object if needed
          const txData = tx.toObject ? tx.toObject() : tx;
          allTransactions.push({
            ...txData,
            accountId: account._id,
            bank: account.bank,
            accountNumber: account.accountNumber,
            source: 'bank',
          });

          // Calculate spending - STRICTLY payments only
          // Exclude transfers, investments, deposits
          if (tx.type === 'payment') {
            const txDate = new Date(tx.date);

            // Weekly Spend: Rolling 7 days
            if (txDate >= oneWeekAgo) {
              weeklySpend += tx.amount;
            }

            // Weekly Chart: Sunday to Saturday (Visual)
            if (txDate >= startOfWeek) {
              const dayIndex = txDate.getDay();
              weeklyChartData[dayIndex] += tx.amount;
            }

            if (txDate >= startOfMonth) {
              monthlySpend += tx.amount;
            }

            // Merchant spending
            const merchant = tx.merchant || tx.description || 'Unknown';
            merchantSpending[merchant] = (merchantSpending[merchant] || 0) + tx.amount;

            // Category spending
            // Prefer explicit category, fallback to helper
            const category = tx.category || categorizeTransaction(tx.description);
            categorySpending[category] = (categorySpending[category] || 0) + tx.amount;
          }
        });
      });
    }

    // Add expenses from Expense model
    if (expensesFromDB && expensesFromDB.length > 0) {
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
          const dayIndex = txDate.getDay();
          weeklyChartData[dayIndex] += expense.amount;
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
    }

    // Calculate investments total
    let investmentsTotal = 0;

    // Stocks value
    investmentsTotal += stockSummary.totalValue || 0;

    // Gold value
    if (goldData) {
      investmentsTotal += goldData.investmentValue || (goldData.amountOunces * goldData.currentPrice) || 0;
    }

    // Investments from Investment model (manually created investments)
    if (investmentsFromDB && investmentsFromDB.length > 0) {
      investmentsFromDB.forEach(inv => {
        // Calculate current value based on currentPrice * amountOwned
        const currentValue = (inv.currentPrice || 0) * (inv.amountOwned || 1);
        investmentsTotal += currentValue;
      });
    }

    // Add investment purchases to allTransactions for Latest Updates
    if (investmentsFromDB && investmentsFromDB.length > 0) {
      investmentsFromDB.forEach(inv => {
        const investmentValue = (inv.currentPrice || 0) * (inv.amountOwned || 1);

        // Create formatted message based on category
        let description = '';
        if (inv.category === 'Stock') {
          description = `Bought ${inv.amountOwned} shares of ${inv.name}`;
        } else if (inv.category === 'Real Estate') {
          description = `Invested in ${inv.name}`;
        } else if (inv.category === 'Gold') {
          description = `Bought ${inv.amountOwned}g of gold`;
        } else if (inv.category === 'Crypto') {
          description = `Purchased ${inv.amountOwned} ${inv.name}`;
        } else {
          description = `Invested in ${inv.name}`;
        }

        allTransactions.push({
          _id: inv._id,
          description: description,
          amount: investmentValue,
          date: inv.purchaseDate || inv.createdAt,
          type: 'investment',
          category: inv.category,
          source: 'investment',
        });
      });
    }

    // Sort transactions by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get top merchant
    let topMerchant = { name: 'None', amount: 0 };
    Object.entries(merchantSpending).forEach(([name, amount]) => {
      if (amount > topMerchant.amount) {
        topMerchant = { name, amount };
      }
    });

    // Calculate category percentages
    // Calculate category percentages with "Other" grouping
    const totalCategorySpend = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
    
    // 1. Convert to array and sort
    let sortedCategories = Object.entries(categorySpending)
      .map(([label, value]) => ({
        label,
        value: Math.round((value / (totalCategorySpend || 1)) * 100),
        amount: value,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 2. Take top 5 and group the rest
    let categoryBreakdown = [];
    if (sortedCategories.length > 5) {
      const top5 = sortedCategories.slice(0, 5);
      const others = sortedCategories.slice(5);
      
      const otherAmount = others.reduce((sum, item) => sum + item.amount, 0);
      const otherValue = others.reduce((sum, item) => sum + item.value, 0); // Sum of percentages might be slightly off due to rounding, but close enough

      categoryBreakdown = [
        ...top5,
        {
          label: 'Other',
          value: otherValue,
          amount: otherAmount
        }
      ];
    } else {
      categoryBreakdown = sortedCategories;
    }

    // Format latest updates (last 10 transactions, including investments)
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

    // Weekly chart formatted
    const weeklyChart = [
      { label: 'Sun', value: weeklyChartData[0] },
      { label: 'Mon', value: weeklyChartData[1] },
      { label: 'Tue', value: weeklyChartData[2] },
      { label: 'Wed', value: weeklyChartData[3] },
      { label: 'Thu', value: weeklyChartData[4] },
      { label: 'Fri', value: weeklyChartData[5] },
      { label: 'Sat', value: weeklyChartData[6] },
    ];

    // Format stock portfolios
    const formattedStocks = stockPortfolios.map(portfolio => ({
      bank: portfolio.bank,
      brokerage: portfolio.brokerage,
      stocks: portfolio.stocks,
      totalValue: portfolio.stocks.reduce((sum, s) => sum + s.currentValue, 0),
    }));

    // Format gold data
    const formattedGold = goldData ? {
      amountOunces: goldData.amountOunces,
      purchasePrice: goldData.purchasePrice,
      currentPrice: goldData.currentPrice,
      investmentValue: goldData.investmentValue,
      gainLoss: goldData.gainLoss,
      gainLossPct: goldData.gainLossPct,
    } : null;

    res.json({
      success: true,
      data: {
        // Summary stats
        totalBalance,
        weeklySpend,
        monthlySpend,
        creditCardDue,
        investmentsTotal,

        // Accounts
        accounts: processedAccounts,
        accountCount: processedAccounts.length,

        // Investments
        stocks: formattedStocks,
        stockSummary,
        gold: formattedGold,

        // Latest activity
        latestUpdates,

        // Spending analysis
        topMerchant,
        categoryBreakdown,

        // Chart data
        weeklyChart,

        // Limits
        dailySpendLimit: 1000,
        remainingLimit: Math.max(0, 1000 - (weeklySpend / 7)),
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
};

// GET /api/dashboard/accounts - Get all linked accounts (from local DB)
exports.getLinkedAccounts = async (req, res) => {
  try {
    const userId = req.userId;

    // Use LOCAL DB as primary source (this is where linked accounts are saved)
    const accounts = await ExternalBankAccount.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        accounts: accounts.map(acc => ({
          id: acc._id,
          bank: acc.bank,
          accountNumber: acc.accountNumber,
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch linked accounts'
    });
  }
};

// GET /api/dashboard/investments - Get all investments (stocks, gold)
exports.getInvestments = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch from Central Bank
    const [centralBankStocks, centralBankGold] = await Promise.all([
      fetchFromCentralBank('stocks', userId),
      fetchFromCentralBank('gold_value', userId),
    ]);

    // Fallback to local DB if needed
    const localStocks = await ExternalStock.find({ userId });
    const localGold = await ExternalGold.findOne({ userId });
    const investments = await Investment.find({ userId });

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
                    investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0),
      }
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch investments'
    });
  }
};

// GET /api/dashboard/updates - Get latest updates/transactions
exports.getLatestUpdates = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;

    // Collect all transactions
    const allTransactions = [];

    // From local accounts (PRIMARY SOURCE)
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

    // From expenses
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

    // Sort by date and limit
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest updates'
    });
  }
};

// GET /api/dashboard/stats - Get spending statistics
exports.getSpendingStats = async (req, res) => {
  try {
    const userId = req.userId;
    const period = req.query.period || 'weekly'; // weekly, monthly, yearly

    // Use LOCAL DB as primary source
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
      default:
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
    }

    let totalSpend = 0;
    let totalIncome = 0;
    const categorySpending = {};

    // Process bank transactions
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

    // Process expenses
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
    res.status(500).json({
      success: false,
      error: 'Failed to fetch spending stats'
    });
  }
};
