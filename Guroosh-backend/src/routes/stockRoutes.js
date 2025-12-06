const express = require('express');
const router = express.Router();
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

// USD to SAR conversion rate (fixed rate: 1 USD = 3.75 SAR)
const USD_TO_SAR = 3.75;

// Saudi stock exchanges
const SAUDI_EXCHANGES = ['SAU', 'Tadawul', 'Saudi Stock Exchange'];

// Helper to check if a stock is Saudi
const isSaudiStock = (symbol, exchange) => {
  return symbol.endsWith('.SR') || SAUDI_EXCHANGES.some(ex =>
    exchange?.toLowerCase().includes(ex.toLowerCase())
  );
};

// Search stocks - uses Yahoo Finance search API
router.get('/search-stocks', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        stocks: []
      });
    }

    // Use Yahoo Finance search API
    const searchResults = await yahooFinance.search(q);

    // Filter and format the results - only include equities
    const matchingStocks = (searchResults.quotes || [])
      .filter(stock => stock.quoteType === 'EQUITY' && stock.symbol)
      .slice(0, 15) // Limit to top 15 results
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.shortname || stock.longname || stock.symbol,
        type: stock.quoteType,
        region: stock.region || 'US',
        exchange: stock.exchDisp || stock.exchange || 'Unknown'
      }));

    res.json({
      success: true,
      stocks: matchingStocks
    });
  } catch (error) {
    console.error('Error searching stocks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search stocks'
    });
  }
});

// Get stock quote (current price) - returns prices in SAR
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    // Get current quote from Yahoo Finance
    const quote = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    // Check if it's a Saudi stock (already in SAR)
    const exchange = quote.exchange || quote.fullExchangeName || '';
    const isInSAR = isSaudiStock(symbol, exchange);
    const conversionRate = isInSAR ? 1 : USD_TO_SAR;

    res.json({
      success: true,
      quote: {
        symbol: quote.symbol,
        price: quote.regularMarketPrice * conversionRate,
        open: quote.regularMarketOpen * conversionRate,
        high: quote.regularMarketDayHigh * conversionRate,
        low: quote.regularMarketDayLow * conversionRate,
        volume: quote.regularMarketVolume,
        previousClose: quote.regularMarketPreviousClose * conversionRate,
        change: quote.regularMarketChange * conversionRate,
        changePercent: quote.regularMarketChangePercent,
        currency: 'SAR',
        originalCurrency: isInSAR ? 'SAR' : 'USD',
        conversionRate: conversionRate
      }
    });
  } catch (error) {
    console.error('Error fetching stock quote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch stock quote'
    });
  }
});

// Get historical stock price range for charting
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1mo' } = req.query; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max

    // Map range to Yahoo Finance period and interval
    let period1, period2, interval;
    const now = new Date();

    switch (range) {
      case '1d':
        period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        interval = '5m'; // 5-minute intervals for 1 day
        break;
      case '5d':
        period1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        interval = '15m'; // 15-minute intervals for 5 days
        break;
      case '1mo':
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = '1d'; // Daily for 1 month
        break;
      case '3mo':
        period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        interval = '1d'; // Daily for 3 months
        break;
      case '6mo':
        period1 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        interval = '1d'; // Daily for 6 months
        break;
      case '1y':
        period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        interval = '1d'; // Daily for 1 year
        break;
      case '5y':
        period1 = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
        interval = '1wk'; // Weekly for 5 years
        break;
      case 'max':
        period1 = new Date(now.getTime() - 20 * 365 * 24 * 60 * 60 * 1000);
        interval = '1mo'; // Monthly for max
        break;
      default:
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        interval = '1d';
    }

    period2 = now;

    // Fetch historical data from Yahoo Finance
    const historicalData = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval
    });

    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Historical data not available for this symbol'
      });
    }

    // Check if it's a Saudi stock (already in SAR)
    const isInSAR = isSaudiStock(symbol, '');
    const conversionRate = isInSAR ? 1 : USD_TO_SAR;

    // Format data for charting
    const chartData = historicalData.map(point => ({
      timestamp: new Date(point.date).getTime(),
      date: new Date(point.date).toISOString(),
      open: point.open * conversionRate,
      high: point.high * conversionRate,
      low: point.low * conversionRate,
      close: point.close * conversionRate,
      volume: point.volume
    }));

    res.json({
      success: true,
      symbol,
      range,
      interval,
      currency: 'SAR',
      data: chartData
    });

  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch chart data'
    });
  }
});

