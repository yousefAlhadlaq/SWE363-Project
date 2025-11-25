const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  advisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Note content is required']
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ request: 1, advisor: 1 });

module.exports = mongoose.model('Note', noteSchema);
