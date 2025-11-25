const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth, adminAuth, advisorAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Note operations (advisor only)
router.post('/request/:requestId', noteController.createNote);
router.get('/request/:requestId', noteController.getRequestNotes);
router.get('/', noteController.getAllAdvisorNotes);
router.get('/search', noteController.searchNotes);
router.get('/:id', noteController.getNoteById);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);

module.exports = router;
