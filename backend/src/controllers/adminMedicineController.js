// Helper function to get models only when needed
const getModels = () => {
  const { Product, Order, OrderItem, User } = require('../models');
  return { Product, Order, OrderItem, User };
};

const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const { sendOrderStatusUpdate } = require('../services/emailService');

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const { Order, OrderItem, Product, User } = getModels();
    
    const { page = 1, limit = 20, status, search } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Add filters
    if (status) {
      whereClause.status = status;
    }

    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    let includeClause = [{
      model: OrderItem,
      as: 'orderItems',
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'category']
      }]
    }, {
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email', 'phone']
    }];

    // Add search functionality
    if (search) {
      includeClause.push({
        model: User,
        as: 'user',
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } }
          ]
        },
        attributes: ['id', 'name', 'email', 'phone']
      });
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.update({ status });

    // Send email notification to user about order status update
    try {
      const user = await User.findByPk(order.userId);
      if (user) {
        await sendOrderStatusUpdate(
          user.name,
          user.email,
          order.orderNumber || order.id,
          status,
          order.totalAmount
        );
      }
    } catch (emailError) {
      console.error('Failed to send order status update email:', emailError);
      // Don't fail the status update if email fails
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total products
    const totalProducts = await Product.count({ where: { isActive: true } });

    // Low stock products (less than 10)
    const lowStockProducts = await Product.count({
      where: {
        stock: { [Op.lt]: 10 },
        isActive: true
      }
    });

    // Out of stock products
    const outOfStockProducts = await Product.count({
      where: {
        stock: 0,
        isActive: true
      }
    });

    // Total orders
    const totalOrders = await Order.count();

    // Orders this month
    const monthlyOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Orders this year
    const yearlyOrders = await Order.count({
      where: {
        createdAt: { [Op.gte]: startOfYear }
      }
    });

    // Total revenue
    const totalRevenue = await Order.sum('totalAmount', {
      where: { status: 'delivered' }
    });

    // Monthly revenue
    const monthlyRevenue = await Order.sum('totalAmount', {
      where: {
        status: 'delivered',
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    // Yearly revenue
    const yearlyRevenue = await Order.sum('totalAmount', {
      where: {
        status: 'delivered',
        createdAt: { [Op.gte]: startOfYear }
      }
    });

    // Pending orders
    const pendingOrders = await Order.count({
      where: { status: 'pending' }
    });

    // Processing orders
    const processingOrders = await Order.count({
      where: { status: 'processing' }
    });

    // Shipped orders
    const shippedOrders = await Order.count({
      where: { status: 'shipped' }
    });

    res.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        orders: {
          total: totalOrders,
          monthly: monthlyOrders,
          yearly: yearlyOrders,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders
        },
        revenue: {
          total: parseFloat(totalRevenue || 0),
          monthly: parseFloat(monthlyRevenue || 0),
          yearly: parseFloat(yearlyRevenue || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.findAll({
      where: {
        stock: { [Op.lte]: parseInt(threshold) },
        isActive: true
      },
      order: [['stock', 'ASC']]
    });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products',
      error: error.message
    });
  }
};

// Bulk update stock
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = [];
    for (const update of updates) {
      const { productId, stock } = update;
      
      if (stock < 0) {
        results.push({
          productId,
          success: false,
          message: 'Stock cannot be negative'
        });
        continue;
      }

      try {
        const product = await Product.findByPk(productId);
        if (product) {
          await product.update({ stock });
          results.push({
            productId,
            success: true,
            message: 'Stock updated successfully'
          });
        } else {
          results.push({
            productId,
            success: false,
            message: 'Product not found'
          });
        }
      } catch (error) {
        results.push({
          productId,
          success: false,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error bulk updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk updating stock',
      error: error.message
    });
  }
};

// Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    let dateFormat;
    switch (groupBy) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const salesData = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'period'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
        [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalRevenue']
      ],
      where: {
        createdAt: {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        },
        status: 'delivered'
      },
      group: [sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE_TRUNC', groupBy, sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message
    });
  }
};

// Get all products for admin (with pagination and filters)
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      whereClause.category = category;
    }

    if (status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        products: products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      stock,
      category,
      prescription,
      dosha,
      benefits,
      description,
      manufacturer,
      image
    } = req.body;

    if (!name || !price || !stock || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, stock, and category are required'
      });
    }

    const product = await Product.create({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      prescription: prescription || false,
      dosha: dosha || '',
      benefits: benefits || '',
      description: description || '',
      manufacturer: manufacturer || '',
      image: image || '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update(updateData);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.update({ stock: parseInt(stock) });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};
