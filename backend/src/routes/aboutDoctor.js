const express = require('express');
const router = express.Router();
const {
  getAllDoctors,
  getDoctorDetails,
  getDoctorAvailability,
  bookAppointment
} = require('../controllers/aboutDoctorController');

console.log('AboutDoctor routes file loaded');

// Get all doctors for Services page
router.get('/', getAllDoctors);

// Get detailed doctor information for about doctor page
router.get('/:doctorId', getDoctorDetails);

// Get doctor availability for booking
router.get('/:doctorId/availability', getDoctorAvailability);

// Book appointment with doctor
router.post('/:doctorId/book', bookAppointment);

module.exports = router;