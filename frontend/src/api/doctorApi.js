import { authService } from '../services/authService';
import { AUTH_API, APPOINTMENTS_API, CHAT_API } from '../config/api';
import api from '../config/api';

// Updated for FastAPI backend
const API_BASE = AUTH_API;
const DOCTOR_API_BASE = "http://localhost:4000/api"; // Base for doctor-specific endpoints

// Authentication - Use new auth service
export const loginDoctor = (credentials) => authService.doctorLogin(credentials);
export const registerDoctor = (doctorData) => authService.doctorRegister(doctorData);

// Profile endpoints (may need to be implemented in FastAPI)
export const getDoctorProfile = (token) =>
  api.get(`${API_BASE}/doctor/profile`); // Token added automatically

export const updateDoctorProfile = (token, data) =>
  api.put(`${API_BASE}/doctor/profile`, data); // Token added automatically

// Dashboard stats (may need to be implemented in FastAPI)
export const getDashboardStats = (token) =>
  api.get(`${DOCTOR_API_BASE}/admin/dashboard/stats`); // Token added automatically

// Appointments - Use new appointments API
export const getAppointments = (token, params = {}) =>
  api.get(`${APPOINTMENTS_API}/doctor`, { params }); // Token added automatically

export const updateAppointmentStatus = (token, appointmentId, data) =>
  api.put(`${APPOINTMENTS_API}/${appointmentId}`, data); // Token added automatically

// Patient management (may need to be implemented)
export const getPatients = (token, params = {}) =>
  api.get(`${DOCTOR_API_BASE}/admin/patients`, { params }); // Token added automatically

// Messages - Use new chat API
export const getMessages = (token, params = {}) =>
  api.get(`${CHAT_API}/doctor/messages`, { params }); // Token added automatically

export const sendMessage = (token, data) =>
  api.post(`${CHAT_API}/doctor/messages`, data); // Token added automatically

export const markMessagesAsRead = (token, patientId) =>
  api.put(`${CHAT_API}/messages/read/${patientId}`, {}); // Token added automatically

// Doctor availability
export const getAvailability = (token) =>
  api.get(`${APPOINTMENTS_API}/doctor/availability`); // Token added automatically

export const updateAvailability = (token, data) =>
  api.post(`${APPOINTMENTS_API}/doctor/availability`, data); // Token added automatically

// Earnings (may need to be implemented)
export const getEarnings = (token, params = {}) =>
  api.get(`${DOCTOR_API_BASE}/admin/doctor/earnings`, { params }); // Token added automatically 