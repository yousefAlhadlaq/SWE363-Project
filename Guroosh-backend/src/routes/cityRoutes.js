const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

// Get all Saudi cities (public endpoint for dropdown)
router.get('/', cityController.getAllCities);

// Get specific city details
router.get('/:cityName', cityController.getCityByName);

module.exports = router;
