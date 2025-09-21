const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const {
  // Category Management
  getCategories,
  createCategory,
  updateCategory,
  
  // Restaurant Management
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  
  // Menu Item Management
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  
  // Cart Management
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  
  // Order Management
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  
  // Payment Processing
  processPayment,
  
  // Admin Dashboard
  getDashboardStats,
  getAllOrders,
  
  // Search and Filters
  search
} = require('../controllers/foodDeliveryCompleteController');

// ==================== PUBLIC ROUTES ====================

// Categories
router.get('/categories', getCategories);

// Restaurants
router.get('/restaurants', getRestaurants);
router.get('/restaurants/:id', getRestaurantById);

// Menu Items
router.get('/restaurants/:restaurantId/menu', getMenuItems);

// Search
router.get('/search', search);

// ==================== PROTECTED ROUTES (User Authentication Required) ====================

// Cart Management
router.post('/cart/add', auth, addToCart);
router.get('/cart', auth, getCart);
router.put('/cart/:id', auth, updateCartItem);
router.delete('/cart/:id', auth, removeFromCart);
router.delete('/cart', auth, clearCart);

// Order Management
router.post('/orders', auth, createOrder);
router.get('/orders', auth, getUserOrders);
router.get('/orders/:id', auth, getOrderById);
router.put('/orders/:id/cancel', auth, cancelOrder);

// Payment Processing
router.post('/payment/process', auth, processPayment);

// ==================== ADMIN ROUTES (Admin Authentication Required) ====================

// Category Management (Admin)
router.post('/admin/categories', adminAuth, createCategory);
router.put('/admin/categories/:id', adminAuth, updateCategory);

// Restaurant Management (Admin)
router.post('/admin/restaurants', adminAuth, createRestaurant);
router.put('/admin/restaurants/:id', adminAuth, updateRestaurant);

// Menu Item Management (Admin)
router.post('/admin/menu-items', adminAuth, createMenuItem);
router.put('/admin/menu-items/:id', adminAuth, updateMenuItem);

// Order Management (Admin)
router.put('/admin/orders/:id/status', adminAuth, updateOrderStatus);
router.get('/admin/orders', adminAuth, getAllOrders);

// Dashboard (Admin)
router.get('/admin/dashboard/stats', adminAuth, getDashboardStats);

module.exports = router;

