const ExternalBankAccount = require('../models/externalBankAccount');
const axios = require('axios');
const { createTransactionNotification } = require('../utils/notificationHelper');

// Central Bank API URL
const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';

// Helper: Generate unique transaction ID
const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 10000)}`;
};

// Helper: Format date
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Helper: Parse SMS to extract transaction details
const parseSmsText = (sms = '') => {
  const result = {
    amount: 0,
    merchant: null,
    date: new Date(),
    type: 'payment',
    category: 'Other',
    confidence: 0,
  };

  // Extract amount (supports various formats)
  const amountPatterns = [
    /(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:sr|sar|ريال)/i,
    /(?:sr|sar|ريال)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /amount[:\s]*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
    /(\d+(?:\.\d{2})?)\s*(?:debited|credited|spent|received)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = sms.match(pattern);
    if (match) {
      result.amount = parseFloat(match[1].replace(/,/g, ''));
      result.confidence += 25;
      break;
    }
  }

  // Extract merchant
  const merchantPatterns = [
    /at\s+([A-Za-z0-9\s&\-']+?)(?:\s+on|\s+dated|\.|$)/i,
    /from\s+([A-Za-z0-9\s&\-']+?)(?:\s+on|\s+dated|\.|$)/i,
    /to\s+([A-Za-z0-9\s&\-']+?)(?:\s+on|\s+dated|\.|$)/i,
    /(?:merchant|store|shop)[:\s]*([A-Za-z0-9\s&\-']+)/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = sms.match(pattern);
    if (match) {
      result.merchant = match[1].trim().substring(0, 50);
      result.confidence += 25;
      break;
    }
  }

  // Determine transaction type
  const creditKeywords = ['credited', 'received', 'deposit', 'refund', 'cashback', 'salary'];
  const debitKeywords = ['debited', 'spent', 'purchase', 'payment', 'withdrawn', 'transfer'];

  const smsLower = sms.toLowerCase();
  const isCredit = creditKeywords.some(kw => smsLower.includes(kw));
  const isDebit = debitKeywords.some(kw => smsLower.includes(kw));

  if (isCredit && !isDebit) {
    result.type = 'deposit';
    result.confidence += 25;
  } else if (isDebit) {
    result.type = 'payment';
    result.confidence += 25;
  }

  // Extract date if present
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{2,4})/i,
  ];

  for (const pattern of datePatterns) {
    const match = sms.match(pattern);
    if (match) {
      const parsed = new Date(match[1]);
      if (!isNaN(parsed.getTime())) {
        result.date = parsed;
        result.confidence += 25;
      }
      break;
    }
  }

  // Categorize based on merchant/description
  if (result.merchant) {
    const merchantLower = result.merchant.toLowerCase();
    if (merchantLower.includes('grocery') || merchantLower.includes('panda') || merchantLower.includes('carrefour')) {
      result.category = 'Groceries';
    } else if (merchantLower.includes('stc') || merchantLower.includes('mobily') || merchantLower.includes('zain')) {
      result.category = 'Telecom';
    } else if (merchantLower.includes('uber') || merchantLower.includes('careem') || merchantLower.includes('fuel')) {
      result.category = 'Transport';
    } else if (merchantLower.includes('amazon') || merchantLower.includes('noon') || merchantLower.includes('mall')) {
      result.category = 'Shopping';
    }
  }

  return result;
};

// POST /api/transactions/transfer - Transfer funds between accounts
exports.transfer = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;
    const userId = req.userId;

    console.log('💸 Transfer Request:', { userId, fromAccountId, toAccountId, amount, description });

    // Validation
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'fromAccountId, toAccountId, and amount are required'
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot transfer to the same account'
      });
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Determine transfer type
    if (fromAccountId === 'main' || toAccountId === 'main') {
      return res.status(400).json({
        success: false,
        error: 'Main Account is not transferable. Please select a specific bank account.'
      });
    }

    // Call Central Bank API to perform transfer between real accounts
    try {
      console.log('📡 Calling Central Bank API for Transfer:', `${CENTRAL_BANK_API}/transfer`);
      const response = await axios.post(`${CENTRAL_BANK_API}/transfer`, {
        userId,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: transferAmount,
        description: description || 'Transfer'
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform transfer');
      }

      // ✅ Create notification for transfer
      console.log('📤 [TRANSFER] Calling createTransactionNotification for transfer:', {
        userId,
        amount: transferAmount,
        type: 'transfer_out',
        accountName: 'Transfer'
      });

      try {
        await createTransactionNotification(userId, {
          amount: transferAmount,
          type: 'transfer_out', // or transfer_in depending on perspective, but usually we notify about the action
          accountName: 'Transfer',
          transactionId: `transfer-${Date.now()}`,
          merchant: description || 'Transfer',
          method: 'Transfer'
        });
        console.log('✅ [TRANSFER] Notification call completed');
      } catch (notifError) {
        console.error('⚠️ [TRANSFER] Notification failed, but transfer succeeded:', notifError.message);
      }

      res.status(201).json({
        success: true,
        updatedMainBalance: newMainBalance,
        updatedAccounts: accounts,
        data: {
          transaction: {
            type: 'transfer',
            amount: transferAmount,
            description: description || 'Transfer',
            date: new Date(),
            fromAccountId,
            toAccountId
          },
          message: 'Transfer successful'
        }
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);

      // Fallback to local DB if Central Bank is unavailable
      // Note: This fallback logic assumes both accounts exist locally
      // ... (existing fallback logic can remain or be simplified if we assume CB is always up)

      // For now, let's keep the error response if CB fails, as local fallback for transfer is complex
      return res.status(500).json({
        success: false,
        error: 'Transfer failed: ' + (centralBankError.response?.data?.error || centralBankError.message)
      });
    }
  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process transfer'
    });
  }
};

// POST /api/transactions/deposit - Quick deposit
exports.quickDeposit = async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;
    const userId = req.userId;

    console.log('💰 Quick Deposit Request:', { userId, accountId, amount, description });

    // Validation
    if (!accountId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'accountId and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Handle deposit to "Main Account" (virtual account)
    if (accountId === 'main') {
      return res.status(400).json({
        success: false,
        error: 'Main Account is a computed virtual account and cannot receive direct deposits.'
      });
    }

    // Call Central Bank API to perform deposit for real accounts
    try {
      console.log('📡 Calling Central Bank API:', `${CENTRAL_BANK_API}/perform_operation`);
      const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
        userId,
        operation_type: 'deposit',
        account_id: accountId,
        amount: parseFloat(amount),
        description: description || 'Quick deposit'
      });

      console.log('✅ Central Bank Response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform deposit');
      }

      // Get updated account info from Central Bank
      const accountResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
      const account = accountResponse.data.accounts?.find(acc => acc.id === accountId);

      // Create notification for successful deposit
      await createTransactionNotification(userId, {
        amount: parseFloat(amount),
        type: 'deposit',
        accountName: account?.bank || 'Unknown',
        transactionId: accountId
      });

      res.status(201).json({
        success: true,
        data: {
          transaction: {
            type: 'deposit',
            amount: parseFloat(amount),
            description: description || 'Quick deposit',
            date: new Date(),
          },
          account: {
            id: accountId,
            bank: account?.bank || 'Unknown',
            balance: response.data.new_balance,
          }
        }
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);

      // Fallback to local DB if Central Bank is unavailable
      const account = await ExternalBankAccount.findOne({ _id: accountId, userId });

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      const transaction = {
        type: 'deposit',
        amount: parseFloat(amount),
        description: description || 'Quick deposit',
        date: new Date(),
      };

      account.balance += parseFloat(amount);
      account.totalDeposits += parseFloat(amount);
      account.transactions.push(transaction);
      await account.save();

      // Create notification for successful deposit (fallback)
      await createTransactionNotification(userId, {
        amount: parseFloat(amount),
        type: 'deposit',
        accountName: account.bank || 'Unknown',
        transactionId: account._id.toString()
      });

      res.status(201).json({
        success: true,
        data: {
          transaction: {
            id: account.transactions[account.transactions.length - 1]._id,
            ...transaction,
          },
          account: {
            id: account._id,
            bank: account.bank,
            balance: account.balance,
          }
        }
      });
    }
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process deposit'
    });
  }
};

// POST /api/transactions/manual - Manual transaction entry
exports.manualEntry = async (req, res) => {
  try {
    const { accountId, name, amount, direction, category, date } = req.body;
    const userId = req.userId;

    // Validation
    if (!accountId || !amount || !direction) {
      return res.status(400).json({
        success: false,
        error: 'accountId, amount, and direction are required'
      });
    }

    if (!['incoming', 'outgoing'].includes(direction)) {
      return res.status(400).json({
        success: false,
        error: 'direction must be "incoming" or "outgoing"'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Determine transaction type and operation
    const operationType = direction === 'incoming' ? 'deposit' : 'payment';
    const txAmount = parseFloat(amount);
    const description = name || `Manual ${direction} transaction`;

    // Handle Main Account (virtual account)
    if (accountId === 'main') {
      return res.status(400).json({
        success: false,
        error: 'Main Account is a computed virtual account and cannot be modified directly.'
      });
    }

    // Call Central Bank API to perform operation for real accounts
    try {
      const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
        userId,
        operation_type: operationType,
        account_id: accountId,
        amount: txAmount,
        description
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform operation');
      }

      // Get updated account info from Central Bank
      const accountResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
      const account = accountResponse.data.accounts?.find(acc => acc.id === accountId);

      // ✅ Create notification for manual transaction
      console.log('📤 [TRANSACTION] Calling createTransactionNotification for manual entry:', {
        userId,
        amount: txAmount,
        type: operationType,
        accountName: account?.bank || 'Unknown'
      });

      try {
        await createTransactionNotification(userId, {
          amount: txAmount,
          type: operationType, // 'deposit' or 'payment'
          accountName: account?.bank || 'Unknown',
          transactionId: accountId,
          merchant: description,
          method: 'Manual Entry'
        });
        console.log('✅ [TRANSACTION] Notification call completed for manual entry');
      } catch (notifError) {
        console.error('⚠️ [TRANSACTION] Notification failed, but transaction succeeded:', notifError.message);
        // Don't throw - let transaction succeed even if notification fails
      }

      res.status(201).json({
        success: true,
        data: {
          transaction: {
            type: operationType,
            amount: txAmount,
            description,
            date: date ? new Date(date) : new Date(),
            direction,
            category: category || 'Other',
          },
          account: {
            id: accountId,
            bank: account?.bank || 'Unknown',
            balance: response.data.new_balance,
          }
        }
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);

      // Fallback to local DB if Central Bank is unavailable
      const account = await ExternalBankAccount.findOne({ _id: accountId, userId });

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      // Check sufficient funds for outgoing
      if (direction === 'outgoing' && account.balance < txAmount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds'
        });
      }

      const transaction = {
        type: operationType,
        amount: txAmount,
        description,
        date: date ? new Date(date) : new Date(),
      };

      // Update account
      if (direction === 'incoming') {
        account.balance += txAmount;
        account.totalDeposits += txAmount;
      } else {
        account.balance -= txAmount;
        account.totalPayments += txAmount;
      }

      account.transactions.push(transaction);
      await account.save();

      // ✅ Create notification for manual transaction (fallback path)
      console.log('📤 [TRANSACTION] Calling createTransactionNotification (fallback):', {
        userId,
        amount: txAmount,
        type: operationType,
        accountName: account.bank || 'Unknown'
      });

      try {
        await createTransactionNotification(userId, {
          amount: txAmount,
          type: operationType, // 'deposit' or 'payment'
          accountName: account.bank || 'Unknown',
          transactionId: account._id.toString(),
          merchant: description,
          method: 'Manual Entry'
        });
        console.log('✅ [TRANSACTION] Notification call completed (fallback)');
      } catch (notifError) {
        console.error('⚠️ [TRANSACTION] Notification failed (fallback), but transaction succeeded:', notifError.message);
        // Don't throw - let transaction succeed even if notification fails
      }

      res.status(201).json({
        success: true,
        data: {
          transaction: {
            id: account.transactions[account.transactions.length - 1]._id,
            ...transaction,
            direction,
            category: category || 'Other',
          },
          account: {
            id: account._id,
            bank: account.bank,
            balance: account.balance,
          }
        }
      });
    }
  } catch (error) {
    console.error('Error creating manual entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual entry'
    });
  }
};

// POST /api/transactions/parse-sms - Parse SMS and create transaction
exports.parseSms = async (req, res) => {
  try {
    const { sms, accountId } = req.body;
    const userId = req.userId;

    // Validation
    if (!sms) {
      return res.status(400).json({
        success: false,
        error: 'SMS text is required'
      });
    }

    // Parse the SMS
    const parsed = parseSmsText(sms);

    // If no account specified, just return parsed data
    if (!accountId) {
      return res.json({
        success: true,
        data: {
          parsed,
          saved: false,
          message: 'SMS parsed but not saved. Provide accountId to save transaction.'
        }
      });
    }

    // Find account
    const account = await ExternalBankAccount.findOne({ _id: accountId, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Only save if we have an amount
    if (parsed.amount <= 0) {
      return res.json({
        success: true,
        data: {
          parsed,
          saved: false,
          message: 'Could not extract amount from SMS. Transaction not saved.'
        }
      });
    }

    // Call Central Bank API to perform operation
    try {
      const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
        userId,
        operation_type: parsed.type,
        account_id: accountId,
        amount: parsed.amount,
        description: parsed.merchant || 'Parsed from SMS'
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to perform operation');
      }

      // Get updated account info from Central Bank
      const accountResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
      const updatedAccount = accountResponse.data.accounts?.find(acc => acc.id === accountId);

      res.status(201).json({
        success: true,
        data: {
          parsed,
          saved: true,
          transaction: {
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.merchant || 'Parsed from SMS',
            date: parsed.date,
            category: parsed.category,
          },
          account: {
            id: accountId,
            bank: updatedAccount?.bank || 'Unknown',
            balance: response.data.new_balance,
          }
        }
      });
    } catch (centralBankError) {
      console.error('Central Bank API Error:', centralBankError.message);

      // Fallback to local DB if Central Bank is unavailable
      const account = await ExternalBankAccount.findOne({ _id: accountId, userId });

      if (!account) {
        return res.status(404).json({
          success: false,
          error: 'Account not found'
        });
      }

      // Check sufficient funds for payments
      if (parsed.type === 'payment' && account.balance < parsed.amount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds for this transaction'
        });
      }

      const transaction = {
        type: parsed.type,
        amount: parsed.amount,
        description: parsed.merchant || 'Parsed from SMS',
        date: parsed.date,
      };

      // Update account
      if (parsed.type === 'deposit') {
        account.balance += parsed.amount;
        account.totalDeposits += parsed.amount;
      } else {
        account.balance -= parsed.amount;
        account.totalPayments += parsed.amount;
      }

      account.transactions.push(transaction);
      await account.save();

      res.status(201).json({
        success: true,
        data: {
          parsed,
          saved: true,
          transaction: {
            id: account.transactions[account.transactions.length - 1]._id,
            ...transaction,
            category: parsed.category,
          },
          account: {
            id: account._id,
            bank: account.bank,
            balance: account.balance,
          }
        }
      });
    }
  } catch (error) {
    console.error('Error parsing SMS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse SMS'
    });
  }
};

// GET /api/transactions - Get all transactions for user
exports.getAllTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 50, offset = 0, accountId, type } = req.query;

    let query = { userId };
    if (accountId) {
      query._id = accountId;
    }

    const accounts = await ExternalBankAccount.find(query);

    // Collect all transactions
    let allTransactions = [];
    accounts.forEach(account => {
      account.transactions.forEach(tx => {
        if (!type || tx.type === type) {
          allTransactions.push({
            id: tx._id,
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            date: tx.date,
            accountId: account._id,
            bank: account.bank,
            accountNumber: account.accountNumber,
          });
        }
      });
    });

    // Sort by date (newest first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply pagination
    const total = allTransactions.length;
    const paginatedTransactions = allTransactions.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
};

// DELETE /api/transactions/:accountId/:transactionId - Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { accountId, transactionId } = req.params;
    const userId = req.userId;

    const account = await ExternalBankAccount.findOne({ _id: accountId, userId });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Account not found'
      });
    }

    // Find transaction
    const txIndex = account.transactions.findIndex(tx => tx._id.toString() === transactionId);

    if (txIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    const tx = account.transactions[txIndex];

    // Reverse the transaction effect
    if (tx.type === 'deposit' || tx.type === 'transfer_in') {
      account.balance -= tx.amount;
      account.totalDeposits -= tx.amount;
    } else {
      account.balance += tx.amount;
      account.totalPayments -= tx.amount;
    }

    // Remove transaction
    account.transactions.splice(txIndex, 1);
    await account.save();

    res.json({
      success: true,
      data: {
        message: 'Transaction deleted successfully',
        account: {
          id: account._id,
          balance: account.balance,
        }
      }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  }
};

// POST /api/transactions/transfer - Transfer between accounts
// This is INTERNAL REDISTRIBUTION - does NOT affect income, expenses, or spending
exports.transfer = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description, date } = req.body;
    const userId = req.userId;

    console.log('💸 Transfer Request:', {
      userId,
      fromAccountId,
      toAccountId,
      amount,
      description
    });

    // Validation
    if (!fromAccountId || !toAccountId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'fromAccountId, toAccountId, and amount are required'
      });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot transfer to the same account'
      });
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be greater than 0'
      });
    }

    // Determine transfer type
    const isFromMain = fromAccountId === 'main';
    const isToMain = toAccountId === 'main';

    // Get current Main Account balance (sum of all real account balances)
    const accountResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
    const allAccounts = accountResponse.data.accounts || [];
    const currentMainBalance = allAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

    // Case 1: Transfer FROM Main Account TO real account
    if (isFromMain && !isToMain) {
      console.log('💳 Transfer FROM Main (virtual) TO real account');

      // Check if Main Account has sufficient funds
      if (currentMainBalance < transferAmount) {
        return res.status(400).json({
          success: false,
          error: 'Insufficient funds in Main Account'
        });
      }

      // Deposit to target real account
      try {
        const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
          userId,
          operation_type: 'deposit',
          account_id: toAccountId,
          amount: transferAmount,
          description: description || 'Transfer from Main Account'
        });

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to deposit to account');
        }

        // Get updated accounts
        const updatedAccountsResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
        const updatedAccounts = updatedAccountsResponse.data.accounts || [];

        // Main balance stays the same (just redistributed)
        const updatedMainBalance = updatedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

        // ✅ Create notification for transfer TO real account
        const toAccountName = updatedAccounts.find(acc => acc.id === toAccountId)?.bank || 'Unknown';
        await createTransactionNotification(userId, {
          amount: transferAmount,
          type: 'transfer_in',
          accountName: toAccountName,
          transactionId: toAccountId,
          merchant: description || `Transfer to ${toAccountName}`,
          method: 'Internal Transfer'
        });

        return res.status(201).json({
          success: true,
          data: {
            transfer: {
              from: 'main',
              to: toAccountId,
              amount: transferAmount,
              description: description || 'Transfer',
              date: date ? new Date(date) : new Date(),
            },
            fromAccount: {
              id: 'main',
              name: 'Main Account (Default)',
            },
            toAccount: {
              id: toAccountId,
              bank: updatedAccounts.find(acc => acc.id === toAccountId)?.bank || 'Unknown',
              balance: response.data.new_balance,
            }
          },
          updatedAccounts: updatedAccounts.map(acc => ({
            id: acc.id || acc._id,
            bank: acc.bank,
            accountNumber: acc.accountNumber,
            accountType: acc.accountType,
            balance: acc.balance,
            currency: acc.currency,
          })),
          updatedMainBalance
        });
      } catch (centralBankError) {
        console.error('Central Bank API Error:', centralBankError.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to transfer to account'
        });
      }
    }

    // Case 2: Transfer FROM real account TO Main Account
    if (!isFromMain && isToMain) {
      console.log('💳 Transfer FROM real account TO Main (virtual)');

      // Withdraw from source real account
      try {
        const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
          userId,
          operation_type: 'payment',
          account_id: fromAccountId,
          amount: transferAmount,
          description: description || 'Transfer to Main Account'
        });

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to withdraw from account');
        }

        // Get updated accounts
        const updatedAccountsResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
        const updatedAccounts = updatedAccountsResponse.data.accounts || [];

        // Main balance stays the same (just redistributed)
        const updatedMainBalance = updatedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

        // ✅ Create notification for transfer FROM real account
        const fromAccountName = updatedAccounts.find(acc => acc.id === fromAccountId)?.bank || 'Unknown';
        await createTransactionNotification(userId, {
          amount: transferAmount,
          type: 'transfer_out',
          accountName: fromAccountName,
          transactionId: fromAccountId,
          merchant: description || `Transfer from ${fromAccountName}`,
          method: 'Internal Transfer'
        });

        return res.status(201).json({
          success: true,
          data: {
            transfer: {
              from: fromAccountId,
              to: 'main',
              amount: transferAmount,
              description: description || 'Transfer',
              date: date ? new Date(date) : new Date(),
            },
            fromAccount: {
              id: fromAccountId,
              bank: updatedAccounts.find(acc => acc.id === fromAccountId)?.bank || 'Unknown',
              balance: response.data.new_balance,
            },
            toAccount: {
              id: 'main',
              name: 'Main Account (Default)',
            }
          },
          updatedAccounts: updatedAccounts.map(acc => ({
            id: acc.id || acc._id,
            bank: acc.bank,
            accountNumber: acc.accountNumber,
            accountType: acc.accountType,
            balance: acc.balance,
            currency: acc.currency,
          })),
          updatedMainBalance
        });
      } catch (centralBankError) {
        console.error('Central Bank API Error:', centralBankError.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to transfer from account'
        });
      }
    }

    // Case 3: Transfer between two real accounts
    if (!isFromMain && !isToMain) {
      console.log('💳 Transfer between two real accounts');

      try {
        const response = await axios.post(`${CENTRAL_BANK_API}/perform_operation`, {
          userId,
          operation_type: 'transfer',
          account_id: fromAccountId,
          to_account_id: toAccountId,
          amount: transferAmount,
          description: description || 'Transfer'
        });

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to transfer');
        }

        // Get updated accounts
        const updatedAccountsResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
        const updatedAccounts = updatedAccountsResponse.data.accounts || [];

        // Main balance stays the same (just redistributed)
        const updatedMainBalance = updatedAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);

        // ✅ Create notification for transfer between real accounts
        const fromAccountName = updatedAccounts.find(acc => acc.id === fromAccountId)?.bank || 'Unknown';
        const toAccountName = updatedAccounts.find(acc => acc.id === toAccountId)?.bank || 'Unknown';
        await createTransactionNotification(userId, {
          amount: transferAmount,
          type: 'transfer_out', // Outgoing from source
          accountName: fromAccountName,
          transactionId: fromAccountId,
          merchant: description || `Transfer to ${toAccountName}`,
          method: 'Account Transfer'
        });

        return res.status(201).json({
          success: true,
          data: {
            transfer: {
              from: fromAccountId,
              to: toAccountId,
              amount: transferAmount,
              description: description || 'Transfer',
              date: date ? new Date(date) : new Date(),
            },
            fromAccount: {
              id: fromAccountId,
              bank: updatedAccounts.find(acc => acc.id === fromAccountId)?.bank || 'Unknown',
              balance: response.data.from_balance,
            },
            toAccount: {
              id: toAccountId,
              bank: updatedAccounts.find(acc => acc.id === toAccountId)?.bank || 'Unknown',
              balance: response.data.to_balance,
            }
          },
          updatedAccounts: updatedAccounts.map(acc => ({
            id: acc.id || acc._id,
            bank: acc.bank,
            accountNumber: acc.accountNumber,
            accountType: acc.accountType,
            balance: acc.balance,
            currency: acc.currency,
          })),
          updatedMainBalance
        });
      } catch (centralBankError) {
        console.error('Central Bank API Error:', centralBankError.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to transfer between accounts'
        });
      }
    }

    // This shouldn't happen, but just in case
    return res.status(400).json({
      success: false,
      error: 'Invalid transfer configuration'
    });

  } catch (error) {
    console.error('Error processing transfer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process transfer'
    });
  }
};
