const { Model, DataTypes } = require('sequelize');

class Address extends Model {
  static initModel(sequelize) {
    Address.init({

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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  }

    }, {
      sequelize,
      modelName: 'Address',

  tableName: 'addresses',
  timestamps: true

    });
    return Address;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Address;
