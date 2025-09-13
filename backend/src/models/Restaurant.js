const { Model, DataTypes } = require('sequelize');

class Restaurant extends Model {
  static initModel(sequelize) {
    Restaurant.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'khichdi', 'fruits', 'juice'
  },
  cuisine: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 4.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  deliveryTime: {
    type: DataTypes.STRING,
    allowNull: false // e.g., "20 mins"
  },
  priceRange: {
    type: DataTypes.STRING,
    allowNull: false // e.g., "₹120-₹200"
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isOpen: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  openingTime: {
    type: DataTypes.TIME,
    defaultValue: '09:00:00'
  },
  closingTime: {
    type: DataTypes.TIME,
    defaultValue: '22:00:00'
  }

    }, {
      sequelize,
      modelName: 'Restaurant',

  timestamps: true,
  tableName: 'restaurants'

    });
    return Restaurant;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Restaurant;
