import axios from "axios";

const API_BASE = "http://localhost:8000/api/auth";

export const loginUser = (formData) =>
  axios.post(`${API_BASE}/login`, formData);

export const logoutUser = (token) =>
  axios.post(`${API_BASE}/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export const getUserProfile = (token) =>
  axios.get(`${API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateUserProfile = (token, data) =>
  axios.put(`${API_BASE}/profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const registerUser = (formData) =>
  axios.post(`${API_BASE}/register`, formData); 