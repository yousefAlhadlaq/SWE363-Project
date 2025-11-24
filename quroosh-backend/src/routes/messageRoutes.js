const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Message operations
router.post('/request/:requestId', messageController.sendMessage);
router.get('/request/:requestId', messageController.getRequestMessages);
router.put('/request/:requestId/mark-read', messageController.markMessagesAsRead);
router.get('/unread-count', messageController.getUnreadCount);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
