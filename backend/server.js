require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { initDB, getDbType } = require('./services/dbService');

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the environment variables.');
  process.exit(1);
}

const app = express();

// Apply secure headers and response compression
app.use(helmet());
app.use(compression());

const PORT = process.env.PORT || 5000;

// Enable CORS for specific frontend URL
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiters
const {
  authLimiter,
  adminLimiter,
  aiLimiter,
  orderLimiter
} = require('./middleware/rateLimiters');

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB (Mongoose MongoDB / Local JSON Fallback)
initDB();

// Test Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: getDbType(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/admin', adminLimiter, require('./routes/adminAuth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', orderLimiter, require('./routes/orders'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', aiLimiter, require('./routes/ai'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ msg: 'Something went wrong on the server!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Shivaay Nutrition Backend API running on port ${PORT}`);
  console.log(`Database engine is set to: [${getDbType().toUpperCase()}]`);
});
