const Message = require('../models/message');
const Request = require('../models/request');
const User = require('../models/user');

// Send message to request thread
exports.sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { content, attachments } = req.body;
    const senderId = req.userId;

    // Validate content
    if (!content || content.trim() === '') {
      return res.status(400).json({
        error: 'Message content is required'
      });
    }

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client.toString() !== senderId &&
        request.advisor?.toString() !== senderId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Determine sender role
    const senderRole = request.client.toString() === senderId ? 'Client' : 'Advisor';

    // Create message
    const message = await Message.create({
      request: requestId,
      sender: senderId,
      senderRole,
      content: content.trim(),
      attachments: attachments || []
    });

    await message.populate('sender', 'fullName email profileImage');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: error.message || 'Error sending message'
    });
  }
};

// Get all messages for a request (thread)
exports.getRequestMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client.toString() !== userId &&
        request.advisor?.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Get all messages for this request
    const messages = await Message.find({ request: requestId })
      .populate('sender', 'fullName email profileImage')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching messages'
    });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Find request
    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        error: 'Request not found'
      });
    }

    // Check if user has access to this request
    if (request.client.toString() !== userId &&
        request.advisor?.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Mark all unread messages from the other party as read
    const result = await Message.updateMany(
      {
        request: requestId,
        sender: { $ne: userId },
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      markedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: error.message || 'Error marking messages as read'
    });
  }
};

// Get unread message count for a user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    // Find all requests where user is involved
    const requests = await Request.find({
      $or: [
        { client: userId },
        { advisor: userId }
      ]
    }).select('_id');

    const requestIds = requests.map(r => r._id);

    // Count unread messages sent by others
    const unreadCount = await Message.countDocuments({
      request: { $in: requestIds },
      sender: { $ne: userId },
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: error.message || 'Error fetching unread count'
    });
  }
};

// Delete message (sender only)
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        error: 'You can only delete your own messages'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: error.message || 'Error deleting message'
    });
  }
};

module.exports = exports;
