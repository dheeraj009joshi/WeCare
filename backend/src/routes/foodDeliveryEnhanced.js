const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  syncRestaurants,
  syncMenuItems,
  saveCart,
  getSavedCart,
  saveOrder,
  getOrderHistory,
  processPayment,
  updateOrderStatus
} = require('../controllers/foodDeliveryEnhancedController');

// Data synchronization routes (works with your existing frontend data)
router.post('/sync/restaurants', syncRestaurants);
router.post('/sync/menu-items', syncMenuItems);

// Cart synchronization routes (for cross-device sync)
router.post('/cart/sync', auth, saveCart);
router.get('/cart/sync', auth, getSavedCart);

// Order persistence routes
router.post('/orders/save', auth, saveOrder);
router.get('/orders/history', auth, getOrderHistory);

// Payment processing routes
router.post('/payment/process', auth, processPayment);

// Order management routes (for admin/restaurant)
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;
