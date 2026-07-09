const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true }
  },
  products: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      flavor: { type: String, required: true }
    }
  ],
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    default: 'Card / UPI'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
