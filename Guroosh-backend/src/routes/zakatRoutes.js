const express = require('express');
const router = express.Router();
const zakatController = require('../controllers/zakatController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * POST /api/zakat/calculate
 * Calculate Zakat for user's investment portfolio
 */
router.post('/calculate', zakatController.calculateZakat);

/**
 * GET /api/zakat/gold-price
 * Get current gold price for Nisab calculation
 */
router.get('/gold-price', zakatController.getGoldPrice);

module.exports = router;
