import axios from "axios";

const API_BASE = "http://localhost:8000/api/auth/doctor";
const DOCTOR_API_BASE = "http://localhost:8000/api/doctor";

// Authentication
export const loginDoctor = (formData) =>
  axios.post(`${API_BASE}/login`, formData);

export const registerDoctor = (formData) =>
  axios.post(`${API_BASE}/register`, formData);

export const getDoctorProfile = (token) =>
  axios.get(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateDoctorProfile = (token, data) =>
  axios.put(`${API_BASE}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Dashboard
export const getDashboardStats = (token) =>
  axios.get(`${DOCTOR_API_BASE}/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAppointments = (token, params = {}) =>
  axios.get(`${DOCTOR_API_BASE}/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

export const updateAppointmentStatus = (token, appointmentId, data) =>
  axios.put(`${DOCTOR_API_BASE}/appointments/${appointmentId}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getPatients = (token, params = {}) =>
  axios.get(`${DOCTOR_API_BASE}/patients`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

export const getMessages = (token, params = {}) =>
  axios.get(`${DOCTOR_API_BASE}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });

export const sendMessage = (token, data) =>
  axios.post(`${DOCTOR_API_BASE}/messages`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const markMessagesAsRead = (token, patientId) =>
  axios.put(`${DOCTOR_API_BASE}/messages/read/${patientId}`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getAvailability = (token) =>
  axios.get(`${DOCTOR_API_BASE}/availability`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateAvailability = (token, data) =>
  axios.put(`${DOCTOR_API_BASE}/availability`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getEarnings = (token, params = {}) =>
  axios.get(`${DOCTOR_API_BASE}/earnings`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  }); 