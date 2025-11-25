const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    currency: {
      type: String,
      default: 'SAR',
      enum: ['SAR', 'USD', 'EUR', 'GBP']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'ar']
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY',
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
    }
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    budgetAlerts: {
      type: Boolean,
      default: true
    },
    goalReminders: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      default: 'private',
      enum: ['public', 'private']
    },
    showEmail: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
