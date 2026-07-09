const express = require('express');
const router = express.Router();
const db = require('../services/dbService');

// @route   GET api/stats/public
// @desc    Get real-time public storefront statistics
router.get('/public', async (req, res) => {
  try {
    const products = await db.products.find();
    const orders = await db.orders.find();
    
    // 1. Calculate active products in stock
    const totalProducts = products.length;
    
    // 2. Calculate unique brands
    const uniqueBrands = new Set(products.map(p => p.brand));
    const totalBrands = uniqueBrands.size;
    
    // 3. Calculate unique customers (by customer name + phone)
    const uniqueCustomers = new Set(orders.map(o => `${o.customerDetails.name.trim().toLowerCase()}_${o.customerDetails.phone.trim()}`));
    const totalCustomers = uniqueCustomers.size;
    
    // 4. Calculate total non-cancelled orders
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalOrders = validOrders.length;
    
    res.json({
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      totalBrands: totalBrands || 0,
      totalOrders: totalOrders || 0
    });
  } catch (err) {
    console.error('Fetch public stats error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
