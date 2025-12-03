const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Get alert settings
router.get('/alert-settings', notificationController.getAlertSettings);

// Get latest updates feed (all notifications for activity feed)
router.get('/latest-updates', notificationController.getLatestUpdates);

// Mark single notification as read
router.put('/:id/mark-read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Update alert settings
router.patch('/alert-settings', notificationController.updateAlertSettings);

// Delete single notification
router.delete('/:id', notificationController.deleteNotification);

// Clear all notifications
router.delete('/', notificationController.clearAllNotifications);

module.exports = router;
