const { Model, DataTypes } = require('sequelize');

class Appointment extends Model {
  static initModel(sequelize) {
    Appointment.init({

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
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  appointmentTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  appointmentType: {
    type: DataTypes.ENUM('video_call', 'chat', 'in_person'),
    defaultValue: 'video_call'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show'),
    defaultValue: 'pending'
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingPassword: {
    type: DataTypes.STRING,
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'Appointment',

  timestamps: true,
  tableName: 'appointments',
  indexes: [
    {
      fields: ['doctorId', 'appointmentDate']
    },
    {
      fields: ['patientId', 'appointmentDate']
    },
    {
      fields: ['status']
    }
  ]

    });
    return Appointment;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = Appointment;
