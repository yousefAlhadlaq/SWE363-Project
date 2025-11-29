const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const accountController = require('../controllers/accountController');

router.use(auth);

router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.patch('/:id/status', accountController.toggleAccountStatus);
router.post('/:id/default', accountController.setPrimaryAccount);

module.exports = router;
