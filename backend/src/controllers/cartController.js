const { getModels } = require('../models');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const { Cart, Product } = getModels();
    
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'stock', 'image', 'category']
      }]
    });

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        items: cartItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        itemCount: cartItems.length
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const { Cart, Product } = getModels();
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and has sufficient stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({
      where: { userId, productId }
    });

    if (cartItem) {
      // Update quantity if item already exists
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for requested quantity'
        });
      }

      await cartItem.update({
        quantity: newQuantity,
        price: product.price
      });
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        userId,
        productId,
        quantity,
        price: product.price
      });
    }

    // Fetch updated cart item with product details
    const updatedCartItem = await Cart.findByPk(cartItem.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'stock', 'image', 'category']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: updatedCartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const { Cart, Product } = getModels();
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cartItem = await Cart.findOne({
      where: { id, userId },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    await cartItem.update({ quantity });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cartItem
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { Cart } = getModels();
    const userId = req.user.id;
    const { id } = req.params;

    const cartItem = await Cart.findOne({
      where: { id, userId }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from cart',
      error: error.message
    });
  }
};

// Clear user's cart
exports.clearCart = async (req, res) => {
  try {
    const { Cart } = getModels();
    const userId = req.user.id;

    await Cart.destroy({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// Get cart summary (count and total)
exports.getCartSummary = async (req, res) => {
  try {
    const { Cart } = getModels();
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId }
    });

    const itemCount = cartItems.length;
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    res.json({
      success: true,
      data: {
        itemCount,
        totalAmount: parseFloat(totalAmount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart summary',
      error: error.message
    });
  }
};
