const express = require('express');
const router = express.Router();
const advisorController = require('../controllers/advisorController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', auth, advisorController.getAllAdvisors);
router.get('/:id', auth, advisorController.getAdvisorById);

// User routes
router.post('/become-advisor', auth, advisorController.becomeAdvisor);
router.put('/profile', auth, advisorController.updateAdvisorProfile);
router.post('/connect', auth, advisorController.sendConnectionRequest);
router.get('/my/requests', auth, advisorController.getMyRequests);
router.get('/my/advisor', auth, advisorController.getMyAdvisor);
router.delete('/disconnect', auth, advisorController.disconnectAdvisor);

// Advisor-only routes
router.get('/requests/received', auth, advisorController.getAdvisorRequests);
router.put('/requests/:requestId/respond', auth, advisorController.respondToRequest);

// Availability management
router.put('/availability', auth, advisorController.updateAvailability);
router.get('/:advisorId/availability', auth, advisorController.getAvailability);

// Advisor statistics
router.get('/stats/me', auth, advisorController.getAdvisorStats);

module.exports = router;
