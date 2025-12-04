/**
 * Gold Price Service
 * Fetches current price from GoldAPI (or env override) and estimates historical price.
 * Returns all prices in SAR (Saudi Riyal)
 */

const axios = require('axios');

/**
 * Gold price calculations expressed per gram (converted to SAR)
 * Uses realistic current market price with USD to SAR conversion
 */

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const USD_TO_SAR = 3.75; // Fixed conversion rate: 1 USD = 3.75 SAR
const GOLD_API_BASE_URL = process.env.GOLD_API_BASE_URL || 'https://www.goldapi.io/api';
const GOLD_API_KEY = process.env.GOLD_API_KEY;
const roundToTwo = (value) => Math.round(value * 100) / 100;

const parsePricePerGramFromGoldApi = (data) => {
  if (!data) return null;
  if (typeof data.price_gram_24k === 'number') return data.price_gram_24k;
  if (typeof data.price === 'number') return data.price / GRAMS_PER_TROY_OUNCE;
  return null;
};

/**
 * Fetch current gold price per gram in SAR
 * Uses realistic current market price converted from USD
 * @returns {Promise<number>} Current price per gram in SAR
 */
async function getCurrentGoldPrice() {
  // Allow manual override for exact pricing (assumes SAR input)
  const envPrice = Number(process.env.GOLD_PRICE_PER_GRAM);
  if (!Number.isNaN(envPrice) && envPrice > 0) {
    return roundToTwo(envPrice);
  }

  try {
    if (!GOLD_API_KEY) {
      console.warn('No GOLD_API_KEY configured, will use fallback price');
      return null;
    }

    const response = await axios.get(`${GOLD_API_BASE_URL}/XAU/USD`, {
      headers: { 'x-access-token': GOLD_API_KEY },
      timeout: 6000,
    });

    const data = response.data || {};
    const pricePerGramUSD = parsePricePerGramFromGoldApi(data);

    if (pricePerGramUSD && pricePerGramUSD > 0) {
      // Convert USD to SAR
      return roundToTwo(pricePerGramUSD * USD_TO_SAR);
    }

    console.warn('GoldAPI returned unexpected payload, will use fallback price');
    return null;
  } catch (error) {
    // This is expected when API key is missing or rate-limited - fallback silently
    console.log('ℹ️  Gold price API unavailable, using fallback');
    // Return null to allow fallback instead of throwing
    return null;
  }
}

/**
 * Fetch historical gold price for a specific date
 * Uses average annual appreciation rates to estimate
 *
 * @param {Date} date - Historical date
 * @param {number} [currentPriceOverride] - Optional current price per gram to avoid re-fetch
 * @returns {Promise<number>} Estimated historical price per gram
 */
async function getHistoricalGoldPrice(date, currentPriceOverride) {
  try {
    const purchaseDate = new Date(date);
    const now = new Date();
    const yearsAgo = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (Number.isNaN(purchaseDate.getTime())) {
      throw new Error('Invalid purchase date');
    }

    const dateKey = purchaseDate.toISOString().split('T')[0];
    const dateKeyCompact = dateKey.replace(/-/g, '');

    // Try GoldAPI historical endpoint: /XAU/USD/YYYYMMDD (preferred) then /XAU/USD/YYYY-MM-DD
    const dateVariants = [`${GOLD_API_BASE_URL}/XAU/USD/${dateKeyCompact}`, `${GOLD_API_BASE_URL}/XAU/USD/${dateKey}`];
    if (GOLD_API_KEY) {
      for (const url of dateVariants) {
        try {
          const response = await axios.get(url, {
            headers: { 'x-access-token': GOLD_API_KEY },
            timeout: 8000,
          });
          const data = response.data || {};
          const pricePerGram = parsePricePerGramFromGoldApi(data);
          if (pricePerGram && pricePerGram > 0) {
            return roundToTwo(pricePerGram);
          }
        } catch (apiError) {
          console.warn(`GoldAPI historical fetch failed for ${url}: ${apiError.message}`);
        }
      }
    }

    // Get current price (per gram)
    const currentPrice =
      typeof currentPriceOverride === 'number' && !Number.isNaN(currentPriceOverride)
        ? currentPriceOverride
        : await getCurrentGoldPrice();

    // Gold has historically appreciated ~7-10% annually on average
    // We'll use 8% as a conservative estimate
    // Reverse calculation: historical_price = current_price / (1.08 ^ years)
    const annualAppreciation = 0.08;
    const historicalPrice = currentPrice / Math.pow(1 + annualAppreciation, yearsAgo);

    return roundToTwo(historicalPrice); // Round to 2 decimals
  } catch (error) {
    console.error('Error calculating historical gold price:', error.message);
    throw error;
  }
}

module.exports = {
  getCurrentGoldPrice,
  getHistoricalGoldPrice
};
