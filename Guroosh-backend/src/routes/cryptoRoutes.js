const express = require('express');
const router = express.Router();
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

// USD to SAR conversion rate (fixed rate: 1 USD = 3.75 SAR)
const USD_TO_SAR = 3.75;

// Popular cryptocurrencies with Yahoo Finance ticker symbols
const POPULAR_CRYPTOS = [
  { symbol: 'BTC-USD', name: 'Bitcoin', shortName: 'BTC' },
  { symbol: 'ETH-USD', name: 'Ethereum', shortName: 'ETH' },
  { symbol: 'USDT-USD', name: 'Tether', shortName: 'USDT' },
  { symbol: 'BNB-USD', name: 'Binance Coin', shortName: 'BNB' },
  { symbol: 'SOL-USD', name: 'Solana', shortName: 'SOL' },
  { symbol: 'USDC-USD', name: 'USD Coin', shortName: 'USDC' },
  { symbol: 'XRP-USD', name: 'Ripple', shortName: 'XRP' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', shortName: 'DOGE' },
  { symbol: 'ADA-USD', name: 'Cardano', shortName: 'ADA' },
  { symbol: 'TRX-USD', name: 'TRON', shortName: 'TRX' },
  { symbol: 'AVAX-USD', name: 'Avalanche', shortName: 'AVAX' },
  { symbol: 'SHIB-USD', name: 'Shiba Inu', shortName: 'SHIB' },
  { symbol: 'DOT-USD', name: 'Polkadot', shortName: 'DOT' },
  { symbol: 'LINK-USD', name: 'Chainlink', shortName: 'LINK' },
  { symbol: 'MATIC-USD', name: 'Polygon', shortName: 'MATIC' },
  { symbol: 'LTC-USD', name: 'Litecoin', shortName: 'LTC' },
  { symbol: 'UNI-USD', name: 'Uniswap', shortName: 'UNI' },
  { symbol: 'ATOM-USD', name: 'Cosmos', shortName: 'ATOM' },
  { symbol: 'XLM-USD', name: 'Stellar', shortName: 'XLM' },
  { symbol: 'BCH-USD', name: 'Bitcoin Cash', shortName: 'BCH' },
  { symbol: 'ETC-USD', name: 'Ethereum Classic', shortName: 'ETC' },
  { symbol: 'XMR-USD', name: 'Monero', shortName: 'XMR' },
  { symbol: 'ALGO-USD', name: 'Algorand', shortName: 'ALGO' },
  { symbol: 'FIL-USD', name: 'Filecoin', shortName: 'FIL' },
  { symbol: 'APT-USD', name: 'Aptos', shortName: 'APT' },
  { symbol: 'ARB-USD', name: 'Arbitrum', shortName: 'ARB' },
  { symbol: 'OP-USD', name: 'Optimism', shortName: 'OP' },
  { symbol: 'NEAR-USD', name: 'NEAR Protocol', shortName: 'NEAR' },
  { symbol: 'VET-USD', name: 'VeChain', shortName: 'VET' },
  { symbol: 'ICP-USD', name: 'Internet Computer', shortName: 'ICP' },
];

/**
 * Search cryptocurrencies
 * Uses predefined list + Yahoo Finance search API
 */
router.get('/search-crypto', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        cryptos: []
      });
    }

    const searchQuery = q.toLowerCase().trim();

    // First, search in our predefined list
    const predefinedMatches = POPULAR_CRYPTOS.filter(crypto =>
      crypto.name.toLowerCase().includes(searchQuery) ||
      crypto.shortName.toLowerCase().includes(searchQuery) ||
      crypto.symbol.toLowerCase().includes(searchQuery)
    );

    // If we have matches in predefined list, return them
    if (predefinedMatches.length > 0) {
      return res.json({
        success: true,
        cryptos: predefinedMatches.map(crypto => ({
          symbol: crypto.symbol,
          name: crypto.name,
          shortName: crypto.shortName,
          type: 'CRYPTOCURRENCY',
          region: 'Global',
          exchange: 'Crypto'
        }))
      });
    }

    // If no matches in predefined list, try Yahoo Finance search with -USD suffix
    try {
      const searchWithUSD = searchQuery.toUpperCase() + '-USD';
      const searchResults = await yahooFinance.search(searchWithUSD);

      // Filter for cryptocurrencies only
      const cryptoResults = (searchResults.quotes || [])
        .filter(result =>
          result.quoteType === 'CRYPTOCURRENCY' ||
          (result.symbol && result.symbol.includes('-USD'))
        )
        .slice(0, 15)
        .map(crypto => ({
          symbol: crypto.symbol,
          name: crypto.shortname || crypto.longname || crypto.symbol.replace('-USD', ''),
          shortName: crypto.symbol.replace('-USD', ''),
          type: 'CRYPTOCURRENCY',
          region: 'Global',
          exchange: crypto.exchDisp || 'Crypto'
        }));

      res.json({
        success: true,
        cryptos: cryptoResults
      });
    } catch (searchError) {
      // If Yahoo search fails, return empty results
      console.warn('Yahoo Finance crypto search failed:', searchError.message);
      res.json({
        success: true,
        cryptos: []
      });
    }
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to search cryptocurrencies'
    });
  }
});

