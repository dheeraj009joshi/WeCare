const express = require('express');
const router = express.Router();
const footerController = require('../controllers/footerController');

// Public routes
router.post('/newsletter/subscribe', footerController.subscribeNewsletter);
router.get('/newsletter/unsubscribe/:email', footerController.unsubscribeNewsletter);
router.post('/contact', footerController.submitContact);
router.get('/content', footerController.getFooterContent);

// Admin routes - COMPLETELY REMOVED
// All admin functionality has been removed from the backend

module.exports = router;
