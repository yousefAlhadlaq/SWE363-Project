const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired'
      });
    }
    res.status(401).json({
      error: 'Authentication failed'
    });
  }
};

// Admin authorization middleware
// Use this AFTER the auth middleware
const adminAuth = async (req, res, next) => {
  try {
    // req.userId should be set by the auth middleware
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Get user from database
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Admin privileges required.'
      });
    }

    // Add user object to request for convenience
    req.user = user;

    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      error: 'Authorization failed'
    });
  }
};

// Advisor authorization middleware
// Use this AFTER the auth middleware
const advisorAuth = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Check if user is an advisor or admin
    if (user.role !== 'advisor' && user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied. Advisor privileges required.'
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Advisor auth error:', error);
    res.status(500).json({
      error: 'Authorization failed'
    });
  }
};

module.exports = { auth, adminAuth, advisorAuth };
