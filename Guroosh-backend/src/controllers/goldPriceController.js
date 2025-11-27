const goldPriceService = require('../services/goldPriceService');

/**
 * Get gold prices for a specific purchase date
 * POST /api/gold/prices
 */
exports.getGoldPrices = async (req, res) => {
  try {
    const { purchaseDate } = req.body;

    if (!purchaseDate) {
      return res.status(400).json({
        success: false,
        error: 'Purchase date is required'
      });
    }

    // Get current price (per gram)
    const currentPrice = await goldPriceService.getCurrentGoldPrice();

    // Get historical price at purchase date (per gram), using same current price baseline
    const historicalPrice = await goldPriceService.getHistoricalGoldPrice(
      new Date(purchaseDate),
      currentPrice
    );

    res.json({
      success: true,
      prices: {
        purchasePrice: historicalPrice,
        currentPrice: currentPrice,
        purchaseDate: purchaseDate,
        currency: 'USD',
        unit: 'gram'
      }
    });
  } catch (error) {
    console.error('Error fetching gold prices:', error);
    const status = error.message && error.message.includes('provider')
      ? 503
      : 500;
    res.status(status).json({
      success: false,
      error: error.message || 'Failed to fetch gold prices'
    });
  }
};
