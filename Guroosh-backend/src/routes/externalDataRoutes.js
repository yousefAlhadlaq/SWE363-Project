const express = require('express');
const router = express.Router();
const externalDataController = require('../controllers/externalDataController');
const { auth } = require('../middleware/auth');

// Get all external data (banks, stocks, crypto)
router.get('/all', auth, externalDataController.getAllExternalData);

// Central Bank routes
router.get('/bank/accounts', auth, externalDataController.getBankAccounts);
router.get('/bank/stocks', auth, externalDataController.getStockPortfolios);

// Central Bank mock server integration
router.post('/notify', externalDataController.handleCentralBankNotification);
router.post('/init-user/:userId', externalDataController.initializeCentralBankUser);
router.post('/operation', auth, externalDataController.performCentralBankOperation);

// Crypto routes
router.get('/crypto/portfolio', auth, externalDataController.getCryptoPortfolio);
router.get('/crypto/prices', externalDataController.getCryptoPrices); // Public endpoint

// Real Estate routes
router.post('/realestate/estimate', auth, externalDataController.estimateProperty);

// Gold routes
router.get('/gold/price', externalDataController.getGoldPrice); // Public endpoint
router.post('/gold/calculate', auth, externalDataController.calculateGoldValue);

module.exports = router;
