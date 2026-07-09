const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();
const db = require('../services/dbService');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;

// @route   GET api/orders
// @desc    Get all orders (admin only)
router.get('/', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const ordersList = await db.orders.find();
    res.json(ordersList);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/orders/my-orders
// @desc    Get orders of logged in user (auth only)
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const ordersList = await db.orders.findByUser(req.user.id);
    res.json(ordersList);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

const orderValidation = [
  body('customerDetails.name').notEmpty().withMessage('Customer name is required').trim(),
  body('customerDetails.phone').notEmpty().withMessage('Customer phone is required').trim(),
  body('products').isArray({ min: 1 }).withMessage('Order must contain at least one product'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  }
];

// @route   POST api/orders
// @desc    Create new order (guest or registered customer)
router.post('/', orderValidation, async (req, res) => {
  const { userId, customerDetails, products, deliveryAddress, paymentMethod } = req.body;

  if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
    return res.status(400).json({ msg: 'Please provide customer name and phone details' });
  }

  if (!products || products.length === 0) {
    return res.status(400).json({ msg: 'Order cannot be created with empty products list' });
  }

  // Decode JWT if Authorization header is present
  const authHeader = req.header('Authorization');
  let tokenUser = null;
  if (authHeader) {
    const tokenParts = authHeader.split(' ');
    const token = tokenParts.length === 2 ? tokenParts[1] : authHeader;
    try {
      tokenUser = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
      // Ignore invalid token
    }
  }

  // Bind and validate user ownership
  const finalUserId = tokenUser ? tokenUser.id : (userId || null);
  if (userId && tokenUser && tokenUser.id !== userId) {
    return res.status(403).json({ msg: 'Unauthorized: Cannot place order for another user account.' });
  }

  try {
    let calculatedAmount = 0;
    const verifiedProducts = [];

    for (let item of products) {
      if (!item.productId) {
        return res.status(400).json({ msg: 'Product ID is required for all ordered items.' });
      }

      // Validate product ID is valid MongoDB ObjectId if database type is mongo
      if (db.getDbType() === 'mongo') {
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          return res.status(400).json({ msg: `Invalid Product ID format: ${item.productId}` });
        }
      }

      // Validate quantities (positive integer, non-zero, non-negative, sensible size <= 100)
      const quantity = Number(item.quantity);
      if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 100) {
        return res.status(400).json({ msg: 'Quantity must be a positive integer (max 100 per item).' });
      }

      // Fetch product from DB
      const dbProduct = await db.products.findById(item.productId);
      if (!dbProduct) {
        return res.status(400).json({ msg: `Product not found: ${item.name || item.productId}` });
      }

      // Validate available stock
      if (dbProduct.stock < quantity) {
        return res.status(400).json({ msg: `Insufficient stock for ${dbProduct.name}. Available: ${dbProduct.stock}` });
      }

      // Calculate subtotal
      calculatedAmount += dbProduct.price * quantity;

      // Build verified product object (ignoring any client-provided price or name modifications)
      verifiedProducts.push({
        productId: item.productId,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity,
        flavor: item.flavor || 'Double Rich Chocolate'
      });
    }

    // Calculate discounts if applicable (none for now)
    const discount = 0;
    const finalAmount = calculatedAmount - discount;

    // Create the order in database
    const newOrder = await db.orders.create({
      userId: finalUserId,
      customerDetails,
      products: verifiedProducts,
      amount: finalAmount,
      deliveryAddress: deliveryAddress || '',
      paymentMethod: paymentMethod || 'Card / UPI',
      status: 'Pending'
    });

    // Atomically update product stock levels and status in database
    for (let item of verifiedProducts) {
      await db.products.deductStock(item.productId, item.quantity);
    }

    res.json(newOrder);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status (admin only)
router.put('/:id/status', [authMiddleware, adminOnly], async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ msg: 'Please provide a valid status code' });
  }

  try {
    if (status === 'Cancelled') {
      const deleted = await db.orders.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ msg: 'Order not found' });
      return res.json({ msg: 'Order cancelled and removed.' });
    }

    const updated = await db.orders.findByIdAndUpdateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ msg: 'Order not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
