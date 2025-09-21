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

// ==================== CATEGORY MANAGEMENT ====================

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

// Create new category (Admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name, identifier, description, image } = req.body;
    const { FoodCategory } = getModels();

    if (!name || !identifier) {
      return res.status(400).json({
        success: false,
        message: 'Name and identifier are required'
      });
    }

    const category = await FoodCategory.create({
      name,
      identifier,
      description,
      image,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update category (Admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, identifier, description, image, isActive } = req.body;
    const { FoodCategory } = getModels();

    const category = await FoodCategory.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.update({
      name: name || category.name,
      identifier: identifier || category.identifier,
      description: description || category.description,
      image: image || category.image,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==================== RESTAURANT MANAGEMENT ====================

// Get all restaurants with optional filters
exports.getRestaurants = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minRating, 
      isOpen,
      sortBy = 'rating',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
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

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { Restaurant, MenuItem } = getModels();
    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          where: { isAvailable: true },
          required: false,
          attributes: ['id', 'name', 'price', 'description', 'image', 'isPopular'],
          limit: 5 // Show only first 5 menu items
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
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

// Create new restaurant (Admin only)
exports.createRestaurant = async (req, res) => {
  try {
    const { 
      name, 
      category, 
      cuisine, 
      rating, 
      deliveryTime, 
      priceRange, 
      image, 
      description, 
      address, 
      phone, 
      openingTime, 
      closingTime 
    } = req.body;

    const { Restaurant } = getModels();

    if (!name || !category || !cuisine) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and cuisine are required'
      });
    }

    const restaurant = await Restaurant.create({
      name,
      category,
      cuisine,
      rating: rating || 4.0,
      deliveryTime: deliveryTime || '30 mins',
      priceRange: priceRange || '₹100-₹300',
      image,
      description,
      address,
      phone,
      openingTime: openingTime || '09:00:00',
      closingTime: closingTime || '22:00:00',
      isActive: true,
      isOpen: true
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update restaurant (Admin only)
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { Restaurant } = getModels();

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    await restaurant.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==================== MENU ITEM MANAGEMENT ====================

// Get menu items for a restaurant
exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, isVegetarian, isVegan, search, page = 1, limit = 20 } = req.query;
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

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: menuItems } = await MenuItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'deliveryTime']
        }
      ],
      order: [['isPopular', 'DESC'], ['name', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      success: true,
      message: 'Menu items retrieved successfully',
      menuItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
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

// Create new menu item (Admin only)
exports.createMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      restaurantId, 
      category, 
      image, 
      isVegetarian, 
      isVegan, 
      isGlutenFree, 
      calories, 
      ingredients, 
      allergens, 
      preparationTime 
    } = req.body;

    const { MenuItem } = getModels();

    if (!name || !price || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and restaurant ID are required'
      });
    }

    const menuItem = await MenuItem.create({
      name,
      description,
      price,
      restaurantId,
      category,
      image,
      isVegetarian: isVegetarian !== undefined ? isVegetarian : true,
      isVegan: isVegan !== undefined ? isVegan : false,
      isGlutenFree: isGlutenFree !== undefined ? isGlutenFree : false,
      calories,
      ingredients: ingredients ? JSON.parse(ingredients) : null,
      allergens: allergens ? JSON.parse(allergens) : null,
      preparationTime,
      isAvailable: true,
      isPopular: false
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update menu item (Admin only)
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { MenuItem } = getModels();

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Parse JSON fields if they exist
    if (updateData.ingredients && typeof updateData.ingredients === 'string') {
      updateData.ingredients = JSON.parse(updateData.ingredients);
    }
    if (updateData.allergens && typeof updateData.allergens === 'string') {
      updateData.allergens = JSON.parse(updateData.allergens);
    }

    await menuItem.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==================== CART MANAGEMENT ====================

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
          attributes: ['id', 'name', 'price', 'description', 'image', 'isVegetarian', 'isVegan']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'deliveryTime', 'rating']
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

// ==================== ORDER MANAGEMENT ====================

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
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
      status: 'pending'
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

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedDeliveryTime } = req.body;
    const { FoodOrder } = getModels();

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

