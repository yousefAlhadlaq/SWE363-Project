const ExternalBankAccount = require('../models/externalBankAccount');
const Expense = require('../models/expense');
const axios = require('axios');

const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';

/**
 * Fetch accounts from Central Bank API
 */
const fetchFromCentralBank = async (endpoint, userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_API}/${endpoint}/${userId}`);
    return response.data;
  } catch (error) {
    console.log(`Central Bank ${endpoint} fetch failed:`, error.message);
    return null;
  }
};

/**
 * GET /api/analytics/spending?range=weekly|monthly|yearly
 *
 * Returns spending data aggregated by time period:
 * - weekly: Last 7 days (Sun-Sat)
 * - monthly: Last 30 days (grouped by date)
 * - yearly: Last 12 months (Jan-Dec)
 *
 * ONLY counts outgoing transactions (payments, withdrawals, expenses)
 * IGNORES deposits, transfers between accounts, and investments
 */
exports.getSpendingAnalytics = async (req, res) => {
  try {
    const userId = req.userId;
    const { range = 'weekly' } = req.query;

    // ✅ CRITICAL: Validate userId exists (from auth middleware)
    if (!userId) {
      console.error('❌ Analytics request without userId');
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        message: 'User authentication required'
      });
    }

    console.log(`📊 Analytics request: userId=${userId}, range=${range}`);

    // Validate range parameter
    if (!['weekly', 'monthly', 'yearly'].includes(range)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid range. Must be weekly, monthly, or yearly'
      });
    }

    // Fetch data from Central Bank and local expenses
    const [centralBankAccounts, expensesFromDB] = await Promise.all([
      fetchFromCentralBank('accounts', userId),
      Expense.find({ userId }).sort({ date: -1 })
    ]);

    const accounts = centralBankAccounts?.accounts || [];
    const now = new Date();
    let data = [];

    if (range === 'weekly') {
      // Last 7 days (Sunday to Saturday)
      const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat

      // Get start of current week (Sunday)
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      startOfWeek.setDate(now.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      // Process bank account transactions
      accounts.forEach(account => {
        const transactions = account.billing?.transactions || account.transactions || [];

        transactions.forEach(tx => {
          const txDate = new Date(tx.date);

          // Only count outgoing transactions (payments, withdrawals)
          // Ignore deposits and internal transfers
          if (tx.type === 'payment' || tx.type === 'withdrawal') {
            if (txDate >= startOfWeek && txDate <= now) {
              const dayIndex = txDate.getDay();
              weeklyData[dayIndex] += tx.amount || 0;
            }
          }
        });
      });

      // Process local expenses
      expensesFromDB.forEach(expense => {
        const expenseDate = new Date(expense.date);

        if (expenseDate >= startOfWeek && expenseDate <= now) {
          const dayIndex = expenseDate.getDay();
          weeklyData[dayIndex] += expense.amount || 0;
        }
      });

      data = [
        { label: 'Sun', value: Math.round(weeklyData[0] * 100) / 100 },
        { label: 'Mon', value: Math.round(weeklyData[1] * 100) / 100 },
        { label: 'Tue', value: Math.round(weeklyData[2] * 100) / 100 },
        { label: 'Wed', value: Math.round(weeklyData[3] * 100) / 100 },
        { label: 'Thu', value: Math.round(weeklyData[4] * 100) / 100 },
        { label: 'Fri', value: Math.round(weeklyData[5] * 100) / 100 },
        { label: 'Sat', value: Math.round(weeklyData[6] * 100) / 100 },
      ];

    } else if (range === 'monthly') {
      // Last 30 days grouped by date (1-31)
      const monthlyData = {};

      // Initialize all dates in current month
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        monthlyData[i] = 0;
      }

      // Process bank account transactions
      accounts.forEach(account => {
        const transactions = account.billing?.transactions || account.transactions || [];

        transactions.forEach(tx => {
          const txDate = new Date(tx.date);

          // Only count outgoing transactions
          if (tx.type === 'payment' || tx.type === 'withdrawal') {
            if (txDate >= startOfMonth && txDate <= now) {
              const dayOfMonth = txDate.getDate();
              monthlyData[dayOfMonth] = (monthlyData[dayOfMonth] || 0) + (tx.amount || 0);
            }
          }
        });
      });

      // Process local expenses
      expensesFromDB.forEach(expense => {
        const expenseDate = new Date(expense.date);

        if (expenseDate >= startOfMonth && expenseDate <= now) {
          const dayOfMonth = expenseDate.getDate();
          monthlyData[dayOfMonth] = (monthlyData[dayOfMonth] || 0) + (expense.amount || 0);
        }
      });

      // Format as array (only include days that have passed in current month)
      const currentDay = now.getDate();
      data = [];
      for (let i = 1; i <= currentDay; i++) {
        data.push({
          label: i.toString(),
          value: Math.round((monthlyData[i] || 0) * 100) / 100
        });
      }

    } else if (range === 'yearly') {
      // Last 12 months (Jan-Dec)
      const yearlyData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Start of current year
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Process bank account transactions
      accounts.forEach(account => {
        const transactions = account.billing?.transactions || account.transactions || [];

        transactions.forEach(tx => {
          const txDate = new Date(tx.date);

          // Only count outgoing transactions
          if (tx.type === 'payment' || tx.type === 'withdrawal') {
            if (txDate >= startOfYear && txDate <= now) {
              const monthIndex = txDate.getMonth();
              yearlyData[monthIndex] += tx.amount || 0;
            }
          }
        });
      });

      // Process local expenses
      expensesFromDB.forEach(expense => {
        const expenseDate = new Date(expense.date);

        if (expenseDate >= startOfYear && expenseDate <= now) {
          const monthIndex = expenseDate.getMonth();
          yearlyData[monthIndex] += expense.amount || 0;
        }
      });

      data = yearlyData.map((value, index) => ({
        label: monthLabels[index],
        value: Math.round(value * 100) / 100
      }));
    }

    // ✅ Check if user has any spending data
    const totalSpending = data.reduce((sum, item) => sum + item.value, 0);
    const hasNoData = totalSpending === 0 && data.every(item => item.value === 0);
    const isNewUser = hasNoData;

    console.log(`✅ Analytics response: ${data.length} data points, total=${totalSpending}, isNewUser=${isNewUser}`);

    res.json({
      success: true,
      data: {
        range,
        chart: data,
        userId, // Include for debugging
        isNewUser, // ✅ NEW: Flag if user has no spending data
        totalSpending, // ✅ NEW: Total for the period
      }
    });

  } catch (error) {
    console.error('❌ Error fetching spending analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch spending analytics',
      error: error.message
    });
  }
};
