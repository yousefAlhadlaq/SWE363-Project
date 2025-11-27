const express = require('express');
const router = express.Router();
const realEstateController = require('../controllers/realEstateController');
const { auth } = require('../middleware/auth');

// Evaluate property value using Groq AI
router.post('/evaluate', auth, realEstateController.evaluateProperty);

// Get location description from coordinates
router.get('/location/:latitude/:longitude', auth, realEstateController.getLocationDescription);

module.exports = router;
