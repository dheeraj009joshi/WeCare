import { MEDICINE_STORE_API } from '../config/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to make API calls for medicine store (non-admin)
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
    const response = await fetch(`${MEDICINE_STORE_API}${endpoint}`, config);
    
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
    console.error('API Error:', error);
    throw error;
  }
};

// Helper function to make API calls for admin operations
const adminApiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  console.log('Admin API Call:', endpoint);
  console.log('Token:', token ? 'Present' : 'Missing');
  
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

  console.log('Request config:', {
    url: `http://localhost:5000/api/hidden-admin${endpoint}`,
    method: options.method || 'GET',
    headers: config.headers
  });

  try {
    // Use the hidden admin endpoint for admin operations
    const response = await fetch(`http://localhost:5000/api/hidden-admin${endpoint}`, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Admin API Error: Response is not JSON. Status:', response.status, 'Content-Type:', contentType);
      throw new Error(`Server returned non-JSON response. Status: ${response.status}. Please check if the backend server is running.`);
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('Admin API Error:', error);
    throw error;
  }
};

// Product API calls
export const productApi = {
  // Get all products with filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    
    return apiCall(endpoint);
  },

  // Get product by ID
  getById: async (id) => {
    return apiCall(`/products/${id}`);
  },

  // Get product categories
  getCategories: async () => {
    return apiCall('/products/categories');
  }
};

// Cart API calls
export const cartApi = {
  // Get user's cart
  getCart: async () => {
    return apiCall('/cart');
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    return apiCall('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    return apiCall(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    return apiCall(`/cart/${cartItemId}`, {
      method: 'DELETE'
    });
  },

  // Clear entire cart
  clearCart: async () => {
    return apiCall('/cart', {
      method: 'DELETE'
    });
  },

  // Get cart summary
  getCartSummary: async () => {
    return apiCall('/cart/summary');
  }
};

// Order API calls
export const orderApi = {
  // Create new order
  createOrder: async (orderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Get user's orders
  getUserOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return apiCall(endpoint);
  },

  // Get order by ID
  getOrderById: async (id) => {
    return apiCall(`/orders/${id}`);
  },

  // Cancel order
  cancelOrder: async (id) => {
    return apiCall(`/orders/${id}/cancel`, {
      method: 'PUT'
    });
  },

  // Check order status (public endpoint)
  checkOrderStatus: async (orderNumber) => {
    return apiCall(`/order-status/${orderNumber}`);
  }
};

// Address API calls
export const addressApi = {
  // Get user's addresses
  getUserAddresses: async () => {
    return apiCall('/addresses');
  },

  // Add new address
  addAddress: async (addressData) => {
    return apiCall('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  },

  // Update address
  updateAddress: async (id, addressData) => {
    return apiCall(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  },

  // Delete address
  deleteAddress: async (id) => {
    return apiCall(`/addresses/${id}`, {
      method: 'DELETE'
    });
  },

  // Set default address
  setDefaultAddress: async (id) => {
    return apiCall(`/addresses/${id}/default`, {
      method: 'PUT'
    });
  },

  // Get default address
  getDefaultAddress: async () => {
    return apiCall('/addresses/default');
  }
};

// Admin API calls
export const adminApi = {
  // Create product
  createProduct: async (productData) => {
    return adminApiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // Update product
  updateProduct: async (id, productData) => {
    return adminApiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // Delete product
  deleteProduct: async (id) => {
    return adminApiCall(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Update product stock
  updateStock: async (id, stock) => {
    return adminApiCall(`/products/${id}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock })
    });
  },

  // Get all orders for admin
  getAllOrders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/orders?${queryString}` : '/orders';
    
    return adminApiCall(endpoint);
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    return adminApiCall(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return adminApiCall('/dashboard');
  },

  // Get low stock products
  getLowStockProducts: async (threshold = 10) => {
    return adminApiCall(`/products/low-stock?threshold=${threshold}`);
  },

  // Bulk update stock
  bulkUpdateStock: async (updates) => {
    return adminApiCall('/products/bulk-stock-update', {
      method: 'POST',
      body: JSON.stringify({ updates })
    });
  },

  // Get sales report
  getSalesReport: async (startDate, endDate, groupBy = 'day') => {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      groupBy
    });
    
    return adminApiCall(`/reports/sales?${queryParams}`);
  }
};

// Payment API calls
export const paymentApi = {
  // Process COD payment and place order
  processCODPayment: async (orderData) => {
    return apiCall('/payment/cod', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  // Get payment status for an order
  getPaymentStatus: async (orderId) => {
    return apiCall(`/payment/status/${orderId}`);
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  try {
    const token = getAuthToken();
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

// Utility function to check if user is admin
export const isAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user && user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};
