const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['transaction', 'budget', 'investment', 'marketing', 'info', 'warning', 'success', 'error'],
    required: true
  },
  category: {
    type: String,
    enum: ['transactionAlerts', 'budgetReminders', 'investmentUpdates', 'marketingEmails', 'advisor'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  metadata: {
    transactionId: mongoose.Schema.Types.ObjectId,
    budgetId: mongoose.Schema.Types.ObjectId,
    investmentId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    accountName: String,
    // Additional fields for Latest Updates feed display
    method: String, // e.g., "POS • Card", "Transfer", "Investment"
    merchant: String, // Merchant or recipient name
    direction: String, // 'in' or 'out' for money flow
    quantity: Number, // For investments (shares, ounces, etc.)
    symbol: String, // For stocks/crypto
    adviceId: mongoose.Schema.Types.ObjectId // For advisor notifications
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  return await this.save();
};

// Static method to mark multiple as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
