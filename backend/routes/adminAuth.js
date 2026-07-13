const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/dbService');
const { sendOTPEmail } = require('../services/emailService');

const { otpLimiter } = require('../middleware/rateLimiters');

const JWT_SECRET = process.env.JWT_SECRET;
const getAdminEmails = () => {
  const envEmail = process.env.ADMIN_EMAIL || 'shivaaynutrition7@gmail.com';
  return envEmail.split(',').map(e => e.toLowerCase().trim());
};

const isAdminEmail = (email) => {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase().trim());
};

const Otp = require('../models/Otp');

// In-memory OTP storage fallback for local JSON DB mode
// Structure: { [email]: { otp, expiresAt, attempts, verified } }
const otpStore = {};

// In-memory Lockout storage fallback for local JSON DB mode
// Structure: { [email]: lockoutUntilTimestamp }
const lockoutStore = {};

// Helper: Check if account is currently locked out
const getLockoutTimeRemaining = async (email) => {
  if (db.getDbType() === 'mongo') {
    try {
      const otpDoc = await Otp.findOne({ email });
      if (otpDoc && otpDoc.lockoutUntil && otpDoc.lockoutUntil > new Date()) {
        return Math.ceil((otpDoc.lockoutUntil.getTime() - Date.now()) / 1000 / 60); // minutes
      }
    } catch (err) {
      console.error('Error checking lockout in MongoDB:', err);
    }
    return 0;
  }
  const lockoutUntil = lockoutStore[email];
  if (lockoutUntil && lockoutUntil > Date.now()) {
    return Math.ceil((lockoutUntil - Date.now()) / 1000 / 60); // minutes
  }
  return 0;
};

