const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate a unique Order ID
const generateOrderId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to optionally retrieve user from token (handles both guest & logged in checkout)
const getOptionalUser = async (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return await User.findById(decoded.id);
  } catch (err) {
    return null;
  }
};

// @desc    Create new order (checkout)
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { items, shippingDetails, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Try to associate with user if logged in
    const user = await getOptionalUser(req);

    // Verify stock and calculate total price
    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product ${item.name} not found` });
      }

      // Check stock
      if (dbProduct.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${dbProduct.name}. Available: ${dbProduct.stock}`
        });
      }

      // Calculate the specific item price based on base price and selected option modifiers
      let itemPrice = dbProduct.price;
      if (item.selectedOptions) {
        // Iterate through selected options
        Object.entries(item.selectedOptions).forEach(([optName, optVal]) => {
          const productOpt = dbProduct.selections.find(
            (s) => s.name.toLowerCase() === optName.toLowerCase()
          );
          if (productOpt) {
            const valObj = productOpt.values.find(
              (v) => v.value.toLowerCase() === optVal.toLowerCase()
            );
            if (valObj) {
              itemPrice += valObj.priceModifier;
            }
          }
        });
      }

      totalAmount += itemPrice * item.quantity;
      processedItems.push({
        product: item.product,
        name: dbProduct.name,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions,
        price: itemPrice
      });

      // Deduct stock
      dbProduct.stock -= item.quantity;
      await dbProduct.save();
    }

    // Create the order
    const order = await Order.create({
      orderId: generateOrderId(),
      user: user ? user._id : null,
      items: processedItems,
      totalAmount,
      shippingDetails,
      paymentMethod,
      paymentStatus: paymentMethod === 'Card Payment' ? 'Paid' : 'Pending'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all orders (admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update order statuses (admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { paymentStatus, shippingStatus } = req.body;
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updates = {};
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (shippingStatus) updates.shippingStatus = shippingStatus;

    order = await Order.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
