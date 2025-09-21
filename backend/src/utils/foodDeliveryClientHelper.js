// Optional client helper for frontend integration
// This can be optionally added to frontend to enable backend features
// without changing existing frontend functionality

class FoodDeliveryClientHelper {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.token = null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Get authentication headers
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Make API request
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        ...options
      };

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Save cart to backend (for cross-device sync)
  async saveCartToBackend(cartItems) {
    if (!this.token) {
      console.warn('No auth token, skipping cart sync');
      return null;
    }

    try {
      return await this.makeRequest('/food-delivery-enhanced/cart/sync', {
        method: 'POST',
        body: JSON.stringify({ cartItems })
      });
    } catch (error) {
      console.error('Failed to save cart to backend:', error);
      return null;
    }
  }

  // Load cart from backend (for cross-device sync)
  async loadCartFromBackend() {
    if (!this.token) {
      console.warn('No auth token, skipping cart sync');
      return null;
    }

    try {
      const response = await this.makeRequest('/food-delivery-enhanced/cart/sync');
      return response.cartItems || [];
    } catch (error) {
      console.error('Failed to load cart from backend:', error);
      return null;
    }
  }

  // Save order to backend
  async saveOrderToBackend(orderData) {
    if (!this.token) {
      console.warn('No auth token, order will not be saved to database');
      return null;
    }

    try {
      return await this.makeRequest('/food-delivery-enhanced/orders/save', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
    } catch (error) {
      console.error('Failed to save order to backend:', error);
      return null;
    }
  }

  // Process payment
  async processPayment(paymentData) {
    if (!this.token) {
      console.warn('No auth token, payment processing unavailable');
      return null;
    }

    try {
      return await this.makeRequest('/food-delivery-enhanced/payment/process', {
        method: 'POST',
        body: JSON.stringify(paymentData)
      });
    } catch (error) {
      console.error('Failed to process payment:', error);
      return null;
    }
  }

  // Get order history
  async getOrderHistory(page = 1, limit = 10) {
    if (!this.token) {
      console.warn('No auth token, order history unavailable');
      return null;
    }

    try {
      return await this.makeRequest(`/food-delivery-enhanced/orders/history?page=${page}&limit=${limit}`);
    } catch (error) {
      console.error('Failed to get order history:', error);
      return null;
    }
  }

  // Sync frontend data with backend
  async syncRestaurantsWithBackend(restaurants) {
    try {
      return await this.makeRequest('/food-delivery-enhanced/sync/restaurants', {
        method: 'POST',
        body: JSON.stringify({ restaurants })
      });
    } catch (error) {
      console.error('Failed to sync restaurants:', error);
      return null;
    }
  }

  // Sync menu items with backend
  async syncMenuItemsWithBackend(menuItems) {
    try {
      return await this.makeRequest('/food-delivery-enhanced/sync/menu-items', {
        method: 'POST',
        body: JSON.stringify({ menuItems })
      });
    } catch (error) {
      console.error('Failed to sync menu items:', error);
      return null;
    }
  }
}

// Usage examples:
/*
// In your frontend (optional enhancement):

// Initialize the helper
const foodDeliveryClient = new FoodDeliveryClientHelper();

// Set token when user logs in
const token = localStorage.getItem('token');
if (token) {
  foodDeliveryClient.setToken(token);
}

// Example: Save cart when it changes (optional)
useEffect(() => {
  if (cartItems.length > 0) {
    foodDeliveryClient.saveCartToBackend(cartItems);
  }
}, [cartItems]);

// Example: Load cart when user logs in (optional)
const handleLogin = async (userData) => {
  // Your existing login logic
  localStorage.setItem('token', userData.token);
  foodDeliveryClient.setToken(userData.token);
  
  // Optionally load saved cart
  const savedCart = await foodDeliveryClient.loadCartFromBackend();
  if (savedCart && savedCart.length > 0) {
    setCartItems(savedCart);
  }
};

// Example: Enhanced order placement with backend persistence
const handlePaymentSubmit = async () => {
  // Your existing frontend logic
  setCheckoutStep("confirmation");
  
  // Additionally save to backend for persistence
  const orderData = {
    cartItems,
    deliveryAddress: userAddress,
    paymentMethod,
    subtotal,
    deliveryFee,
    taxes,
    total
  };
  
  const backendOrder = await foodDeliveryClient.saveOrderToBackend(orderData);
  if (backendOrder) {
    console.log('Order saved to database:', backendOrder.order.orderNumber);
  }
  
  // Process payment if needed
  if (paymentMethod !== 'cod') {
    const paymentResult = await foodDeliveryClient.processPayment({
      orderId: backendOrder?.order?.id,
      paymentMethod,
      amount: total
    });
    
    if (paymentResult && paymentResult.success) {
      console.log('Payment processed:', paymentResult.transactionId);
    }
  }
  
  // Your existing cart clearing logic
  setTimeout(() => {
    setCartItems([]);
    localStorage.removeItem("cart");
  }, 3000);
};
*/

module.exports = FoodDeliveryClientHelper;
