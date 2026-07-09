const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/dbService');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const getAdminEmails = () => {
  const envEmail = process.env.ADMIN_EMAIL || 'shivaaynutrition190@gmail.com';
  return envEmail.split(',').map(e => e.toLowerCase().trim());
};

const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase().trim());
};

// Register validation middleware
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  }
];

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', registerValidation, async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (isAdminEmail(normalizedEmail)) {
    return res.status(400).json({ msg: 'This email is reserved for administration and cannot be used as a customer account.' });
  }

  try {
    // Check for existing user
    let user = await db.users.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.users.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer' // default registration is always customer
    });

    // Create JWT
    const payload = { id: newUser.id, role: newUser.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      });
    });

  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Email already registered. Please login.' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all credentials' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (isAdminEmail(normalizedEmail)) {
    return res.status(400).json({ msg: 'This email is reserved for administration and cannot be used as a customer account.' });
  }

  try {
    // Check for user
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT
    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth/google
// @desc    OAuth/Google Sign-In logic
router.post('/google', async (req, res) => {
  const { name, email, googleId, imageUrl } = req.body;

  if (!email || !name) {
    return res.status(400).json({ msg: 'Google OAuth payload missing details' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (isAdminEmail(normalizedEmail)) {
    return res.status(400).json({ msg: 'This email is reserved for administration and cannot be used as a customer account.' });
  }

  try {
    let user = await db.users.findOne({ email });

    // If user does not exist, auto-register them
    if (!user) {
      const randomPass = Math.random().toString(36).substring(2, 12);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPass, salt);

      user = await db.users.create({
        name,
        email,
        phone: 'GoogleLogin',
        password: hashedPassword,
        role: 'customer'
      });
      console.log(`Auto-registered new Google OAuth user: ${email}`);
    }

    // Create JWT token
    const payload = { id: user.id, role: user.role };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d', algorithm: 'HS256' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    });

  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user details (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
