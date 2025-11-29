const ExternalBankAccount = require('../models/externalBankAccount');
const axios = require('axios');

// Central Bank API URL
const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';

// Get all accounts for a user
exports.getAllAccounts = async (req, res) => {
  try {
    const userId = req.userId;
    const accounts = await ExternalBankAccount.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      accounts: accounts.map(account => ({
        id: account._id,
        bank: account.bank,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
        transactions: account.transactions,
        createdAt: account.createdAt,
      }))
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts'
    });
  }
};

// Create a new account
exports.createAccount = async (req, res) => {
  try {
    const { bankId, initialDeposit, accountName } = req.body;
    const userId = req.userId;

    // Validate input
    if (!bankId || !initialDeposit || !accountName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Call Central Bank API to link the account
    try {
      console.log('🔗 Linking account:', { userId, bankId: parseInt(bankId) });

      const centralBankResponse = await axios.post(`${CENTRAL_BANK_API}/link-account`, {
        userId,
        bankId: parseInt(bankId)
      });

      console.log('✅ Account linked:', centralBankResponse.data);

      if (!centralBankResponse.data.success) {
        throw new Error(centralBankResponse.data.error || 'Failed to link account with Central Bank');
      }

      const linkedAccount = centralBankResponse.data.account;

      // Now perform the initial deposit using Central Bank's perform_operation endpoint
      console.log('💰 Performing initial deposit:', {
        userId,
        account_id: linkedAccount.id,
        amount: parseFloat(initialDeposit)
      });

      const depositResponse = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
        userId,
        operation_type: 'deposit',
        account_id: linkedAccount.id,
        amount: parseFloat(initialDeposit),
        description: `Initial deposit for ${accountName}`
      });

      console.log('✅ Deposit completed:', depositResponse.data);

      if (!depositResponse.data.success) {
        throw new Error(depositResponse.data.error || 'Failed to perform initial deposit');
      }

      const finalAccount = {
        id: linkedAccount.id,
        bank: linkedAccount.bankName,
        accountNumber: linkedAccount.accountNumber,
        accountName,
        balance: depositResponse.data.new_balance,
        currency: linkedAccount.currency,
      };

      console.log('🎉 Account created successfully:', finalAccount);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        account: finalAccount
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);

      // Fallback: Create account directly if Central Bank is unavailable
      const bankMapping = {
        '1': 'Al Rajhi Bank',
        '2': 'National Commercial Bank',
        '3': 'Riyad Bank',
        '4': 'Saudi British Bank',
        '5': 'Bank Albilad',
        '6': 'Alinma Bank',
        '7': 'Bank Al Jazira',
        '8': 'Banque Saudi Fransi',
      };

      const bankName = bankMapping[bankId] || 'Unknown Bank';
      const accountNumber = `SA${Date.now()}${Math.floor(Math.random() * 1000000)}`;

      const newAccount = new ExternalBankAccount({
        userId,
        bank: bankName,
        accountNumber,
        accountType: 'Checking',
        balance: parseFloat(initialDeposit),
        currency: 'SAR',
        totalDeposits: parseFloat(initialDeposit),
        transactions: [
          {
            type: 'deposit',
            amount: parseFloat(initialDeposit),
            description: `Initial deposit for ${accountName}`,
            date: new Date()
          }
        ]
      });

      await newAccount.save();

      res.status(201).json({
        success: true,
        message: 'Account created successfully (fallback mode)',
        account: {
          id: newAccount._id,
          bank: newAccount.bank,
          accountNumber: newAccount.accountNumber,
          accountName,
          balance: newAccount.balance,
          currency: newAccount.currency,
        }
      });
    }
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account'
    });
  }
};

// Get single account
exports.getAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const account = await ExternalBankAccount.findOne({ _id: id, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    res.json({
      success: true,
      account: {
        id: account._id,
        bank: account.bank,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
        transactions: account.transactions,
        totalDeposits: account.totalDeposits,
        totalPayments: account.totalPayments,
        createdAt: account.createdAt,
      }
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch account'
    });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const account = await ExternalBankAccount.findOneAndDelete({ _id: id, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
};
