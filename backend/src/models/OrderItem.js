const { Model, DataTypes } = require('sequelize');

class OrderItem extends Model {
  static initModel(sequelize) {
    OrderItem.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }

    }, {
      sequelize,
      modelName: 'OrderItem',

  tableName: 'order_items',
  timestamps: true

    });
    return OrderItem;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = OrderItem;
