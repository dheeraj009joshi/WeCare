const express = require('express');
const router = express.Router();

// Import controllers - Temporarily commented to isolate issue
// const productController = require('../controllers/productController');
// const cartController = require('../controllers/cartController');
// const orderController = require('../controllers/orderController');
// const addressController = require('../controllers/addressController');
// const paymentController = require('../controllers/paymentController');

// Import middleware - Temporarily commented
// const auth = require('../middleware/auth');

// Temporary simple routes for testing
router.get('/products', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Products endpoint working',
    products: [
      {
        id: 1,
        name: "Ashwagandha",
        price: 299,
        category: "Stress Relief",
        image: "/uploads/ayurvedic/ashwagandha.jpg"
      }
    ]
  });
});

// Admin routes - COMPLETELY REMOVED
// All admin functionality has been removed from the backend

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Medicine store API is working! (Admin panel removed)' });
});

// Seed products route (for manual seeding)
router.post('/seed-products', async (req, res) => {
  try {
    const { seedProducts } = require('../seeders/productSeeder');
    await seedProducts();
    res.json({ 
      success: true,
      message: 'Products seeded successfully!' 
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to seed products',
      error: error.message 
    });
  }
});

module.exports = router;
