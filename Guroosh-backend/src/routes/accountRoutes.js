const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all accounts for the logged-in user
router.get('/', accountController.getAllAccounts);

// Create a new account
router.post('/create', accountController.createAccount);

// Get a single account
router.get('/:id', accountController.getAccount);

// Delete an account
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
