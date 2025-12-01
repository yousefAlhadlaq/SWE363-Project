require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const ExternalBankAccount = require('../src/models/externalBankAccount');
const ExternalStock = require('../src/models/externalStock');
const ExternalGold = require('../src/models/externalGold');
const goldPriceService = require('./services/goldPriceService');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Central Bank connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Saudi Banks
const SAUDI_BANKS = [
  'Al Rajhi Bank',
  'National Commercial Bank (NCB)',
  'Riyad Bank',
  'Samba Financial Group',
  'Banque Saudi Fransi',
  'Arab National Bank',
  'Saudi British Bank (SABB)',
  'Alinma Bank',
  'Bank Al Jazira',
  'Bank Albilad'
];

// Saudi Stock Brokerages
const SAUDI_BROKERAGES = [
  'Al Rajhi Capital',
  'SNB Capital',
  'Riyad Capital',
  'Samba Capital',
  'BSF Capital'
];

// Saudi Stocks with symbols (from Tadawul)
const SAUDI_STOCKS = [
  { symbol: '2222.SR', name: 'Saudi Aramco' },
  { symbol: '1120.SR', name: 'Al Rajhi Bank' },
  { symbol: '1180.SR', name: 'National Commercial Bank' },
  { symbol: '1010.SR', name: 'Riyad Bank' },
  { symbol: '2030.SR', name: 'Saudi Basic Industries (SABIC)' },
  { symbol: '2010.SR', name: 'SABIC Agri-Nutrients' },
  { symbol: '4030.SR', name: 'Bahri' },
  { symbol: '2380.SR', name: 'Petrochemical' },
  { symbol: '2090.SR', name: 'SABIC Fertilizer' },
  { symbol: '4280.SR', name: 'Kingdom Holding' }
];

// Utility function to generate random account number
function generateAccountNumber() {
  return 'SA' + Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
}

