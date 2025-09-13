const { Model, DataTypes } = require('sequelize');

class FoodCart extends Model {
  static initModel(sequelize) {
    FoodCart.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
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
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  specialInstructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true // For guest users
  }

    }, {
      sequelize,
      modelName: 'FoodCart',

  timestamps: true,
  tableName: 'food_cart'

    });
    return FoodCart;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FoodCart;
