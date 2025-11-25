const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { auth, adminAuth, advisorAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Meeting operations
router.post('/request/:requestId', meetingController.scheduleMeeting);
router.get('/', meetingController.getUserMeetings);
router.get('/upcoming', meetingController.getUpcomingMeetings);
router.get('/request/:requestId', meetingController.getRequestMeetings);
router.get('/:id', meetingController.getMeetingById);
router.put('/:id', meetingController.updateMeeting);
router.put('/:id/cancel', meetingController.cancelMeeting);
router.put('/:id/complete', meetingController.completeMeeting);

module.exports = router;
