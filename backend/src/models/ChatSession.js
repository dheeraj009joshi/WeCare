const { Model, DataTypes } = require('sequelize');

class ChatSession extends Model {
  static initModel(sequelize) {
    ChatSession.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING,
        defaultValue: 'Chat'
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'ChatSession',
      tableName: 'chat_sessions',
      timestamps: true
    });
    return ChatSession;
  }

  static associate(models) {
    ChatSession.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

module.exports = ChatSession; 