// Utility function to get random element from array
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Utility function to get random number in range
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Utility function to get random date in past years
function getRandomPastDate(yearsBack = 5) {
  const now = new Date();
  const past = new Date(now);
  past.setFullYear(now.getFullYear() - yearsBack);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

// Notify main backend about operations
async function notifyMainBackend(data) {
  try {
    const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://localhost:5001';
    await axios.post(`${MAIN_BACKEND_URL}/api/external/notify`, data);
    console.log(`✅ Notified main backend: ${data.operation_type}`);
  } catch (error) {
    console.error('❌ Failed to notify main backend:', error.message);
  }
}

// CREATE USER - Generate random bank accounts and stock portfolios
app.post('/api/create_user', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Check if user already has accounts
    const existingAccounts = await ExternalBankAccount.find({ userId });
    const existingStocks = await ExternalStock.find({ userId });
    const existingGold = await ExternalGold.findOne({ userId });

    if (existingAccounts.length > 0 || existingStocks.length > 0 || existingGold) {
      return res.json({
        success: true,
        message: 'User already has accounts',
        accounts: existingAccounts,
        stocks: existingStocks,
        gold: existingGold
      });
    }

    // Generate random number of bank accounts (1-5)
    const numAccounts = getRandomNumber(1, 5);
    const accounts = [];
    const accountTypes = ['Checking', 'Savings', 'Investment', 'Business'];

    for (let i = 0; i < numAccounts; i++) {
      const account = new ExternalBankAccount({
        userId,
        bank: getRandomElement(SAUDI_BANKS),
        accountNumber: generateAccountNumber(),
        accountType: getRandomElement(accountTypes),
        balance: getRandomNumber(1000, 50000),
        currency: 'SAR',
        transactions: [],
        totalDeposits: 0,
        totalPayments: 0
      });
      await account.save();
      accounts.push(account);
    }

    // Generate random number of stocks (2-5) with Yahoo Finance integration
    const numStocks = getRandomNumber(2, 5);
    const stocks = [];

    // Get random unique stocks
    const selectedStocks = [];
    while (selectedStocks.length < numStocks) {
      const stock = getRandomElement(SAUDI_STOCKS);
      if (!selectedStocks.find(s => s.symbol === stock.symbol)) {
        selectedStocks.push(stock);
      }
    }

    // Fetch historical prices from Yahoo Finance
    const YahooFinance = require('yahoo-finance2').default;
    const yahooFinance = new YahooFinance();

    for (const stockInfo of selectedStocks) {
      try {
        // Generate random purchase date (1-3 years ago)
        const purchaseDate = getRandomPastDate(3);
        const shares = getRandomNumber(1, 100);

        // Fetch historical price for purchase date
        let purchasePrice;
        try {
          const historicalData = await yahooFinance.historical(stockInfo.symbol, {
            period1: new Date(purchaseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            period2: new Date(purchaseDate.getTime() + 1 * 24 * 60 * 60 * 1000),
            interval: '1d'
          });

          if (historicalData && historicalData.length > 0) {
            purchasePrice = historicalData[0].close;
          } else {
            // Fallback to random price if no historical data
            purchasePrice = getRandomNumber(10, 500);
          }
        } catch (err) {
          console.log(`Warning: Could not fetch historical price for ${stockInfo.symbol}, using random`);
          purchasePrice = getRandomNumber(10, 500);
        }

        // Fetch current price
        let currentPrice;
        try {
          const quote = await yahooFinance.quote(stockInfo.symbol);
          currentPrice = quote.regularMarketPrice || purchasePrice;
        } catch (err) {
          console.log(`Warning: Could not fetch current price for ${stockInfo.symbol}, using purchase price`);
          currentPrice = purchasePrice;
        }

        const stock = new ExternalStock({
          userId,
          bank: getRandomElement(SAUDI_BANKS),
          brokerage: getRandomElement(SAUDI_BROKERAGES),
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          shares,
          purchasePrice,
          currentPrice,
          purchaseDate
        });

        await stock.save();
        stocks.push(stock);
      } catch (error) {
        console.error(`Error creating stock ${stockInfo.symbol}:`, error.message);
      }
    }

    // Generate gold reserve (1-100 ounces with random purchase date 1-3 years ago)
    let goldReserve = null;
    try {
      const goldOunces = getRandomNumber(1, 100);
      const goldPurchaseDate = getRandomPastDate(3);

      // Get historical and current gold prices
      const purchasePrice = await goldPriceService.getHistoricalGoldPrice(goldPurchaseDate);
      const currentPrice = await goldPriceService.getCurrentGoldPrice();

      // Calculate investment value
      const investment = goldPriceService.calculateGoldInvestment(
        goldOunces,
        purchasePrice,
        currentPrice
      );

      goldReserve = new ExternalGold({
        userId,
        amountOunces: goldOunces,
        purchasePrice,
        currentPrice,
        purchaseDate: goldPurchaseDate,
        investmentValue: investment.currentValue
      });

      await goldReserve.save();
      console.log(`✅ Created gold reserve: ${goldOunces} oz for user ${userId}`);
    } catch (error) {
      console.error('Error creating gold reserve:', error.message);
      // Continue even if gold creation fails
    }

    res.json({
      success: true,
      message: 'User accounts and portfolios created successfully',
      data: {
        userId,
        accounts: accounts.map(acc => ({
          bank: acc.bank,
          accountNumber: acc.accountNumber,
          accountType: acc.accountType,
          balance: acc.balance,
          currency: acc.currency
        })),
        stocks: stocks.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          shares: stock.shares,
          purchasePrice: stock.purchasePrice,
          currentPrice: stock.currentPrice,
          purchaseDate: stock.purchaseDate,
          bank: stock.bank,
          brokerage: stock.brokerage
        })),
        gold: goldReserve ? {
          amountOunces: goldReserve.amountOunces,
          purchasePrice: goldReserve.purchasePrice,
          currentPrice: goldReserve.currentPrice,
          purchaseDate: goldReserve.purchaseDate,
          investmentValue: goldReserve.investmentValue
        } : null
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PERFORM OPERATION
app.post('/api/perform_operation', async (req, res) => {
  try {
    const {
      userId,
      operation_type,
      account_id,
      to_account_id,
      amount,
      stock_symbol,
      shares,
      description
    } = req.body;

    let result;

    switch (operation_type) {
      case 'deposit':
        result = await handleDeposit(userId, account_id, amount, description);
        break;

      case 'payment':
        result = await handlePayment(userId, account_id, amount, description);
        break;

      case 'transfer':
        result = await handleTransfer(userId, account_id, to_account_id, amount, description);
        break;

      case 'buy_stock':
        result = await handleBuyStock(userId, stock_symbol, shares, account_id);
        break;

      case 'sell_stock':
        result = await handleSellStock(userId, stock_symbol, shares, account_id);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid operation type'
        });
    }

    // Notify main backend
    await notifyMainBackend({
      userId,
      operation_type,
      ...result
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error performing operation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Handle Deposit
async function handleDeposit(userId, accountId, amount, description) {
  const account = await ExternalBankAccount.findById(accountId);

  if (!account || account.userId.toString() !== userId) {
    throw new Error('Account not found');
  }

  account.balance += amount;
  account.totalDeposits += amount;
  account.transactions.push({
    type: 'deposit',
    amount,
    description: description || 'Deposit',
    date: new Date()
  });

  await account.save();

  return {
    account_id: accountId,
    new_balance: account.balance,
    transaction_type: 'deposit',
    amount
  };
}

// Handle Payment
async function handlePayment(userId, accountId, amount, description) {
  const account = await ExternalBankAccount.findById(accountId);

  if (!account || account.userId.toString() !== userId) {
    throw new Error('Account not found');
  }

  if (account.balance < amount) {
    throw new Error('Insufficient funds');
  }

  account.balance -= amount;
  account.totalPayments += amount;
  account.transactions.push({
    type: 'payment',
    amount,
    description: description || 'Payment',
    date: new Date()
  });

  await account.save();

  return {
    account_id: accountId,
    new_balance: account.balance,
    transaction_type: 'payment',
    amount
  };
}

// Handle Transfer
async function handleTransfer(userId, fromAccountId, toAccountId, amount, description) {
  const fromAccount = await ExternalBankAccount.findById(fromAccountId);
  const toAccount = await ExternalBankAccount.findById(toAccountId);

  if (!fromAccount || fromAccount.userId.toString() !== userId) {
    throw new Error('Source account not found');
  }

  if (!toAccount) {
    throw new Error('Destination account not found');
  }

  if (fromAccount.balance < amount) {
    throw new Error('Insufficient funds');
  }

  // Deduct from source
  fromAccount.balance -= amount;
  fromAccount.transactions.push({
    type: 'transfer_out',
    amount,
    description: description || 'Transfer',
    toAccount: toAccount.accountNumber,
    date: new Date()
  });

  // Add to destination
  toAccount.balance += amount;
  toAccount.transactions.push({
    type: 'transfer_in',
    amount,
    description: description || 'Transfer',
    fromAccount: fromAccount.accountNumber,
    date: new Date()
  });

  await fromAccount.save();
  await toAccount.save();

  return {
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    from_balance: fromAccount.balance,
    to_balance: toAccount.balance,
    transaction_type: 'transfer',
    amount
  };
}

// Handle Buy Stock
async function handleBuyStock(userId, symbol, shares, accountId) {
  const YahooFinance = require('yahoo-finance2').default;
  const yahooFinance = new YahooFinance();

  // Get current price
  const quote = await yahooFinance.quote(symbol);
  const currentPrice = quote.regularMarketPrice;
  const totalCost = currentPrice * shares;

  // Deduct from account
  const account = await ExternalBankAccount.findById(accountId);

  if (!account || account.userId.toString() !== userId) {
    throw new Error('Account not found');
  }

  if (account.balance < totalCost) {
    throw new Error('Insufficient funds');
  }

  account.balance -= totalCost;
  account.transactions.push({
    type: 'payment',
    amount: totalCost,
    description: `Buy ${shares} shares of ${symbol}`,
    date: new Date()
  });
  await account.save();

  // Add or update stock
  let stock = await ExternalStock.findOne({ userId, symbol });

  if (stock) {
    // Update existing stock
    const totalShares = stock.shares + shares;
    const avgPrice = ((stock.shares * stock.purchasePrice) + (shares * currentPrice)) / totalShares;
    stock.shares = totalShares;
    stock.purchasePrice = avgPrice;
    stock.currentPrice = currentPrice;
  } else {
    // Create new stock
    stock = new ExternalStock({
      userId,
      bank: account.bank,
      brokerage: getRandomElement(SAUDI_BROKERAGES),
      symbol,
      name: quote.shortName || symbol,
      shares,
      purchasePrice: currentPrice,
      currentPrice,
      purchaseDate: new Date()
    });
  }

  await stock.save();

  return {
    account_id: accountId,
    new_balance: account.balance,
    stock: {
      symbol,
      shares: stock.shares,
      currentPrice,
      totalValue: stock.shares * currentPrice
    },
    transaction_type: 'buy_stock',
    amount: totalCost
  };
}

// Handle Sell Stock
async function handleSellStock(userId, symbol, shares, accountId) {
  const stock = await ExternalStock.findOne({ userId, symbol });

  if (!stock) {
    throw new Error('Stock not found in portfolio');
  }

  if (stock.shares < shares) {
    throw new Error('Insufficient shares');
  }

  const YahooFinance = require('yahoo-finance2').default;
  const yahooFinance = new YahooFinance();

  const quote = await yahooFinance.quote(symbol);
  const currentPrice = quote.regularMarketPrice;
  const totalProceeds = currentPrice * shares;

  // Update stock
  stock.shares -= shares;
  stock.currentPrice = currentPrice;

  if (stock.shares === 0) {
    await ExternalStock.deleteOne({ _id: stock._id });
  } else {
    await stock.save();
  }

  // Add to account
  const account = await ExternalBankAccount.findById(accountId);

  if (!account || account.userId.toString() !== userId) {
    throw new Error('Account not found');
  }

  account.balance += totalProceeds;
  account.totalDeposits += totalProceeds;
  account.transactions.push({
    type: 'deposit',
    amount: totalProceeds,
    description: `Sell ${shares} shares of ${symbol}`,
    date: new Date()
  });
  await account.save();

  return {
    account_id: accountId,
    new_balance: account.balance,
    stock: {
      symbol,
      shares: stock.shares,
      currentPrice,
      totalValue: stock.shares * currentPrice
    },
    transaction_type: 'sell_stock',
    amount: totalProceeds
  };
}

// Get user's bank accounts with billing info
app.get('/api/accounts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const accounts = await ExternalBankAccount.find({ userId });

    if (!accounts || accounts.length === 0) {
      return res.json({
        success: true,
        accounts: [],
        totalBalance: 0,
        message: 'No bank accounts found for this user'
      });
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    res.json({
      success: true,
      accounts: accounts.map(acc => ({
        id: acc._id,
        bank: acc.bank,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance,
        currency: acc.currency,
        billing: {
          transactions: acc.transactions,
          totalDeposits: acc.totalDeposits,
          totalPayments: acc.totalPayments
        }
      })),
      totalBalance
    });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's stock portfolios
app.get('/api/stocks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const stocks = await ExternalStock.find({ userId });

    if (!stocks || stocks.length === 0) {
      return res.json({
        success: true,
        portfolios: [],
        summary: {
          totalValue: 0,
          totalInvested: 0,
          totalGainLoss: 0,
          gainLossPct: 0
        },
        message: 'No stock portfolios found for this user'
      });
    }

    // Calculate total portfolio value
    let totalValue = 0;
    let totalInvested = 0;

    // Group stocks by brokerage
    const portfolioMap = {};

    stocks.forEach(stock => {
      const currentValue = stock.shares * stock.currentPrice;
      const investedValue = stock.shares * stock.purchasePrice;
      const gainLoss = currentValue - investedValue;
      const gainLossPct = investedValue > 0 ? (gainLoss / investedValue) * 100 : 0;

      totalValue += currentValue;
      totalInvested += investedValue;

      const key = `${stock.bank}-${stock.brokerage}`;
      if (!portfolioMap[key]) {
        portfolioMap[key] = {
          bank: stock.bank,
          brokerage: stock.brokerage,
          stocks: []
        };
      }

      portfolioMap[key].stocks.push({
        symbol: stock.symbol,
        name: stock.name,
        shares: stock.shares,
        purchasePrice: stock.purchasePrice,
        currentPrice: stock.currentPrice,
        purchaseDate: stock.purchaseDate,
        currentValue,
        investedValue,
        gainLoss,
        gainLossPct: parseFloat(gainLossPct.toFixed(2))
      });
    });

    const portfolios = Object.values(portfolioMap);

    res.json({
      success: true,
      portfolios,
      summary: {
        totalValue,
        totalInvested,
        totalGainLoss: totalValue - totalInvested,
        gainLossPct: totalInvested > 0
          ? parseFloat(((totalValue - totalInvested) / totalInvested * 100).toFixed(2))
          : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stock portfolios:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's gold reserve value
app.get('/api/gold_value/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const goldReserve = await ExternalGold.findOne({ userId });

    if (!goldReserve) {
      return res.json({
        success: true,
        gold: null,
        message: 'No gold reserve found for this user'
      });
    }

    // Fetch current gold price
    const currentPrice = await goldPriceService.getCurrentGoldPrice();

    // Calculate updated investment value
    const investment = goldPriceService.calculateGoldInvestment(
      goldReserve.amountOunces,
      goldReserve.purchasePrice,
      currentPrice
    );

    // Update current price in database
    goldReserve.currentPrice = currentPrice;
    goldReserve.investmentValue = investment.currentValue;
    await goldReserve.save();

    res.json({
      success: true,
      gold: {
        amountOunces: goldReserve.amountOunces,
        purchasePrice: goldReserve.purchasePrice,
        currentPrice: goldReserve.currentPrice,
        purchaseDate: goldReserve.purchaseDate,
        investmentValue: goldReserve.investmentValue,
        purchaseValue: investment.purchaseValue,
        gainLoss: investment.gainLoss,
        gainLossPct: investment.gainLossPct
      }
    });
  } catch (error) {
    console.error('Error fetching gold reserve:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Central Bank API',
    status: 'operational',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.CENTRAL_BANK_PORT || 5002;

app.listen(PORT, () => {
  console.log(`🏦 Central Bank API running on port ${PORT}`);
  console.log(`📊 Serving bank accounts and stock portfolios from MongoDB`);
  console.log(`💳 Operations: deposits, payments, transfers, buy/sell stocks`);
});
