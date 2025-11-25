const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

// All expense routes are protected
router.use(auth);

router.get('/', expenseController.getAllExpenses);
router.get('/:id', expenseController.getExpenseById);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
