const { Model, DataTypes } = require('sequelize');

class User extends Model {
  static initModel(sequelize) {
    User.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      age: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      height: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      bloodGroup: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      allergies: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      lifestyle: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.TEXT, // base64 string or URL
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('user', 'doctor', 'admin'),
        defaultValue: 'user',
      },
    }, {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true
    });
    return User;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = User; 