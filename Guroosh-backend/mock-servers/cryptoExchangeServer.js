const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Mock crypto portfolios
const mockCryptoData = {
  users: {
    '692608c30e0887d701de59d7': { // Admin user
      portfolios: [
        {
          exchange: 'Binance',
          holdings: [
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              amount: 0.5,
              purchasePrice: 42000,
              currentPrice: 67500,
              purchaseDate: '2024-01-10'
            },
            {
              symbol: 'ETH',
              name: 'Ethereum',
              amount: 3.2,
              purchasePrice: 2200,
              currentPrice: 3450,
              purchaseDate: '2024-02-15'
            }
          ]
        },
        {
          exchange: 'Coinbase',
          holdings: [
            {
              symbol: 'SOL',
              name: 'Solana',
              amount: 25,
              purchasePrice: 95,
              currentPrice: 145,
              purchaseDate: '2024-03-01'
            },
            {
              symbol: 'ADA',
              name: 'Cardano',
              amount: 1500,
              purchasePrice: 0.45,
              currentPrice: 0.62,
              purchaseDate: '2024-01-20'
            }
          ]
        }
      ]
    }
  },
  // Current market prices (simulated live prices)
  marketPrices: {
    BTC: 67500,
    ETH: 3450,
    SOL: 145,
    ADA: 0.62,
    BNB: 520,
    XRP: 0.58,
    DOGE: 0.15,
    DOT: 7.8
  }
};

// Get user's crypto portfolio
app.get('/api/portfolio/:userId', (req, res) => {
  const { userId } = req.params;
  const userData = mockCryptoData.users[userId];

  if (!userData) {
    return res.status(404).json({
      success: false,
      error: 'User not found in Crypto Exchange'
    });
  }

  let totalValue = 0;
  let totalInvested = 0;

  const portfoliosWithCalculations = userData.portfolios.map(portfolio => {
    const holdingsWithValues = portfolio.holdings.map(holding => {
      const currentValue = holding.amount * holding.currentPrice;
      const investedValue = holding.amount * holding.purchasePrice;
      const gainLoss = currentValue - investedValue;
      const gainLossPct = (gainLoss / investedValue) * 100;

      totalValue += currentValue;
      totalInvested += investedValue;

      return {
        ...holding,
        currentValue,
        investedValue,
        gainLoss,
        gainLossPct: parseFloat(gainLossPct.toFixed(2))
      };
    });

    return {
      ...portfolio,
      holdings: holdingsWithValues
    };
  });

  res.json({
    success: true,
    portfolios: portfoliosWithCalculations,
    summary: {
      totalValue,
      totalInvested,
      totalGainLoss: totalValue - totalInvested,
      gainLossPct: totalInvested > 0
        ? parseFloat(((totalValue - totalInvested) / totalInvested * 100).toFixed(2))
        : 0
    }
  });
});

// Get current market prices
app.get('/api/prices', (req, res) => {
  res.json({
    success: true,
    prices: mockCryptoData.marketPrices,
    timestamp: new Date().toISOString()
  });
});

// Get price for specific crypto
app.get('/api/price/:symbol', (req, res) => {
  const { symbol } = req.params;
  const price = mockCryptoData.marketPrices[symbol.toUpperCase()];

  if (!price) {
    return res.status(404).json({
      success: false,
      error: 'Cryptocurrency not found'
    });
  }

  res.json({
    success: true,
    symbol: symbol.toUpperCase(),
    price,
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Crypto Exchange API',
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.CRYPTO_PORT || 5003;

app.listen(PORT, () => {
  console.log(`₿ Crypto Exchange API running on port ${PORT}`);
  console.log(`📈 Serving cryptocurrency portfolios and live prices`);
});