// @route   POST api/admin/check-email
// @desc    Validate admin email & determine if first-time or returning
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Please enter an email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Authorization check
  if (!isAdminEmail(normalizedEmail)) {
    return res.status(403).json({ msg: 'Access Denied: Not an authorized admin email address' });
  }

  // 2. Lockout check
  const minutesLeft = await getLockoutTimeRemaining(normalizedEmail);
  if (minutesLeft > 0) {
    return res.status(429).json({ 
      msg: `Account temporarily locked out. Please try again in ${minutesLeft} minute(s).` 
    });
  }

  try {
    // Check if user exists in DB by email
    let user = await db.users.findOne({ email: normalizedEmail });
    if (user) {
      // If user exists but is not admin, upgrade them
      if (user.role !== 'admin') {
        user = await db.users.findByIdAndUpdate(user.id || user._id, { role: 'admin' });
      }
    } else {
      // Create new admin user
      user = await db.users.create({
        name: 'Shivaay Admin',
        email: normalizedEmail,
        phone: process.env.OWNER_PHONE || '8295056962',
        role: 'admin'
      });
    }

    const isFirstTime = !user.password;

    if (isFirstTime) {
      // 3. Generate 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // 4. Save to temporary store (10 minute expiry)
      if (db.getDbType() === 'mongo') {
        await Otp.findOneAndUpdate(
          { email: normalizedEmail },
          { otp: generatedOtp, expiresAt, attempts: 0, verified: false },
          { upsert: true, new: true }
        );
      } else {
        otpStore[normalizedEmail] = {
          otp: generatedOtp,
          expiresAt: expiresAt.getTime(),
          attempts: 0,
          verified: false
        };
      }

      // 5. Send Email
      await sendOTPEmail(normalizedEmail, generatedOtp);

      return res.json({ 
        isFirstTime: true,
        msg: 'First-time setup: OTP code sent successfully. Check your email.' 
      });
    } else {
      return res.json({ 
        isFirstTime: false,
        msg: 'Welcome back: Please enter your administrator password.' 
      });
    }

  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/send-otp
// @desc    Validate admin email & send 6-digit OTP
router.post('/send-otp', otpLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Please enter an email address' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Authorization check
  if (!isAdminEmail(normalizedEmail)) {
    return res.status(403).json({ msg: 'Access Denied: Not an authorized admin email address' });
  }

  // 2. Lockout check
  const minutesLeft = await getLockoutTimeRemaining(normalizedEmail);
  if (minutesLeft > 0) {
    return res.status(429).json({ 
      msg: `Account temporarily locked out. Please try again in ${minutesLeft} minute(s).` 
    });
  }

  try {
    // Check if user exists in DB by email
    let user = await db.users.findOne({ email: normalizedEmail });
    if (user) {
      // If user exists but is not admin, upgrade them
      if (user.role !== 'admin') {
        user = await db.users.findByIdAndUpdate(user.id || user._id, { role: 'admin' });
      }
    } else {
      // Create new admin user
      user = await db.users.create({
        name: 'Shivaay Admin',
        email: normalizedEmail,
        phone: process.env.OWNER_PHONE || '8295056962',
        role: 'admin'
      });
    }

    // 3. Generate 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Save to temporary store (10 minute expiry)
    if (db.getDbType() === 'mongo') {
      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { otp: generatedOtp, expiresAt, attempts: 0, verified: false },
        { upsert: true, new: true }
      );
    } else {
      otpStore[normalizedEmail] = {
        otp: generatedOtp,
        expiresAt: expiresAt.getTime(),
        attempts: 0,
        verified: false
      };
    }

    // 5. Send Email
    await sendOTPEmail(normalizedEmail, generatedOtp);

    res.json({ msg: 'OTP sent successfully. Please check your email (or console log fallback).' });

  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/verify-otp
// @desc    Verify OTP and check password status (first-time vs returning)
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: 'Please enter email and OTP code' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Lockout check
  const minutesLeft = await getLockoutTimeRemaining(normalizedEmail);
  if (minutesLeft > 0) {
    return res.status(429).json({ 
      msg: `Account temporarily locked out. Please try again in ${minutesLeft} minute(s).` 
    });
  }

  let otpData;
  if (db.getDbType() === 'mongo') {
    otpData = await Otp.findOne({ email: normalizedEmail });
  } else {
    otpData = otpStore[normalizedEmail];
  }

  // 2. Validate OTP exists & is active
  const isExpired = !otpData || (db.getDbType() === 'mongo' ? otpData.expiresAt < new Date() : otpData.expiresAt < Date.now());
  if (isExpired) {
    return res.status(400).json({ msg: 'OTP has expired or is invalid. Please request a new code.' });
  }

  // 3. Match OTP
  if (otpData.otp !== otp.trim()) {
    const newAttempts = otpData.attempts + 1;

    if (newAttempts >= 3) {
      // Lockout admin for 10 minutes
      const lockoutUntil = new Date(Date.now() + 10 * 60 * 1000);
      if (db.getDbType() === 'mongo') {
        await Otp.findOneAndUpdate(
          { email: normalizedEmail },
          { lockoutUntil, expiresAt: lockoutUntil } // Keep document alive for lockout duration
        );
      } else {
        lockoutStore[normalizedEmail] = lockoutUntil.getTime();
        delete otpStore[normalizedEmail];
      }
      return res.status(429).json({
        msg: 'Too many incorrect OTP attempts. You have been locked out for 10 minutes.'
      });
    }

    if (db.getDbType() === 'mongo') {
      await Otp.findOneAndUpdate({ email: normalizedEmail }, { attempts: newAttempts });
    } else {
      otpData.attempts = newAttempts;
    }

    return res.status(400).json({
      msg: `Incorrect OTP code. ${3 - newAttempts} attempt(s) remaining.`
    });
  }

  try {
    // Find admin user
    const user = await db.users.findOne({ email: normalizedEmail, role: 'admin' });
    if (!user) {
      return res.status(404).json({ msg: 'Admin user not found' });
    }

    // Mark OTP as verified
    if (db.getDbType() === 'mongo') {
      await Otp.findOneAndUpdate({ email: normalizedEmail }, { verified: true });
    } else {
      otpData.verified = true;
    }

    // Check if password has ever been set
    const isFirstTime = !user.password;

    res.json({
      msg: 'OTP verified successfully.',
      isFirstTime
    });

  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/set-password
// @desc    Set password for first-time admin login (requires verified OTP)
router.post('/set-password', async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let otpData;
  if (db.getDbType() === 'mongo') {
    otpData = await Otp.findOne({ email: normalizedEmail });
  } else {
    otpData = otpStore[normalizedEmail];
  }

  // 1. Verify OTP is active and validated
  const isVerified = otpData && otpData.verified && otpData.otp === otp && (db.getDbType() === 'mongo' ? otpData.expiresAt >= new Date() : otpData.expiresAt >= Date.now());
  if (!isVerified) {
    return res.status(403).json({ msg: 'Unauthorized: OTP verification required' });
  }

  try {
    const user = await db.users.findOne({ email: normalizedEmail, role: 'admin' });
    if (!user) {
      return res.status(404).json({ msg: 'Admin user not found' });
    }

    // 2. Hash and save the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.users.findByIdAndUpdate(user.id, { password: hashedPassword });

    // Clean up OTP store
    if (db.getDbType() === 'mongo') {
      await Otp.deleteOne({ email: normalizedEmail });
    } else {
      delete otpStore[normalizedEmail];
    }

    // 3. Generate JWT and authenticate
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
    console.error('Set password error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/admin/login
// @desc    Authenticates returning admin (requires password check only, NO OTP)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Authorization check
  if (!isAdminEmail(normalizedEmail)) {
    return res.status(403).json({ msg: 'Access Denied: Not an authorized admin email address' });
  }

  try {
    const user = await db.users.findOne({ email: normalizedEmail, role: 'admin' });
    if (!user) {
      return res.status(404).json({ msg: 'Admin user not found' });
    }

    if (!user.password) {
      return res.status(400).json({ msg: 'No password configured yet. Please use setup password flow.' });
    }

    // 1. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid administrator password' });
    }

    // 2. Generate JWT and authenticate
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
    console.error('Admin password login error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
