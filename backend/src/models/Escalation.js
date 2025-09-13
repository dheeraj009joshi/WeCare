const { Model, DataTypes } = require('sequelize');

class Escalation extends Model {
  static initModel(sequelize) {
    Escalation.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      triggeredBy: {
        type: DataTypes.ENUM('ai', 'user'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'closed'),
        defaultValue: 'open'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      sessionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chat_sessions',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'Escalation',
      tableName: 'escalations',
      timestamps: true
    });
    return Escalation;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Escalation; 