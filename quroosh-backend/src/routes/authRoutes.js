const express = require('express');

const router = express.Router();

// Placeholder auth routes; replace with real logic when ready.
router.post('/register', (req, res) => res.status(501).json({ message: 'Register not implemented' }));
router.post('/login', (req, res) => res.status(501).json({ message: 'Login not implemented' }));
router.get('/me', (req, res) => res.status(501).json({ message: 'Me not implemented' }));

module.exports = router;
