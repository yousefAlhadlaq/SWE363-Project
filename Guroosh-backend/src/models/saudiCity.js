const mongoose = require('mongoose');

const saudiCitySchema = new mongoose.Schema({
  nameEn: {
    type: String,
    required: true,
    unique: true
  },
  nameAr: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  priceMultiplier: {
    type: Number,
    required: true,
    default: 1.0,
    min: 0.1,
    max: 10.0
  },
  basePricePerSqm: {
    type: Number,
    required: true,
    default: 3000 // SAR per square meter
  },
  marketStatus: {
    type: String,
    enum: ['Hot', 'Moderate', 'Cool'],
    default: 'Moderate'
  },
  description: String
}, {
  timestamps: true
});

module.exports = mongoose.model('SaudiCity', saudiCitySchema);
