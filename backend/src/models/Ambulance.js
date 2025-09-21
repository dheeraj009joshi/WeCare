const { Model, DataTypes } = require('sequelize');

class Ambulance extends Model {
  static initModel(sequelize) {
    Ambulance.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  providerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zipCode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  ambulanceType: {
    type: DataTypes.ENUM('basic', 'advanced', 'cardiac', 'neonatal', 'air'),
    defaultValue: 'basic'
  },
  status: {
    type: DataTypes.ENUM('available', 'assigned', 'busy', 'maintenance'),
    defaultValue: 'available'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  responseTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  contactPerson: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyNumber: {
    type: DataTypes.STRING,
    allowNull: false
  }

    }, {
      sequelize,
      modelName: 'Ambulance',

  timestamps: true,
  tableName: 'ambulances',
  indexes: [
    {
      fields: ['city', 'state']
    },
    {
      fields: ['isAvailable']
    },
    {
      fields: ['status']
    },
    {
      fields: ['ambulanceType']
    }
  ]

    });
    return Ambulance;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Ambulance;
