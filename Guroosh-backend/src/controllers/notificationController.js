const Notification = require('../models/notification');
const Settings = require('../models/settings');
const User = require('../models/user');
const { createBulkNotifications } = require('../utils/notificationHelper');

// GET /api/notifications - Get all notifications for the logged-in user
exports.getAllNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    // ✅ FIX: Use req.userId (set by auth middleware)
    const userId = req.userId || req.user._id;
    console.log('🔍 [NOTIF API] getAllNotifications for userId:', userId);

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    console.log('🔍 [NOTIF API] Found', notifications.length, 'notifications');

    const unreadCount = await Notification.getUnreadCount(userId);
    const totalCount = await Notification.countDocuments({ user: userId });

    console.log('🔍 [NOTIF API] Unread:', unreadCount, 'Total:', totalCount);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// GET /api/notifications/unread-count - Get unread count only
exports.getUnreadCount = async (req, res) => {
  try {
    // ✅ FIX: Use req.userId (set by auth middleware)
    const userId = req.userId || req.user._id;
    console.log('🔍 [NOTIF API] getUnreadCount for userId:', userId);

    const unreadCount = await Notification.getUnreadCount(userId);
    console.log('🔍 [NOTIF API] Unread count:', unreadCount);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message
    });
  }
};

// PUT /api/notifications/:id/mark-read - Mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification, unreadCount }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// PUT /api/notifications/mark-all-read - Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;
    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { unreadCount: 0 }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// DELETE /api/notifications/:id - Delete a single notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      message: 'Notification deleted',
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// DELETE /api/notifications - Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;
    await Notification.deleteMany({ user: userId });

    res.json({
      success: true,
      message: 'All notifications cleared',
      data: { unreadCount: 0 }
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
};

// PATCH /api/notifications/alert-settings - Update alert settings
exports.updateAlertSettings = async (req, res) => {
  try {
    const { transactionAlerts, budgetReminders, investmentUpdates, marketingEmails } = req.body;
    const userId = req.userId || req.user._id;

    let settings = await Settings.findOne({ user: userId });

    if (!settings) {
      // Create default settings if they don't exist
      settings = new Settings({
        user: userId,
        alertSettings: {
          transactionAlerts: true,
          budgetReminders: true,
          investmentUpdates: true,
          marketingEmails: true
        }
      });
    }

    // Update alert settings
    if (typeof transactionAlerts === 'boolean') {
      settings.alertSettings.transactionAlerts = transactionAlerts;
    }
    if (typeof budgetReminders === 'boolean') {
      settings.alertSettings.budgetReminders = budgetReminders;
    }
    if (typeof investmentUpdates === 'boolean') {
      settings.alertSettings.investmentUpdates = investmentUpdates;
    }
    if (typeof marketingEmails === 'boolean') {
      settings.alertSettings.marketingEmails = marketingEmails;
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Alert settings updated',
      data: { alertSettings: settings.alertSettings }
    });
  } catch (error) {
    console.error('Error updating alert settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert settings',
      error: error.message
    });
  }
};

// GET /api/notifications/alert-settings - Get alert settings
exports.getAlertSettings = async (req, res) => {
  try {
    const userId = req.userId || req.user._id;
    let settings = await Settings.findOne({ user: userId });

    if (!settings) {
      // Return default settings
      return res.json({
        success: true,
        data: {
          alertSettings: {
            transactionAlerts: true,
            budgetReminders: true,
            investmentUpdates: true,
            marketingEmails: true
          }
        }
      });
    }

    res.json({
      success: true,
      data: { alertSettings: settings.alertSettings }
    });
  } catch (error) {
    console.error('Error fetching alert settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert settings',
      error: error.message
    });
  }
};

// GET /api/notifications/latest-updates - Get Latest Updates feed (ALL notifications, read or unread)
exports.getLatestUpdates = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.userId || req.user._id;

    // Fetch ALL notifications (read and unread) for Latest Updates feed
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Format for Latest Updates feed display
    const formattedUpdates = notifications.map(notif => ({
      id: notif._id,
      merchant: notif.metadata.merchant || notif.title,
      amount: notif.metadata.amount || 0,
      timestamp: notif.createdAt,
      method: notif.metadata.method || 'Transaction',
      status: notif.metadata.direction || (notif.type === 'investment' ? 'investment' : 'out'),
      type: notif.type,
      accountName: notif.metadata.accountName,
      read: notif.read
    }));

    res.json({
      success: true,
      data: {
        updates: formattedUpdates,
        totalCount: notifications.length
      }
    });
  } catch (error) {
    console.error('Error fetching latest updates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest updates',
      error: error.message
    });
  }
};

exports.createAdminNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', targetAudience = 'all' } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required.'
      });
    }

    const allowedTypes = new Set(['info', 'warning', 'success', 'error']);
    const normalizedType = allowedTypes.has(type) ? type : 'info';

    const audienceFilters = {
      all: {},
      advisors: { $or: [{ role: 'advisor' }, { isAdvisor: true }] },
      clients: { role: { $in: ['user', 'client'] } }
    };

    const audienceKey = audienceFilters[targetAudience] ? targetAudience : 'all';
    const recipients = await User.find(audienceFilters[audienceKey]).select('_id');

    if (!recipients.length) {
      return res.status(404).json({
        success: false,
        error: 'No recipients found for the selected audience.'
      });
    }

    const { successful, failed } = await createBulkNotifications(
      recipients.map((user) => user._id),
      {
        type: normalizedType,
        category: 'marketingEmails',
        title: title.trim(),
        message: message.trim(),
        metadata: { audience: audienceKey }
      }
    );

    return res.status(201).json({
      success: true,
      message: `Notification sent to ${successful} recipient${successful === 1 ? '' : 's'}.`,
      data: { successful, failed }
    });
  } catch (error) {
    console.error('Error sending admin notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send notification.',
      details: error.message
    });
  }
};
