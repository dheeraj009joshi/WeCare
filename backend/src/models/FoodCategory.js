const { Model, DataTypes } = require('sequelize');

class FoodCategory extends Model {
  static initModel(sequelize) {
    FoodCategory.init({

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
  identifier: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // e.g., 'khichdi', 'fruits', 'juice'
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }

    }, {
      sequelize,
      modelName: 'FoodCategory',

  timestamps: true,
  tableName: 'food_categories'

    });
    return FoodCategory;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FoodCategory;
