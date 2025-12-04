const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const authMiddleware = require('../middleware/auth');

// Protect all routes
router.use(authMiddleware.auth);

router.get('/csv', exportController.exportCSV);
router.get('/pdf', exportController.exportPDF);

module.exports = router;
