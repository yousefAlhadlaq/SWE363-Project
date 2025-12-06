const rateLimit = require('express-rate-limit');

// Strict limiter for authentication routes (login, register, password reset)
// 10 attempts per 15-minute window to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { 
    success: false,
    error: 'Too many authentication attempts, please try again in 15 minutes.' 
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
});

// General API rate limiter
// 100 requests per minute for authenticated users
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { 
    success: false,
    error: 'Too many requests, please slow down.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for sensitive operations (password reset)
// 5 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { 
    success: false,
    error: 'Too many password reset attempts, please try again in an hour.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, apiLimiter, passwordResetLimiter };
