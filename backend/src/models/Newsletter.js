const { Model, DataTypes } = require('sequelize');

class Newsletter extends Model {
  static initModel(sequelize) {
    Newsletter.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'unsubscribed', 'pending'),
    defaultValue: 'active'
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'footer'
  }

    }, {
      sequelize,
      modelName: 'Newsletter',

  timestamps: true,
  tableName: 'newsletters'

    });
    return Newsletter;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Newsletter;
