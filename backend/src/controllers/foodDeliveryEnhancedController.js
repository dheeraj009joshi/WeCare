const { getModels } = require('../models');
const { Op } = require('sequelize');

// This controller works with your existing frontend data structure
// without requiring any frontend changes

// Sync frontend restaurant data to database
exports.syncRestaurants = async (req, res) => {
  try {
    const { FoodCategory, Restaurant } = getModels();
    const { restaurants } = req.body;

    if (!restaurants || !Array.isArray(restaurants)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurants data'
      });
    }

    const syncedRestaurants = [];

    for (const restaurantData of restaurants) {
      const [restaurant, created] = await Restaurant.findOrCreate({
        where: { id: restaurantData.id },
        defaults: {
          name: restaurantData.name,
          category: restaurantData.category,
          cuisine: restaurantData.cuisine,
          rating: restaurantData.rating,
          deliveryTime: restaurantData.time,
          priceRange: restaurantData.price,
          image: restaurantData.img,
          description: `${restaurantData.name} - ${restaurantData.cuisine}`
        }
      });

      if (!created) {
        // Update existing restaurant
        await restaurant.update({
          name: restaurantData.name,
          category: restaurantData.category,
          cuisine: restaurantData.cuisine,
          rating: restaurantData.rating,
          deliveryTime: restaurantData.time,
          priceRange: restaurantData.price,
          image: restaurantData.img
        });
      }

      syncedRestaurants.push(restaurant);
    }

    res.status(200).json({
      success: true,
      message: 'Restaurants synced successfully',
      count: syncedRestaurants.length
    });
  } catch (error) {
    console.error('Sync restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Sync frontend menu items data to database
exports.syncMenuItems = async (req, res) => {
  try {
    const { MenuItem, Restaurant } = getModels();
    const { menuItems } = req.body;

    if (!menuItems || typeof menuItems !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid menu items data'
      });
    }

    const syncedItems = [];

    for (const [restaurantId, items] of Object.entries(menuItems)) {
      if (Array.isArray(items)) {
        for (const itemData of items) {
          const [menuItem, created] = await MenuItem.findOrCreate({
            where: { id: itemData.id },
            defaults: {
              name: itemData.name,
              description: itemData.description,
              price: itemData.price,
              restaurantId: parseInt(restaurantId),
              isVegetarian: true, // Default for healthy food
              isAvailable: true
            }
          });

          if (!created) {
            // Update existing menu item
            await menuItem.update({
              name: itemData.name,
              description: itemData.description,
              price: itemData.price,
              restaurantId: parseInt(restaurantId)
            });
          }

          syncedItems.push(menuItem);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Menu items synced successfully',
      count: syncedItems.length
    });
  } catch (error) {
    console.error('Sync menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Save cart to database (for cross-device sync)
exports.saveCart = async (req, res) => {
  try {
    const { FoodCart, MenuItem, Restaurant } = getModels();
    const { cartItems } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cart data'
      });
    }

    // Clear existing cart for user
    await FoodCart.destroy({
      where: { userId: userId }
    });

    // Save new cart items
    const savedCartItems = [];
    for (const item of cartItems) {
      const cartItem = await FoodCart.create({
        userId: userId,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions || null
      });
      savedCartItems.push(cartItem);
    }

    res.status(200).json({
      success: true,
      message: 'Cart saved successfully',
      cartItems: savedCartItems
    });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get saved cart (for cross-device sync)
exports.getSavedCart = async (req, res) => {
  try {
    const { FoodCart, MenuItem, Restaurant } = getModels();
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const cartItems = await FoodCart.findAll({
      where: { userId: userId },
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['id', 'name', 'price', 'description', 'image']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'deliveryTime']
        }
      ]
    });

    // Convert to frontend format
    const frontendCartItems = cartItems.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      description: item.menuItem.description,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurant.name,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions
    }));

    res.status(200).json({
      success: true,
      cartItems: frontendCartItems
    });
  } catch (error) {
    console.error('Get saved cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Save order to database (enhanced persistence)
exports.saveOrder = async (req, res) => {
  try {
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant, User } = getModels();
    const { 
      cartItems, 
      deliveryAddress, 
      paymentMethod, 
      subtotal, 
      deliveryFee, 
      taxes, 
      total 
    } = req.body;
    
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are required'
      });
    }

    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and payment method are required'
      });
    }

    // Generate order number
    const orderNumber = 'FD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create order
    const order = await FoodOrder.create({
      orderNumber,
      userId,
      subtotal: subtotal || 0,
      deliveryFee: deliveryFee || 30,
      taxes: taxes || 0,
      total: total || 0,
      paymentMethod,
      deliveryAddress,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      status: 'pending'
    });

    // Create order items
    const orderItems = [];
    for (const item of cartItems) {
      const orderItem = await FoodOrderItem.create({
        orderId: order.id,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        specialInstructions: item.specialInstructions,
        itemSnapshot: {
          name: item.name,
          description: item.description,
          price: item.price,
          restaurantName: item.restaurantName
        }
      });
      orderItems.push(orderItem);
    }

    // Clear user's cart after successful order
    await FoodCart.destroy({
      where: { userId: userId }
    });

    res.status(201).json({
      success: true,
      message: 'Order saved successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        estimatedDeliveryTime: order.estimatedDeliveryTime
      }
    });
  } catch (error) {
    console.error('Save order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user order history
exports.getOrderHistory = async (req, res) => {
  try {
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant } = getModels();
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await FoodOrder.findAndCountAll({
      where: { userId: userId },
      include: [
        {
          model: FoodOrderItem,
          as: 'orderItems',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['id', 'name', 'price', 'description', 'image'],
              required: false
            },
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name', 'deliveryTime'],
              required: false
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      success: true,
      message: 'Order history retrieved successfully',
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Process payment (placeholder for payment gateway integration)
exports.processPayment = async (req, res) => {
  try {
    const { FoodOrder, FoodOrderItem } = getModels();
    const { 
      orderId, 
      paymentMethod, 
      paymentDetails,
      amount 
    } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Find the order
    const order = await FoodOrder.findOne({
      where: { 
        id: orderId,
        userId: userId 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Process payment based on method
    let paymentResult = { success: false };

    switch (paymentMethod) {
      case 'cod':
        // Cash on Delivery - automatically approve
        paymentResult = {
          success: true,
          transactionId: 'COD_' + Date.now(),
          message: 'Cash on Delivery order confirmed'
        };
        break;

      case 'card':
        // Credit/Debit Card - simulate payment processing
        // In real implementation, integrate with payment gateway like Stripe, Razorpay, etc.
        paymentResult = {
          success: true,
          transactionId: 'CARD_' + Date.now(),
          message: 'Card payment processed successfully'
        };
        break;

      case 'upi':
        // UPI Payment - simulate UPI processing
        // In real implementation, integrate with UPI gateway
        paymentResult = {
          success: true,
          transactionId: 'UPI_' + Date.now(),
          message: 'UPI payment processed successfully'
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    if (paymentResult.success) {
      // Update order status
      await order.update({
        paymentStatus: 'paid',
        status: 'confirmed'
      });

      res.status(200).json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: paymentResult.transactionId,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus
        }
      });
    } else {
      await order.update({
        paymentStatus: 'failed'
      });

      res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error || 'Payment gateway error'
      });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update order status (for admin/restaurant use)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { FoodOrder } = getModels();
    const { id } = req.params;
    const { status, estimatedDeliveryTime } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await FoodOrder.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const updateData = { status };
    
    if (estimatedDeliveryTime) {
      updateData.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
    }

    if (status === 'delivered') {
      updateData.actualDeliveryTime = new Date();
    }

    await order.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