// Get historical stock price for a specific date
router.get('/historical/:symbol/:date', async (req, res) => {
  const { symbol, date } = req.params;

  try {

    // Parse the date
    const targetDate = new Date(date + 'T00:00:00.000Z');
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format'
      });
    }

    // Get historical data from Yahoo Finance
    // Fetch data from the target date minus 7 days to ensure we get the exact date
    const startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 7);

    const endDate = new Date(targetDate);
    endDate.setDate(endDate.getDate() + 1);

    const historicalData = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Historical data not found for this stock'
      });
    }

    // Find the exact date or closest date
    const targetDateString = date; // YYYY-MM-DD format
    let closestData = null;

    for (const data of historicalData) {
      if (!data.date) continue;
      const dataDate = new Date(data.date);
      const dataDateString = dataDate.toISOString().split('T')[0];
      if (dataDateString === targetDateString) {
        closestData = data;
        break;
      }
    }

    // If exact date not found, use the closest available date before the target
    if (!closestData && historicalData.length > 0) {
      // Find the closest date before target date
      for (let i = historicalData.length - 1; i >= 0; i--) {
        if (!historicalData[i].date) continue;
        const dataDate = new Date(historicalData[i].date);
        if (dataDate <= targetDate) {
          closestData = historicalData[i];
          break;
        }
      }
      // If still not found, use the first available
      if (!closestData) {
        closestData = historicalData[0];
      }
    }

    if (!closestData) {
      return res.status(404).json({
        success: false,
        error: `No data available for ${date}. Market may have been closed on this date.`
      });
    }

    // Check if it's a Saudi stock (already in SAR)
    const isInSAR = isSaudiStock(symbol, '');
    const conversionRate = isInSAR ? 1 : USD_TO_SAR;

    const dataDate = new Date(closestData.date);
    res.json({
      success: true,
      historical: {
        symbol: symbol,
        date: dataDate.toISOString().split('T')[0],
        open: closestData.open * conversionRate,
        high: closestData.high * conversionRate,
        low: closestData.low * conversionRate,
        close: closestData.close * conversionRate,
        adjustedClose: (closestData.adjclose || closestData.close) * conversionRate,
        volume: closestData.volume,
        currency: 'SAR',
        originalCurrency: isInSAR ? 'SAR' : 'USD'
      }
    });
  } catch (error) {
    console.error('Error fetching historical stock price:', error.message);

    // Format error message to show readable dates instead of timestamps
    let errorMessage = error.message || 'Failed to fetch historical stock price';

    // Check if error contains timestamp format (startDate = number, endDate = number)
    const timestampMatch = errorMessage.match(/startDate\s*=\s*(\d+),\s*endDate\s*=\s*(\d+)/);
    if (timestampMatch) {
      try {
        // Try to get the available date range for this stock
        const recentData = await yahooFinance.historical(symbol, {
          period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
          period2: new Date(), // Now
          interval: '1d'
        });

        if (recentData && recentData.length > 0) {
          const oldestDate = new Date(recentData[0].date).toISOString().split('T')[0];
          const newestDate = new Date(recentData[recentData.length - 1].date).toISOString().split('T')[0];
          errorMessage = `Historical data for ${symbol} is only available between ${oldestDate} and ${newestDate}. The requested date (${date}) is outside this range.`;
        } else {
          const startTimestamp = parseInt(timestampMatch[1]);
          const endTimestamp = parseInt(timestampMatch[2]);
          const startDateFormatted = new Date(startTimestamp * 1000).toISOString().split('T')[0];
          const endDateFormatted = new Date(endTimestamp * 1000).toISOString().split('T')[0];
          errorMessage = `Historical data not available for ${symbol} between ${startDateFormatted} and ${endDateFormatted}. This stock may not have been publicly traded on this date.`;
        }
      } catch (rangeError) {
        // If we can't get the range, show the original formatted error
        const startTimestamp = parseInt(timestampMatch[1]);
        const endTimestamp = parseInt(timestampMatch[2]);
        const startDateFormatted = new Date(startTimestamp * 1000).toISOString().split('T')[0];
        const endDateFormatted = new Date(endTimestamp * 1000).toISOString().split('T')[0];
        errorMessage = `Historical data not available for ${symbol} between ${startDateFormatted} and ${endDateFormatted}. This stock may not have been publicly traded on this date.`;
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

module.exports = router;
