const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/dashboard - Main dashboard data (all computed stats)
router.get('/', dashboardController.getDashboardData);

// GET /api/dashboard/accounts - Get all linked accounts
router.get('/accounts', dashboardController.getLinkedAccounts);

// GET /api/dashboard/updates - Get latest updates/transactions
router.get('/updates', dashboardController.getLatestUpdates);

// GET /api/dashboard/stats - Get spending statistics
router.get('/stats', dashboardController.getSpendingStats);

// GET /api/dashboard/investments - Get all investments (stocks, gold)
router.get('/investments', dashboardController.getInvestments);

module.exports = router;
