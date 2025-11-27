# External Financial Data APIs

## Overview

The Quroosh app now integrates with multiple external data sources to fetch real financial information instead of relying on manual user input. This creates a more realistic and automated financial management experience.

**NEW:** All mock servers now use **MongoDB** as their data source, providing a realistic database-backed system with Saudi Arabian financial data (SAR currency, Tadawul stocks, and Saudi cities).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Quroosh API                         │
│                    (Port 5000)                              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├─────────────────────────────────────┐
               │                                     │
               ▼                                     ▼
    ┌──────────────────────┐            ┌──────────────────────┐
    │  Central Bank API    │            │  Crypto Exchange API │
    │  (Port 5002)         │            │  (Port 5003)         │
    │                      │            │                      │
    │  • Bank Accounts     │            │  • BTC, ETH, SOL     │
    │  • Stock Portfolios  │            │  • Portfolio Values  │
    └──────────────────────┘            └──────────────────────┘
               │                                     │
               │                                     │
               ▼                                     ▼
    ┌──────────────────────┐            ┌──────────────────────┐
    │  Real Estate API     │            │  Gold Price API      │
    │  (Port 5004)         │            │  (External)          │
    │                      │            │                      │
    │  • Property Values   │            │  • Live Gold Prices  │
    │  • Location-based    │            │  • Price Calculator  │
    └──────────────────────┘            └──────────────────────┘
```

---

## Quick Start

### Start All Servers at Once

```bash
cd Guroosh-backend
npm run start:all
```

This will start:
- ⚡ Main API (port 5000)
- 🏦 Central Bank API (port 5002)
- ₿ Crypto Exchange API (port 5003)
- 🏠 Real Estate API (port 5004)

### Start Servers Individually

```bash
# Main API only
npm start

# Or for development with auto-reload
npm run dev

# Individual mock servers
npm run start:bank       # Central Bank API
npm run start:crypto     # Crypto Exchange API
npm run start:realestate # Real Estate API
```

### Initialize Database with Sample Data

Before using the external APIs, you need to seed the database with Saudi cities and sample financial data:

```bash
cd Guroosh-backend
npm run seed:external
```

This will populate:
- **21 Saudi Cities** with Arabic/English names, regions, and price multipliers
- **Bank Accounts** in Saudi banks (Al Rajhi, Saudi National Bank, Riyad Bank)
- **Stock Portfolio** with Tadawul stocks (Al Rajhi 1120.SR, Aramco 2222.SR, SABIC 1010.SR, STC 4030.SR)
- **Crypto Holdings** (BTC, ETH, BNB, SOL)

---

## API Endpoints

### Main API - External Data Routes

Base URL: `http://localhost:5000/api/external`

#### Get All External Data
```http
GET /api/external/all
Authorization: Bearer <token>
```

Returns:
- Bank accounts with balances
- Stock portfolios with current values
- Crypto holdings with prices
- Grand total across all sources

#### Bank Accounts
```http
GET /api/external/bank/accounts
Authorization: Bearer <token>
```

Returns user's bank accounts across different banks with current balances.

#### Stock Portfolios
```http
GET /api/external/bank/stocks
Authorization: Bearer <token>
```

Returns stock holdings with:
- Current prices
- Gain/loss calculations
- Portfolio breakdown by brokerage

#### Crypto Portfolio
```http
GET /api/external/crypto/portfolio
Authorization: Bearer <token>
```

Returns cryptocurrency holdings with current market values.

#### Crypto Prices (Public)
```http
GET /api/external/crypto/prices
```

Returns current prices for all supported cryptocurrencies.

#### Get Saudi Cities (Public)
```http
GET /api/cities
```

Returns all available Saudi cities for dropdown menus with:
- English and Arabic names
- Region information
- Price multipliers
- Market status (Hot/Moderate/Cool)

Example response:
```json
{
  "success": true,
  "cities": [
    {
      "value": "Riyadh",
      "label": "Riyadh (الرياض)",
      "labelEn": "Riyadh",
      "labelAr": "الرياض",
      "region": "Riyadh",
      "priceMultiplier": 3.5,
      "marketStatus": "Hot"
    }
  ],
  "count": 21
}
```

