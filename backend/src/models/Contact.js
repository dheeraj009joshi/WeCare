const { Model, DataTypes } = require('sequelize');

class Contact extends Model {
  static initModel(sequelize) {
    Contact.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'in-progress', 'resolved', 'closed'),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  source: {
    type: DataTypes.STRING,
    defaultValue: 'footer'
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'Contact',

  timestamps: true,
  tableName: 'contacts'

    });
    return Contact;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Contact;
