const { Op } = require('sequelize');

// Lazy load models to avoid initialization issues
const getModels = () => {
  const { 
    FoodCategory, 
    Restaurant, 
    MenuItem, 
    FoodCart, 
    FoodOrder, 
    FoodOrderItem, 
    User 
  } = require('../models');
  return { FoodCategory, Restaurant, MenuItem, FoodCart, FoodOrder, FoodOrderItem, User };
};

// Get all food categories
exports.getCategories = async (req, res) => {
  try {
    const { FoodCategory } = getModels();
    const categories = await FoodCategory.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all restaurants with optional filters
exports.getRestaurants = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minRating, 
      isOpen,
      sortBy = 'rating',
      sortOrder = 'DESC'
    } = req.query;

    let whereClause = { isActive: true };

    // Apply filters
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { cuisine: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (minRating) {
      whereClause.rating = { [Op.gte]: parseFloat(minRating) };
    }

    if (isOpen !== undefined) {
      whereClause.isOpen = isOpen === 'true';
    }

    const { Restaurant, MenuItem } = getModels();
    const restaurants = await Restaurant.findAll({
      where: whereClause,
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isAvailable: true },
          required: false,
          attributes: ['id', 'name', 'price', 'description', 'image', 'isPopular']
        }
      ],
      order: [[sortBy, sortOrder]]
    });

    res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get restaurant by ID with menu items
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Restaurant, MenuItem } = getModels();

    const restaurant = await Restaurant.findByPk(id, {
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isAvailable: true },
          required: false,
          order: [['isPopular', 'DESC'], ['name', 'ASC']]
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant retrieved successfully',
      restaurant
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get menu items for a restaurant
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, isVegetarian, isVegan, search } = req.query;
    const { MenuItem, Restaurant } = getModels();

    let whereClause = { 
      restaurantId: restaurantId,
      isAvailable: true 
    };

    if (category) {
      whereClause.category = category;
    }

    if (isVegetarian !== undefined) {
      whereClause.isVegetarian = isVegetarian === 'true';
    }

    if (isVegan !== undefined) {
      whereClause.isVegan = isVegan === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'deliveryTime']
        }
      ],
      order: [['isPopular', 'DESC'], ['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      menuItems,
      count: menuItems.length
    });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve menu items',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, restaurantId, quantity = 1, specialInstructions } = req.body;
    const userId = req.user?.id;
    const { MenuItem, FoodCart, Restaurant } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Verify menu item exists and is available
    const menuItem = await MenuItem.findOne({
      where: { 
        id: menuItemId, 
        restaurantId: restaurantId,
        isAvailable: true 
      }
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found or not available'
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await FoodCart.findOne({
      where: {
        userId: userId,
        menuItemId: menuItemId,
        restaurantId: restaurantId
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item exists
      existingCartItem.quantity += parseInt(quantity);
      cartItem = await existingCartItem.save();
    } else {
      // Create new cart item
      cartItem = await FoodCart.create({
        userId: userId,
        menuItemId: menuItemId,
        restaurantId: restaurantId,
        quantity: parseInt(quantity),
        specialInstructions: specialInstructions
      });
    }

    // Fetch the complete cart item with associations
    const completeCartItem = await FoodCart.findByPk(cartItem.id, {
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

    res.status(200).json({
      success: true,
      message: 'Item added to cart successfully',
      cartItem: completeCartItem
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { FoodCart, MenuItem, Restaurant } = getModels();

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
          attributes: ['id', 'name', 'price', 'description', 'image', 'isVegetarian', 'isVegan']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'deliveryTime', 'rating']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      const itemTotal = item.menuItem.price * item.quantity;
      subtotal += parseFloat(itemTotal);
      totalItems += item.quantity;
    });

    const deliveryFee = 30.00;
    const taxes = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + taxes;

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      cartItems,
      summary: {
        totalItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        deliveryFee,
        taxes: parseFloat(taxes.toFixed(2)),
        total: parseFloat(total.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const { FoodCart, MenuItem, Restaurant } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const cartItem = await FoodCart.findOne({
      where: { 
        id: id,
        userId: userId 
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    // Fetch updated cart item with associations
    const updatedCartItem = await FoodCart.findByPk(cartItem.id, {
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

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      cartItem: updatedCartItem
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { FoodCart } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const cartItem = await FoodCart.findOne({
      where: { 
        id: id,
        userId: userId 
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { FoodCart } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    await FoodCart.destroy({
      where: { userId: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create order from cart
exports.createOrder = async (req, res) => {
  try {
    const { deliveryAddress, paymentMethod, deliveryInstructions } = req.body;
    const userId = req.user?.id;
    const { FoodCart, FoodOrder, FoodOrderItem, MenuItem, Restaurant } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Validate required fields
    if (!deliveryAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and payment method are required'
      });
    }

    // Get cart items
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

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += parseFloat(item.menuItem.price) * item.quantity;
    });

    const deliveryFee = 30.00;
    const taxes = subtotal * 0.05;
    const total = subtotal + deliveryFee + taxes;

    // Generate order number
    const orderNumber = 'FD' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create order
    const order = await FoodOrder.create({
      orderNumber,
      userId,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryFee,
      taxes: parseFloat(taxes.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      paymentMethod,
      deliveryAddress,
      deliveryInstructions,
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    });

    // Create order items
    const orderItems = [];
    for (const cartItem of cartItems) {
      const orderItem = await FoodOrderItem.create({
        orderId: order.id,
        menuItemId: cartItem.menuItemId,
        restaurantId: cartItem.restaurantId,
        quantity: cartItem.quantity,
        unitPrice: cartItem.menuItem.price,
        totalPrice: parseFloat(cartItem.menuItem.price) * cartItem.quantity,
        specialInstructions: cartItem.specialInstructions,
        itemSnapshot: {
          name: cartItem.menuItem.name,
          description: cartItem.menuItem.description,
          price: cartItem.menuItem.price,
          restaurantName: cartItem.restaurant.name
        }
      });
      orderItems.push(orderItem);
    }

    // Clear cart after successful order
    await FoodCart.destroy({
      where: { userId: userId }
    });

    // Fetch complete order with items
    const completeOrder = await FoodOrder.findByPk(order.id, {
      include: [
        {
          model: FoodOrderItem,
          as: 'orderItems',
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
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: completeOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status, page = 1, limit = 10 } = req.query;
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    let whereClause = { userId: userId };

    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await FoodOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: FoodOrderItem,
          as: 'orderItems',
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
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const order = await FoodOrder.findOne({
      where: { 
        id: id,
        userId: userId 
      },
      include: [
        {
          model: FoodOrderItem,
          as: 'orderItems',
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
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const { FoodOrder } = getModels();

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const order = await FoodOrder.findOne({
      where: { 
        id: id,
        userId: userId 
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
