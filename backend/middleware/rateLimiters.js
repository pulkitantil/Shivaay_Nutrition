const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { msg: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { msg: 'Too many admin portal requests. Please try again after 15 minutes.' }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: { msg: 'Too many AI requests. Please try again after 15 minutes.' }
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { msg: 'Too many orders placed. Please try again after 15 minutes.' }
});

const productWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { msg: 'Too many product modifications. Please try again after 15 minutes.' }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per windowMs
  message: { msg: 'Too many OTP requests. Please try again after 15 minutes.' }
});

module.exports = {
  authLimiter,
  adminLimiter,
  aiLimiter,
  orderLimiter,
  productWriteLimiter,
  otpLimiter
};
