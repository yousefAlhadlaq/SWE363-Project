const express = require('express');
const router = express.Router();
const goldPriceController = require('../controllers/goldPriceController');
const { auth } = require('../middleware/auth');

// Initialize Yahoo Finance
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const USD_TO_SAR = 3.75;

// Get gold prices for a purchase date
router.post('/prices', auth, goldPriceController.getGoldPrices);

// Get historical gold price range for charting (similar to stocks/crypto)
router.get('/chart', async (req, res) => {
    try {
        const { range = '1mo' } = req.query;

        // Map range to Yahoo Finance period and interval
        let period1, period2, interval;
        const now = new Date();

        switch (range) {
            case '1d':
                period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                interval = '5m';
                break;
            case '5d':
                period1 = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
                interval = '15m';
                break;
            case '1mo':
                period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                interval = '1d';
                break;
            case '3mo':
                period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                interval = '1d';
                break;
            case '6mo':
                period1 = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
                interval = '1wk';
                break;
            case '1y':
                period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                interval = '1wk';
                break;
            case '5y':
                period1 = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000);
                interval = '1mo';
                break;
            case 'max':
                period1 = new Date('2000-01-01');
                interval = '1mo';
                break;
            default:
                period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                interval = '1d';
        }

        period2 = now;

        console.log(`🥇 Fetching gold chart data: range=${range}, interval=${interval}`);

        // Fetch historical gold data from Yahoo Finance (GC=F = Gold Futures)
        const historicalData = await yahooFinance.historical('GC=F', {
            period1,
            period2,
            interval
        });

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No historical gold data found for the specified range'
            });
        }

        console.log(`✅ Fetched ${historicalData.length} gold data points`);

        // Format data for charting - convert to SAR per gram
        const chartData = historicalData.map(point => {
            const pricePerOunceUSD = point.close;
            const pricePerGramUSD = pricePerOunceUSD / GRAMS_PER_TROY_OUNCE;
            const pricePerGramSAR = pricePerGramUSD * USD_TO_SAR;

            return {
                timestamp: new Date(point.date).getTime(),
                date: new Date(point.date).toISOString(),
                open: (point.open / GRAMS_PER_TROY_OUNCE) * USD_TO_SAR,
                high: (point.high / GRAMS_PER_TROY_OUNCE) * USD_TO_SAR,
                low: (point.low / GRAMS_PER_TROY_OUNCE) * USD_TO_SAR,
                close: pricePerGramSAR,
                volume: point.volume
            };
        });

        res.json({
            success: true,
            symbol: 'GC=F',
            range,
            interval,
            currency: 'SAR',
            unit: 'gram',
            data: chartData
        });
    } catch (error) {
        console.error('Error fetching gold chart data:', error.message);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch gold chart data'
        });
    }
});

module.exports = router;
