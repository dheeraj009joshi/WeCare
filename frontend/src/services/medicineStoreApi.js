// Updated for FastAPI backend - uses the new API helpers from config/api.js
import { medicineAPI, contactAPI } from '../config/api';

// Medicine API calls (updated for FastAPI backend)
export const productApi = {
  // Get all medicines with filters
  getAll: async (filters = {}) => {
    try {
      const response = await medicineAPI.getMedicines(filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error.response?.data || error;
    }
  },

  // Get medicine by ID
  getById: async (id) => {
    try {
      const response = await medicineAPI.getMedicine(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching medicine:', error);
      throw error.response?.data || error;
    }
  },

  // Get medicine categories (this might need to be implemented in backend)
  getCategories: async () => {
    try {
      // For now, return static categories until backend implements this
      return ['Pain Relief', 'Antibiotics', 'Vitamins', 'First Aid', 'Supplements'];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error.response?.data || error;
    }
  }
};

// Cart API calls (updated for FastAPI backend)
export const cartApi = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await medicineAPI.getCart();
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error.response?.data || error;
    }
  },

  // Add item to cart
  addToCart: async (medicine_id, quantity = 1) => {
    try {
      const response = await medicineAPI.addToCart({ medicine_id, quantity });
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error.response?.data || error;
    }
  },

  // Update cart item quantity (may need to be implemented in backend)
  updateCartItem: async (medicineId, quantity) => {
    try {
      // For now, remove and re-add with new quantity
      await medicineAPI.removeFromCart(medicineId);
      const response = await medicineAPI.addToCart({ medicine_id: medicineId, quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error.response?.data || error;
    }
  },

  // Remove item from cart
  removeFromCart: async (medicineId) => {
    try {
      const response = await medicineAPI.removeFromCart(medicineId);
      return response.data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error.response?.data || error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await medicineAPI.clearCart();
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error.response?.data || error;
    }
  },

  // Get cart summary (same as getCart for now)
  getCartSummary: async () => {
    return cartApi.getCart();
  }
};

// Order API calls (updated for FastAPI backend)
export const orderApi = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await medicineAPI.createOrder(orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error.response?.data || error;
    }
  },

  // Get user's orders
  getUserOrders: async (filters = {}) => {
    try {
      const response = await medicineAPI.getUserOrders(filters);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error.response?.data || error;
    }
  },

  // Get order by ID (may need to be implemented in backend)
  getOrderById: async (id) => {
    try {
      // This endpoint may need to be added to FastAPI backend
      const response = await medicineAPI.getUserOrders({ order_id: id });
      return response.data[0]; // Return first order if found
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error.response?.data || error;
    }
  },

  // Cancel order (may need to be implemented in backend)
  cancelOrder: async (id) => {
    try {
      // This functionality may need to be implemented in FastAPI backend
      console.warn('Cancel order functionality not implemented in FastAPI backend yet');
      throw new Error('Cancel order functionality not available');
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error.response?.data || error;
    }
  },

  // Check order status (may need to be implemented in backend)
  checkOrderStatus: async (orderNumber) => {
    try {
      // This functionality may need to be implemented in FastAPI backend
      console.warn('Order status check functionality not implemented in FastAPI backend yet');
      throw new Error('Order status check functionality not available');
    } catch (error) {
      console.error('Error checking order status:', error);
      throw error.response?.data || error;
    }
  }
};

// Address API calls (may need to be implemented in FastAPI backend)
export const addressApi = {
  // Get user's addresses
  getUserAddresses: async () => {
    try {
      // This functionality may need to be implemented in FastAPI backend
      console.warn('Address management not implemented in FastAPI backend yet');
      return [];
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error.response?.data || error;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      // This functionality may need to be implemented in FastAPI backend
      console.warn('Address management not implemented in FastAPI backend yet');
      throw new Error('Address management not available');
    } catch (error) {
      console.error('Error adding address:', error);
      throw error.response?.data || error;
    }
  },

  // For other address methods, similar implementation...
  updateAddress: async (id, addressData) => {
    throw new Error('Address management not available');
  },

  deleteAddress: async (id) => {
    throw new Error('Address management not available');
  },

  setDefaultAddress: async (id) => {
    throw new Error('Address management not available');
  },

  getDefaultAddress: async () => {
    throw new Error('Address management not available');
  }
};

// Admin API calls (updated for FastAPI backend)
export const adminApi = {
  // Create medicine
  createProduct: async (medicineData) => {
    try {
      const response = await medicineAPI.createMedicine(medicineData);
      return response.data;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw error.response?.data || error;
    }
  },

  // Update medicine
  updateProduct: async (id, medicineData) => {
    try {
      const response = await medicineAPI.updateMedicine(id, medicineData);
      return response.data;
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw error.response?.data || error;
    }
  },

  // Delete medicine
  deleteProduct: async (id) => {
    try {
      const response = await medicineAPI.deleteMedicine(id);
      return response.data;
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw error.response?.data || error;
    }
  },

  // Update medicine stock
  updateStock: async (id, stock_quantity) => {
    try {
      const response = await medicineAPI.updateMedicine(id, { stock_quantity });
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error.response?.data || error;
    }
  },

  // Get all orders for admin (may need to be implemented)
  getAllOrders: async (filters = {}) => {
    try {
      // This may need admin-specific order endpoint in FastAPI
      console.warn('Admin order management not fully implemented in FastAPI backend yet');
      return [];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error.response?.data || error;
    }
  },

  // Other admin functions - may need implementation in FastAPI backend
  updateOrderStatus: async (id, status) => {
    throw new Error('Order status update not available');
  },

  getDashboardStats: async () => {
    throw new Error('Dashboard stats not available');
  },

  getLowStockProducts: async (threshold = 10) => {
    try {
      // Filter medicines with low stock
      const response = await medicineAPI.getMedicines({ stock_quantity__lt: threshold });
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error.response?.data || error;
    }
  }
};

// Payment API calls (may need to be implemented in FastAPI backend)
export const paymentApi = {
  // Process COD payment and place order
  processCODPayment: async (orderData) => {
    try {
      // For now, just create the order with COD payment method
      const response = await medicineAPI.createOrder({
        ...orderData,
        payment_method: 'cash_on_delivery'
      });
      return response.data;
    } catch (error) {
      console.error('Error processing COD payment:', error);
      throw error.response?.data || error;
    }
  },

  // Get payment status for an order
  getPaymentStatus: async (orderId) => {
    try {
      // This functionality may need to be implemented
      return { status: 'pending', payment_method: 'cash_on_delivery' };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error.response?.data || error;
    }
  }
};

// Utility functions
export const isAuthenticated = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
};

export const isAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user && (user.role === 'admin' || user.is_admin);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};