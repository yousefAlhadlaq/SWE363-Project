const Account = require('../models/account');

const sanitizeName = (value = '') => value.trim().replace(/\s+/g, ' ');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.userId })
      .sort({ isPrimary: -1, createdAt: 1 });

    res.json({
      success: true,
      data: accounts
    });
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

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: account
    });
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

    res.json({
      success: true,
      message: 'Account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: error.message || 'Failed to update account' });
  }
};

exports.toggleAccountStatus = async (req, res) => {
  try {
    const { action } = req.body; // 'activate' | 'deactivate'
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

    res.json({
      success: true,
      message: 'Primary account updated successfully',
      data: account
    });
  } catch (error) {
    console.error('Set primary account error:', error);
    res.status(500).json({ error: error.message || 'Failed to update primary account' });
  }
};
