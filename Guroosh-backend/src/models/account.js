const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['cash', 'checking', 'savings', 'card', 'wallet'],
    default: 'cash'
  },
  institution: {
    type: String,
    default: ''
  },
  lastFour: {
    type: String,
    default: ''
  },
  balance: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'SAR'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);
