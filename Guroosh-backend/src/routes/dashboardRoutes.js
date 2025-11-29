const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/overview', dashboardController.getOverview);
router.get('/recent-transactions', dashboardController.getRecentTransactions);

module.exports = router;
