const express = require('express');
const router = express.Router();
const {
  registerDoctor,
  loginDoctor,
  getDoctorProfile,
  getDoctorProfileById,
  getAllDoctors,
  getDoctorStatistics,
  getDoctorAvailability,
  getDoctorEarnings,
  getDoctorAppointments,
  updateDoctorProfile,
  updateDoctorProfilePicture,
  updateDoctorSpecializations,
  updateDoctorCertificates,
  updateDoctorAvailability,
  updateDoctorStatus,
  updateAppointmentStatus,
  updateDoctorVerificationStatus,
  deleteDoctorSpecialization,
  deleteDoctorCertificate,
  deleteDoctor,
  forgotPassword,
  resetPassword
} = require('../controllers/doctorAuthController');
const doctorAuth = require('../middleware/doctorAuth');

// Public routes
router.post('/register', registerDoctor);
router.post('/login', loginDoctor);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', doctorAuth, getDoctorProfile);
router.get('/profile/:id', doctorAuth, getDoctorProfileById);
router.get('/all', doctorAuth, getAllDoctors);
router.get('/statistics', doctorAuth, getDoctorStatistics);
router.get('/profile/:id/availability', doctorAuth, getDoctorAvailability);
router.get('/profile/availability', doctorAuth, getDoctorAvailability);
router.get('/profile/earnings', doctorAuth, getDoctorEarnings);
router.get('/profile/appointments', doctorAuth, getDoctorAppointments);
router.put('/profile', doctorAuth, updateDoctorProfile);
router.put('/profile/picture', doctorAuth, updateDoctorProfilePicture);
router.put('/profile/specializations', doctorAuth, updateDoctorSpecializations);
router.put('/profile/certificates', doctorAuth, updateDoctorCertificates);
router.put('/profile/availability', doctorAuth, updateDoctorAvailability);
router.put('/profile/status', doctorAuth, updateDoctorStatus);
router.put('/appointments/:appointmentId/status', doctorAuth, updateAppointmentStatus);
router.put('/profile/:id/verify', doctorAuth, updateDoctorVerificationStatus);
router.delete('/profile/specialization', doctorAuth, deleteDoctorSpecialization);
router.delete('/profile/certificate', doctorAuth, deleteDoctorCertificate);
router.delete('/profile/:id', doctorAuth, deleteDoctor);

module.exports = router; 