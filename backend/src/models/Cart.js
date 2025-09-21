const { Model, DataTypes } = require('sequelize');

class Cart extends Model {
  static initModel(sequelize) {
    Cart.init({
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
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'Cart',
      tableName: 'carts',
      timestamps: true
    });
    return Cart;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Cart;
