const mongoose = require('mongoose');

const advisorRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  responseMessage: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Prevent duplicate requests
advisorRequestSchema.index({ user: 1, advisor: 1 }, { unique: true });

module.exports = mongoose.model('AdvisorRequest', advisorRequestSchema);
