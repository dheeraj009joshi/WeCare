const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAppointments,
  updateAppointmentStatus,
  getPatients,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getAvailability,
  updateAvailability,
  getEarnings
} = require('../controllers/doctorDashboardController');
const doctorAuth = require('../middleware/doctorAuth');

// Apply doctor authentication to all routes
router.use(doctorAuth);

// Dashboard Stats
router.get('/stats', getDashboardStats);

// Appointments
router.get('/appointments', getAppointments);
router.put('/appointments/:appointmentId', updateAppointmentStatus);

// Patients
router.get('/patients', getPatients);

// Messages
router.get('/messages', getMessages);
router.post('/messages', sendMessage);
router.put('/messages/read/:patientId', markMessagesAsRead);

// Availability
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);

// Earnings
router.get('/earnings', getEarnings);

module.exports = router; 