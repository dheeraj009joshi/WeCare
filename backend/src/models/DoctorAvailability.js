const { Model, DataTypes } = require('sequelize');

class DoctorAvailability extends Model {
  static initModel(sequelize) {
    DoctorAvailability.init({

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
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0 = Sunday, 1 = Monday, etc.
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    }
  },
  startTime: {
    type: DataTypes.STRING, // Format: "09:00"
    allowNull: false
  },
  endTime: {
    type: DataTypes.STRING, // Format: "17:00"
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxAppointments: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  appointmentDuration: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 30
  },
  breakStart: {
    type: DataTypes.STRING, // Format: "12:00"
    allowNull: true
  },
  breakEnd: {
    type: DataTypes.STRING, // Format: "13:00"
    allowNull: true
  }

    }, {
      sequelize,
      modelName: 'DoctorAvailability',

  timestamps: true,
  tableName: 'doctor_availabilities',
  indexes: [
    {
      fields: ['doctorId', 'dayOfWeek']
    }
  ]

    });
    return DoctorAvailability;
  }

  static associate(models) {
    // Associations will be defined in models/index.js
  }
}

module.exports = DoctorAvailability;
