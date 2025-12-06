/**
 * Gold Price Service
 * Fetches current price from Yahoo Finance (primary) or GoldAPI (fallback)
 * Returns all prices in SAR (Saudi Riyal)
 */

const axios = require('axios');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

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
 * Primary: Yahoo Finance (FREE, no API key needed)
 * Fallback: GoldAPI (requires API key)
 * @returns {Promise<number>} Current price per gram in SAR
 */
async function getCurrentGoldPrice() {
  // Allow manual override for exact pricing (assumes SAR input)
  const envPrice = Number(process.env.GOLD_PRICE_PER_GRAM);
  if (!Number.isNaN(envPrice) && envPrice > 0) {
    return roundToTwo(envPrice);
  }

  // PRIMARY: Try Yahoo Finance first (FREE, no API key needed)
  try {
    console.log('🥇 Fetching gold price from Yahoo Finance (GC=F)...');
    const quote = await yahooFinance.quote('GC=F');

    if (quote && quote.regularMarketPrice) {
      const pricePerOunceUSD = quote.regularMarketPrice;
      const pricePerGramUSD = pricePerOunceUSD / GRAMS_PER_TROY_OUNCE;
      const pricePerGramSAR = pricePerGramUSD * USD_TO_SAR;

      console.log(`✅ Yahoo Finance Gold: $${pricePerOunceUSD}/oz → ${roundToTwo(pricePerGramSAR)} SAR/gram`);
      return roundToTwo(pricePerGramSAR);
    }
  } catch (yahooError) {
    console.log('⚠️ Yahoo Finance unavailable, trying GoldAPI...');
  }

  // FALLBACK: Try GoldAPI (requires API key)
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
      console.log(`✅ GoldAPI Gold: ${roundToTwo(pricePerGramUSD * USD_TO_SAR)} SAR/gram`);
      return roundToTwo(pricePerGramUSD * USD_TO_SAR);
    }

    console.warn('GoldAPI returned unexpected payload, will use fallback price');
    return null;
  } catch (error) {
    // This is expected when API key is missing or rate-limited - fallback silently
    console.log('ℹ️  Gold price APIs unavailable, using fallback');
    // Return null to allow fallback instead of throwing
    return null;
  }
}

/**
 * Fetch historical gold price for a specific date
 * Primary: Yahoo Finance historical data (FREE)
 * Fallback 1: GoldAPI historical endpoint
 * Fallback 2: Estimation based on current price and appreciation rate
 *
 * @param {Date} date - Historical date
 * @param {number} [currentPriceOverride] - Optional current price per gram to avoid re-fetch
 * @returns {Promise<number>} Estimated historical price per gram in SAR
 */
async function getHistoricalGoldPrice(date, currentPriceOverride) {
  try {
    const purchaseDate = new Date(date);
    const now = new Date();
    const yearsAgo = (now - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);

    if (Number.isNaN(purchaseDate.getTime())) {
      throw new Error('Invalid purchase date');
    }

    // PRIMARY: Try Yahoo Finance historical data (FREE)
    try {
      console.log(`🥇 Fetching historical gold price from Yahoo Finance for ${purchaseDate.toISOString().split('T')[0]}...`);

      // Fetch a small range around the target date
      const period1 = new Date(purchaseDate);
      period1.setDate(period1.getDate() - 3);
      const period2 = new Date(purchaseDate);
      period2.setDate(period2.getDate() + 3);

      const historicalData = await yahooFinance.historical('GC=F', {
        period1,
        period2,
        interval: '1d'
      });

      if (historicalData && historicalData.length > 0) {
        // Find the closest date to our target
        let closestData = historicalData[0];
        let closestDiff = Math.abs(new Date(historicalData[0].date) - purchaseDate);

        for (const data of historicalData) {
          const diff = Math.abs(new Date(data.date) - purchaseDate);
          if (diff < closestDiff) {
            closestDiff = diff;
            closestData = data;
          }
        }

        const pricePerOunceUSD = closestData.close;
        const pricePerGramUSD = pricePerOunceUSD / GRAMS_PER_TROY_OUNCE;
        const pricePerGramSAR = pricePerGramUSD * USD_TO_SAR;

        console.log(`✅ Yahoo Finance Historical Gold (${closestData.date.toISOString().split('T')[0]}): ${roundToTwo(pricePerGramSAR)} SAR/gram`);
        return roundToTwo(pricePerGramSAR);
      }
    } catch (yahooError) {
      console.log('⚠️ Yahoo Finance historical unavailable, trying GoldAPI...');
    }

    // FALLBACK 1: Try GoldAPI historical endpoint
    const dateKey = purchaseDate.toISOString().split('T')[0];
    const dateKeyCompact = dateKey.replace(/-/g, '');
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
            console.log(`✅ GoldAPI Historical Gold (${dateKey}): ${roundToTwo(pricePerGram * USD_TO_SAR)} SAR/gram`);
            return roundToTwo(pricePerGram * USD_TO_SAR);
          }
        } catch (apiError) {
          console.warn(`GoldAPI historical fetch failed for ${url}: ${apiError.message}`);
        }
      }
    }

    // FALLBACK 2: Estimate based on current price and appreciation rate
    console.log('ℹ️  Using estimation for historical gold price...');

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

    console.log(`📊 Estimated historical gold price: ${roundToTwo(historicalPrice)} SAR/gram (${yearsAgo.toFixed(1)} years ago)`);
    return roundToTwo(historicalPrice);
  } catch (error) {
    console.error('Error calculating historical gold price:', error.message);
    throw error;
  }
}

module.exports = {
  getCurrentGoldPrice,
  getHistoricalGoldPrice
};
