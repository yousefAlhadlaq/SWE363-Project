const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/analytics/spending?range=weekly|monthly|yearly|all
router.get('/spending', analyticsController.getSpendingAnalytics);

module.exports = router;
