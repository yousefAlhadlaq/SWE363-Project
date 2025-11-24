const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Request CRUD operations
router.post('/', requestController.createRequest);
router.get('/', requestController.getAllRequests);
router.get('/:id', requestController.getRequestById);
router.put('/:id/status', requestController.updateRequestStatus);
router.delete('/:id', requestController.deleteRequest);

// Advisor actions
router.post('/:id/accept', requestController.acceptRequest);
router.post('/:id/decline', requestController.declineRequest);
router.post('/:id/draft', requestController.saveDraft);

// Client history
router.get('/client/:clientId/history', requestController.getClientHistory);

module.exports = router;
