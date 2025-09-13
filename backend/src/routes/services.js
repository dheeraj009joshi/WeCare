const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getDoctorsByService,
  getAllSpecializations,
  getDoctorsBySpecialization,
  searchDoctors
} = require('../controllers/servicesController');

// Public routes (no authentication required)
router.get('/', getAllServices);
router.get('/specializations', getAllSpecializations);
router.get('/doctors', getDoctorsBySpecialization);
router.get('/doctors/search', searchDoctors);
router.get('/:serviceId/doctors', getDoctorsByService);

module.exports = router; 