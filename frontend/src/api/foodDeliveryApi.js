const API_BASE_URL = 'http://localhost:8000/api/food-delivery-complete';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('API Error: Response is not JSON. Status:', response.status, 'Content-Type:', contentType);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the backend server is running.`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Food Delivery API Error:', error);
    throw error;
  }
};

// Public API calls (no authentication required)
export const publicApi = {
  // Get all food categories
  getCategories: async () => {
    return apiCall('/categories');
  },

  // Get all restaurants with optional filters
  getRestaurants: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = queryParams.toString() ? `/restaurants?${queryParams.toString()}` : '/restaurants';
    return apiCall(endpoint);
  },

  // Get restaurant by ID with menu items
  getRestaurantById: async (id) => {
    return apiCall(`/restaurants/${id}`);
  },

  // Get menu items for a specific restaurant
  getMenuItems: async (restaurantId, filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = queryParams.toString() 
      ? `/restaurants/${restaurantId}/menu?${queryParams.toString()}` 
      : `/restaurants/${restaurantId}/menu`;
    return apiCall(endpoint);
  }
};

// Protected API calls (require authentication)
export const protectedApi = {
  // Cart management
  getCart: async () => {
    return apiCall('/cart');
  },

  addToCart: async (menuItemId, restaurantId, quantity = 1, specialInstructions = '') => {
    return apiCall('/cart/add', {
      method: 'POST',
      body: JSON.stringify({
        menuItemId,
        restaurantId,
        quantity,
        specialInstructions
      })
    });
  },

  updateCartItem: async (cartItemId, quantity) => {
    return apiCall(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  removeFromCart: async (cartItemId) => {
    return apiCall(`/cart/${cartItemId}`, {
      method: 'DELETE'
    });
  },

  clearCart: async () => {
    return apiCall('/cart', {
      method: 'DELETE'
    });
  },

  // Order management
  createOrder: async (orderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getUserOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = queryParams.toString() ? `/orders?${queryParams.toString()}` : '/orders';
    return apiCall(endpoint);
  },

  getOrderById: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },

  cancelOrder: async (orderId, reason = '') => {
    return apiCall(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }
};

// Enhanced API calls for syncing frontend data
export const enhancedApi = {
  // Sync frontend restaurant data to database
  syncRestaurants: async (restaurants) => {
    return apiCall('/enhanced/sync-restaurants', {
      method: 'POST',
      body: JSON.stringify({ restaurants })
    });
  },

  // Sync frontend menu items data to database
  syncMenuItems: async (menuItems) => {
    return apiCall('/enhanced/sync-menu-items', {
      method: 'POST',
      body: JSON.stringify({ menuItems })
    });
  },

  // Get restaurants with enhanced data
  getRestaurantsEnhanced: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = queryParams.toString() 
      ? `/enhanced/restaurants?${queryParams.toString()}` 
      : '/enhanced/restaurants';
    return apiCall(endpoint);
  }
};

// Admin API calls (require admin authentication)
export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiCall('/admin/dashboard-stats');
  },

  // Get all orders for admin
  getAllOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const endpoint = queryParams.toString() ? `/admin/orders?${queryParams.toString()}` : '/admin/orders';
    return apiCall(endpoint);
  },

  // Update order status
  updateOrderStatus: async (orderId, status, adminNotes = '') => {
    return apiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes })
    });
  },

  // Get restaurant analytics
  getRestaurantAnalytics: async (restaurantId, period = 'month') => {
    return apiCall(`/admin/restaurants/${restaurantId}/analytics?period=${period}`);
  },

  // Get popular items
  getPopularItems: async (limit = 10) => {
    return apiCall(`/admin/popular-items?limit=${limit}`);
  },

  // Get revenue statistics
  getRevenueStats: async (period = 'month') => {
    return apiCall(`/admin/revenue-stats?period=${period}`);
  }
};

// Utility functions
export const utils = {
  // Calculate delivery fee
  calculateDeliveryFee: (subtotal) => {
    return 30.00; // Fixed delivery fee
  },

  // Calculate taxes
  calculateTaxes: (subtotal) => {
    return subtotal * 0.05; // 5% tax
  },

  // Calculate total
  calculateTotal: (subtotal, deliveryFee = 30.00) => {
    const taxes = utils.calculateTaxes(subtotal);
    return subtotal + deliveryFee + taxes;
  },

  // Format price to Indian Rupees
  formatPrice: (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  },

  // Validate delivery address
  validateDeliveryAddress: (address) => {
    const required = ['fullName', 'phone', 'address', 'city', 'pincode'];
    const missing = required.filter(field => !address[field] || address[field].trim() === '');
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
    
    // Validate phone number (basic Indian format)
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(address.phone.replace(/\s+/g, ''))) {
      throw new Error('Invalid phone number format');
    }
    
    // Validate pincode (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(address.pincode)) {
      throw new Error('Invalid pincode format');
    }
    
    return true;
  },

  // Generate order number
  generateOrderNumber: () => {
    return 'FD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
};

// Export all APIs
export default {
  public: publicApi,
  protected: protectedApi,
  enhanced: enhancedApi,
  admin: adminApi,
  utils
};
