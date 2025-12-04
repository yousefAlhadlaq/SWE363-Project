# Quroosh - Personal Finance Management App

A comprehensive personal finance management application built with React and Node.js, featuring expense tracking, investment management, Zakat calculation, and financial advisory services.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication-api)
  - [Dashboard](#dashboard-api)
  - [Expenses](#expenses-api)
  - [Investments](#investments-api)
  - [Zakat](#zakat-api)
  - [Accounts](#accounts-api)
  - [Budgets](#budgets-api)
  - [Goals](#goals-api)
  - [Categories](#categories-api)
  - [Transactions](#transactions-api)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## Features

- **User Authentication**: Secure login, signup, password recovery, and email verification
- **Dashboard**: Overview of financial metrics and insights
- **Expense Tracking**: Categorize and track expenses with budget management
- **Income Management**: Record and monitor income sources
- **Investment Portfolio**: Track stocks, gold, crypto, and real estate investments
- **Zakat Calculator**: Calculate Islamic charitable obligations based on Nisab
- **Financial Advisory**: Connect with financial advisors
- **Reports & Export**: Generate and export financial reports (PDF/CSV)
- **Admin Panel**: User management and system administration
- **Theme Support**: Light and dark mode with customizable themes
- **Responsive Design**: Mobile-friendly interface

---

## Tech Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.2
- **Routing**: React Router DOM 6.26.2
- **Styling**: Tailwind CSS 3.4.15
- **Icons**: Lucide React 0.553.0

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1.0
- **Database**: MongoDB (Mongoose 9.0.0)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **API Integration**: Yahoo Finance, GoldAPI.io

---

## Architecture

The application consists of multiple services:

| Service | Port | Description |
|---------|------|-------------|
| **Main API** | 5001 | Core backend API for all operations |
| **Central Bank API** | 5002 | Mock service for external bank accounts, gold, and stocks |
| **Frontend** | 5173 | React application (Vite dev server) |

### External APIs Used
- **Yahoo Finance** - Real-time stock and cryptocurrency prices
- **Groq AI** - Real estate property valuations
- **GoldAPI.io** - Live gold prices (optional, has fallback)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: version 18.x or higher
- **npm**: version 8.x or higher
- **MongoDB**: Local instance or MongoDB Atlas connection string

To check your current versions:

```bash
node --version
npm --version
```

---

## Installation

### Frontend Setup

1. **Clone the repository**

```bash
git clone <repository-url>
cd quroosh-frontend
```

2. **Install frontend dependencies**

```bash
npm install
```

### Backend Setup

1. **Navigate to backend directory**

```bash
cd Guroosh-backend
```

2. **Install backend dependencies**

```bash
npm install
```

3. **Create environment file**

Create a `.env` file in the `Guroosh-backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/quroosh

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (for verification emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# External API Keys (optional)
GOLD_API_KEY=your-goldapi-key
ALPHA_VANTAGE_KEY=your-alpha-vantage-key

# Mock Server Ports
CENTRAL_BANK_PORT=5002
CRYPTO_PORT=5003
REAL_ESTATE_PORT=5004
```

4. **Start MongoDB**

Make sure MongoDB is running locally or update `MONGODB_URI` to your MongoDB Atlas connection string.

---

## Running the Application

### Start Backend (All Services)

From the `Guroosh-backend` directory:

```bash
# Start all servers (Main API + Mock Servers)
node start-all.js

# OR use npm script
npm run start:all
```

This starts:
- ⚡ Main API on port 5001
- 🏦 Central Bank API on port 5002
- ₿ Crypto Exchange API on port 5003
- 🏠 Real Estate API on port 5004

### Start Backend (Individual Services)

```bash
# Main API only
npm start

# With auto-reload (development)
npm run dev

# Individual mock servers
npm run start:bank      # Central Bank API
npm run start:crypto    # Crypto Exchange API
npm run start:realestate # Real Estate API
```

### Start Frontend

From the root `quroosh-frontend` directory:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Build for Production

```bash
# Frontend build
npm run build

# Preview production build
npm run preview
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Main API port (default: 5001) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for JWT token signing |
| `EMAIL_HOST` | No | SMTP server host |
| `EMAIL_USER` | No | SMTP username |
| `EMAIL_PASS` | No | SMTP password |
| `GOLD_API_KEY` | No | GoldAPI.io key for live gold prices |
| `ALPHA_VANTAGE_KEY` | No | Alpha Vantage key for stock data |

---

## API Documentation

**Base URL**: `http://localhost:5001/api`

All protected routes require an `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

### Authentication API

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+966501234567"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "isEmailVerified": false,
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isEmailVerified": true
  }
}
```

#### Update Profile (Protected)
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Smith",
  "phoneNumber": "+966509876543"
}
```

---

### Dashboard API

#### Get Dashboard Data (Protected)
```http
GET /api/dashboard
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "totalBalance": 15000.00,
    "monthlyIncome": 8000.00,
    "monthlyExpenses": 3500.00,
    "accounts": [
      {
        "id": "acc123",
        "bank": "Al Rajhi Bank",
        "accountName": "Savings",
        "balance": 15000.00
      }
    ],
    "latestUpdates": [
      {
        "id": "tx1",
        "merchant": "Grocery Store",
        "amount": 250.00,
        "status": "out",
        "timestamp": "2024-12-04T10:30:00Z"
      }
    ]
  }
}
```

#### Get Spending Statistics (Protected)
```http
GET /api/dashboard/stats
Authorization: Bearer <token>
```

---

### Expenses API

#### Get All Expenses (Protected)
```http
GET /api/expenses
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "exp123",
      "title": "Grocery Shopping",
      "amount": 350.00,
      "category": {
        "_id": "cat1",
        "name": "Food & Dining"
      },
      "date": "2024-12-04",
      "description": "Weekly groceries"
    }
  ]
}
```

#### Create Expense (Protected)
```http
POST /api/expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Restaurant Dinner",
  "amount": 150.00,
  "categoryId": "cat1",
  "date": "2024-12-04",
  "description": "Family dinner"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Expense created successfully",
  "expense": {
    "_id": "exp124",
    "title": "Restaurant Dinner",
    "amount": 150.00,
    "date": "2024-12-04"
  }
}
```

#### Update Expense (Protected)
```http
PUT /api/expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 175.00
}
```

#### Delete Expense (Protected)
```http
DELETE /api/expenses/:id
Authorization: Bearer <token>
```

---

### Investments API

#### Get All Investments (Protected)
```http
GET /api/investments
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "investments": [
    {
      "_id": "inv123",
      "name": "Apple Inc (AAPL)",
      "category": "Stock",
      "amountOwned": 10,
      "buyPrice": 150.00,
      "currentPrice": 175.50,
      "purchaseDate": "2024-01-15"
    },
    {
      "_id": "inv124",
      "name": "Gold Reserve",
      "category": "Gold",
      "amountOwned": 50,
      "unitLabel": "grams",
      "buyPrice": 65.00,
      "currentPrice": 72.00
    }
  ]
}
```

#### Create Investment (Protected)
```http
POST /api/investments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tesla Inc (TSLA)",
  "category": "Stock",
  "amountOwned": 5,
  "buyPrice": 250.00,
  "currentPrice": 275.00,
  "purchaseDate": "2024-12-01"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "investment": {
    "_id": "inv125",
    "name": "Tesla Inc (TSLA)",
    "category": "Stock",
    "amountOwned": 5,
    "buyPrice": 250.00,
    "currentPrice": 275.00
  }
}
```

#### Get Portfolio Summary (Protected)
```http
GET /api/investments/portfolio
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "portfolio": {
    "totalValue": 25000.00,
    "totalGain": 3500.00,
    "gainPercentage": 16.28,
    "breakdown": {
      "Stock": 15000.00,
      "Gold": 7500.00,
      "Crypto": 2500.00
    }
  }
}
```

---

### Zakat API

#### Calculate Zakat (Protected)
```http
POST /api/zakat/calculate
Authorization: Bearer <token>
Content-Type: application/json

