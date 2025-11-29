const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const accountController = require('../controllers/accountController');

router.use(auth);

// Managed account endpoints
router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.patch('/:id/status', accountController.toggleAccountStatus);
router.post('/:id/default', accountController.setPrimaryAccount);

// Legacy external account endpoints (used by dashboard linking flow)
router.get('/external', accountController.getExternalAccounts);
router.post('/create', accountController.linkExternalAccount);
router.get('/external/:id', accountController.getExternalAccount);
router.delete('/external/:id', accountController.deleteExternalAccount);

module.exports = router;
