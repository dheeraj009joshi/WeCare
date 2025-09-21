const { getModels } = require('../models');

const { sequelize } = require('../config/db');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Create new order
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { Order, OrderItem, Cart, Product } = getModels();
    
    const userId = req.user.id;
    const {
      deliveryAddress,
      deliveryPhone,
      deliveryName,
      paymentMethod,
      notes
    } = req.body;

    // Validate required fields
    if (!deliveryAddress || !deliveryPhone || !deliveryName || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address, phone, name, and payment method are required'
      });
    }

    // Get user's cart
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total amount and validate stock
    let totalAmount = 0;
    for (const cartItem of cartItems) {
      if (cartItem.product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${cartItem.product.name}`
        });
      }
      totalAmount += cartItem.price * cartItem.quantity;
    }

    // Create order
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      totalAmount,
      paymentMethod,
      deliveryAddress,
      deliveryPhone,
      deliveryName,
      notes,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }, { transaction });

    // Create order items and update stock
    const orderItems = [];
    for (const cartItem of cartItems) {
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        totalPrice: cartItem.price * cartItem.quantity
      }, { transaction });

      // Update product stock
      await Product.update(
        { stock: cartItem.product.stock - cartItem.quantity },
        { 
          where: { id: cartItem.productId },
          transaction 
        }
      );

      orderItems.push(orderItem);
    }

    // Clear user's cart
    await Cart.destroy({
      where: { userId },
      transaction
    });

    // Commit transaction
    await transaction.commit();

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: completeOrder
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const { Order, OrderItem, Product } = getModels();
    
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category']
        }]
      }],
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

// Get single order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { Order, OrderItem, Product } = getModels();
    
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category', 'description']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { Order, OrderItem, Product } = getModels();
    
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: { id, userId },
      include: [{
        model: OrderItem,
        as: 'orderItems'
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that is already shipped or delivered'
      });
    }

    // Update order status
    await order.update({ status: 'cancelled' }, { transaction });

    // Restore product stock
    for (const orderItem of order.orderItems) {
      await Product.increment(
        { stock: orderItem.quantity },
        { 
          where: { id: orderItem.productId },
          transaction 
        }
      );
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    await transaction.rollback();
    
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Get order status
exports.getOrderStatus = async (req, res) => {
  try {
    const { Order } = getModels();
    
    const { orderNumber } = req.params;

    const order = await Order.findOne({
      where: { orderNumber },
      attributes: ['id', 'orderNumber', 'status', 'createdAt', 'estimatedDelivery']
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order status',
      error: error.message
    });
  }
};
