const { Model, DataTypes } = require('sequelize');

class Service extends Model {
  static initModel(sequelize) {
    Service.init({

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
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.TEXT, // URL or base64
    allowNull: true
  },
  requirements: {
    type: DataTypes.JSON, // Array of requirements
    allowNull: true
  },
  specializations: {
    type: DataTypes.JSON, // Array of required specializations
    allowNull: true
  },
  // Additional fields for better doctor matching
  minExperience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  maxPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'Service',

  timestamps: true,
  tableName: 'services'

    });
    return Service;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Service;
