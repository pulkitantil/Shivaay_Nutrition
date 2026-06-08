require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB, getDbType } = require('./services/dbService');

const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for specific frontend URL
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { msg: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { msg: 'Too many admin portal requests. Please try again after 15 minutes.' }
});

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
app.use('/api/orders', require('./routes/orders'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', require('./routes/ai'));

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
