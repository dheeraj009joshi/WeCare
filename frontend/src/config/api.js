import axios from 'axios';

// API Configuration
const config = {
  // Development
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    MEDICINE_STORE_API: 'http://localhost:5000/api/medicine-store'
  },
  
  // Production
  production: {
    API_BASE_URL: 'https://your-production-domain.com/api',
    MEDICINE_STORE_API: 'https://your-production-domain.com/api/medicine-store'
  },
  
  // Staging
  staging: {
    API_BASE_URL: 'https://your-staging-domain.com/api',
    MEDICINE_STORE_API: 'https://your-staging-domain.com/api/medicine-store'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export current config
export const apiConfig = config[environment];

// Export individual values for convenience
export const API_BASE_URL = apiConfig.API_BASE_URL;
export const MEDICINE_STORE_API = apiConfig.MEDICINE_STORE_API;

// Create Axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
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

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${MEDICINE_STORE_API}${endpoint}`;
};

export default api;
