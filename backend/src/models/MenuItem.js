const { Model, DataTypes } = require('sequelize');

class MenuItem extends Model {
  static initModel(sequelize) {
    MenuItem.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
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
  category: {
    type: DataTypes.STRING,
    allowNull: true // e.g., 'main', 'beverage', 'dessert'
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isVegetarian: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isVegan: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isGlutenFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  ingredients: {
    type: DataTypes.JSON,
    allowNull: true // Array of ingredients
  },
  allergens: {
    type: DataTypes.JSON,
    allowNull: true // Array of allergens
  },
  preparationTime: {
    type: DataTypes.INTEGER,
    allowNull: true // in minutes
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isPopular: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }

    }, {
      sequelize,
      modelName: 'MenuItem',

  timestamps: true,
  tableName: 'menu_items'

    });
    return MenuItem;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = MenuItem;
