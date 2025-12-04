const Investment = require('../models/investment');
const externalDataService = require('../services/externalDataService');
const { createInvestmentNotification } = require('../utils/notificationHelper');

// Daily appreciation rate for Real Estate (0.02% per day = ~7.5% per year)
const DAILY_APPRECIATION_RATE = 0.0002; // 0.02%

/**
 * Calculate appreciated value for Real Estate based on days elapsed
 * Formula: newValue = originalValue * (1 + dailyRate) ^ daysElapsed
 */
const calculateAppreciatedValue = (originalValue, purchaseDate) => {
  const now = new Date();
  const purchase = new Date(purchaseDate);
  const daysElapsed = Math.floor((now - purchase) / (1000 * 60 * 60 * 24));

  // Apply compound interest formula
  const appreciatedValue = originalValue * Math.pow(1 + DAILY_APPRECIATION_RATE, daysElapsed);

  return Math.round(appreciatedValue * 100) / 100; // Round to 2 decimal places
};

// Get all investments
exports.getAllInvestments = async (req, res) => {
  try {
    // Fetch manually created investments from MongoDB
    const investments = await Investment.find({ userId: req.userId })
      .sort({ purchaseDate: -1 });

    // Apply daily appreciation to Real Estate investments
    const investmentsWithAppreciation = investments.map(inv => {
      const invObj = inv.toObject();

      if (invObj.category === 'Real Estate') {
        // For real estate, calculate current price from buyPrice with daily appreciation
        // If currentPrice is stored, use buyPrice as the base; otherwise use buyPrice
        const basePrice = invObj.buyPrice || invObj.currentPrice;

        if (basePrice) {
          // Calculate appreciated value based on purchase date
          invObj.currentPrice = calculateAppreciatedValue(basePrice, invObj.purchaseDate || invObj.createdAt);
        }
      }

      return invObj;
    });

    // Fetch external investments from Central Bank (stocks and gold)
    let externalInvestments = [];
    try {
      const stockData = await externalDataService.fetchStockPortfolios(req.userId);

      // Convert Central Bank stock data to investment format
      if (stockData.success && stockData.portfolios) {
        stockData.portfolios.forEach(portfolio => {
          portfolio.stocks.forEach(stock => {
            externalInvestments.push({
              _id: `external-stock-${stock.symbol}-${portfolio.bank}`,
              userId: req.userId,
              name: stock.name,
              category: 'Stock',
              amountOwned: stock.shares,
              buyPrice: stock.purchasePrice,
              currentPrice: stock.currentPrice,
              purchaseDate: stock.purchaseDate,
              notes: `${portfolio.bank} - ${portfolio.brokerage}`,
              isExternal: true, // Mark as external source
              source: 'Central Bank',
              bank: portfolio.bank,
              brokerage: portfolio.brokerage
            });
          });
        });
      }
    } catch (error) {
      console.error('Error fetching external stocks:', error.message);
      // Continue even if external data fails
    }

    // Fetch gold reserves from Central Bank
    try {
      const goldData = await externalDataService.fetchGoldReserves(req.userId);

      // Convert Central Bank gold data to investment format
      if (goldData.success && goldData.gold) {
        externalInvestments.push({
          _id: `external-gold-reserve`,
          userId: req.userId,
          name: 'Gold Reserve',
          category: 'Gold',
          amountOwned: goldData.gold.amountOunces,
          buyPrice: goldData.gold.purchasePrice,
          currentPrice: goldData.gold.currentPrice,
          purchaseDate: goldData.gold.purchaseDate,
          notes: `Central Bank Gold Reserve - ${goldData.gold.gainLossPct >= 0 ? '+' : ''}${goldData.gold.gainLossPct}% gain`,
          isExternal: true,
          source: 'Central Bank',
          goldData: {
            investmentValue: goldData.gold.investmentValue,
            purchaseValue: goldData.gold.purchaseValue,
            gainLoss: goldData.gold.gainLoss,
            gainLossPct: goldData.gold.gainLossPct
          }
        });
      }
    } catch (error) {
      console.error('Error fetching gold reserves:', error.message);
      // Continue even if gold data fails
    }

    // Combine manual and external investments
    const allInvestments = [...investmentsWithAppreciation, ...externalInvestments];

    res.json({
      success: true,
      investments: allInvestments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single investment
exports.getInvestmentById = async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    const invObj = investment.toObject();

    // Apply daily appreciation to Real Estate
    if (invObj.category === 'Real Estate') {
      const basePrice = invObj.buyPrice || invObj.currentPrice;
      if (basePrice) {
        invObj.currentPrice = calculateAppreciatedValue(basePrice, invObj.purchaseDate || invObj.createdAt);
      }
    }

    res.json({
      success: true,
      investment: invObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create investment
exports.createInvestment = async (req, res) => {
  try {
    const {
      name,
      category,
      amountOwned,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes,
      // Real Estate specific fields
      areaSqm,
      latitude,
      longitude,
      propertyType,
      yearBuilt,
      bedrooms,
      bathrooms
    } = req.body;

    // Validation (category-specific)
    if (category === 'Real Estate') {
      if (!name || !category || !currentPrice) {
        return res.status(400).json({
          success: false,
          error: 'Please provide all required fields'
        });
      }
    } else {
      if (!name || !category || !amountOwned || !buyPrice || !currentPrice) {
        return res.status(400).json({
          success: false,
          error: 'Please provide all required fields'
        });
      }
    }

    if ((amountOwned !== undefined && amountOwned < 0) ||
      (buyPrice !== undefined && buyPrice < 0) ||
      (currentPrice !== undefined && currentPrice < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Amount and prices must be positive numbers'
      });
    }

    const investmentData = {
      userId: req.userId,
      name,
      category,
      amountOwned: category === 'Real Estate' ? 1 : amountOwned,
      buyPrice,
      currentPrice: category === 'Real Estate' ? currentPrice : currentPrice,
      purchaseDate,
      notes
    };

    // Add Real Estate specific fields if provided
    if (category === 'Real Estate') {
      if (areaSqm) investmentData.areaSqm = areaSqm;
      if (latitude) investmentData.latitude = latitude;
      if (longitude) investmentData.longitude = longitude;
      if (propertyType) investmentData.propertyType = propertyType;
      if (yearBuilt) investmentData.yearBuilt = yearBuilt;
      if (bedrooms) investmentData.bedrooms = bedrooms;
      if (bathrooms) investmentData.bathrooms = bathrooms;
    }

    const investment = await Investment.create(investmentData);

    // Calculate investment value for the update message
    const investmentValue = category === 'Real Estate'
      ? currentPrice
      : (currentPrice * amountOwned);

    // ✅ Create notification for investment
    await createInvestmentNotification(req.userId, {
      investmentType: category,
      amount: investmentValue,
      change: null, // New investment, no change yet
      investmentId: investment._id,
      name,
      quantity: amountOwned,
      symbol: category === 'Stock' ? name : null,
    });

    // Create a formatted update message for dashboard
    let updateMessage = '';
    if (category === 'Stock') {
      updateMessage = `Bought ${amountOwned} shares of ${name}`;
    } else if (category === 'Real Estate') {
      updateMessage = `Invested in ${name}`;
    } else if (category === 'Gold') {
      updateMessage = `Bought ${amountOwned}g of gold`;
    } else if (category === 'Crypto') {
      updateMessage = `Purchased ${amountOwned} ${name}`;
    } else {
      updateMessage = `Invested in ${name}`;
    }

    // Create latest update object for dashboard
    const latestUpdate = {
      id: investment._id.toString(),
      merchant: updateMessage,
      amount: investmentValue,
      timestamp: new Date().toISOString(),
      method: `Investment · ${category}`,
      status: 'investment', // Special status for investment transactions
      category: category,
      type: 'investment'
    };

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment,
      latestUpdate // Include this for dashboard to display
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update investment
exports.updateInvestment = async (req, res) => {
  try {
    const {
      name,
      category,
      amountOwned,
      buyPrice,
      currentPrice,
      purchaseDate,
      notes
    } = req.body;

    // Validation
    if (amountOwned !== undefined && amountOwned < 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be positive'
      });
    }

    if (buyPrice !== undefined && buyPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Buy price must be positive'
      });
    }

    if (currentPrice !== undefined && currentPrice < 0) {
      return res.status(400).json({
        success: false,
        error: 'Current price must be positive'
      });
    }

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, category, amountOwned, buyPrice, currentPrice, purchaseDate, notes },
      { new: true, runValidators: true }
    );

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment updated successfully',
      investment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete investment
exports.deleteInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        error: 'Investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get portfolio summary
exports.getPortfolioSummary = async (req, res) => {
  try {
    const investments = await Investment.find({ userId: req.userId });

    let totalValue = 0;
    let totalInvested = 0;
    const byCategory = {};

    investments.forEach(inv => {
      let currentPrice = inv.currentPrice;

      // Apply daily appreciation to Real Estate
      if (inv.category === 'Real Estate') {
        const basePrice = inv.buyPrice || inv.currentPrice;
        if (basePrice) {
          currentPrice = calculateAppreciatedValue(basePrice, inv.purchaseDate || inv.createdAt);
        }
      }

      const currentValue = currentPrice * inv.amountOwned;
      const investedValue = inv.buyPrice * inv.amountOwned;

      totalValue += currentValue;
      totalInvested += investedValue;

      if (!byCategory[inv.category]) {
        byCategory[inv.category] = {
          value: 0,
          invested: 0,
          count: 0
        };
      }

      byCategory[inv.category].value += currentValue;
      byCategory[inv.category].invested += investedValue;
      byCategory[inv.category].count += 1;
    });

    // Add Central Bank stocks to portfolio summary
    try {
      const stockData = await externalDataService.fetchStockPortfolios(req.userId);

      if (stockData.success && stockData.summary) {
        totalValue += stockData.summary.totalValue || 0;
        totalInvested += stockData.summary.totalInvested || 0;

        // Add stocks to byCategory
        if (!byCategory['Stock']) {
          byCategory['Stock'] = {
            value: 0,
            invested: 0,
            count: 0
          };
        }

        byCategory['Stock'].value += stockData.summary.totalValue || 0;
        byCategory['Stock'].invested += stockData.summary.totalInvested || 0;

        // Count number of stocks
        if (stockData.portfolios) {
          stockData.portfolios.forEach(portfolio => {
            byCategory['Stock'].count += portfolio.stocks?.length || 0;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching external stock data:', error.message);
      // Continue even if external data fails
    }

    // Add Central Bank gold reserves to portfolio summary
    try {
      const goldData = await externalDataService.fetchGoldReserves(req.userId);

      if (goldData.success && goldData.gold) {
        const goldCurrentValue = goldData.gold.investmentValue || 0;
        const goldInvestedValue = goldData.gold.purchaseValue || 0;

        totalValue += goldCurrentValue;
        totalInvested += goldInvestedValue;

        // Add gold to byCategory
        if (!byCategory['Gold']) {
          byCategory['Gold'] = {
            value: 0,
            invested: 0,
            count: 0
          };
        }

        byCategory['Gold'].value += goldCurrentValue;
        byCategory['Gold'].invested += goldInvestedValue;
        byCategory['Gold'].count += 1;
      }
    } catch (error) {
      console.error('Error fetching gold reserve data:', error.message);
      // Continue even if gold data fails
    }

    const totalGainLoss = totalValue - totalInvested;
    const gainLossPercentage = totalInvested > 0
      ? ((totalGainLoss / totalInvested) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      portfolio: {
        totalValue,
        totalInvested,
        totalGainLoss,
        gainLossPercentage: parseFloat(gainLossPercentage),
        investmentCount: investments.length + (byCategory['Stocks']?.count || 0),
        byCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