#### Real Estate Valuation
```http
POST /api/external/realestate/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "area": 320,
  "location": "Riyadh",
  "propertyType": "Villa",
  "yearBuilt": 2015,
  "bedrooms": 4,
  "bathrooms": 3
}
```

Returns:
- Estimated property value
- Price per square meter
- Comparable properties
- Market trends

#### Gold Price (Public)
```http
GET /api/external/gold/price
```

Returns current gold price per troy ounce in USD.

#### Calculate Gold Value
```http
POST /api/external/gold/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 12,
  "unit": "oz"  // or "g", "kg", "grams", "kilograms"
}
```

Returns total value of gold holdings based on current market price.

---

## Mock Server Details

### Central Bank API (Port 5002)

**Purpose:** Simulates a central bank that aggregates user financial data.

**Endpoints:**
- `GET /api/accounts/:userId` - Get bank accounts
- `GET /api/stocks/:userId` - Get stock portfolios
- `POST /api/register/:userId` - Register new user

**Sample Data (from MongoDB):**
- Multiple bank accounts (Al Rajhi Bank, Saudi National Bank, Riyad Bank)
- Stock portfolios (Tadawul: Al Rajhi 1120.SR, Aramco 2222.SR, SABIC 1010.SR, STC 4030.SR)
- All data in SAR (Saudi Riyal) currency
- Real-time price calculations

### Crypto Exchange API (Port 5003)

**Purpose:** Simulates a cryptocurrency exchange.

**Endpoints:**
- `GET /api/portfolio/:userId` - Get crypto portfolio
- `GET /api/prices` - Get all crypto prices
- `GET /api/price/:symbol` - Get specific crypto price

**Supported Cryptocurrencies:**
- BTC (Bitcoin)
- ETH (Ethereum)
- SOL (Solana)
- ADA (Cardano)
- BNB (Binance Coin)
- XRP (Ripple)
- DOGE (Dogecoin)
- DOT (Polkadot)

### Real Estate Valuation API (Port 5004)

**Purpose:** Estimates property values based on location and characteristics.

**Endpoints:**
- `POST /api/estimate` - Estimate property value
- `GET /api/market/:location` - Get market data for location
- `GET /api/cities` - Get all available Saudi cities (NEW)

**Pricing Factors:**
- Location (Saudi city-based multipliers from MongoDB)
- Property type (Villa, Apartment, Commercial, etc.)
- Age/Year built
- Size (area in m²)

**Saudi City Multipliers (from database):**
- Mecca: 4.0x (Holy city, highest demand)
- Medina: 3.8x (Holy city)
- Riyadh: 3.5x (Capital)
- Jeddah: 3.2x (Commercial hub)
- Khobar: 2.8x (Eastern Province)
- Other cities: 1.4x - 2.7x

---

## Integration Examples

### Frontend Integration

```javascript
// Fetch all external data
const response = await fetch('http://localhost:5000/api/external/all', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.summary.grandTotal); // Total across all sources
```

### Calculate User's Gold Value

```javascript
// User enters: "I have 12 oz of gold"
const response = await fetch('http://localhost:5000/api/external/gold/calculate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 12,
    unit: 'oz'
  })
});

const data = await response.json();
console.log(data.calculation.totalValue); // e.g., $24,600
```

### Estimate Real Estate Value

```javascript
const response = await fetch('http://localhost:5000/api/external/realestate/estimate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    area: 250,
    location: 'Jeddah',
    propertyType: 'Villa',
    yearBuilt: 2015,
    bedrooms: 4,
    bathrooms: 3
  })
});

const data = await response.json();
console.log(data.estimate.value); // Estimated property value
```

### Get Cities for Dropdown

```javascript
// Fetch all Saudi cities for location dropdown
const response = await fetch('http://localhost:5000/api/cities');
const data = await response.json();

// Use in dropdown/select component
const cityOptions = data.cities.map(city => ({
  value: city.value,
  label: city.label, // Shows: "Riyadh (الرياض)"
  priceMultiplier: city.priceMultiplier
}));
```

