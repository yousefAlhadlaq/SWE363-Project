const Notification = require('../models/notification');
const User = require('../models/user');

const activeStatusFilter = {
  $or: [{ status: 'active' }, { status: { $exists: false } }]
};

const audienceFilters = {
  all: activeStatusFilter,
  advisors: {
    $and: [
      activeStatusFilter,
      { $or: [{ role: 'advisor' }, { isAdvisor: true }] }
    ]
  },
  clients: {
    $and: [
      activeStatusFilter,
      { $or: [{ role: 'user' }, { role: 'client' }, { isAdvisor: false }, { isAdvisor: { $exists: false } }] }
    ]
  }
};

exports.createAdminNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', targetAudience = 'all' } = req.body;

    if (!title?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, error: 'Title and message are required.' });
    }

    const filter = audienceFilters[targetAudience] || audienceFilters.all;
    const recipients = await User.find(filter).select('_id');

    if (!recipients.length) {
      return res.status(404).json({ success: false, error: 'No users found for the selected audience.' });
    }

    const recipientIds = new Set(recipients.map((user) => user._id.toString()));
    recipientIds.add(req.userId.toString());

    const docs = Array.from(recipientIds).map((userId) => ({
      user: userId,
      type,
      category: 'marketingEmails',
      title: title.trim(),
      message: message.trim(),
      metadata: { audience: targetAudience }
    }));

    await Notification.insertMany(docs);

    res.status(201).json({
      success: true,
      data: {
        created: docs.length,
        audience: targetAudience
      }
    });
  } catch (error) {
    console.error('Admin notification broadcast error:', error);
    res.status(500).json({ success: false, error: 'Failed to send notification.' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly } = req.query;
    const query = { user: req.userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const [notifications, unreadCount, totalCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Notification.getUnreadCount(req.userId),
      Notification.countDocuments({ user: req.userId })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        totalCount
      }
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications.' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.userId);
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch unread count.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.userId });
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }
    await notification.markAsRead();
    const unreadCount = await Notification.getUnreadCount(req.userId);
    res.json({ success: true, data: { notification, unreadCount } });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notification as read.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.userId);
    res.json({ success: true, data: { unreadCount: 0 } });
  } catch (error) {
    console.error('Mark all notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark notifications as read.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!result) {
      return res.status(404).json({ success: false, error: 'Notification not found.' });
    }
    const unreadCount = await Notification.getUnreadCount(req.userId);
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification.' });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    res.json({ success: true, data: { unreadCount: 0 } });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to clear notifications.' });
  }
};
