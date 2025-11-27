const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');
const { auth } = require('../middleware/auth');

// Get all goals
router.get('/', auth, goalController.getAllGoals);

// Get single goal
router.get('/:id', auth, goalController.getGoalById);

// Create goal
router.post('/', auth, goalController.createGoal);

// Update goal
router.put('/:id', auth, goalController.updateGoal);

// Delete goal
router.delete('/:id', auth, goalController.deleteGoal);

// Update goal progress
router.patch('/:id/progress', auth, goalController.updateGoalProgress);

module.exports = router;
