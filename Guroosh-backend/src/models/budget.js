const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null
  },
  alertThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggeredAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

budgetSchema.index(
  { userId: 1, categoryId: 1, period: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('Budget', budgetSchema);