/**
 * Get cryptocurrency quote (current price)
 * Uses Yahoo Finance - crypto symbols should be in format: BTC-USD, ETH-USD, etc.
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    let { symbol } = req.params;

    // Ensure symbol is in correct format (add -USD if not present)
    if (!symbol.includes('-USD') && !symbol.includes('-')) {
      symbol = symbol.toUpperCase() + '-USD';
    }

    // Get current quote from Yahoo Finance
    const quote = await yahooFinance.quote(symbol);

    if (!quote || !quote.regularMarketPrice) {
      return res.status(404).json({
        success: false,
        error: 'Cryptocurrency not found'
      });
    }

    // Convert all crypto prices from USD to SAR
    res.json({
      success: true,
      quote: {
        symbol: quote.symbol,
        price: quote.regularMarketPrice * USD_TO_SAR,
        open: quote.regularMarketOpen * USD_TO_SAR,
        high: quote.regularMarketDayHigh * USD_TO_SAR,
        low: quote.regularMarketDayLow * USD_TO_SAR,
        volume: quote.regularMarketVolume,
        previousClose: quote.regularMarketPreviousClose * USD_TO_SAR,
        change: quote.regularMarketChange * USD_TO_SAR,
        changePercent: quote.regularMarketChangePercent,
        marketCap: quote.marketCap * USD_TO_SAR,
        currency: 'SAR',
        originalCurrency: 'USD',
        conversionRate: USD_TO_SAR
      }
    });
  } catch (error) {
    console.error('Error fetching crypto quote:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cryptocurrency quote'
    });
  }
});

/**
 * Get historical cryptocurrency price for a specific date
 * Uses Yahoo Finance - crypto symbols should be in format: BTC-USD, ETH-USD, etc.
 */
router.get('/historical/:symbol/:date', async (req, res) => {
  let { symbol, date } = req.params;

  try {
    // Ensure symbol is in correct format (add -USD if not present)
    if (!symbol.includes('-USD') && !symbol.includes('-')) {
      symbol = symbol.toUpperCase() + '-USD';
    }

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
        error: 'Historical data not found for this cryptocurrency'
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
        error: `No data available for ${date}. Crypto may not have trading data on this date.`
      });
    }

    const dataDate = new Date(closestData.date);
    // Convert all crypto historical prices from USD to SAR
    res.json({
      success: true,
      historical: {
        symbol: symbol,
        date: dataDate.toISOString().split('T')[0],
        open: closestData.open * USD_TO_SAR,
        high: closestData.high * USD_TO_SAR,
        low: closestData.low * USD_TO_SAR,
        close: closestData.close * USD_TO_SAR,
        adjustedClose: (closestData.adjclose || closestData.close) * USD_TO_SAR,
        volume: closestData.volume,
        currency: 'SAR',
        originalCurrency: 'USD'
      }
    });
  } catch (error) {
    console.error('Error fetching historical crypto price:', error.message);

    // Format error message to show readable dates
    let errorMessage = error.message || 'Failed to fetch historical cryptocurrency price';

    // Check if error contains timestamp format
    const timestampMatch = errorMessage.match(/startDate\s*=\s*(\d+),\s*endDate\s*=\s*(\d+)/);
    if (timestampMatch) {
      try {
        // Try to get the available date range for this crypto
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
          errorMessage = `Historical data not available for ${symbol} between ${startDateFormatted} and ${endDateFormatted}. This cryptocurrency may not have trading data on this date.`;
        }
      } catch (rangeError) {
        const startTimestamp = parseInt(timestampMatch[1]);
        const endTimestamp = parseInt(timestampMatch[2]);
        const startDateFormatted = new Date(startTimestamp * 1000).toISOString().split('T')[0];
        const endDateFormatted = new Date(endTimestamp * 1000).toISOString().split('T')[0];
        errorMessage = `Historical data not available for ${symbol} between ${startDateFormatted} and ${endDateFormatted}. This cryptocurrency may not have trading data on this date.`;
      }
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

module.exports = router;
