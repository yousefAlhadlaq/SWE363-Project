const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// GET /api/transactions - Get all transactions
router.get('/', transactionController.getAllTransactions);

// POST /api/transactions/deposit - Quick deposit
router.post('/deposit', transactionController.quickDeposit);

// POST /api/transactions/manual - Manual transaction entry
router.post('/manual', transactionController.manualEntry);

// POST /api/transactions/parse-sms - Parse SMS and create transaction
router.post('/parse-sms', transactionController.parseSms);

// POST /api/transactions/transfer - Transfer between accounts
router.post('/transfer', transactionController.transfer);

// DELETE /api/transactions/:accountId/:transactionId - Delete a transaction
router.delete('/:accountId/:transactionId', transactionController.deleteTransaction);

module.exports = router;
