const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { auth } = require('../middleware/auth');

// Get all investments
router.get('/', auth, investmentController.getAllInvestments);

// Get portfolio summary
router.get('/portfolio', auth, investmentController.getPortfolioSummary);

// Get single investment
router.get('/:id', auth, investmentController.getInvestmentById);

// Create investment
router.post('/', auth, investmentController.createInvestment);

// Update investment
router.put('/:id', auth, investmentController.updateInvestment);

// Delete investment
router.delete('/:id', auth, investmentController.deleteInvestment);

module.exports = router;
