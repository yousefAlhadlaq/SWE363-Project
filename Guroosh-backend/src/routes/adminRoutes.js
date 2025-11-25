const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');

// Test admin-only route
router.get('/test', auth, adminAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the admin panel!',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