---

## Data Flow

### How It Works:

1. **User Logs In** → Main API authenticates user

2. **Dashboard Loads** → Frontend requests all external data

3. **Main API** → Fetches data from all external sources in parallel:
   - Central Bank API (accounts + stocks)
   - Crypto Exchange API (crypto holdings)
   - Real Estate API (property values if user owns real estate)
   - Gold Price API (if user has gold)

4. **Data Aggregation** → Main API combines all data

5. **Response** → Frontend displays comprehensive financial overview

---

## Adding New Users to Mock Servers

The mock servers currently have data for the admin user. To add data for new users:

1. **Edit mock server files:**
   - `mock-servers/centralBankServer.js`
   - `mock-servers/cryptoExchangeServer.js`

2. **Add user data in the `mockData.users` object:**

```javascript
mockData.users[newUserId] = {
  bankAccounts: [...],
  stockPortfolios: [...]
};
```

3. **Or use the registration endpoints** (future feature)

---

## Environment Variables

Add to `.env` file:

```env
# External API Endpoints (optional - defaults shown)
CENTRAL_BANK_API=http://localhost:5002/api
CRYPTO_API=http://localhost:5003/api
REAL_ESTATE_API=http://localhost:5004/api

# Gold API (optional - uses fallback if not set)
GOLD_API_KEY=your-api-key-here
```

---

## Testing

### Test Central Bank Connection

```bash
curl http://localhost:5002/api/accounts/692608c30e0887d701de59d7
```

### Test Crypto Prices

```bash
curl http://localhost:5003/api/prices
```

### Test Real Estate Estimation

```bash
curl -X POST http://localhost:5004/api/estimate \
  -H "Content-Type: application/json" \
  -d '{"area":250,"location":"Riyadh","propertyType":"Villa"}'
```

### Test Cities Endpoint

```bash
curl http://localhost:5000/api/cities
```

### Test Gold Price

```bash
curl http://localhost:5000/api/external/gold/price
```

---

## Future Enhancements

- [ ] Add OAuth integration for real bank APIs
- [ ] Integrate with real crypto exchanges (Binance, Coinbase APIs)
- [ ] Use real real estate APIs (Zillow, Redfin)
- [ ] Historical data tracking
- [ ] Real-time price updates via WebSockets
- [ ] Multi-currency support

---

## Troubleshooting

### Servers Won't Start

**Issue:** Port already in use

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :5002

# Kill the process or change port in start script
```

### External Data Not Loading

**Issue:** Mock servers not running

**Solution:**
```bash
# Make sure all servers are running
npm run start:all

# Or check each server
curl http://localhost:5002/health
curl http://localhost:5003/health
curl http://localhost:5004/health
```

### Gold Price Shows Fallback

**Issue:** External gold API unavailable

**Solution:** This is expected for demo. The system uses a fallback price. For production, get an API key from:
- https://www.goldapi.io/
- https://metals-api.com/
- https://www.metals.dev/

---

## Summary

Your Quroosh app now has a **realistic financial data architecture with MongoDB backend**:

✅ **Bank Accounts** - Saudi banks (Al Rajhi, SNB, Riyad Bank) with SAR balances - Auto-fetched from MongoDB
✅ **Stocks** - Tadawul stocks (1120.SR, 2222.SR, 1010.SR, 4030.SR) - Auto-fetched from MongoDB
✅ **Crypto** - BTC, ETH, BNB, SOL portfolios - Auto-fetched from MongoDB
✅ **Real Estate** - 21 Saudi cities with location-based pricing - MongoDB-backed
✅ **Gold** - User enters amount, gets value from live prices
✅ **Cities Dropdown** - Frontend can fetch all available Saudi cities from database

This creates a **realistic financial management experience** with:
- **Database-backed mock servers** (no hardcoded data)
- **Saudi Arabian financial context** (SAR currency, Tadawul stocks)
- **Bilingual support** (Arabic/English city names)
- **Scalable architecture** (easy to add more cities or users)
