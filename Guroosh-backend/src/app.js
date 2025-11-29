const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

// Middleware
// CORS must come before helmet to ensure headers are set correctly
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Configure helmet to not interfere with CORS
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/advisors', require('./routes/advisorRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/investments', require('./routes/investmentRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/external', require('./routes/externalDataRoutes'));
app.use('/api/cities', require('./routes/cityRoutes'));
app.use('/api/stocks', require('./routes/stockRoutes'));
app.use('/api/real-estate', require('./routes/realEstateRoutes'));
app.use('/api/gold', require('./routes/goldRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res, next) => {
  console.log('❌ 404 Not Found:', {
    method: req.method,
    url: req.url,
    path: req.path,
    originalUrl: req.originalUrl,
    headers: req.headers
  });
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!' 
  });
});

module.exports = app;
