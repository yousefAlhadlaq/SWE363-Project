const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.use(auth, adminAuth);

router.get('/overview', adminController.getOverview);
router.get('/finance', adminController.getFinanceSnapshot);
router.get('/activity', adminController.getActivityFeed);

// Legacy test route (kept for quick connectivity checks)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Admin access verified',
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
