# Central Bank Mock Server API Documentation

## Overview
The Central Bank mock server simulates banking operations and stock portfolios for users in Saudi Arabia. It handles bank accounts from multiple Saudi banks, stock portfolios from Tadawul (Saudi Stock Exchange), and provides transaction history with billing information.

## Features

### ✅ Implemented Features

1. **User Bank Accounts**
   - Multiple bank accounts per user (1-5 random accounts)
   - Saudi banks: Al Rajhi, NCB, Riyad Bank, Samba, etc.
   - Account types: Checking, Savings, Investment, Business
   - Random balances: 1,000 - 50,000 SAR
   - Complete billing information with transaction history

2. **Stock Portfolios**
   - Random Saudi stocks (2-5 per user)
   - Real prices from Yahoo Finance
   - Historical prices for purchase dates
   - Brokerages: Al Rajhi Capital, SNB Capital, etc.

3. **Operations**
   - ✅ Deposits
   - ✅ Payments
   - ✅ Transfers (between accounts)
   - ✅ Buy stocks
   - ✅ Sell stocks

4. **Billing Information**
   - Transaction list with types (deposit, payment, transfer_in, transfer_out)
   - Total deposits
   - Total payments
   - Date and description for each transaction

5. **Notifications**
   - Automatic notification to main backend after each operation
   - Sends operation details for synchronization

## API Endpoints

### 1. Create User
**POST** `/api/create_user`

Creates random bank accounts and stock portfolios for a new user.

**Request:**
```json
{
  "userId": "USER_OBJECT_ID"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User accounts and portfolios created successfully",
  "data": {
    "userId": "USER_OBJECT_ID",
    "accounts": [
      {
        "bank": "Al Rajhi Bank",
        "accountNumber": "SA1234567890123456",
        "accountType": "Checking",
        "balance": 25000,
        "currency": "SAR"
      }
    ],
    "stocks": [
      {
        "symbol": "2222.SR",
        "name": "Saudi Aramco",
        "shares": 50,
        "purchasePrice": 32.50,
        "currentPrice": 35.20,
        "purchaseDate": "2023-05-15",
        "bank": "Al Rajhi Bank",
        "brokerage": "Al Rajhi Capital"
      }
    ]
  }
}
```

### 2. Get User Accounts
**GET** `/api/accounts/:userId`

Retrieves all bank accounts with billing information.

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": "ACCOUNT_ID",
      "bank": "Al Rajhi Bank",
      "accountNumber": "SA1234567890123456",
      "accountType": "Checking",
      "balance": 25000,
      "currency": "SAR",
      "billing": {
        "transactions": [
          {
            "type": "deposit",
            "amount": 5000,
            "description": "Salary",
            "date": "2025-11-20"
          }
        ],
        "totalDeposits": 10000,
        "totalPayments": 3000
      }
    }
  ],
  "totalBalance": 25000
}
```

### 3. Get User Stocks
**GET** `/api/stocks/:userId`

Retrieves stock portfolios grouped by brokerage.

**Response:**
```json
{
  "success": true,
  "portfolios": [
    {
      "bank": "Al Rajhi Bank",
      "brokerage": "Al Rajhi Capital",
      "stocks": [
        {
          "symbol": "2222.SR",
          "name": "Saudi Aramco",
          "shares": 50,
          "purchasePrice": 32.50,
          "currentPrice": 35.20,
          "purchaseDate": "2023-05-15",
          "currentValue": 1760,
          "investedValue": 1625,
          "gainLoss": 135,
          "gainLossPct": 8.31
        }
      ]
    }
  ],
  "summary": {
    "totalValue": 1760,
    "totalInvested": 1625,
    "totalGainLoss": 135,
    "gainLossPct": 8.31
  }
}
```

### 4. Perform Operation
**POST** `/api/perform_operation`

Executes banking or stock operations.

#### Deposit
```json
{
  "userId": "USER_ID",
  "operation_type": "deposit",
  "account_id": "ACCOUNT_ID",
  "amount": 5000,
  "description": "Salary payment"
}
```

#### Payment
```json
{
  "userId": "USER_ID",
  "operation_type": "payment",
  "account_id": "ACCOUNT_ID",
  "amount": 2000,
  "description": "Rent payment"
}
```

#### Transfer
```json
{
  "userId": "USER_ID",
  "operation_type": "transfer",
  "account_id": "FROM_ACCOUNT_ID",
  "to_account_id": "TO_ACCOUNT_ID",
  "amount": 3000,
  "description": "Transfer to savings"
}
```

#### Buy Stock
```json
{
  "userId": "USER_ID",
  "operation_type": "buy_stock",
  "stock_symbol": "2222.SR",
  "shares": 10,
  "account_id": "ACCOUNT_ID"
}
```

#### Sell Stock
```json
{
  "userId": "USER_ID",
  "operation_type": "sell_stock",
  "stock_symbol": "2222.SR",
  "shares": 5,
  "account_id": "ACCOUNT_ID"
}
```

**Response:**
```json
{
  "success": true,
  "account_id": "ACCOUNT_ID",
  "new_balance": 28000,
  "transaction_type": "deposit",
  "amount": 5000
}
```

### 5. Health Check
**GET** `/health`

Checks server status.

**Response:**
```json
{
  "service": "Central Bank API",
  "status": "operational",
  "database": "connected",
  "timestamp": "2025-11-27T10:00:00.000Z"
}
```

## Notification System

After each operation, the server automatically sends a notification to the main backend:

**POST** `http://localhost:5000/api/external/notify`

```json
{
  "userId": "USER_ID",
  "operation_type": "deposit",
  "account_id": "ACCOUNT_ID",
  "new_balance": 28000,
  "transaction_type": "deposit",
  "amount": 5000
}
```

## Saudi Banks Included

- Al Rajhi Bank
- National Commercial Bank (NCB)
- Riyad Bank
- Samba Financial Group
- Banque Saudi Fransi
- Arab National Bank
- Saudi British Bank (SABB)
- Alinma Bank
- Bank Al Jazira
- Bank Albilad

## Saudi Stocks (Tadawul)

- 2222.SR - Saudi Aramco
- 1120.SR - Al Rajhi Bank
- 1180.SR - National Commercial Bank
- 1010.SR - Riyad Bank
- 2030.SR - SABIC
- 2010.SR - SABIC Agri-Nutrients
- 4030.SR - Bahri
- 2380.SR - Petrochemical
- 2090.SR - SABIC Fertilizer
- 4280.SR - Kingdom Holding

## Environment Variables

```env
MONGODB_URI=mongodb://...
CENTRAL_BANK_PORT=5002
MAIN_BACKEND_URL=http://localhost:5000
```

## Running the Server

```bash
# Start the central bank server
npm run start:bank

# Or run all mock servers
npm run start:all
```

## Notes

- All stock prices are fetched from Yahoo Finance in real-time
- Historical prices are fetched based on actual purchase dates
- Transactions are automatically recorded in billing information
- All operations notify the main backend for synchronization
- No initial random operations - operations are triggered by API calls only
