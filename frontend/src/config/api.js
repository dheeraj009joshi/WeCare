import axios from 'axios';

// API Configuration - Updated for FastAPI Backend
const config = {
  // Development
  development: {
    API_BASE_URL: 'http://localhost:4000/api',
    AUTH_API: 'http://localhost:4000/api/auth',
    MEDICINE_STORE_API: 'http://localhost:4000/api/medicine-store',
    APPOINTMENTS_API: 'http://localhost:4000/api/appointments',
    DOCTORS_API: 'http://localhost:4000/api/doctors',
    FOOD_DELIVERY_API: 'http://localhost:4000/api/food-delivery',
    CHAT_API: 'http://localhost:4000/api/chat',
    EMERGENCY_API: 'http://localhost:4000/api/emergency',
    SERVICES_API: 'http://localhost:4000/api/services',
    CONTACT_API: 'http://localhost:4000/api/contact',
    ADMIN_API: 'http://localhost:4000/api/admin'
  },
  
  // Production
  production: {
    API_BASE_URL: 'https://your-production-domain.com/api',
    AUTH_API: 'https://your-production-domain.com/api/auth',
    MEDICINE_STORE_API: 'https://your-production-domain.com/api/medicine-store',
    APPOINTMENTS_API: 'https://your-production-domain.com/api/appointments',
    DOCTORS_API: 'https://your-production-domain.com/api/doctors',
    FOOD_DELIVERY_API: 'https://your-production-domain.com/api/food-delivery',
    CHAT_API: 'https://your-production-domain.com/api/chat',
    EMERGENCY_API: 'https://your-production-domain.com/api/emergency',
    SERVICES_API: 'https://your-production-domain.com/api/services',
    CONTACT_API: 'https://your-production-domain.com/api/contact',
    ADMIN_API: 'https://your-production-domain.com/api/admin'
  },
  
  // Staging
  staging: {
    API_BASE_URL: 'https://your-staging-domain.com/api',
    AUTH_API: 'https://your-staging-domain.com/api/auth',
    MEDICINE_STORE_API: 'https://your-staging-domain.com/api/medicine-store',
    APPOINTMENTS_API: 'https://your-staging-domain.com/api/appointments',
    DOCTORS_API: 'https://your-staging-domain.com/api/doctors',
    FOOD_DELIVERY_API: 'https://your-staging-domain.com/api/food-delivery',
    CHAT_API: 'https://your-staging-domain.com/api/chat',
    EMERGENCY_API: 'https://your-staging-domain.com/api/emergency',
    SERVICES_API: 'https://your-staging-domain.com/api/services',
    CONTACT_API: 'https://your-staging-domain.com/api/contact',
    ADMIN_API: 'https://your-staging-domain.com/api/admin'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export current config
export const apiConfig = config[environment];

// Export individual values for convenience
export const API_BASE_URL = apiConfig.API_BASE_URL;
export const AUTH_API = apiConfig.AUTH_API;
export const MEDICINE_STORE_API = apiConfig.MEDICINE_STORE_API;
export const APPOINTMENTS_API = apiConfig.APPOINTMENTS_API;
export const DOCTORS_API = apiConfig.DOCTORS_API;
export const FOOD_DELIVERY_API = apiConfig.FOOD_DELIVERY_API;
export const CHAT_API = apiConfig.CHAT_API;
export const EMERGENCY_API = apiConfig.EMERGENCY_API;
export const SERVICES_API = apiConfig.SERVICES_API;
export const CONTACT_API = apiConfig.CONTACT_API;
export const ADMIN_API = apiConfig.ADMIN_API;

// Create Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    
    // Add JWT token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Helper functions for API calls
export const getApiUrl = (endpoint) => {
  return `${MEDICINE_STORE_API}${endpoint}`;
};

// Auth API helpers
export const authAPI = {
  register: (userData) => api.post(`${AUTH_API}/register`, userData),
  login: (credentials) => api.post(`${AUTH_API}/login`, credentials, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  doctorRegister: (doctorData) => api.post(`${AUTH_API}/doctor/register`, doctorData),
  doctorLogin: (credentials) => api.post(`${AUTH_API}/doctor/login`, credentials, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
};

// Appointments API helpers
export const appointmentsAPI = {
  getUserAppointments: (params) => api.get(`${APPOINTMENTS_API}/`, { params }),
  getDoctorAppointments: (params) => api.get(`${APPOINTMENTS_API}/doctor`, { params }),
  bookAppointment: (appointmentData) => api.post(`${APPOINTMENTS_API}/`, appointmentData),
  updateAppointment: (id, updateData) => api.put(`${APPOINTMENTS_API}/${id}`, updateData),
  cancelAppointment: (id) => api.delete(`${APPOINTMENTS_API}/${id}`),
  getDoctorAvailability: (doctorId) => api.get(`${APPOINTMENTS_API}/doctor/${doctorId}/availability`),
  // New availability endpoints
  getDoctorAvailableSlots: (doctorId, date) => api.get(`${APPOINTMENTS_API}/doctor/${doctorId}/available-slots?date=${date}`),
  getDoctorWeeklyAvailability: (doctorId, startDate = null) => {
    const params = startDate ? `?start_date=${startDate}` : '';
    return api.get(`${APPOINTMENTS_API}/doctor/${doctorId}/availability-week${params}`);
  },
};

// Medicine Store API helpers
export const medicineAPI = {
  getMedicines: (params) => api.get(`${MEDICINE_STORE_API}/`, { params }),
  getMedicine: (id) => api.get(`${MEDICINE_STORE_API}/${id}`),
  createMedicine: (medicineData) => api.post(`${MEDICINE_STORE_API}/`, medicineData),
  updateMedicine: (id, updateData) => api.put(`${MEDICINE_STORE_API}/${id}`, updateData),
  deleteMedicine: (id) => api.delete(`${MEDICINE_STORE_API}/${id}`),
  addToCart: (cartData) => api.post(`${MEDICINE_STORE_API}/cart/add`, cartData),
  getCart: () => api.get(`${MEDICINE_STORE_API}/cart`),
  removeFromCart: (medicineId) => api.delete(`${MEDICINE_STORE_API}/cart/remove/${medicineId}`),
  clearCart: () => api.delete(`${MEDICINE_STORE_API}/cart/clear`),
  createOrder: (orderData) => api.post(`${MEDICINE_STORE_API}/orders`, orderData),
  getUserOrders: (params) => api.get(`${MEDICINE_STORE_API}/orders`, { params }),
};

// Food Delivery API helpers
export const foodAPI = {
  getRestaurants: (params) => api.get(`${FOOD_DELIVERY_API}/restaurants`, { params }),
  getRestaurant: (id) => api.get(`${FOOD_DELIVERY_API}/restaurants/${id}`),
  getMenuItems: (restaurantId, params) => api.get(`${FOOD_DELIVERY_API}/restaurants/${restaurantId}/menu`, { params }),
  addToFoodCart: (cartData) => api.post(`${FOOD_DELIVERY_API}/cart/add`, cartData),
  getFoodCart: () => api.get(`${FOOD_DELIVERY_API}/cart`),
  createFoodOrder: (orderData) => api.post(`${FOOD_DELIVERY_API}/orders`, orderData),
  getFoodOrders: (params) => api.get(`${FOOD_DELIVERY_API}/orders`, { params }),
};

// Chat API helpers
export const chatAPI = {
  getSessions: (params) => api.get(`${CHAT_API}/sessions`, { params }),
  createSession: (sessionData) => api.post(`${CHAT_API}/sessions`, sessionData),
  getMessages: (sessionId, params) => api.get(`${CHAT_API}/sessions/${sessionId}/messages`, { params }),
  sendMessage: (sessionId, messageData) => api.post(`${CHAT_API}/sessions/${sessionId}/messages`, messageData),
  getDoctorMessages: (params) => api.get(`${CHAT_API}/doctor/messages`, { params }),
};

// Services API helpers
export const servicesAPI = {
  getServices: (params) => api.get(`${SERVICES_API}/`, { params }),
  getService: (id) => api.get(`${SERVICES_API}/${id}`),
  createService: (serviceData) => api.post(`${SERVICES_API}/`, serviceData),
  updateService: (id, updateData) => api.put(`${SERVICES_API}/${id}`, updateData),
};

// Contact API helpers
export const contactAPI = {
  submitContact: (contactData) => api.post(`${CONTACT_API}/`, contactData),
  getContacts: (params) => api.get(`${CONTACT_API}/`, { params }),
  subscribeNewsletter: (email) => api.post(`${CONTACT_API}/newsletter`, { email }),
};

// Emergency API helpers
export const emergencyAPI = {
  createEmergencyRequest: (requestData) => api.post(`${EMERGENCY_API}/request`, requestData),
  getEmergencyRequests: (params) => api.get(`${EMERGENCY_API}/requests`, { params }),
  updateEmergencyStatus: (id, status) => api.put(`${EMERGENCY_API}/requests/${id}/status`, { status }),
};

export default api;
