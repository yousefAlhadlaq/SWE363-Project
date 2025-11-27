const SaudiCity = require('../models/saudiCity');

// Get all Saudi cities (for dropdown in frontend)
exports.getAllCities = async (req, res) => {
  try {
    const cities = await SaudiCity.find()
      .select('nameEn nameAr region priceMultiplier marketStatus')
      .sort({ priceMultiplier: -1 }); // Sort by price (most expensive first)

    res.json({
      success: true,
      cities: cities.map(city => ({
        value: city.nameEn,
        label: `${city.nameEn} (${city.nameAr})`,
        labelEn: city.nameEn,
        labelAr: city.nameAr,
        region: city.region,
        priceMultiplier: city.priceMultiplier,
        marketStatus: city.marketStatus
      })),
      count: cities.length
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cities'
    });
  }
};

// Get single city details
exports.getCityByName = async (req, res) => {
  try {
    const { cityName } = req.params;
    const city = await SaudiCity.findOne({ nameEn: cityName });

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }

    res.json({
      success: true,
      city: {
        nameEn: city.nameEn,
        nameAr: city.nameAr,
        region: city.region,
        priceMultiplier: city.priceMultiplier,
        basePricePerSqm: city.basePricePerSqm,
        marketStatus: city.marketStatus,
        description: city.description
      }
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch city'
    });
  }
};
