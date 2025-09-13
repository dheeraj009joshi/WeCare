const { getModels } = require('../models');

const { Op } = require('sequelize');
const { sendAppointmentConfirmation, sendDoctorAppointmentNotification } = require('../services/emailService');

// Create a new appointment booking
const createBooking = async (req, res) => {
  try {
    const { Doctor, Appointment, User } = getModels();
    
    const {
      doctorName,
      patientName,
      phone,
      email,
      age,
      gender,
      appointmentDate,
      appointmentTime,
      problemDescription,
      termsAccepted,
      userId // Add userId for authenticated users
    } = req.body;

    // Validate required fields
    if (!doctorName || !appointmentDate || !appointmentTime || !problemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'Terms and conditions must be accepted'
      });
    }

    // Find doctor by name
    const doctor = await Doctor.findOne({
      where: {
        name: {
          [Op.iLike]: `%${doctorName}%`
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if doctor is available
    if (!doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available for appointments'
      });
    }

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        doctorId: doctor.id,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Find user by userId (for authenticated users) or phone number
    let user;
    if (userId) {
      user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else {
      // Fallback to phone number lookup for non-authenticated users
      user = await User.findOne({
        where: { phone }
      });

      if (!user) {
        // Create new user if not exists
        user = await User.create({
          name: patientName,
          email: email || null,
          phone,
          age: age || null,
          gender: gender || null
        });
      } else {
        // Update user information if exists
        await user.update({
          name: patientName,
          email: email || user.email,
          age: age || user.age,
          gender: gender || user.gender
        });
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId: doctor.id,
      patientId: user.id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      condition: problemDescription,
      symptoms: problemDescription,
      fee: doctor.consultationFee,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Update doctor statistics
    await doctor.update({
      totalAppointments: doctor.totalAppointments + 1
    });

    // Send email notifications
    try {
      // Send confirmation email to patient
      if (user.email) {
        await sendAppointmentConfirmation(
          user.name,
          user.email,
          doctor.name,
          appointment.appointmentDate,
          appointment.appointmentTime
        );
      }

      // Send notification email to doctor
      if (doctor.email) {
        await sendDoctorAppointmentNotification(
          doctor.email,
          doctor.name,
          user.name,
          appointment.appointmentDate,
          appointment.appointmentTime
        );
      }
    } catch (emailError) {
      console.error('Failed to send appointment emails:', emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointmentId: appointment.id,
        doctorName: doctor.name,
        patientName: user.name,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        fee: appointment.fee,
        status: appointment.status
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get available time slots for a doctor on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { Doctor, Appointment } = getModels();
    
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and date are required'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get booked slots for the date
    const bookedSlots = await Appointment.findAll({
      where: {
        doctorId,
        appointmentDate: new Date(date),
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      },
      attributes: ['appointmentTime']
    });

    const bookedTimes = bookedSlots.map(slot => slot.appointmentTime);

    // Available time slots
    const allSlots = [
      "09:00 AM",
      "10:30 AM", 
      "12:00 PM",
      "02:00 PM",
      "03:30 PM",
      "05:00 PM"
    ];

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({
      success: true,
      data: {
        availableSlots,
        bookedSlots: bookedTimes,
        doctorName: doctor.name,
        consultationFee: doctor.consultationFee
      }
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { Doctor, Appointment, User } = getModels();
    
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['name', 'specializations', 'consultationFee', 'profilePicture']
        },
        {
          model: User,
          as: 'patient',
          attributes: ['name', 'email', 'phone', 'age', 'gender']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment',
      error: error.message
    });
  }
};

// Get appointments for a user
const getUserAppointments = async (req, res) => {
  try {
    const { Doctor, Appointment } = getModels();
    
    const { userId } = req.params;

    const appointments = await Appointment.findAll({
      where: {
        patientId: userId
      },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['name', 'specializations', 'profilePicture']
        }
      ],
      order: [['appointmentDate', 'DESC']]
    });

    res.json({
      success: true,
      data: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('Error getting user appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user appointments',
      error: error.message
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { Appointment } = getModels();
    
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled'
      });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed appointment'
      });
    }

    await appointment.update({
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
};

// Get user profile data for booking form
const getUserProfileForBooking = async (req, res) => {
  try {
    const { User } = getModels();
    
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'age', 'gender', 'address']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Error getting user profile for booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// Update appointment status (for doctors)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { Appointment } = getModels();
    
    const { id } = req.params;
    const { status, prescription, notes } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const updateData = { status };
    if (prescription) updateData.prescription = prescription;
    if (notes) updateData.notes = notes;

    await appointment.update(updateData);

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getAvailableSlots,
  getAppointmentById,
  getUserAppointments,
  cancelAppointment,
  updateAppointmentStatus,
  getUserProfileForBooking
}; 