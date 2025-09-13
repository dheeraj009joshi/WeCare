const { Model, DataTypes } = require('sequelize');

class Message extends Model {
  static initModel(sequelize) {
    Message.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      sender: {
        type: DataTypes.ENUM('user', 'ai'),
        allowNull: false
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false
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
      modelName: 'Message',
      tableName: 'messages',
      timestamps: true
    });
    return Message;
  }

  static associate(models) {
    Message.belongsTo(models.ChatSession, { foreignKey: 'sessionId' });
  }
}

module.exports = Message; 