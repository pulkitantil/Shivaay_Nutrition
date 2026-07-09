const express = require('express');
const router = express.Router();
const db = require('../services/dbService');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { productWriteLimiter } = require('../middleware/rateLimiters');

// @route   GET api/products
// @desc    Get all products
router.get('/', async (req, res) => {
  try {
    const productsList = await db.products.find();
    res.json(productsList);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   GET api/products/:id
// @desc    Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.products.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/products
// @desc    Create product (admin only)
router.post('/', [authMiddleware, adminOnly, productWriteLimiter], async (req, res) => {
  const { name, brand, category, description, image, price, discount, stock, status } = req.body;

  if (!name || !brand || !category || !description || !image || !price) {
    return res.status(400).json({ msg: 'Please provide all required product details' });
  }

  try {
    const newProduct = await db.products.create({
      name,
      brand,
      category,
      description,
      image,
      price: parseFloat(price),
      discount: discount ? parseFloat(discount) : 0,
      stock: stock ? parseInt(stock) : 10,
      status: status || 'In Stock'
    });
    res.json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/products/:id
// @desc    Update product (admin only)
router.put('/:id', [authMiddleware, adminOnly, productWriteLimiter], async (req, res) => {
  const allowedFields = ['name', 'brand', 'category', 'description', 'image', 'price', 'discount', 'stock', 'status'];
  const updateData = {};
  for (let key of allowedFields) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }

  try {
    const updated = await db.products.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) return res.status(404).json({ msg: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/products/:id
// @desc    Delete product (admin only)
router.delete('/:id', [authMiddleware, adminOnly, productWriteLimiter], async (req, res) => {
  try {
    const deleted = await db.products.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: 'Product not found' });
    res.json({ msg: 'Product successfully removed from database catalogue' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
