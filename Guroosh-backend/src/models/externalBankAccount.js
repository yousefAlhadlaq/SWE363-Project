const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['deposit', 'payment', 'transfer_in', 'transfer_out'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: String,
  fromAccount: String, // For transfers
  toAccount: String, // For transfers
  date: {
    type: Date,
    default: Date.now
  }
});

const externalBankAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  bank: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  accountName: {
    type: String,
    required: false  // Optional for backwards compatibility
  },
  accountType: {
    type: String,
    enum: ['Checking', 'Savings', 'Investment', 'Business'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'SAR' // Saudi Riyal
  },
  bankLogo: {
    type: String,
    required: false
  },
  // Billing Information
  transactions: [transactionSchema],
  totalDeposits: {
    type: Number,
    default: 0
  },
  totalPayments: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ExternalBankAccount', externalBankAccountSchema);
