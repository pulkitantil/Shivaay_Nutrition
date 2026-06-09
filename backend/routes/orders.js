const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const db = require('../services/dbService');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// @route   GET api/orders
// @desc    Get all orders (admin only)
router.get('/', [authMiddleware, adminOnly], async (req, res) => {
  try {
    const ordersList = await db.orders.find();
    res.json(ordersList);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  }
});

const orderValidation = [
  body('customerDetails.name').notEmpty().withMessage('Customer name is required').trim(),
  body('customerDetails.phone').notEmpty().withMessage('Customer phone is required').trim(),
  body('products').isArray({ min: 1 }).withMessage('Order must contain at least one product'),
  body('amount').isFloat({ gt: 0 }).withMessage('Order amount must be greater than 0'),
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
  const { userId, customerDetails, products, amount, deliveryAddress, paymentMethod } = req.body;

  if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
    return res.status(400).json({ msg: 'Please provide customer name and phone details' });
  }

  if (!products || products.length === 0) {
    return res.status(400).json({ msg: 'Order cannot be created with empty products list' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ msg: 'Invalid order amount value' });
  }

  try {
    const newOrder = await db.orders.create({
      userId: userId || null,
      customerDetails,
      products,
      amount: parseFloat(amount),
      deliveryAddress: deliveryAddress || '',
      paymentMethod: paymentMethod || 'Card / UPI',
      status: 'Pending'
    });

    // Update Product Stock Levels & Availability Status
    for (let item of products) {
      const dbProduct = await db.products.findById(item.productId);
      if (dbProduct) {
        const newStock = Math.max(0, dbProduct.stock - item.quantity);
        let newStatus = dbProduct.status;
        if (newStock === 0) {
          newStatus = 'Out of Stock';
        } else if (newStock <= 3) {
          newStatus = 'Limited Stock';
        }
        await db.products.findByIdAndUpdate(item.productId, {
          stock: newStock,
          status: newStatus
        });
      }
    }

    res.json(newOrder);
  } catch (err) {
    console.error('Error placing order:', err);
    res.status(500).send('Server Error');
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
    res.status(500).send('Server Error');
  }
});

module.exports = router;
