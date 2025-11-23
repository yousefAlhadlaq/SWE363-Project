# Quroosh Backend Implementation Plan

## Project Overview
This document outlines the backend implementation plan for the Quroosh Personal Finance Management Application using Node.js, Express.js, and MongoDB.

---

## Table of Contents
1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema Design](#database-schema-design)
4. [API Endpoints Specification](#api-endpoints-specification)
5. [Team Workload Distribution](#team-workload-distribution)
6. [10-Day Implementation Timeline](#10-day-implementation-timeline)
7. [Setup Instructions](#setup-instructions)

---

## Tech Stack

### Core Technologies
- **Runtime**: Node.js (v18.x or higher)
- **Framework**: Express.js (v4.x)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Validation**: express-validator or Joi
- **Environment**: dotenv
- **Security**: helmet, cors, express-rate-limit
- **File Upload**: multer (for reports/documents)
- **Email**: nodemailer (for verification emails)

### Development Tools
- **Linting**: ESLint (optional)
- **Process Manager**: PM2 (for production)

---

## Project Structure

```
quroosh-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── jwt.js               # JWT configuration
│   │   └── email.js             # Email service config
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Expense.js           # Expense schema
│   │   ├── Income.js            # Income schema
│   │   ├── Investment.js        # Investment schema
│   │   ├── Budget.js            # Budget schema
│   │   ├── Goal.js              # Financial goal schema
│   │   ├── Category.js          # Category schema
│   │   └── Advisor.js           # Financial advisor schema
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── expenseController.js # Expense operations
│   │   ├── incomeController.js  # Income operations
│   │   ├── investmentController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   ├── categoryController.js
│   │   ├── advisorController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── incomeRoutes.js
│   │   ├── investmentRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── goalRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── advisorRoutes.js
│   │   └── dashboardRoutes.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── validation.js        # Input validation
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── adminAuth.js         # Admin authorization
│   ├── utils/
│   │   ├── emailService.js      # Email sending utility
│   │   ├── tokenGenerator.js    # Token generation
│   │   ├── zakahCalculator.js   # Zakah calculation logic
│   │   └── validators.js        # Custom validators
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

---

## Database Schema Design

### 1. User Schema
```javascript
{
  _id: ObjectId,
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  phoneNumber: String,
  address: String,
  role: { type: String, enum: ['user', 'advisor', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  preferences: {
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'English' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    notifications: {
      transactionAlerts: { type: Boolean, default: true },
      budgetReminders: { type: Boolean, default: true },
      investmentUpdates: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 2. Category Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['expense', 'income'], required: true },
  color: String,
  icon: String,
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### 3. Expense Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  categoryId: { type: ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true, min: 0 },
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  merchant: String,
  paymentMethod: { type: String, enum: ['cash', 'card', 'transfer', 'pos'], default: 'cash' },
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 4. Income Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  categoryId: { type: ObjectId, ref: 'Category' },
  amount: { type: Number, required: true, min: 0 },
  source: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  isRecurring: { type: Boolean, default: false },
  recurringPeriod: { type: String, enum: ['weekly', 'biweekly', 'monthly', 'yearly'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5. Budget Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  categoryId: { type: ObjectId, ref: 'Category', required: true },
  limit: { type: Number, required: true, min: 0 },
  period: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, required: true },
  endDate: Date,
  alertThreshold: { type: Number, min: 0, max: 100, default: 80 }, // percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 6. Goal Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  savedAmount: { type: Number, default: 0, min: 0 },
  deadline: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 7. Investment Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ['Stock', 'Real Estate', 'Crypto', 'Gold', 'Bonds', 'Other'],
    required: true
  },
  // For stocks, crypto, gold
  amountOwned: Number,
  unitLabel: String, // shares, coins, oz
  // For real estate
  areaSqm: Number,
  // Common fields
  buyPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, required: true, min: 0 },
  purchaseDate: Date,
  notes: String,
  includeInZakah: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 8. Advisor Schema
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  specialization: [String],
  bio: String,
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalReviews: { type: Number, default: 0 },
  availability: {
    monday: { available: Boolean, hours: [String] },
    tuesday: { available: Boolean, hours: [String] },
    wednesday: { available: Boolean, hours: [String] },
    thursday: { available: Boolean, hours: [String] },
    friday: { available: Boolean, hours: [String] },
    saturday: { available: Boolean, hours: [String] },
    sunday: { available: Boolean, hours: [String] }
  },
  hourlyRate: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## API Endpoints Specification

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | User login | No |
| POST | `/verify-email` | Verify email with token | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/logout` | Logout user | Yes |
| GET | `/me` | Get current user info | Yes |

### User Management (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/preferences` | Update user preferences | Yes |
| DELETE | `/account` | Delete user account | Yes |
| GET | `/` | Get all users (admin) | Admin |
| PUT | `/:id/role` | Update user role (admin) | Admin |

### Expense Management (`/api/expenses`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all expenses (with filters) | Yes |
| GET | `/:id` | Get expense by ID | Yes |
| POST | `/` | Create new expense | Yes |
| PUT | `/:id` | Update expense | Yes |
| DELETE | `/:id` | Delete expense | Yes |
| GET | `/stats` | Get expense statistics | Yes |
| POST | `/bulk` | Create multiple expenses | Yes |

### Income Management (`/api/incomes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all incomes (with filters) | Yes |
| GET | `/:id` | Get income by ID | Yes |
| POST | `/` | Create new income | Yes |
| PUT | `/:id` | Update income | Yes |
| DELETE | `/:id` | Delete income | Yes |
| GET | `/stats` | Get income statistics | Yes |

### Budget Management (`/api/budgets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all budgets | Yes |
| GET | `/:id` | Get budget by ID | Yes |
| POST | `/` | Create new budget | Yes |
| PUT | `/:id` | Update budget | Yes |
| DELETE | `/:id` | Delete budget | Yes |
| GET | `/status` | Get budget status/alerts | Yes |

### Goal Management (`/api/goals`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all goals | Yes |
| GET | `/:id` | Get goal by ID | Yes |
| POST | `/` | Create new goal | Yes |
| PUT | `/:id` | Update goal | Yes |
| DELETE | `/:id` | Delete goal | Yes |
| PATCH | `/:id/progress` | Update goal progress | Yes |

### Category Management (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all categories | Yes |
| GET | `/:id` | Get category by ID | Yes |
| POST | `/` | Create new category | Yes |
| PUT | `/:id` | Update category | Yes |
| DELETE | `/:id` | Delete category | Yes |
| PATCH | `/:id/toggle` | Enable/disable category | Yes |

### Investment Management (`/api/investments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all investments | Yes |
| GET | `/:id` | Get investment by ID | Yes |
| POST | `/` | Create new investment | Yes |
| PUT | `/:id` | Update investment | Yes |
| DELETE | `/:id` | Delete investment | Yes |
| GET | `/portfolio` | Get portfolio summary | Yes |
| GET | `/zakah` | Calculate zakah on investments | Yes |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/overview` | Get dashboard overview | Yes |
| GET | `/financial-status` | Get financial status data | Yes |
| GET | `/recent-transactions` | Get recent transactions | Yes |
| GET | `/spending-breakdown` | Get spending breakdown | Yes |

### Advisor Management (`/api/advisors`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get all advisors | Yes |
| GET | `/:id` | Get advisor by ID | Yes |
| POST | `/` | Create advisor profile | Advisor |
| PUT | `/:id` | Update advisor profile | Advisor |
| DELETE | `/:id` | Delete advisor profile | Advisor |
| GET | `/:id/availability` | Get advisor availability | Yes |
| PUT | `/:id/availability` | Update availability | Advisor |

---

## Team Workload Distribution

### **Team Member 1: Authentication & User Management**

#### Responsibilities:
1. **Authentication System**
   - User registration with email validation
   - Login/logout functionality
   - JWT token generation and validation
   - Password hashing with bcrypt
   - Email verification system
   - Password recovery (forgot/reset password)
   - Refresh token mechanism

2. **User Management**
   - User profile CRUD operations
   - User preferences management
   - Account settings
   - User profile updates
   - Account deletion

#### Files to Create:
- `models/User.js`
- `controllers/authController.js`
- `controllers/userController.js`
- `routes/authRoutes.js`
- `routes/userRoutes.js`
- `middleware/auth.js`
- `middleware/adminAuth.js`
- `utils/emailService.js`
- `utils/tokenGenerator.js`
- `config/jwt.js`
- `config/email.js`

#### Deliverables:
- Working authentication system
- JWT middleware for protected routes
- Email verification system
- Password reset functionality
- User profile management endpoints
- Unit tests for auth and user routes

---

### **Team Member 2: Expense, Income & Category Management**

#### Responsibilities:
1. **Expense Management**
   - Create, read, update, delete expenses
   - Expense filtering (by date, category, amount)
   - Expense statistics and aggregations
   - Bulk expense creation
   - SMS parsing for expense entry

2. **Income Management**
   - Create, read, update, delete incomes
   - Income filtering and statistics
   - Recurring income tracking

3. **Category Management**
   - Create, read, update, delete categories
   - Category enable/disable functionality
   - Default categories seeding
   - Category-based spending analysis

#### Files to Create:
- `models/Expense.js`
- `models/Income.js`
- `models/Category.js`
- `controllers/expenseController.js`
- `controllers/incomeController.js`
- `controllers/categoryController.js`
- `routes/expenseRoutes.js`
- `routes/incomeRoutes.js`
- `routes/categoryRoutes.js`
- `utils/validators.js` (for expense/income validation)

#### Deliverables:
- Complete expense management system
- Income tracking functionality
- Category management system
- Filtering and search capabilities
- Statistics endpoints
- Unit tests for expense, income, and category routes

---

### **Team Member 3: Investment, Budget & Goal Management**

#### Responsibilities:
1. **Investment Management**
   - Create, read, update, delete investments
   - Support for multiple investment types (stocks, real estate, crypto, gold)
   - Portfolio value calculations
   - Performance tracking
   - Zakah calculation for investments
   - Investment category filtering

2. **Budget Management**
   - Create, read, update, delete budgets
   - Budget tracking and alerts
   - Budget vs actual spending comparison
   - Budget period management

3. **Goal Management**
   - Create, read, update, delete financial goals
   - Goal progress tracking
   - Goal status updates
   - Goal completion notifications

#### Files to Create:
- `models/Investment.js`
- `models/Budget.js`
- `models/Goal.js`
- `controllers/investmentController.js`
- `controllers/budgetController.js`
- `controllers/goalController.js`
- `routes/investmentRoutes.js`
- `routes/budgetRoutes.js`
- `routes/goalRoutes.js`
- `utils/zakahCalculator.js`

#### Deliverables:
- Investment tracking system
- Portfolio management endpoints
- Budget management system
- Goal tracking functionality
- Zakah calculation utility
- Unit tests for investment, budget, and goal routes

---

### **Team Member 4: Dashboard, Advisor Management & Integration**

#### Responsibilities:
1. **Dashboard Analytics**
   - Financial overview endpoint
   - Recent transactions aggregation
   - Spending breakdown by category
   - Financial status over time
   - Income vs expense trends
   - Monthly/weekly/yearly reports

2. **Advisor Management**
   - Advisor profile CRUD operations
   - Availability management
   - Advisor search and filtering
   - Advisor ratings and reviews

3. **Integration & Deployment**
   - API integration testing
   - Error handling middleware
   - Rate limiting
   - CORS configuration
   - Database connection setup
   - Environment configuration
   - API documentation
   - Deployment setup

#### Files to Create:
- `models/Advisor.js`
- `controllers/dashboardController.js`
- `controllers/advisorController.js`
- `routes/dashboardRoutes.js`
- `routes/advisorRoutes.js`
- `middleware/errorHandler.js`
- `middleware/rateLimiter.js`
- `middleware/validation.js`
- `config/database.js`
- `app.js`
- `server.js`
- `.env.example`
- `README.md` (backend documentation)

#### Deliverables:
- Dashboard analytics endpoints
- Advisor management system
- Complete middleware setup
- Database configuration
- Error handling system
- Rate limiting
- Backend documentation
- Integration tests
- Deployment configuration

---

## 10-Day Implementation Timeline

### Days 1-2: Setup & Foundation
- **All Team Members** (Day 1):
  - Set up project structure together
  - Install dependencies
  - Configure MongoDB Atlas
  - Set up development environment
  - Create `.env` file

- **Day 2 - Start Individual Work**:
  - **Team Member 1**: User model + basic auth setup
  - **Team Member 2**: Category model + Expense model
  - **Team Member 3**: Investment model + Budget model + Goal model
  - **Team Member 4**: Express app setup + all middleware

### Days 3-4: Core Authentication & CRUD
- **Team Member 1**:
  - Complete register, login, JWT middleware
  - User profile endpoints
- **Team Member 2**:
  - Category CRUD operations
  - Expense CRUD operations
- **Team Member 3**:
  - Investment CRUD operations
  - Budget CRUD operations
- **Team Member 4**:
  - Dashboard overview endpoint
  - Error handling middleware

### Days 5-6: Advanced Features
- **Team Member 1**:
  - Password reset (skip email verification for now)
  - User preferences update
- **Team Member 2**:
  - Income CRUD operations
  - Expense statistics endpoint
- **Team Member 3**:
  - Goal CRUD operations
  - Portfolio summary endpoint
  - Zakah calculation
- **Team Member 4**:
  - Dashboard financial status
  - Dashboard recent transactions
  - Advisor model + basic CRUD

### Days 7-8: Integration & Refinement
- **All Team Members** (collaborate):
  - Integrate all routes in app.js
  - Test endpoints with Postman
  - Fix integration bugs
  - Add input validation
  - Handle edge cases

### Days 9-10: Final Polish & Deployment
- **Day 9**:
  - Final bug fixes
  - API documentation (README)
  - Security review (check auth, validation)
  - Performance check (add indexes)

- **Day 10**:
  - Deploy to production (Railway/Heroku)
  - Frontend-backend integration
  - Final verification
  - Prepare demo

---

## Setup Instructions

### 1. Prerequisites
```bash
# Install Node.js (v18 or higher)
# Install MongoDB or set up MongoDB Atlas account
```

### 2. Create Backend Project
```bash
# Create project directory
mkdir quroosh-backend
cd quroosh-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express mongoose dotenv bcryptjs jsonwebtoken cors helmet express-validator nodemailer express-rate-limit multer

# Install dev dependencies
npm install --save-dev nodemon
```

### 3. Create Environment File
Create `.env` file:
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quroosh?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Email Service (using Gmail as example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@quroosh.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Update package.json Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

### 5. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create database user with password
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get connection string and add to `.env`

---

## Best Practices

### 1. Code Organization
- Use MVC pattern consistently
- Keep controllers thin, move business logic to services
- Use async/await for asynchronous operations
- Handle errors properly with try-catch

### 2. Security
- Never commit `.env` file
- Hash passwords before storing
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting
- Set proper CORS policies
- Sanitize database queries

### 3. Database
- Use indexes for frequently queried fields
- Validate data at schema level
- Use transactions for multi-document operations
- Implement soft deletes for important data

### 4. API Design
- Use RESTful conventions
- Return proper HTTP status codes
- Include pagination for list endpoints
- Version your API (e.g., `/api/v1/`)
- Provide meaningful error messages

### 5. Documentation
- Comment complex logic
- Document all API endpoints
- Keep README updated
- Document environment variables

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Solution**:
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas
- Check database user credentials

### Issue 2: CORS Errors
**Solution**:
```javascript
// Add in app.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 3: JWT Token Invalid
**Solution**:
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper token format in headers

---

## Additional Resources

### MongoDB Learning
- [MongoDB University](https://university.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Tutorial](https://www.mongodb.com/docs/atlas/getting-started/)

### Node.js & Express
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### Authentication
- [JWT.io](https://jwt.io/)
- [Passport.js](http://www.passportjs.org/)

---

## Support & Communication

### Team Communication
- Use GitHub Issues for bug tracking
- Use Pull Requests for code review
- Daily standups to discuss progress
- Weekly sprint reviews

### Code Review Checklist
- [ ] Code follows project structure
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Documentation updated
- [ ] No sensitive data exposed
- [ ] Code is properly commented

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building the Quroosh backend in 10 days. Each team member has clear responsibilities and deliverables. Follow the timeline, maintain code quality, communicate regularly, and focus on getting features working rather than perfect testing.

**Priority**: Working endpoints > Perfect code. Test manually with Postman as you build!

**Good luck with your implementation!** 🚀
