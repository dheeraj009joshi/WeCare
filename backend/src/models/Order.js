const { Model, DataTypes } = require('sequelize');

class Order extends Model {
  static initModel(sequelize) {
    Order.init({

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
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  deliveryAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  deliveryPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deliveryName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'Order',

  tableName: 'orders',
  timestamps: true

    });
    return Order;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Order;
