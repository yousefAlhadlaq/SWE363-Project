const axios = require('axios');

/**
 * Gold Price Service
 * Uses GoldAPI.io free tier for current gold prices
 * For historical prices, we'll use a simpler fallback approach
 */

// GoldAPI.io - Free tier allows 100 requests/month
const GOLD_API_KEY = process.env.GOLD_API_KEY || 'goldapi-demo-key'; // Users need to get their own key
const GOLD_API_BASE_URL = 'https://www.goldapi.io/api';

// Cache object
let goldPriceCache = {
  value: null,
  timestamp: 0
};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * Fetch current gold price per ounce in USD
 * @returns {Promise<number>} Current price per ounce
 */
async function getCurrentGoldPrice() {
  const now = Date.now();

  // Return cached value if valid
  if (goldPriceCache.value && (now - goldPriceCache.timestamp < CACHE_DURATION)) {
    return goldPriceCache.value;
  }

  try {
    // If no API key is set, use a realistic fallback price
    if (GOLD_API_KEY === 'goldapi-demo-key') {
      // Only log this once per server start or long interval, not every call
      if (!goldPriceCache.value) {
        console.log('⚠️ Using fallback gold price - set GOLD_API_KEY in .env for real prices');
      }
      
      // Return a realistic current gold price (around $2600 per oz in late 2025)
      // We cache this random value so it doesn't jump around on every refresh
      const price = 2600 + Math.random() * 50; 
      
      goldPriceCache = {
        value: price,
        timestamp: now
      };
      
      return price;
    }

    const response = await axios.get(`${GOLD_API_BASE_URL}/XAU/USD`, {
      headers: {
        'x-access-token': GOLD_API_KEY
      },
      timeout: 5000
    });

    if (response.data && response.data.price) {
      const price = response.data.price;
      
      // Update cache
      goldPriceCache = {
        value: price,
        timestamp: now
      };
      
      return price;
    }

    throw new Error('Invalid response from Gold API');
  } catch (error) {
    // Only log error if we don't have a stale cache to fall back to
    // OR if enough time has passed since last error log (to avoid spam)
    const shouldLog = !goldPriceCache.value || (now - goldPriceCache.timestamp > CACHE_DURATION);
    
    if (shouldLog) {
      console.log(`ℹ️  Gold price API unavailable (${error.message}), using fallback/cached price`);
    }
    
    // If we have a stale cache, keep using it to avoid drastic jumps
    if (goldPriceCache.value) {
      return goldPriceCache.value;
    }
    
    // Absolute fallback if nothing else works
    const fallbackPrice = 2600 + Math.random() * 50;
    goldPriceCache = {
      value: fallbackPrice,
      timestamp: now
    };
    return fallbackPrice;
  }
}

/**
 * Fetch historical gold price for a specific date
 * Note: Most free APIs don't provide historical data, so we'll estimate based on
 * average annual appreciation rates
 *
 * @param {Date} date - Historical date
 * @returns {Promise<number>} Estimated historical price per ounce
 */
async function getHistoricalGoldPrice(date) {
  try {
    const purchaseDate = new Date(date);
    const now = new Date();
    const yearsAgo = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Get current price
    const currentPrice = await getCurrentGoldPrice();

    // Gold has historically appreciated ~7-10% annually on average
    // We'll use 8% as a conservative estimate
    // Reverse calculation: historical_price = current_price / (1.08 ^ years)
    const annualAppreciation = 0.08;
    const historicalPrice = currentPrice / Math.pow(1 + annualAppreciation, yearsAgo);

    return Math.round(historicalPrice * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error('Error calculating historical gold price:', error.message);
    // Fallback: assume $1800 as base price from 3 years ago
    return 1800;
  }
}

/**
 * Calculate investment value for gold holdings
 * @param {number} ounces - Amount of gold in ounces
 * @param {number} purchasePrice - Price per ounce at purchase
 * @param {number} currentPrice - Current price per ounce
 * @returns {Object} Investment details
 */
function calculateGoldInvestment(ounces, purchasePrice, currentPrice) {
  const purchaseValue = ounces * purchasePrice;
  const currentValue = ounces * currentPrice;
  const gainLoss = currentValue - purchaseValue;
  const gainLossPct = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;

  return {
    purchaseValue: Math.round(purchaseValue * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
    gainLoss: Math.round(gainLoss * 100) / 100,
    gainLossPct: Math.round(gainLossPct * 100) / 100
  };
}

module.exports = {
  getCurrentGoldPrice,
  getHistoricalGoldPrice,
  calculateGoldInvestment
};
