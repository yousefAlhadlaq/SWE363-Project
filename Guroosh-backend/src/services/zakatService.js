/**
 * Zakat Calculation Service
 * Implements Saudi Arabian Zakat regulations
 *
 * Global Parameters:
 * - Zakat Rate: 2.5% (Based on Hijri Year)
 * - Gold Nisab: Value of 85 grams of 24k Gold
 * - Total Nisab: Sum of all liquid assets must exceed Gold Nisab value
 */

const ZAKAT_RATE = 0.025; // 2.5%
const GOLD_NISAB_GRAMS = 85; // 85 grams of 24k gold

/**
 * Calculate Zakat for a user's investment portfolio
 * @param {Array} investments - Array of investment objects
 * @param {Number} currentGoldPricePerGram - Current gold price per gram in SAR
 * @returns {Object} Detailed Zakat calculation breakdown
 */
exports.calculateZakat = async (investments, currentGoldPricePerGram) => {
  try {
    // Calculate Gold Nisab threshold value
    const goldNisabValue = GOLD_NISAB_GRAMS * currentGoldPricePerGram;

    // Initialize category totals
    const categoryBreakdown = {
      realEstate: { total: 0, zakatable: 0, zakat: 0, items: [] },
      stocks: { total: 0, zakatable: 0, zakat: 0, items: [] },
      crypto: { total: 0, zakatable: 0, zakat: 0, items: [] },
      gold: { total: 0, zakatable: 0, zakat: 0, items: [] }
    };

    // Process each investment
    investments.forEach(investment => {
      const currentValue = investment.currentPrice * (investment.amountOwned || 1);

      switch (investment.category) {
        case 'Real Estate':
          // ALL Real Estate is for TRADING purposes (Urud al-Tijarah)
          // Zakat = Current Market Value * 2.5%
          const realEstateZakat = currentValue * ZAKAT_RATE;
          categoryBreakdown.realEstate.total += currentValue;
          categoryBreakdown.realEstate.zakatable += currentValue;
          categoryBreakdown.realEstate.zakat += realEstateZakat;
          categoryBreakdown.realEstate.items.push({
            name: investment.name,
            value: currentValue,
            zakatable: currentValue,
            zakat: realEstateZakat,
            reason: 'Trading property (Urud al-Tijarah)'
          });
          break;

        case 'Stock':
          // Check if Saudi market (TASI) or International
          const stockName = investment.name.toLowerCase();
          const isSaudiStock = stockName.includes('tadawul') ||
            stockName.includes('saudi') ||
            stockName.includes('.sr') ||
            stockName.includes('tasi');

          let stockZakat = 0;
          let stockZakatable = 0;
          let stockReason = '';

          if (isSaudiStock) {
            // Saudi Market - Check if Investor or Speculator
            // We'll assume if held < 1 year = Speculator, >= 1 year = Investor
            const purchaseDate = investment.purchaseDate ? new Date(investment.purchaseDate) : null;
            const now = new Date();
            const holdingPeriodDays = purchaseDate ? (now - purchaseDate) / (1000 * 60 * 60 * 24) : 365;
            const isSpeculator = holdingPeriodDays < 365;

            if (isSpeculator) {
              // Speculator (Trading): Zakat = Market Value * 2.5%
              stockZakat = currentValue * ZAKAT_RATE;
              stockZakatable = currentValue;
              stockReason = 'Saudi stock - Speculator (held < 1 year)';
            } else {
              // Investor (Long-term): Zakat = $0 (Paid by company)
              stockZakat = 0;
              stockZakatable = 0;
              stockReason = 'Saudi stock - Investor (held ≥ 1 year, company pays Zakat)';
            }
          } else {
            // International Market: Zakat = Market Value * 2.5%
            stockZakat = currentValue * ZAKAT_RATE;
            stockZakatable = currentValue;
            stockReason = 'International stock';
          }

          categoryBreakdown.stocks.total += currentValue;
          categoryBreakdown.stocks.zakatable += stockZakatable;
          categoryBreakdown.stocks.zakat += stockZakat;
          categoryBreakdown.stocks.items.push({
            name: investment.name,
            value: currentValue,
            zakatable: stockZakatable,
            zakat: stockZakat,
            reason: stockReason
          });
          break;

        case 'Crypto':
          // Cryptocurrencies: Zakat = Market Value * 2.5%
          const cryptoZakat = currentValue * ZAKAT_RATE;
          categoryBreakdown.crypto.total += currentValue;
          categoryBreakdown.crypto.zakatable += currentValue;
          categoryBreakdown.crypto.zakat += cryptoZakat;
          categoryBreakdown.crypto.items.push({
            name: investment.name,
            value: currentValue,
            zakatable: currentValue,
            zakat: cryptoZakat,
            reason: 'Cryptocurrency'
          });
          break;

        case 'Gold':
          // Gold Calculation
          // Total Gold Value = Weight (grams) * Current Price per Gram
          // If Total Gold Value < Gold Nisab Value: Zakat on Gold = 0
          // Else: Zakat = Total Gold Value * 2.5%

          // Assume amountOwned is in grams for gold
          const goldWeight = investment.amountOwned || 0;
          const goldValue = currentValue;

          let goldZakat = 0;
          let goldZakatable = 0;
          let goldReason = '';

          if (goldValue < goldNisabValue) {
            goldZakat = 0;
            goldZakatable = 0;
            goldReason = `Below Nisab threshold (${goldWeight}g < ${GOLD_NISAB_GRAMS}g)`;
          } else {
            goldZakat = goldValue * ZAKAT_RATE;
            goldZakatable = goldValue;
            goldReason = `Above Nisab threshold (${goldWeight}g ≥ ${GOLD_NISAB_GRAMS}g)`;
          }

          categoryBreakdown.gold.total += goldValue;
          categoryBreakdown.gold.zakatable += goldZakatable;
          categoryBreakdown.gold.zakat += goldZakat;
          categoryBreakdown.gold.items.push({
            name: investment.name,
            value: goldValue,
            weight: goldWeight,
            zakatable: goldZakatable,
            zakat: goldZakat,
            reason: goldReason
          });
          break;
      }
    });

    // Calculate total liquid assets for Nisab check
    const totalLiquidAssets =
      categoryBreakdown.crypto.total +
      categoryBreakdown.gold.total;

    // Calculate total zakatable wealth
    const totalZakatable =
      categoryBreakdown.realEstate.zakatable +
      categoryBreakdown.stocks.zakatable +
      categoryBreakdown.crypto.zakatable +
      categoryBreakdown.gold.zakatable;

    // Calculate total Zakat
    const totalZakat =
      categoryBreakdown.realEstate.zakat +
      categoryBreakdown.stocks.zakat +
      categoryBreakdown.crypto.zakat +
      categoryBreakdown.gold.zakat;

    // Check if total liquid assets meet Nisab threshold
    const meetsNisab = totalLiquidAssets >= goldNisabValue;
    const nisabStatus = meetsNisab
      ? `✓ Meets Nisab (${(totalLiquidAssets / goldNisabValue * 100).toFixed(1)}% of threshold)`
      : `✗ Below Nisab (${(totalLiquidAssets / goldNisabValue * 100).toFixed(1)}% of threshold)`;

    return {
      success: true,
      calculation: {
        goldNisabValue,
        goldNisabGrams: GOLD_NISAB_GRAMS,
        currentGoldPricePerGram,
        zakatRate: ZAKAT_RATE,
        meetsNisab,
        nisabStatus,
        totalLiquidAssets,
        totalZakatable,
        totalZakat,
        categoryBreakdown,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Error calculating Zakat:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate Zakat'
    };
  }
};

/**
 * Get current gold price per gram in SAR
 * Uses the Gold API to fetch live prices
 * @returns {Number} Gold price per gram in SAR
 */
exports.getCurrentGoldPrice = async () => {
  try {
    // Fetch from Gold API (using goldPriceService)
    // Note: goldPriceService now returns price directly in SAR
    const goldPriceService = require('./goldPriceService');
    const pricePerGramSAR = await goldPriceService.getCurrentGoldPrice();

    if (pricePerGramSAR && pricePerGramSAR > 0) {
      console.log(`✅ Gold price fetched: ${pricePerGramSAR.toFixed(2)} SAR/gram`);
      return pricePerGramSAR;
    }

    // Fallback price if API unavailable (approximate SAR per gram for 24k gold)
    console.log('📌 Using default gold price: 250 SAR/gram');
    return 250; // ~250 SAR per gram (fallback)

  } catch (error) {
    // Return fallback price on error - this is expected behavior
    console.log('📌 Using default gold price: 250 SAR/gram');
    return 250;
  }
};
