const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const SaudiCity = require('../src/models/saudiCity');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Real Estate API connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Property type multipliers
const propertyTypeMultipliers = {
  'Single Family Home': 1.0,
  'Villa': 1.2,
  'Apartment': 0.85,
  'Duplex': 0.95,
  'Townhouse': 0.9,
  'Penthouse': 1.4,
  'Commercial': 1.5,
  'Land': 0.4
};

// Calculate property value based on location, size, and type
async function calculatePropertyValue(area, locationName, propertyType, yearBuilt) {
  // Get city data from database
  const city = await SaudiCity.findOne({ nameEn: locationName });

  if (!city) {
    // Use default values if city not found
    const basePricePerSqm = 3000;
    const locationMult = 1.0;
    const typeMult = propertyTypeMultipliers[propertyType] || 1.0;
    const currentYear = new Date().getFullYear();
    const age = currentYear - (yearBuilt || 2000);
    const ageFactor = Math.max(0.7, 1 - (age * 0.01));

    const pricePerSqm = basePricePerSqm * locationMult * typeMult * ageFactor;
    return Math.round(area * pricePerSqm * (0.95 + Math.random() * 0.1));
  }

  // Use city's multiplier and base price
  const locationMult = city.priceMultiplier;
  const basePricePerSqm = city.basePricePerSqm;
  const typeMult = propertyTypeMultipliers[propertyType] || 1.0;

  // Age depreciation
  const currentYear = new Date().getFullYear();
  const age = currentYear - (yearBuilt || 2000);
  const ageFactor = Math.max(0.7, 1 - (age * 0.01)); // Max 30% depreciation

  // Calculate final price
  const pricePerSqm = basePricePerSqm * locationMult * typeMult * ageFactor;
  const totalValue = area * pricePerSqm;

  // Add some randomness (+/- 5%)
  const randomFactor = 0.95 + Math.random() * 0.1;

  return {
    value: Math.round(totalValue * randomFactor),
    cityData: {
      name: city.nameEn,
      nameAr: city.nameAr,
      region: city.region,
      multiplier: city.priceMultiplier,
      basePricePerSqm: city.basePricePerSqm,
      marketStatus: city.marketStatus
    }
  };
}

// Get all Saudi cities (for dropdown)
app.get('/api/cities', async (req, res) => {
  try {
    const cities = await SaudiCity.find()
      .select('nameEn nameAr region priceMultiplier marketStatus')
      .sort({ priceMultiplier: -1 }); // Sort by price (most expensive first)

    res.json({
      success: true,
      cities: cities.map(city => ({
        nameEn: city.nameEn,
        nameAr: city.nameAr,
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
      error: error.message
    });
  }
});

// Estimate property value
app.post('/api/estimate', async (req, res) => {
  try {
    const {
      area,
      location,
      propertyType,
      yearBuilt,
      bedrooms,
      bathrooms
    } = req.body;

    if (!area || !location) {
      return res.status(400).json({
        success: false,
        error: 'Area and location are required'
      });
    }

    const estimation = await calculatePropertyValue(
      parseFloat(area),
      location,
      propertyType || 'Apartment',
      yearBuilt
    );

    const estimatedValue = estimation.value || estimation;
    const cityData = estimation.cityData;

    // Calculate price per square meter
    const pricePerSqm = estimatedValue / parseFloat(area);

    // Generate comparable properties (mock data)
    const comparables = [
      {
        address: `${Math.floor(Math.random() * 9999)} King Fahd Road, ${location}`,
        area: area * (0.9 + Math.random() * 0.2),
        price: estimatedValue * (0.95 + Math.random() * 0.1),
        soldDate: '2025-01-15'
      },
      {
        address: `${Math.floor(Math.random() * 9999)} Al Olaya Street, ${location}`,
        area: area * (0.9 + Math.random() * 0.2),
        price: estimatedValue * (0.95 + Math.random() * 0.1),
        soldDate: '2024-12-20'
      },
      {
        address: `${Math.floor(Math.random() * 9999)} Prince Sultan Street, ${location}`,
        area: area * (0.9 + Math.random() * 0.2),
        price: estimatedValue * (0.95 + Math.random() * 0.1),
        soldDate: '2024-11-10'
      }
    ];

    res.json({
      success: true,
      estimate: {
        value: estimatedValue,
        pricePerSqm: Math.round(pricePerSqm),
        currency: 'SAR',
        confidence: cityData ? 90 : 75,
        estimatedDate: new Date().toISOString()
      },
      propertyDetails: {
        area: parseFloat(area),
        location,
        propertyType: propertyType || 'Apartment',
        yearBuilt: yearBuilt || 'Unknown',
        bedrooms,
        bathrooms
      },
      cityData,
      comparables,
      marketTrend: {
        yearOverYear: '+5.2%',
        quarterOverQuarter: '+1.8%',
        trend: 'increasing'
      }
    });
  } catch (error) {
    console.error('Error estimating property:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get location-based market data
app.get('/api/market/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const city = await SaudiCity.findOne({ nameEn: location });

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found'
      });
    }

    res.json({
      success: true,
      location: city.nameEn,
      locationAr: city.nameAr,
      marketData: {
        avgPricePerSqm: Math.round(city.basePricePerSqm * city.priceMultiplier),
        priceMultiplier: city.priceMultiplier,
        marketHealth: city.marketStatus,
        region: city.region,
        inventory: Math.floor(Math.random() * 500) + 100,
        avgDaysOnMarket: Math.floor(Math.random() * 60) + 20
      }
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Real Estate Valuation API',
    status: 'operational',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.REAL_ESTATE_PORT || 5004;

app.listen(PORT, () => {
  console.log(`🏠 Real Estate Valuation API running on port ${PORT}`);
  console.log(`📍 Serving property valuations for Saudi cities from MongoDB`);
});
