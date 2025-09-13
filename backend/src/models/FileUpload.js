const { Model, DataTypes } = require('sequelize');

class FileUpload extends Model {
  static initModel(sequelize) {
    FileUpload.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      originalName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileSize: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      uploadPath: {
        type: DataTypes.TEXT,
        allowNull: false
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
      modelName: 'FileUpload',
      tableName: 'file_uploads',
      timestamps: true
    });
    return FileUpload;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = FileUpload; 