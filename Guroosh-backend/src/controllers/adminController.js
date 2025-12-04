const User = require('../models/user');
const Expense = require('../models/expense');
const Investment = require('../models/investment');
const Request = require('../models/request');
const Meeting = require('../models/meeting');
const AdvisorRequest = require('../models/advisorRequest');
const ExternalBankAccount = require('../models/externalBankAccount');
const emailService = require('../utils/emailService');

const generateResetCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const formatMonthLabel = (year, monthIndex) => {
  const date = new Date(year, monthIndex - 1, 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const buildActivityItem = (payload) => ({
  type: payload.type,
  title: payload.title,
  subtitle: payload.subtitle,
  meta: payload.meta,
  timestamp: payload.timestamp
});

exports.getOverview = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsers,
      verifiedUsers,
      totalAdvisors,
      availableAdvisors,
      pendingAdvisorApplicants,
      pendingRequests,
      activeRequests,
      meetingsThisWeek,
      expenseAggregate,
      investmentAggregate,
      incomeAggregate,
      uniqueClients
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ $or: [{ role: 'advisor' }, { isAdvisor: true }] }),
      User.countDocuments({
        $and: [
          { $or: [{ role: 'advisor' }, { isAdvisor: true }] },
          { 'advisorProfile.availability': 'available' }
        ]
      }),
      AdvisorRequest.countDocuments({ status: 'pending' }),
      Request.countDocuments({ status: 'Pending' }),
      Request.countDocuments({ status: { $in: ['Accepted', 'In Progress'] } }),
      Meeting.countDocuments({ dateTime: { $gte: weekStart, $lte: now } }),
      Expense.aggregate([
        { $match: { date: { $gte: startOfMonth, $lte: now } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Investment.aggregate([
        {
          $project: {
            holdingValue: {
              $multiply: [
                { $ifNull: ['$amountOwned', 0] },
                {
                  $cond: [
                    { $gt: ['$currentPrice', 0] },
                    { $ifNull: ['$currentPrice', 0] },
                    { $ifNull: ['$buyPrice', 0] }
                  ]
                }
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$holdingValue' }
          }
        }
      ]),
      ExternalBankAccount.aggregate([
        { $unwind: '$transactions' },
        {
          $match: {
            'transactions.date': { $gte: startOfMonth, $lte: now },
            'transactions.type': { $in: ['deposit', 'transfer_in'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$transactions.amount' }
          }
        }
      ]),
      Request.distinct('client', { status: { $ne: 'Cancelled' } })
    ]);

    const monthlyExpenseTotal = expenseAggregate[0]?.total || 0;
    const monthlyExpenseCount = expenseAggregate[0]?.count || 0;
    const investmentValue = investmentAggregate[0]?.total || 0;
    const monthlyIncome = incomeAggregate[0]?.total || 0;

    res.json({
      success: true,
      data: {
        totals: {
          totalUsers,
          newUsersLast30Days: newUsers,
          verifiedUsers,
          activeClients: uniqueClients.length
        },
        advisors: {
          total: totalAdvisors,
          available: availableAdvisors,
          pendingApplications: pendingAdvisorApplicants
        },
        workflow: {
          pendingRequests,
          activeRequests,
          meetingsScheduledThisWeek: meetingsThisWeek
        },
        finance: {
          monthlyExpenseTotal,
          monthlyIncome,
          averageTicket: monthlyExpenseCount ? monthlyExpenseTotal / monthlyExpenseCount : 0,
          investmentValue,
          netCashFlow: monthlyIncome - monthlyExpenseTotal
        }
      }
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: error.message || 'Failed to load admin overview' });
  }
};

exports.getFinanceSnapshot = async (req, res) => {
  try {
    const now = new Date();
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const categoryWindow = new Date(now);
    categoryWindow.setDate(now.getDate() - 90);

    const [monthlyTrend, categoryLeaders, dailyVelocity] = await Promise.all([
      Expense.aggregate([
        { $match: { date: { $gte: trendStart, $lte: now } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: categoryWindow, $lte: now } } },
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
        {
          $match: {
            date: {
              $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13),
              $lte: now
            }
          }
        },
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
      ])
    ]);

    const trendSeries = monthlyTrend.map((item) => ({
      label: formatMonthLabel(item._id.year, item._id.month),
      total: item.total
    }));

    const categoryBreakdown = categoryLeaders.map((item) => ({
      id: item._id,
      name: item.category?.name || 'Uncategorized',
      color: item.category?.color || '#0f172a',
      transactions: item.count,
      total: item.total
    }));

    const dailySeries = dailyVelocity.map((item) => ({
      date: new Date(item._id.year, item._id.month - 1, item._id.day).toISOString(),
      total: item.total
    }));

    res.json({
      success: true,
      data: {
        monthlyTrend: trendSeries,
        categoryBreakdown,
        dailyVelocity: dailySeries
      }
    });
  } catch (error) {
    console.error('Admin finance snapshot error:', error);
    res.status(500).json({ error: error.message || 'Failed to load finance snapshot' });
  }
};

exports.getActivityFeed = async (req, res) => {
  try {
    const [requests, meetings, expenses] = await Promise.all([
      Request.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('client', 'fullName')
        .select('title status createdAt client'),
      Meeting.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('advisor', 'fullName')
        .select('title status dateTime advisor'),
      Expense.find()
        .sort({ date: -1 })
        .limit(8)
        .populate('userId', 'fullName')
        .populate('categoryId', 'name')
        .select('title amount date userId categoryId')
    ]);

    const combined = [
      ...requests.map((reqItem) => buildActivityItem({
        type: 'request',
        title: reqItem.title,
        subtitle: `Status: ${reqItem.status}`,
        meta: reqItem.client?.fullName || 'Client',
        timestamp: reqItem.createdAt
      })),
      ...meetings.map((meeting) => buildActivityItem({
        type: 'meeting',
        title: meeting.title || 'Scheduled meeting',
        subtitle: meeting.advisor?.fullName || 'Advisor',
        meta: meeting.status,
        timestamp: meeting.dateTime
      })),
      ...expenses.map((expense) => buildActivityItem({
        type: 'expense',
        title: expense.title,
        subtitle: expense.categoryId?.name || 'Expense',
        meta: `SAR ${expense.amount.toFixed(2)} · ${expense.userId?.fullName || 'User'}`,
        timestamp: expense.date
      }))
    ];

    const sorted = combined
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    res.json({ success: true, data: sorted });
  } catch (error) {
    console.error('Admin activity feed error:', error);
    res.status(500).json({ error: error.message || 'Failed to load activity feed' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { q, status, role } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (role) filters.role = role;
    if (q) {
      filters.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(filters)
      .select('-password -emailVerificationCode -passwordResetCode')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [recentExpenses, recentRequests] = await Promise.all([
      Expense.find({ userId: user._id }).sort({ date: -1 }).limit(10),
      Request.find({ client: user._id }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        user,
        recentExpenses,
        recentRequests
      }
    });
  } catch (error) {
    console.error('Admin user profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ error: 'Action must be activate or deactivate' });
    }

    if (req.params.id === String(req.userId)) {
      return res.status(400).json({ error: 'You cannot change your own status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = action === 'activate' ? 'active' : 'inactive';
    user.deactivatedAt = action === 'deactivate' ? new Date() : null;
    await user.save();

    res.json({ success: true, message: `User ${action}d successfully`, data: user });
  } catch (error) {
    console.error('Admin toggle user status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update user status' });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const resetCode = generateResetCode();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    emailService.sendPasswordResetEmail(user.email, user.fullName, resetCode)
      .catch((err) => console.error('Admin reset email error:', err.message));

    res.json({ success: true, message: 'Password reset instructions sent to user' });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({ error: error.message || 'Failed to reset password' });
  }
};