{
  "cashAmount": 5000,
  "savingsAmount": 10000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "calculation": {
    "totalWealth": 45000.00,
    "nisabThreshold": 21000.00,
    "isZakatDue": true,
    "zakatAmount": 1125.00,
    "breakdown": {
      "cash": {
        "amount": 5000,
        "zakat": 125.00
      },
      "savings": {
        "amount": 10000,
        "zakat": 250.00
      },
      "stocks": {
        "amount": 15000,
        "zakat": 375.00
      },
      "gold": {
        "amount": 10000,
        "zakat": 250.00
      },
      "crypto": {
        "amount": 5000,
        "zakat": 125.00
      }
    },
    "goldPrice": {
      "pricePerGram": 250.00,
      "currency": "SAR"
    }
  }
}
```

#### Get Current Gold Price (Protected)
```http
GET /api/zakat/gold-price
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "goldPrice": {
    "pricePerGram": 250.00,
    "pricePerOunce": 7087.00,
    "currency": "SAR",
    "source": "GoldAPI.io",
    "lastUpdated": "2024-12-04T12:00:00Z"
  }
}
```

---

### Accounts API

#### Get All Accounts (Protected)
```http
GET /api/accounts
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "accounts": [
    {
      "_id": "acc123",
      "name": "Main Checking",
      "type": "checking",
      "balance": 5000.00,
      "isPrimary": true,
      "status": "active"
    }
  ]
}
```

#### Create Account (Protected)
```http
POST /api/accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Savings Account",
  "type": "savings",
  "initialBalance": 1000.00
}
```

#### Link External Account (Protected)
```http
POST /api/accounts/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankId": "1",
  "accountName": "Al Rajhi Savings",
  "initialDeposit": 5000.00
}
```

---

### Budgets API

#### Get All Budgets (Protected)
```http
GET /api/budgets
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "budgets": [
    {
      "_id": "bud123",
      "categoryId": "cat1",
      "limit": 2000.00,
      "period": "monthly",
      "spent": 1500.00,
      "status": {
        "percentage": 75,
        "state": "warning"
      }
    }
  ]
}
```

#### Create Budget (Protected)
```http
POST /api/budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoryId": "cat1",
  "limit": 3000.00,
  "period": "monthly"
}
```

---

### Goals API

#### Get All Goals (Protected)
```http
GET /api/goals
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "goals": [
    {
      "_id": "goal123",
      "name": "Emergency Fund",
      "targetAmount": 30000.00,
      "savedAmount": 15000.00,
      "deadline": "2025-06-01",
      "status": "active"
    }
  ]
}
```

#### Create Goal (Protected)
```http
POST /api/goals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Vacation Fund",
  "targetAmount": 10000.00,
  "savedAmount": 0,
  "deadline": "2025-08-01"
}
```

#### Update Goal Progress (Protected)
```http
PATCH /api/goals/:id/progress
Authorization: Bearer <token>
Content-Type: application/json

