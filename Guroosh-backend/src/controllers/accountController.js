const ExternalBankAccount = require('../models/externalBankAccount');
const Account = require('../models/account');
const axios = require('axios');

const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';
const sanitizeName = (value = '') => value.trim().replace(/\s+/g, ' ');
const BANK_NAME_MAP = {
  1: 'Al Rajhi Bank',
  2: 'National Commercial Bank',
  3: 'Riyad Bank',
  4: 'Saudi British Bank',
  5: 'Bank Albilad',
  6: 'Alinma Bank',
  7: 'Bank Al Jazira',
  8: 'Banque Saudi Fransi'
};

const mapExternalAccount = (account) => ({
  id: account._id,
  bank: account.bank,
  accountNumber: account.accountNumber,
  accountType: account.accountType,
  balance: account.balance,
  currency: account.currency,
  transactions: account.transactions,
  totalDeposits: account.totalDeposits,
  totalPayments: account.totalPayments,
  createdAt: account.createdAt
});

// Managed (local) accounts -------------------------------------------------
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId }).sort({ isPrimary: -1, createdAt: 1 });
    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch accounts' });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, type, balance = 0, currency = 'SAR', institution, lastFour } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Account name is required' });
    }

    const normalizedName = sanitizeName(name);
    const existing = await Account.findOne({ userId: req.userId, name: normalizedName });
    if (existing) {
      return res.status(400).json({ error: 'Account with this name already exists' });
    }

    const hasAccounts = await Account.exists({ userId: req.userId });

    const account = await Account.create({
      userId: req.userId,
      name: normalizedName,
      type: type || 'cash',
      balance: Number(balance) || 0,
      currency,
      institution,
      lastFour,
      isPrimary: !hasAccounts
    });

    if (account.isPrimary) {
      await Account.updateMany(
        { userId: req.userId, _id: { $ne: account._id } },
        { $set: { isPrimary: false } }
      );
    }

    res.status(201).json({ success: true, message: 'Account created successfully', data: account });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: error.message || 'Failed to create account' });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = sanitizeName(req.body.name);
    if (req.body.type) updates.type = req.body.type;
    if (req.body.balance !== undefined) updates.balance = Number(req.body.balance);
    if (req.body.currency) updates.currency = req.body.currency;
    if (req.body.institution !== undefined) updates.institution = req.body.institution;
    if (req.body.lastFour !== undefined) updates.lastFour = req.body.lastFour;

    if (updates.name) {
      const duplicate = await Account.findOne({
        userId: req.userId,
        name: updates.name,
        _id: { $ne: req.params.id }
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Another account already uses this name' });
      }
    }

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ success: true, message: 'Account updated successfully', data: account });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: error.message || 'Failed to update account' });
  }
};

exports.toggleAccountStatus = async (req, res) => {
  try {
    const { action } = req.body;
    if (!['activate', 'deactivate'].includes(action)) {
      return res.status(400).json({ error: 'Action must be activate or deactivate' });
    }

    const account = await Account.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    account.status = action === 'activate' ? 'active' : 'inactive';
    if (action === 'deactivate' && account.isPrimary) {
      account.isPrimary = false;
      await Account.updateOne(
        { userId: req.userId, _id: { $ne: account._id } },
        { $set: { isPrimary: true } }
      );
    }
    await account.save();

    res.json({
      success: true,
      message: `Account ${action === 'activate' ? 'activated' : 'deactivated'} successfully`,
      data: account
    });
  } catch (error) {
    console.error('Toggle account status error:', error);
    res.status(500).json({ error: error.message || 'Failed to toggle account status' });
  }
};

exports.setPrimaryAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, userId: req.userId, status: 'active' });
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await Account.updateMany({ userId: req.userId }, { $set: { isPrimary: false } });
    account.isPrimary = true;
    await account.save();

    res.json({ success: true, message: 'Primary account updated successfully', data: account });
  } catch (error) {
    console.error('Set primary account error:', error);
    res.status(500).json({ error: error.message || 'Failed to update primary account' });
  }
};

// External (legacy) accounts ----------------------------------------------
exports.getExternalAccounts = async (req, res) => {
  try {
    const accounts = await ExternalBankAccount.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, accounts: accounts.map(mapExternalAccount) });
  } catch (error) {
    console.error('Error fetching linked accounts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch accounts' });
  }
};

exports.linkExternalAccount = async (req, res) => {
  try {
    const { bankId, initialDeposit, accountName } = req.body;
    const userId = req.userId;

    if (!bankId || !initialDeposit || !accountName) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    try {
      const centralBankResponse = await axios.post(`${CENTRAL_BANK_API}/link-account`, {
        userId,
        bankId: parseInt(bankId, 10)
      });

      if (!centralBankResponse.data.success) {
        throw new Error(centralBankResponse.data.error || 'Failed to link account with Central Bank');
      }

      const linkedAccount = centralBankResponse.data.account;
      const depositResponse = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
        userId,
        operation_type: 'deposit',
        account_id: linkedAccount.id,
        amount: parseFloat(initialDeposit),
        description: `Initial deposit for ${accountName}`
      });

      if (!depositResponse.data.success) {
        throw new Error(depositResponse.data.error || 'Failed to perform initial deposit');
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        account: {
          id: linkedAccount.id,
          bank: linkedAccount.bankName,
          accountNumber: linkedAccount.accountNumber,
          accountName,
          balance: depositResponse.data.new_balance,
          currency: linkedAccount.currency
        }
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);
      const accountNumber = `SA${Date.now()}${Math.floor(Math.random() * 1000000)}`;
      const bankName = BANK_NAME_MAP[bankId] || 'Unknown Bank';

      const newAccount = await ExternalBankAccount.create({
        userId,
        bank: bankName,
        accountNumber,
        accountType: 'Checking',
        balance: parseFloat(initialDeposit),
        currency: 'SAR',
        totalDeposits: parseFloat(initialDeposit),
        transactions: [{
          type: 'deposit',
          amount: parseFloat(initialDeposit),
          description: `Initial deposit for ${accountName}`,
          date: new Date()
        }]
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully (fallback mode)',
        account: {
          id: newAccount._id,
          bank: newAccount.bank,
          accountNumber: newAccount.accountNumber,
          accountName,
          balance: newAccount.balance,
          currency: newAccount.currency
        }
      });
    }
  } catch (error) {
    console.error('Error creating external account:', error);
    res.status(500).json({ success: false, error: 'Failed to create account' });
  }
};

exports.getExternalAccount = async (req, res) => {
  try {
    const account = await ExternalBankAccount.findOne({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.json({ success: true, account: mapExternalAccount(account) });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch account' });
  }
};

exports.deleteExternalAccount = async (req, res) => {
  try {
    const account = await ExternalBankAccount.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};
