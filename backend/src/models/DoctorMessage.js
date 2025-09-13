const { Model, DataTypes } = require('sequelize');

class DoctorMessage extends Model {
  static initModel(sequelize) {
    DoctorMessage.init({

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  sender: {
    type: DataTypes.ENUM('doctor', 'patient'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('text', 'image', 'file', 'prescription'),
    defaultValue: 'text'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'appointments',
      key: 'id'
    }
  }

    }, {
      sequelize,
      modelName: 'DoctorMessage',

  timestamps: true,
  tableName: 'doctor_messages',
  indexes: [
    {
      fields: ['doctorId', 'patientId', 'createdAt']
    },
    {
      fields: ['appointmentId']
    }
  ]

    });
    return DoctorMessage;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = DoctorMessage;
