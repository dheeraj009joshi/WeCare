const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getAllOrders,
  getAllRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/foodDeliveryAdminController');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);

// Order Management
router.get('/orders', getAllOrders);

// Restaurant Management
router.get('/restaurants', getAllRestaurants);
router.post('/restaurants', createRestaurant);
router.put('/restaurants/:id', updateRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

// Menu Item Management
router.get('/restaurants/:restaurantId/menu-items', getMenuItems);
router.post('/restaurants/:restaurantId/menu-items', createMenuItem);
router.put('/menu-items/:id', updateMenuItem);
router.delete('/menu-items/:id', deleteMenuItem);

module.exports = router;
