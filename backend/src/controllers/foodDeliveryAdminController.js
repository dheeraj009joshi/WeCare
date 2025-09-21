const { getModels } = require('../models');
const { Op } = require('sequelize');

// Admin Dashboard - Get overview statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const { FoodOrder, Restaurant, MenuItem, User } = getModels();
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Order statistics
    const totalOrders = await FoodOrder.count();
    const todayOrders = await FoodOrder.count({
      where: {
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        }
      }
    });

    const monthlyOrders = await FoodOrder.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Revenue statistics
    const totalRevenue = await FoodOrder.sum('total', {
      where: { paymentStatus: 'paid' }
    });

    const todayRevenue = await FoodOrder.sum('total', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: startOfDay,
          [Op.lt]: endOfDay
        }
      }
    });

    const monthlyRevenue = await FoodOrder.sum('total', {
      where: {
        paymentStatus: 'paid',
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    // Restaurant and menu statistics
    const totalRestaurants = await Restaurant.count({ where: { isActive: true } });
    const totalMenuItems = await MenuItem.count({ where: { isAvailable: true } });
    const totalCategories = await FoodCategory.count({ where: { isActive: true } });

    // Order status breakdown
    const orderStatusStats = await FoodOrder.findAll({
      attributes: [
        'status',
        [FoodOrder.sequelize.fn('COUNT', FoodOrder.sequelize.col('status')), 'count']
      ],
      group: ['status']
    });

    // Popular items (most ordered)
    const popularItems = await FoodOrderItem.findAll({
      attributes: [
        'menuItemId',
        [FoodOrderItem.sequelize.fn('SUM', FoodOrderItem.sequelize.col('quantity')), 'totalOrdered'],
        [FoodOrderItem.sequelize.fn('COUNT', FoodOrderItem.sequelize.col('orderId')), 'orderCount']
      ],
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['name', 'price', 'image'],
          include: [
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['name']
            }
          ]
        }
      ],
      group: ['menuItemId', 'menuItem.id', 'menuItem->restaurant.id'],
      order: [[FoodOrderItem.sequelize.fn('SUM', FoodOrderItem.sequelize.col('quantity')), 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      stats: {
        orders: {
          total: totalOrders || 0,
          today: todayOrders || 0,
          monthly: monthlyOrders || 0,
          statusBreakdown: orderStatusStats.reduce((acc, item) => {
            acc[item.status] = parseInt(item.dataValues.count);
            return acc;
          }, {})
        },
        revenue: {
          total: parseFloat(totalRevenue || 0),
          today: parseFloat(todayRevenue || 0),
          monthly: parseFloat(monthlyRevenue || 0)
        },
        inventory: {
          restaurants: totalRestaurants,
          menuItems: totalMenuItems,
          categories: totalCategories
        },
        popularItems: popularItems.map(item => ({
          id: item.menuItemId,
          name: item.menuItem?.name || 'Unknown Item',
          restaurantName: item.menuItem?.restaurant?.name || 'Unknown Restaurant',
          totalOrdered: parseInt(item.dataValues.totalOrdered),
          orderCount: parseInt(item.dataValues.orderCount),
          price: item.menuItem?.price || 0
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Admin Restaurant Management
exports.getAllRestaurants = async (req, res) => {
  try {
    const { Restaurant, FoodCategory } = getModels();
    const { page = 1, limit = 10, search, category, isActive } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { cuisine: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: restaurants } = await Restaurant.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: MenuItem,
          as: 'menuItems',
          attributes: ['id', 'name', 'price', 'isAvailable'],
          where: { isAvailable: true },
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      success: true,
      message: 'Restaurants retrieved successfully',
      restaurants: restaurants.map(restaurant => ({
        ...restaurant.toJSON(),
        menuItemsCount: restaurant.menuItems?.length || 0
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { Restaurant } = getModels();
    const {
      name,
      category,
      cuisine,
      rating = 4.0,
      deliveryTime,
      priceRange,
      image,
      description,
      address,
      phone,
      openingTime = '09:00:00',
      closingTime = '22:00:00'
    } = req.body;

    if (!name || !category || !cuisine || !deliveryTime || !priceRange) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, cuisine, delivery time, and price range are required'
      });
    }

    const restaurant = await Restaurant.create({
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
      closingTime,
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

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { Restaurant } = getModels();
    const { id } = req.params;
    const updateData = req.body;

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

// Delete restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const { Restaurant } = getModels();
    const { id } = req.params;

    const restaurant = await Restaurant.findByPk(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Soft delete - mark as inactive
    await restaurant.update({ isActive: false });

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Menu Item Management
exports.getMenuItems = async (req, res) => {
  try {
    const { MenuItem, Restaurant } = getModels();
    const { restaurantId } = req.params;
    const { page = 1, limit = 20, search, category, isAvailable } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = { restaurantId: restaurantId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (isAvailable !== undefined) {
      whereClause.isAvailable = isAvailable === 'true';
    }

    const { count, rows: menuItems } = await MenuItem.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['id', 'name', 'category']
        }
      ],
      order: [['createdAt', 'DESC']],
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

// Create menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { MenuItem, Restaurant } = getModels();
    const { restaurantId } = req.params;
    const {
      name,
      description,
      price,
      category,
      image,
      isVegetarian = true,
      isVegan = false,
      isGlutenFree = false,
      calories,
      ingredients,
      allergens,
      preparationTime,
      isPopular = false
    } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    const menuItem = await MenuItem.create({
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
      preparationTime,
      isPopular,
      isAvailable: true
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

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { MenuItem } = getModels();
    const { id } = req.params;
    const updateData = req.body;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
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

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { MenuItem } = getModels();
    const { id } = req.params;

    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Soft delete - mark as unavailable
    await menuItem.update({ isAvailable: false });

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete menu item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const { FoodOrder, FoodOrderItem, MenuItem, Restaurant, User } = getModels();
    const { 
      page = 1, 
      limit = 20, 
      status, 
      paymentMethod, 
      paymentStatus,
      startDate,
      endDate 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }

    if (paymentMethod) {
      whereClause.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      whereClause.paymentStatus = paymentStatus;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

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
              attributes: ['id', 'name', 'price'],
              required: false
            },
            {
              model: Restaurant,
              as: 'restaurant',
              attributes: ['id', 'name'],
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
