const groqService = require('../services/groqService');

/**
 * Evaluate real estate property using Groq AI
 * POST /api/real-estate/evaluate
 */
exports.evaluateProperty = async (req, res) => {
  try {
    const { latitude, longitude, propertyType, area, bedrooms, bathrooms, yearBuilt } = req.body;

    // Validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    if (!propertyType) {
      return res.status(400).json({
        success: false,
        error: 'Property type is required'
      });
    }

    if (!area || area <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid property area is required'
      });
    }

    // For apartments, bedrooms and bathrooms should be provided
    if (propertyType === 'Apartment') {
      if (!bedrooms || bedrooms <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Number of bedrooms is required for apartments'
        });
      }
      if (!bathrooms || bathrooms <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Number of bathrooms is required for apartments'
        });
      }
    }

    // Call Groq service to evaluate the property
    const evaluation = await groqService.evaluateRealEstate({
      latitude,
      longitude,
      propertyType,
      area,
      bedrooms,
      bathrooms,
      yearBuilt
    });

    if (!evaluation.success) {
      return res.status(500).json({
        success: false,
        error: evaluation.error || 'Failed to evaluate property'
      });
    }

    res.json({
      success: true,
      estimate: evaluation.estimate
    });

  } catch (error) {
    console.error('Error in evaluateProperty controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate property'
    });
  }
};

/**
 * Get location description from coordinates
 * GET /api/real-estate/location/:latitude/:longitude
 */
exports.getLocationDescription = async (req, res) => {
  try {
    const { latitude, longitude } = req.params;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    const locationInfo = await groqService.getLocationDescription(
      parseFloat(latitude),
      parseFloat(longitude)
    );

    if (!locationInfo.success) {
      return res.status(500).json({
        success: false,
        error: locationInfo.error || 'Failed to get location description'
      });
    }

    res.json({
      success: true,
      location: locationInfo.location
    });

  } catch (error) {
    console.error('Error in getLocationDescription controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get location description'
    });
  }
};
