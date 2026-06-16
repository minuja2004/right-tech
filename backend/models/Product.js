const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Laptops', 'Printers', 'CCTV & Security', 'Gadgets', 'IT Services', 'Flyers']
  },
  price: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0
  },
  allowKoko: {
    type: Boolean,
    default: true
  },
  selections: [
    {
      name: {
        type: String, // e.g. "Size", "Flavor"
        required: true
      },
      values: [
        {
          value: {
            type: String, // e.g. "1kg", "Strawberry"
            required: true
          },
          priceModifier: {
            type: Number,
            default: 0 // e.g. +1500 or 0
          }
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', ProductSchema);
