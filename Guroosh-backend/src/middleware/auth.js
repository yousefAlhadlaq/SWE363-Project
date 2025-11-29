const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is deactivated. Please contact support.' });
    }

    req.userId = user._id.toString();
    req.user = user;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin authorization middleware
// Use this AFTER the auth middleware
const adminAuth = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user || await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

// Advisor authorization middleware
// Use this AFTER the auth middleware
const advisorAuth = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = req.user || await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'advisor' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Advisor privileges required.' });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error('Advisor auth error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

module.exports = { auth, adminAuth, advisorAuth };
