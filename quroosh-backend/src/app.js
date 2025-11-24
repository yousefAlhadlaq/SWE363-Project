const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes Implement when routes are ready
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/categories', require('./routes/categoryRoutes'));
// app.use('/api/expenses', require('./routes/expenseRoutes'));
// app.use('/api/incomes', require('./routes/incomeRoutes'));
// app.use('/api/investments', require('./routes/investmentRoutes'));
// app.use('/api/budgets', require('./routes/budgetRoutes'));
// app.use('/api/goals', require('./routes/goalRoutes'));
// app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Basic error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;
