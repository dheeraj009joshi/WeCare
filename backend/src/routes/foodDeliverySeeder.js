const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const {
  seedCategories,
  seedRestaurants,
  seedMenuItems,
  seedAll,
  clearAll,
  getSeedingStatus
} = require('../controllers/foodDeliverySeederController');

// ==================== SEEDER ROUTES ====================

// Get seeding status (public)
router.get('/status', getSeedingStatus);

// Seed individual components (admin only)
router.post('/categories', adminAuth, seedCategories);
router.post('/restaurants', adminAuth, seedRestaurants);
router.post('/menu-items', adminAuth, seedMenuItems);

// Seed all data at once (admin only)
router.post('/all', adminAuth, seedAll);

// Clear all data (admin only)
router.delete('/all', adminAuth, clearAll);

module.exports = router;

