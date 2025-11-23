const express = require('express');

const router = express.Router();

router.get('/', (req, res) => res.status(501).json({ message: 'Budgets not implemented' }));
router.post('/', (req, res) => res.status(501).json({ message: 'Budgets not implemented' }));
router.put('/:id', (req, res) => res.status(501).json({ message: 'Budgets not implemented' }));
router.delete('/:id', (req, res) => res.status(501).json({ message: 'Budgets not implemented' }));

module.exports = router;
