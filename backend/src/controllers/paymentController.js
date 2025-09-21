const { getModels } = require('../models');

const { sequelize } = require('../config/db');

// Generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Process COD payment and create order
exports.processCODPayment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { Order, OrderItem, Cart, Product } = getModels();
    const userId = req.user.id;
    const {
      deliveryAddress,
      deliveryPhone,
      deliveryName,
      notes
    } = req.body;

    // Validate required fields
    if (!deliveryAddress || !deliveryPhone || !deliveryName) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address, phone, and name are required'
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
      if (!cartItem.product) {
        return res.status(400).json({ success: false, message: 'One or more products in your cart no longer exist' });
      }
      if (cartItem.product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${cartItem.product.name}`
        });
      }
      totalAmount += Number(cartItem.price) * cartItem.quantity;
    }

    // Normalize address JSON
    const normalizedAddress = typeof deliveryAddress === 'string' ? { address: deliveryAddress } : deliveryAddress;

    // Create order with COD payment method
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId,
      totalAmount,
      paymentMethod: 'cod',
      paymentStatus: 'pending', // COD orders are pending until delivery
      status: 'confirmed', // COD orders are confirmed immediately
      deliveryAddress: normalizedAddress,
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
      message: 'Order placed successfully with COD payment',
      data: completeOrder
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    
    console.error('Error processing COD payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing COD payment',
      error: error.message
    });
  }
};

// Get payment status for an order
exports.getPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { id: orderId, userId },
      attributes: ['id', 'orderNumber', 'paymentMethod', 'paymentStatus', 'totalAmount']
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};
