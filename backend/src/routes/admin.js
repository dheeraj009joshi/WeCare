const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// Import admin controllers
const adminDashboardController = require('../controllers/adminDashboardController');
const adminDoctorsController = require('../controllers/adminDoctorsController');
const adminMedicineStoreController = require('../controllers/adminMedicineStoreController');

// Apply admin authentication middleware to all routes
router.use(adminAuth);

// Dashboard routes
router.get('/dashboard/stats', adminDashboardController.getDashboardStats);
router.get('/dashboard/running-appointments', adminDashboardController.getRunningAppointments);
router.get('/dashboard/scheduled-appointments', adminDashboardController.getScheduledAppointments);

// Patients management routes
router.get('/patients', adminDashboardController.getPatients);

// Doctors management routes
router.get('/doctors', adminDoctorsController.getDoctors);
router.post('/doctors', adminDoctorsController.addDoctor);
router.get('/doctors/:id', adminDoctorsController.getDoctorDetails);
router.put('/doctors/:id/status', adminDoctorsController.updateDoctorStatus);
router.delete('/doctors/:id', adminDoctorsController.deleteDoctor);
router.get('/doctors/summary/active', adminDoctorsController.getActiveDoctorsSummary);

// Medicine store routes
router.get('/products', adminMedicineStoreController.getProducts);
router.post('/products', adminMedicineStoreController.addProduct);
router.get('/products/:id', adminMedicineStoreController.getProductDetails);
router.put('/products/:id', adminMedicineStoreController.updateProduct);
router.delete('/products/:id', adminMedicineStoreController.deleteProduct);
router.put('/products/:id/stock', adminMedicineStoreController.updateProductStock);
router.get('/products/categories', adminMedicineStoreController.getProductCategories);
router.get('/products/low-stock', adminMedicineStoreController.getLowStockProducts);
router.put('/products/:id/toggle-status', adminMedicineStoreController.toggleProductStatus);

module.exports = router;
