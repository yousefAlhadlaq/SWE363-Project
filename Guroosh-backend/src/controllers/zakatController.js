const zakatService = require('../services/zakatService');
const Investment = require('../models/investment');
const externalDataService = require('../services/externalDataService');

/**
 * Calculate Zakat for user's investment portfolio
 * POST /api/zakat/calculate
 */
exports.calculateZakat = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user investments from database
    const dbInvestments = await Investment.find({ userId }).lean();

    // Fetch external investments from Central Bank (stocks and gold)
    let externalInvestments = [];

    // Fetch external stocks from Central Bank
    try {
      const stockData = await externalDataService.fetchStockPortfolios(userId);

      // Convert Central Bank stock data to investment format
      if (stockData.success && stockData.portfolios) {
        stockData.portfolios.forEach(portfolio => {
          portfolio.stocks.forEach(stock => {
            externalInvestments.push({
              _id: `external-stock-${stock.symbol}-${portfolio.bank}`,
              userId: userId,
              name: stock.name,
              category: 'Stock',
              amountOwned: stock.shares,
              buyPrice: stock.purchasePrice,
              currentPrice: stock.currentPrice,
              purchaseDate: stock.purchaseDate,
              isExternal: true,
              source: 'Central Bank'
            });
          });
        });
      }
    } catch (error) {
      console.error('Error fetching external stocks for Zakat:', error.message);
      // Continue even if external data fails
    }

    // Fetch gold reserves from Central Bank
    try {
      const goldData = await externalDataService.fetchGoldReserves(userId);

      // Convert Central Bank gold data to investment format
      if (goldData.success && goldData.gold) {
        externalInvestments.push({
          _id: `external-gold-reserve`,
          userId: userId,
          name: 'Gold Reserve',
          category: 'Gold',
          amountOwned: goldData.gold.amountOunces,
          buyPrice: goldData.gold.purchasePrice,
          currentPrice: goldData.gold.currentPrice,
          purchaseDate: goldData.gold.purchaseDate,
          isExternal: true,
          source: 'Central Bank'
        });
      }
    } catch (error) {
      console.error('Error fetching gold reserves for Zakat:', error.message);
      // Continue even if gold data fails
    }

    // Combine database investments and external investments
    const allInvestments = [...dbInvestments, ...externalInvestments];

    if (!allInvestments || allInvestments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No investments found. Add investments to calculate Zakat.'
      });
    }

    console.log(`📊 Zakat calculation: ${dbInvestments.length} DB investments + ${externalInvestments.length} external investments`);

    // Get current gold price
    const currentGoldPricePerGram = await zakatService.getCurrentGoldPrice();

    // Calculate Zakat with all investments
    const result = await zakatService.calculateZakat(allInvestments, currentGoldPricePerGram);

    console.log('📊 Zakat calculation result:', JSON.stringify(result, null, 2));

    if (!result.success) {
      console.error('❌ Zakat calculation failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to calculate Zakat'
      });
    }

    console.log('✅ Sending successful Zakat response');
    res.json({
      success: true,
      calculation: result.calculation
    });

  } catch (error) {
    console.error('Error in calculateZakat controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate Zakat'
    });
  }
};

/**
 * Get current gold price for Nisab calculation
 * GET /api/zakat/gold-price
 */
exports.getGoldPrice = async (req, res) => {
  try {
    const currentGoldPricePerGram = await zakatService.getCurrentGoldPrice();

    res.json({
      success: true,
      goldPrice: {
        pricePerGram: currentGoldPricePerGram,
        nisabValue: currentGoldPricePerGram * 85,
        nisabGrams: 85,
        currency: 'SAR'
      }
    });

  } catch (error) {
    console.error('Error in getGoldPrice controller:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get gold price'
    });
  }
};
