const { getModels } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db'); 

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  const { Doctor, Appointment, User } = getModels();
  try {
    const doctorId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Run all independent queries in parallel
    const [
      todayAppointments,
      pendingAppointments,
      unreadMessages,
      totalPatients,
      totalEarnings,
      recentAppointments
    ] = await Promise.all([
      Appointment.count({
        where: {
          doctorId: doctorId,
          appointmentDate: {
            [Op.gte]: today,
            [Op.lt]: tomorrow
          }
        }
      }),
      Appointment.count({
        where: {
          doctorId: doctorId,
          status: 'pending'
        }
      }),
      DoctorMessage.count({
        where: {
          doctorId: doctorId,
          sender: 'patient',
          isRead: false
        }
      }),
      Appointment.count({
        where: {
          doctorId: doctorId
        },
        distinct: true,
        col: 'patientId'
      }),
      Appointment.sum('fee', {
        where: {
          doctorId: doctorId,
          status: 'completed',
          paymentStatus: 'paid'
        }
      }),
      Appointment.findAll({
        where: {
          doctorId: doctorId
        },
        include: [{
          model: User,
          as: 'patient',
          attributes: ['name', 'email', 'phone']
        }],
        order: [['appointmentDate', 'ASC']],
        limit: 5
      })
    ]);

    res.status(200).json({
      stats: {
        todayAppointments,
        pendingAppointments,
        unreadMessages,
        totalPatients,
        totalEarnings: totalEarnings || 0
      },
      recentAppointments
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Appointments
const getAppointments = async (req, res) => {
  const { Appointment, User } = getModels();
  try {
    const doctorId = req.user.id;
    const { date, status, page = 1, limit = 10 } = req.query;

    let whereClause = { doctorId: doctorId };

    // Filter by date
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.appointmentDate = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    const offset = (page - 1) * limit;

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'patient',
        attributes: ['name', 'email', 'phone']
      }],
      order: [['appointmentDate', 'ASC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      appointments: appointments.rows,
      total: appointments.count,
      page: parseInt(page),
      totalPages: Math.ceil(appointments.count / limit)
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Appointment Status
const updateAppointmentStatus = async (req, res) => {
  const { Appointment } = getModels();
  try {
    const doctorId = req.user.id;
    const { appointmentId } = req.params;
    const { status, notes, prescription } = req.body;

    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        doctorId: doctorId
      }
    });

    if (!appointment) {
      return res.status(404).json({
        message: 'Appointment not found'
      });
    }

    await appointment.update({
      status,
      notes,
      prescription
    });

    res.status(200).json({
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Patients
const getPatients = async (req, res) => {
  const { Appointment, User } = getModels();
  try {
    const doctorId = req.user.id;
    const { page = 1, limit = 10, search } = req.query;

    let whereClause = { doctorId: doctorId };
    if (search) {
      whereClause = {
        doctorId: doctorId,
        '$patient.name$': { [Op.iLike]: `%${search}%` }
      };
    }

    const offset = (page - 1) * limit;

    // Get patients with appointment counts in a single grouped query
    const patientAppointments = await Appointment.findAndCountAll({
      where: whereClause,
      attributes: [
        'patientId',
        [sequelize.fn('COUNT', sequelize.col('Appointment.id')), 'appointmentCount']
      ],
      include: [{
        model: User,
        as: 'patient',
        attributes: ['id', 'name', 'email', 'phone', 'dob', 'gender']
      }],
      group: ['patientId', 'patient.id'],
      order: [[{ model: User, as: 'patient' }, 'name', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      subQuery: false
    });

    // Transform the result to match the expected format
    const patientsWithAppointments = patientAppointments.rows.map(row => ({
      ...row.patient.toJSON(),
      appointmentCount: parseInt(row.dataValues.appointmentCount)
    }));

    res.status(200).json({
      patients: patientsWithAppointments,
      total: patientAppointments.count.length,
      page: parseInt(page),
      totalPages: Math.ceil(patientAppointments.count.length / limit)
    });

  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Messages
const getMessages = async (req, res) => {
  const { DoctorMessage, User } = getModels();
  try {
    const doctorId = req.user.id;
    const { patientId, page = 1, limit = 20 } = req.query;

    let whereClause = { doctorId: doctorId };
    if (patientId) {
      whereClause.patientId = patientId;
    }

    const offset = (page - 1) * limit;

    const messages = await DoctorMessage.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'patient',
        attributes: ['name', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.status(200).json({
      messages: messages.rows,
      total: messages.count,
      page: parseInt(page),
      totalPages: Math.ceil(messages.count / limit)
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Send Message
const sendMessage = async (req, res) => {
  const { DoctorMessage } = getModels();
  try {
    const doctorId = req.user.id;
    const { patientId, message, messageType = 'text', appointmentId } = req.body;

    const newMessage = await DoctorMessage.create({
      doctorId,
      patientId,
      sender: 'doctor',
      message,
      messageType,
      appointmentId
    });

    const messageWithPatient = await DoctorMessage.findByPk(newMessage.id, {
      include: [{
        model: User,
        as: 'patient',
        attributes: ['name', 'email']
      }]
    });

    res.status(201).json({
      message: 'Message sent successfully',
      data: messageWithPatient
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Mark Messages as Read
const markMessagesAsRead = async (req, res) => {
  const { DoctorMessage } = getModels();
  try {
    const doctorId = req.user.id;
    const { patientId } = req.params;

    await DoctorMessage.update(
      { isRead: true },
      {
        where: {
          doctorId: doctorId,
          patientId: patientId,
          sender: 'patient',
          isRead: false
        }
      }
    );

    res.status(200).json({
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Availability
const getAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const availability = await DoctorAvailability.findAll({
      where: { doctorId: doctorId },
      order: [['dayOfWeek', 'ASC']]
    });

    res.status(200).json({
      availability
    });

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update Availability
const updateAvailability = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { availability } = req.body;

    // Delete existing availability
    await DoctorAvailability.destroy({
      where: { doctorId: doctorId }
    });

    // Create new availability
    if (availability && availability.length > 0) {
      const availabilityData = availability.map(slot => ({
        ...slot,
        doctorId: doctorId
      }));

      await DoctorAvailability.bulkCreate(availabilityData);
    }

    res.status(200).json({
      message: 'Availability updated successfully'
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get Earnings
const getEarnings = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    let whereClause = {
      doctorId: doctorId,
      status: 'completed',
      paymentStatus: 'paid'
    };

    if (startDate && endDate) {
      whereClause.appointmentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const offset = (page - 1) * limit;

    const earnings = await Appointment.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'patient',
        attributes: ['name', 'email']
      }],
      order: [['appointmentDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const totalEarnings = await Appointment.sum('fee', {
      where: whereClause
    });

    const totalAppointments = await Appointment.count({
      where: whereClause
    });

    res.status(200).json({
      earnings: earnings.rows,
      totalEarnings: totalEarnings || 0,
      totalAppointments,
      page: parseInt(page),
      totalPages: Math.ceil(earnings.count / limit)
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getAppointments,
  updateAppointmentStatus,
  getPatients,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getAvailability,
  updateAvailability,
  getEarnings
}; 