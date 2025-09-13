const { Model, DataTypes } = require('sequelize');

class Product extends Model {
  static initModel(sequelize) {
    Product.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false
      },
      prescription: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dosha: {
        type: DataTypes.STRING,
        allowNull: true
      },
      benefits: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      manufacturer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
      timestamps: true
    });
    return Product;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Product;
