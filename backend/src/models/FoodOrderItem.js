const { Model, DataTypes } = require('sequelize');

class FoodOrderItem extends Model {
  static initModel(sequelize) {
    FoodOrderItem.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'food_orders',
      key: 'id'
    }
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'menu_items',
      key: 'id'
    }
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'restaurants',
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
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Store item details at time of order (in case menu item is updated/deleted later)
  itemSnapshot: {
    type: DataTypes.JSON,
    allowNull: false
    // Structure: { name, description, price, restaurant details }
  }

    }, {
      sequelize,
      modelName: 'FoodOrderItem',

  timestamps: true,
  tableName: 'food_order_items'

    });
    return FoodOrderItem;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FoodOrderItem;
