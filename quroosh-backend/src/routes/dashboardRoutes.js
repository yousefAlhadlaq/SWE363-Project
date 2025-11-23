const express = require('express');

const router = express.Router();

router.get('/overview', (req, res) => res.status(501).json({ message: 'Dashboard overview not implemented' }));
router.get('/recent', (req, res) => res.status(501).json({ message: 'Dashboard recent not implemented' }));

module.exports = router;
