const Goal = require('../models/Goal');

// Get all goals
exports.getAllGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId })
      .sort({ deadline: 1 });

    res.json({
      success: true,
      goals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single goal
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create goal
exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline } = req.body;

    // Validation
    if (!name || !targetAmount) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and target amount'
      });
    }

    if (targetAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be positive'
      });
    }

    if (savedAmount !== undefined && savedAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Saved amount must be positive'
      });
    }

    const goal = await Goal.create({
      userId: req.userId,
      name,
      targetAmount,
      savedAmount: savedAmount || 0,
      deadline
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update goal
exports.updateGoal = async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline, status } = req.body;

    // Validation
    if (targetAmount !== undefined && targetAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be positive'
      });
    }

    if (savedAmount !== undefined && savedAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Saved amount must be positive'
      });
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, targetAmount, savedAmount, deadline, status },
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update goal progress
exports.updateGoalProgress = async (req, res) => {
  try {
    const { amount } = req.body;

    // Validation
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an amount'
      });
    }

    if (amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    // Add to saved amount
    goal.savedAmount += amount;

    // Auto-complete if target reached
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json({
      success: true,
      message: 'Goal progress updated successfully',
      goal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
