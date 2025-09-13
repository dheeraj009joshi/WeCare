const { Model, DataTypes } = require('sequelize');

class FooterContent extends Model {
  static initModel(sequelize) {
    FooterContent.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('social_media', 'company_info', 'quick_links', 'contact_info'),
    allowNull: false
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  label: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'FooterContent',

  timestamps: true,
  tableName: 'footer_contents'

    });
    return FooterContent;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FooterContent;
