const express = require('express');
const router = express.Router();
const {
  createBooking,
  getAvailableSlots,
  getAppointmentById,
  getUserAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  getUserProfileForBooking
} = require('../controllers/bookingController');

// Create a new booking
router.post('/create', createBooking);

// Get available time slots for a doctor
router.get('/available-slots', getAvailableSlots);

// Get appointment by ID
router.get('/appointment/:id', getAppointmentById);

// Get user profile for booking form
router.get('/user-profile/:userId', getUserProfileForBooking);

// Get appointments for a user
router.get('/user/:userId', getUserAppointments);

// Cancel appointment
router.put('/cancel/:id', cancelAppointment);

// Update appointment status (for doctors)
router.put('/status/:id', updateAppointmentStatus);

module.exports = router; 