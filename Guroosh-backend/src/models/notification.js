const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['transaction', 'budget', 'investment', 'marketing', 'info', 'warning', 'success', 'error'],
      default: 'info'
    },
    category: {
      type: String,
      enum: ['transactionAlerts', 'budgetReminders', 'investmentUpdates', 'marketingEmails'],
      default: 'marketingEmails'
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
      default: false,
      index: true
    },
    metadata: {
      audience: { type: String, default: 'all' },
      actionUrl: String
    }
  },
  { timestamps: true }
);

notificationSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save();
};

notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany({ user: userId, read: false }, { read: true });
};

notificationSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ user: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
