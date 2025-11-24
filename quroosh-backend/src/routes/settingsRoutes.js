const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const auth = require('../middleware/auth');

// All routes are protected
router.get('/', auth, settingsController.getSettings);
router.put('/', auth, settingsController.updateSettings);
router.post('/reset', auth, settingsController.resetSettings);

module.exports = router;
