const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 * Returns first error message if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      error: errors.array()[0].msg 
    });
  }
  next();
};

/**
 * Registration input validation
 */
const registerValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('employmentStatus')
    .trim()
    .notEmpty()
    .withMessage('Employment status is required')
    .isIn(['Employed', 'Self-Employed', 'Student', 'Unemployed', 'Retired'])
    .withMessage('Invalid employment status'),
  handleValidationErrors,
];

/**
 * Login input validation
 */
const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Email verification validation
 */
const verifyEmailValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits'),
  handleValidationErrors,
];

/**
 * Password reset validation
 */
const resetPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('verificationCode')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  handleValidationErrors,
];

/**
 * Forgot password validation
 */
const forgotPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors,
];

module.exports = { 
  registerValidator, 
  loginValidator, 
  verifyEmailValidator,
  resetPasswordValidator,
  forgotPasswordValidator,
  handleValidationErrors 
};
