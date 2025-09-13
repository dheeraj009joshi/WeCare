import { authAPI } from '../config/api';

// Convert credentials to form data format for FastAPI OAuth2PasswordRequestForm
const convertToFormData = (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email || credentials.username);
  formData.append('password', credentials.password);
  return formData;
};

export const authService = {
  // User Registration
  register: async (userData) => {
    try {
      console.log('🔐 Registering user:', { email: userData.email, name: userData.name });
      
      // FastAPI expects JSON for registration
      const response = await authAPI.register(userData);
      console.log('✅ Registration successful:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Registration failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  },

  // User Login
  login: async (credentials) => {
    try {
      console.log('🔐 Logging in user:', { email: credentials.email });
      
      // Convert to form data for FastAPI OAuth2PasswordRequestForm
      const formData = convertToFormData(credentials);
      
      const response = await authAPI.login(formData);
      console.log('✅ Login successful:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  },

  // Doctor Registration
  doctorRegister: async (doctorData) => {
    try {
      console.log('🩺 Registering doctor:', { 
        email: doctorData.email, 
        name: doctorData.name,
        license_number: doctorData.license_number 
      });
      
      // FastAPI expects JSON for doctor registration
      const response = await authAPI.doctorRegister(doctorData);
      console.log('✅ Doctor registration successful:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Doctor registration failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Doctor registration failed'
      };
    }
  },

  // Doctor Login
  doctorLogin: async (credentials) => {
    try {
      console.log('🩺 Logging in doctor:', { email: credentials.email });
      
      // Convert to form data for FastAPI OAuth2PasswordRequestForm
      const formData = convertToFormData(credentials);
      
      const response = await authAPI.doctorLogin(formData);
      console.log('✅ Doctor login successful:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Doctor login failed:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Doctor login failed'
      };
    }
  }
};

export default authService;