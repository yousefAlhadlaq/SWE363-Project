const express = require('express');
const router = express.Router();
const goldPriceController = require('../controllers/goldPriceController');
const { auth } = require('../middleware/auth');

// Get gold prices for a purchase date
router.post('/prices', auth, goldPriceController.getGoldPrices);

module.exports = router;
