const axios = require('axios');

// External API endpoints
const CENTRAL_BANK_API = process.env.CENTRAL_BANK_API || 'http://localhost:5002/api';
const CRYPTO_API = process.env.CRYPTO_API || 'http://localhost:5003/api';
const REAL_ESTATE_API = process.env.REAL_ESTATE_API || 'http://localhost:5004/api';
const GOLD_API_KEY = process.env.GOLD_API_KEY || 'goldapi-demo-key'; // Get free key from goldapi.io
const GOLD_API = 'https://www.goldapi.io/api';

// Ensure Central Bank has initialized data for a user
const ensureCentralBankUser = async (userId) => {
  try {
    await axios.post(`${CENTRAL_BANK_API}/create_user`, { userId });
    return true;
  } catch (error) {
    console.error('Error ensuring Central Bank user:', error.message);
    return false;
  }
};

// ===== CENTRAL BANK SERVICES =====

// Fetch bank accounts from Central Bank
exports.fetchBankAccounts = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bank accounts:', error.message);
    // Attempt to initialize user then retry once
    const initialized = await ensureCentralBankUser(userId);
    if (initialized) {
      try {
        const retryResponse = await axios.get(`${CENTRAL_BANK_API}/accounts/${userId}`);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry fetching bank accounts failed:', retryError.message);
      }
    }
    return {
      success: false,
      error: 'Failed to connect to Central Bank API',
      accounts: [],
      totalBalance: 0
    };
  }
};

// Fetch stock portfolios from Central Bank
exports.fetchStockPortfolios = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_API}/stocks/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching stock portfolios:', error.message);
    const initialized = await ensureCentralBankUser(userId);
    if (initialized) {
      try {
        const retryResponse = await axios.get(`${CENTRAL_BANK_API}/stocks/${userId}`);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry fetching stock portfolios failed:', retryError.message);
      }
    }
    return {
      success: false,
      error: 'Failed to connect to Central Bank API',
      portfolios: [],
      summary: { totalValue: 0, totalInvested: 0, totalGainLoss: 0 }
    };
  }
};

// Fetch gold reserves from Central Bank
exports.fetchGoldReserves = async (userId) => {
  try {
    const response = await axios.get(`${CENTRAL_BANK_API}/gold_value/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gold reserves:', error.message);
    const initialized = await ensureCentralBankUser(userId);
    if (initialized) {
      try {
        const retryResponse = await axios.get(`${CENTRAL_BANK_API}/gold_value/${userId}`);
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry fetching gold reserves failed:', retryError.message);
      }
    }
    return {
      success: false,
      error: 'Failed to connect to Central Bank API',
      gold: null
    };
  }
};

// ===== CRYPTO SERVICES =====

// Fetch crypto portfolio
exports.fetchCryptoPortfolio = async (userId) => {
  try {
    const response = await axios.get(`${CRYPTO_API}/portfolio/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto portfolio:', error.message);
    return {
      success: false,
      error: 'Failed to connect to Crypto Exchange API',
      portfolios: [],
      summary: { totalValue: 0, totalInvested: 0, totalGainLoss: 0 }
    };
  }
};

// Fetch current crypto prices
exports.fetchCryptoPrices = async () => {
  try {
    const response = await axios.get(`${CRYPTO_API}/prices`);
    return response.data;
  } catch (error) {
    console.error('Error fetching crypto prices:', error.message);
    return {
      success: false,
      error: 'Failed to fetch crypto prices',
      prices: {}
    };
  }
};

// ===== REAL ESTATE SERVICES =====

// Estimate property value
exports.estimatePropertyValue = async (propertyData) => {
  try {
    const response = await axios.post(`${REAL_ESTATE_API}/estimate`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error estimating property value:', error.message);
    return {
      success: false,
      error: 'Failed to connect to Real Estate Valuation API',
      estimate: { value: 0, pricePerSqm: 0 }
    };
  }
};

// ===== GOLD PRICE SERVICES =====

// Fetch current gold price using goldPriceService (Yahoo Finance - FREE)
exports.fetchGoldPrice = async () => {
  try {
    const goldPriceService = require('./goldPriceService');
    const pricePerGramSAR = await goldPriceService.getCurrentGoldPrice();

    if (pricePerGramSAR && pricePerGramSAR > 0) {
      return {
        success: true,
        price: pricePerGramSAR, // Price per gram in SAR
        gold: {
          price: pricePerGramSAR,
          unit: 'gram',
          currency: 'SAR',
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    console.log('Error fetching gold price from goldPriceService:', error.message);
  }

  // Fallback to estimated price if API fails
  // Current gold price is approximately 500 SAR per gram
  const fallbackPrice = 500;
  return {
    success: true,
    price: fallbackPrice,
    gold: {
      price: fallbackPrice,
      unit: 'gram',
      currency: 'SAR',
      timestamp: new Date().toISOString(),
      note: 'Using fallback price - API unavailable'
    }
  };
};

// Calculate gold portfolio value
exports.calculateGoldValue = async (goldAmount, unit = 'oz') => {
  try {
    const goldPriceData = await exports.fetchGoldPrice();

    if (!goldPriceData.success) {
      throw new Error('Failed to fetch gold price');
    }

    const pricePerOz = goldPriceData.gold.price;

    // Convert to troy ounces if needed
    let amountInOz = goldAmount;
    if (unit === 'g' || unit === 'grams') {
      amountInOz = goldAmount / 31.1035; // grams to troy ounces
    } else if (unit === 'kg' || unit === 'kilograms') {
      amountInOz = (goldAmount * 1000) / 31.1035;
    }

    const totalValue = amountInOz * pricePerOz;

    return {
      success: true,
      calculation: {
        amount: goldAmount,
        unit,
        amountInOz,
        pricePerOz,
        totalValue,
        currency: 'USD',
        timestamp: goldPriceData.gold.timestamp
      }
    };
  } catch (error) {
    console.error('Error calculating gold value:', error.message);
    return {
      success: false,
      error: 'Failed to calculate gold value'
    };
  }
};

// ===== AGGREGATED DATA SERVICE =====

// Fetch all external investment data for a user
exports.fetchAllExternalData = async (userId) => {
  try {
    const [bankData, stockData, cryptoData] = await Promise.all([
      exports.fetchBankAccounts(userId),
      exports.fetchStockPortfolios(userId),
      exports.fetchCryptoPortfolio(userId)
    ]);

    return {
      success: true,
      data: {
        bankAccounts: bankData,
        stocks: stockData,
        crypto: cryptoData
      },
      summary: {
        totalCash: bankData.totalBalance || 0,
        totalStocks: stockData.summary?.totalValue || 0,
        totalCrypto: cryptoData.summary?.totalValue || 0,
        grandTotal: (bankData.totalBalance || 0) +
          (stockData.summary?.totalValue || 0) +
          (cryptoData.summary?.totalValue || 0)
      }
    };
  } catch (error) {
    console.error('Error fetching external data:', error.message);
    return {
      success: false,
      error: 'Failed to fetch external financial data'
    };
  }
};
