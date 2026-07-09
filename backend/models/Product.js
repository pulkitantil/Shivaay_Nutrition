const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['In Stock', 'Limited Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  ratings: {
    type: Number,
    default: 5.0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);
