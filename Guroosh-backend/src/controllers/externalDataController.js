const externalDataService = require('../services/externalDataService');
const centralBankService = require('../services/centralBankService');

// Get all external financial data for current user
exports.getAllExternalData = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await externalDataService.fetchAllExternalData(userId);

    res.json(data);
  } catch (error) {
    console.error('Error in getAllExternalData:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch external data'
    });
  }
};

// Get bank accounts from Central Bank
exports.getBankAccounts = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await externalDataService.fetchBankAccounts(userId);

    res.json(data);
  } catch (error) {
    console.error('Error in getBankAccounts:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch bank accounts'
    });
  }
};

// Get stock portfolios from Central Bank
exports.getStockPortfolios = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await externalDataService.fetchStockPortfolios(userId);

    res.json(data);
  } catch (error) {
    console.error('Error in getStockPortfolios:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stock portfolios'
    });
  }
};

// Get crypto portfolio
exports.getCryptoPortfolio = async (req, res) => {
  try {
    const userId = req.userId;
    const data = await externalDataService.fetchCryptoPortfolio(userId);

    res.json(data);
  } catch (error) {
    console.error('Error in getCryptoPortfolio:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch crypto portfolio'
    });
  }
};

// Get current crypto prices
exports.getCryptoPrices = async (req, res) => {
  try {
    const data = await externalDataService.fetchCryptoPrices();

    res.json(data);
  } catch (error) {
    console.error('Error in getCryptoPrices:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch crypto prices'
    });
  }
};

// Estimate real estate property value
exports.estimateProperty = async (req, res) => {
  try {
    const propertyData = req.body;

    if (!propertyData.area || !propertyData.location) {
      return res.status(400).json({
        success: false,
        error: 'Area and location are required'
      });
    }

    const data = await externalDataService.estimatePropertyValue(propertyData);

    res.json(data);
  } catch (error) {
    console.error('Error in estimateProperty:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to estimate property value'
    });
  }
};

// Get current gold price
exports.getGoldPrice = async (req, res) => {
  try {
    const data = await externalDataService.fetchGoldPrice();

    res.json(data);
  } catch (error) {
    console.error('Error in getGoldPrice:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch gold price'
    });
  }
};

// Calculate gold value
exports.calculateGoldValue = async (req, res) => {
  try {
    const { amount, unit } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid gold amount is required'
      });
    }

    const data = await externalDataService.calculateGoldValue(
      parseFloat(amount),
      unit || 'oz'
    );

    res.json(data);
  } catch (error) {
    console.error('Error in calculateGoldValue:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate gold value'
    });
  }
};

// ========================================
// Central Bank Mock Server Integration
// ========================================

// Handle notifications from Central Bank about operations
exports.handleCentralBankNotification = async (req, res) => {
  try {
    const notificationData = req.body;

    console.log('📩 Received notification from Central Bank:', notificationData);

    // Log the operation for tracking
    // You can add additional logic here to update local database or trigger events

    res.json({
      success: true,
      message: 'Notification received and processed'
    });
  } catch (error) {
    console.error('Error handling Central Bank notification:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process notification'
    });
  }
};

// Initialize Central Bank accounts for a new user
exports.initializeCentralBankUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const result = await centralBankService.createUser(userId);

    res.json(result);
  } catch (error) {
    console.error('Error initializing Central Bank user:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize Central Bank user'
    });
  }
};

// Perform operation on Central Bank (deposit, payment, transfer, buy/sell stock)
exports.performCentralBankOperation = async (req, res) => {
  try {
    const userId = req.userId;
    const operationData = req.body;

    if (!operationData.operation_type) {
      return res.status(400).json({
        success: false,
        error: 'Operation type is required'
      });
    }

    // Add userId to operation data
    operationData.userId = userId;

    const result = await centralBankService.performOperation(operationData);

    res.json(result);
  } catch (error) {
    console.error('Error performing Central Bank operation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to perform operation'
    });
  }
};