// ==================== PAYMENT PROCESSING ====================

// Process payment
exports.processPayment = async (req, res) => {
  try {
    const { 
      orderId, 
      paymentMethod, 
      paymentDetails,
      amount 
    } = req.body;

    const userId = req.user?.id;
    const { FoodOrder } = getModels();

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
        paymentResult = {
          success: true,
          transactionId: 'CARD_' + Date.now(),
          message: 'Card payment processed successfully'
        };
        break;

      case 'upi':
        // UPI Payment - simulate UPI processing
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

// ==================== ADMIN DASHBOARD ====================

// Get dashboard statistics (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const { FoodOrder, FoodOrderItem, Restaurant, MenuItem, User } = getModels();

    // Get total orders
    const totalOrders = await FoodOrder.count();

    // Get total revenue
    const revenueResult = await FoodOrder.findOne({
      attributes: [
        [FoodOrder.sequelize.fn('SUM', FoodOrder.sequelize.col('total')), 'totalRevenue']
      ],
      where: {
        status: ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
      }
    });

    // Get orders by status
    const ordersByStatus = await FoodOrder.findAll({
      attributes: [
        'status',
        [FoodOrder.sequelize.fn('COUNT', FoodOrder.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    // Get recent orders
    const recentOrders = await FoodOrder.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get popular restaurants
    const popularRestaurants = await Restaurant.findAll({
      attributes: [
        'id', 'name', 'rating',
        [Restaurant.sequelize.fn('COUNT', Restaurant.sequelize.col('orderItems.id')), 'orderCount']
      ],
      include: [
        {
          model: FoodOrderItem,
          as: 'orderItems',
          attributes: []
        }
      ],
      group: ['Restaurant.id'],
      order: [[Restaurant.sequelize.literal('orderCount'), 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      stats: {
        totalOrders,
        totalRevenue: parseFloat(revenueResult?.dataValues?.totalRevenue || 0),
        ordersByStatus,
        recentOrders,
        popularRestaurants
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant, User } = getModels();

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: orders } = await FoodOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: FoodOrderItem,
          as: 'orderItems',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              attributes: ['id', 'name', 'price']
            },
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name']
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// ==================== SEARCH AND FILTERS ====================

// Search restaurants and menu items
exports.search = async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    const { Restaurant, MenuItem } = getModels();

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${q}%`;

    let results = {
      restaurants: [],
      menuItems: []
    };

    if (type === 'all' || type === 'restaurants') {
      const { count: restaurantCount, rows: restaurants } = await Restaurant.findAndCountAll({
        where: {
          [Op.and]: [
            { isActive: true },
            {
              [Op.or]: [
                { name: { [Op.iLike]: searchTerm } },
                { cuisine: { [Op.iLike]: searchTerm } },
                { description: { [Op.iLike]: searchTerm } }
              ]
            }
          ]
        },
        limit: parseInt(limit),
        offset: offset
      });

      results.restaurants = restaurants;
    }

    if (type === 'all' || type === 'menu') {
      const { count: menuCount, rows: menuItems } = await MenuItem.findAndCountAll({
        where: {
          [Op.and]: [
            { isAvailable: true },
            {
              [Op.or]: [
                { name: { [Op.iLike]: searchTerm } },
                { description: { [Op.iLike]: searchTerm } }
              ]
            }
          ]
        },
        include: [
          {
            model: Restaurant,
            as: 'restaurant',
            attributes: ['id', 'name', 'deliveryTime']
          }
        ],
        limit: parseInt(limit),
        offset: offset
      });

      results.menuItems = menuItems;
    }

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      results,
      query: q
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

