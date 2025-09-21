import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const DOCTOR_AUTH_BASE = `${API_BASE}/auth/doctor`;
const DOCTOR_API_BASE = `${API_BASE}/doctor`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('doctorToken');
      window.location.href = '/doctors/login';
    }
    return Promise.reject(error);
  }
);

// Authentication Services
export const doctorAuthService = {
  // Register doctor
  register: async (doctorData) => {
    try {
      const response = await axios.post(`${DOCTOR_AUTH_BASE}/register`, doctorData);
      if (response.data.token) {
        localStorage.setItem('doctorToken', response.data.token);
        localStorage.setItem('doctorData', JSON.stringify(response.data.doctor));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login doctor
  login: async (credentials) => {
    try {
      const response = await axios.post(`${DOCTOR_AUTH_BASE}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('doctorToken', response.data.token);
        localStorage.setItem('doctorData', JSON.stringify(response.data.doctor));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${DOCTOR_AUTH_BASE}/forgot-password`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to process forgot password request' };
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${DOCTOR_AUTH_BASE}/reset-password`, { token, newPassword });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  },

  // Get doctor profile
  getProfile: async () => {
    try {
      const response = await apiClient.get(`${DOCTOR_AUTH_BASE}/profile`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  // Update doctor profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put(`${DOCTOR_AUTH_BASE}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
  },

  // Check if doctor is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('doctorToken');
  },

  // Get current doctor data
  getCurrentDoctor: () => {
    const doctorData = localStorage.getItem('doctorData');
    return doctorData ? JSON.parse(doctorData) : null;
  },

  // Test backend connection
  testConnection: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Backend connection failed' };
    }
  }
};

// Dashboard Services
export const doctorDashboardService = {
  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get dashboard stats' };
    }
  },

  // Get appointments
  getAppointments: async (params = {}) => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/appointments`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get appointments' };
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, statusData) => {
    try {
      const response = await apiClient.put(`${DOCTOR_API_BASE}/appointments/${appointmentId}`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update appointment' };
    }
  },

  // Get patients
  getPatients: async (params = {}) => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/patients`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get patients' };
    }
  },

  // Get messages
  getMessages: async (params = {}) => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/messages`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get messages' };
    }
  },

  // Send message
  sendMessage: async (messageData) => {
    try {
      const response = await apiClient.post(`${DOCTOR_API_BASE}/messages`, messageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },

  // Mark messages as read
  markMessagesAsRead: async (patientId) => {
    try {
      const response = await apiClient.put(`${DOCTOR_API_BASE}/messages/read/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark messages as read' };
    }
  },

  // Get availability
  getAvailability: async () => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/availability`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get availability' };
    }
  },

  // Update availability
  updateAvailability: async (availabilityData) => {
    try {
      const response = await apiClient.put(`${DOCTOR_API_BASE}/availability`, availabilityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update availability' };
    }
  },

  // Get earnings
  getEarnings: async (params = {}) => {
    try {
      const response = await apiClient.get(`${DOCTOR_API_BASE}/earnings`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get earnings' };
    }
  }
};

// Utility functions
export const doctorUtils = {
  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // Format date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Format time
  formatTime: (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      pending: 'text-yellow-600',
      confirmed: 'text-green-600',
      completed: 'text-blue-600',
      cancelled: 'text-red-600',
      'no_show': 'text-gray-600',
    };
    return colors[status] || 'text-gray-600';
  },

  // Get status badge
  getStatusBadge: (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      'no_show': 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  }
};

export default {
  doctorAuthService,
  doctorDashboardService,
  doctorUtils
}; 