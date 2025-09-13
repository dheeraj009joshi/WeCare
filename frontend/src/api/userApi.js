import { authService } from '../services/authService';
import { AUTH_API } from '../config/api';
import api from '../config/api';

// Updated for FastAPI backend
const API_BASE = AUTH_API;

// Use the new auth service for login/register
export const loginUser = (credentials) => authService.login(credentials);
export const registerUser = (userData) => authService.register(userData);

// Logout (client-side only since FastAPI uses stateless JWT)
export const logoutUser = (token) => {
  // FastAPI doesn't need server-side logout for JWT tokens
  // Just clear client-side storage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  localStorage.removeItem('userType');
  localStorage.removeItem('loginTime');
  return Promise.resolve({ success: true });
};

// Profile endpoints (these may need to be implemented in FastAPI)
export const getUserProfile = (token) =>
  api.get(`${API_BASE}/profile`); // Token added automatically by interceptor

export const updateUserProfile = (token, data) =>
  api.put(`${API_BASE}/profile`, data); // Token added automatically by interceptor 