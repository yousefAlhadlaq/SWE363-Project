const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { 
  registerValidator, 
  loginValidator, 
  verifyEmailValidator,
  resetPasswordValidator,
  forgotPasswordValidator 
} = require('../validators/authValidators');

// Public routes with rate limiting and validation
router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.post('/verify-email', authLimiter, verifyEmailValidator, authController.verifyEmail);
router.post('/resend-code', authLimiter, authController.resendVerificationCode);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPasswordValidator, authController.resetPassword);
router.post('/resend-reset-code', passwordResetLimiter, authController.resendResetCode);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;