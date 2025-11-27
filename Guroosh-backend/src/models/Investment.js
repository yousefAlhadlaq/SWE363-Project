const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Stock', 'Crypto', 'Real Estate', 'Gold', 'Other'],
    required: true
  },
  amountOwned: {
    type: Number,
    required: true,
    min: 0
  },
  buyPrice: {
    type: Number,
    required: false,  // Optional for Real Estate when fetched from API
    min: 0
  },
  currentPrice: {
    type: Number,
    required: false,  // Can be fetched from Real Estate API
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  // Real Estate specific fields
  location: {
    type: String,  // City name for Real Estate (deprecated, use lat/lng)
    trim: true
  },
  latitude: {
    type: Number,  // Latitude coordinates for real estate
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,  // Longitude coordinates for real estate
    min: -180,
    max: 180
  },
  areaSqm: {
    type: Number,
    min: 0
  },
  propertyType: {
    type: String,
    enum: ['Villa', 'Apartment', 'Townhouse', 'Commercial', 'Land', 'Other']
  },
  yearBuilt: Number,
  bedrooms: Number,
  bathrooms: Number,
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Investment', investmentSchema);