{
  "savedAmount": 5000.00
}
```

---

### Categories API

#### Get All Categories (Protected)
```http
GET /api/categories
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "cat1",
      "name": "Food & Dining",
      "type": "expense",
      "color": "#22d3ee",
      "icon": "🍽️",
      "isActive": true
    }
  ]
}
```

#### Create Category (Protected)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Entertainment",
  "type": "expense",
  "color": "#f43f5e",
  "icon": "🎬"
}
```

#### Toggle Category (Protected)
```http
PATCH /api/categories/:id/toggle
Authorization: Bearer <token>
```

---

### Transactions API

#### Get All Transactions (Protected)
```http
GET /api/transactions
Authorization: Bearer <token>
```

#### Create Manual Transaction (Protected)
```http
POST /api/transactions/manual
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 500.00,
  "category": "Shopping",
  "merchant": "Electronics Store",
  "accountId": "acc123",
  "date": "2024-12-04"
}
```

#### Transfer Between Accounts (Protected)
```http
POST /api/transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": "acc123",
  "toAccountId": "acc456",
  "amount": 1000.00,
  "description": "Monthly savings"
}
```

---

## Project Structure

```
quroosh-frontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── Admin/           # Admin panel
│   │   ├── Advisor/         # Financial advisor
│   │   ├── Auth/            # Authentication
│   │   ├── Dashboard/       # Dashboard
│   │   ├── Expenses/        # Expense tracking
│   │   ├── Investments/     # Investment management
│   │   └── Shared/          # Reusable components
│   ├── context/             # React context providers
│   ├── services/            # API service layer
│   ├── routes/              # Application routing
│   └── main.jsx             # Entry point
├── Guroosh-backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Business logic
│   │   └── server.js        # Express app entry
│   ├── mock-servers/        # External API mocks
│   │   ├── centralBankServer.js
│   │   ├── cryptoExchangeServer.js
│   │   └── realEstateServer.js
│   ├── start-all.js         # Multi-server launcher
│   └── package.json
└── README.md
```

---

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start main API server |
| `npm run dev` | Start with auto-reload |
| `npm run start:all` | Start all servers |
| `npm run start:bank` | Start Central Bank API |
| `npm run start:crypto` | Start Crypto Exchange API |
| `npm run start:realestate` | Start Real Estate API |
| `npm test` | Run tests |

---

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.

---

## Support

For support, please open an issue in the repository or contact the development team.
