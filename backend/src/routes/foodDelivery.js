const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getCategories,
  getRestaurants,
  getRestaurantById,
  getMenuItems,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder
} = require('../controllers/foodDeliveryController');

// Public routes
// Get all food categories
router.get('/categories', getCategories);

// Get all restaurants (with optional filters)
router.get('/restaurants', getRestaurants);

// Get restaurant by ID with menu items
router.get('/restaurants/:id', getRestaurantById);

// Get menu items for a specific restaurant
router.get('/restaurants/:restaurantId/menu', getMenuItems);

// Protected routes (require authentication)
// Cart management
router.post('/cart/add', auth, addToCart);
router.get('/cart', auth, getCart);
router.put('/cart/:id', auth, updateCartItem);
router.delete('/cart/:id', auth, removeFromCart);
router.delete('/cart', auth, clearCart);

// Order management
router.post('/orders', auth, createOrder);
router.get('/orders', auth, getUserOrders);
router.get('/orders/:id', auth, getOrderById);
router.put('/orders/:id/cancel', auth, cancelOrder);

module.exports = router;
