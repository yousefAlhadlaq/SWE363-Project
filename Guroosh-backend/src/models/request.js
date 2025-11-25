const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    enum: ['Portfolio', 'Planning', 'Tax', 'Retirement', 'Investment', 'Budgeting', 'Other']
  },
  urgency: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  budget: {
    type: String,
    default: null
  },
  preferredAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  draft: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
requestSchema.index({ client: 1, status: 1 });
requestSchema.index({ advisor: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
