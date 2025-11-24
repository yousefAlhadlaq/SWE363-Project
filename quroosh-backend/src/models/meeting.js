const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Meeting with Financial Advisor'
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  location: {
    type: String,
    default: ''
  },
  meetingType: {
    type: String,
    enum: ['Video Call', 'Phone Call', 'In-Person', 'Other'],
    default: 'Video Call'
  },
  meetingLink: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
meetingSchema.index({ advisor: 1, dateTime: 1 });
meetingSchema.index({ client: 1, dateTime: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
