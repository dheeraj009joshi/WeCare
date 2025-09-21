const { Model, DataTypes } = require('sequelize');

class FoodOrder extends Model {
  static initModel(sequelize) {
    FoodOrder.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM,
    values: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 30.00
  },
  taxes: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM,
    values: ['card', 'upi', 'cod'],
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM,
    values: ['pending', 'paid', 'failed', 'refunded'],
    defaultValue: 'pending'
  },
  // Delivery Address
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false
    // Structure: { fullName, phone, address, city, pincode }
  },
  estimatedDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  actualDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveryInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'FoodOrder',

  timestamps: true,
  tableName: 'food_orders'

    });
    return FoodOrder;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FoodOrder;
