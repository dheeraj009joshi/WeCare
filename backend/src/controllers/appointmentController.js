const { getModels } = require('../models');
const { Op } = require('sequelize');
const { sendEmail, emailTemplates } = require('../../utils/email');

// Create new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { Appointment, Doctor, User } = getModels();
    const { doctorId, appointmentDate, appointmentTime, appointmentType, notes, condition, symptoms, fee } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Doctor, date, and time are required' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate,
        appointmentTime,
        status: { [Op.notIn]: ['cancelled', 'completed'] }
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: userId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      appointmentType: appointmentType || 'video_call',
      notes,
      condition: condition || 'General Consultation',
      symptoms: symptoms || '',
      fee: fee || 0,
      status: 'confirmed'
    });

    // Update doctor statistics
    await doctor.update({
      totalAppointments: doctor.totalAppointments + 1
    });

    // Send email notifications
    try {
      // Send confirmation email to patient
      const patientHtml = emailTemplates.appointmentConfirmation(
        user.name,
        doctor.name,
        appointmentDate,
        appointmentTime,
        appointmentType || 'video_call'
      );
      await sendEmail(user.email, '✅ Appointment Confirmed - WeCure', patientHtml);

      // Send notification email to doctor
      const doctorHtml = emailTemplates.appointmentConfirmation(
        `Patient: ${user.name}`,
        doctor.name,
        appointmentDate,
        appointmentTime,
        appointmentType || 'video_call'
      );
      await sendEmail(doctor.email, '📅 New Appointment - WeCure', doctorHtml);

      // Note: Video call functionality can be added later
      // when the Appointment model is extended with those fields

    } catch (emailError) {
      console.error('Failed to send appointment emails:', emailError);
      // Don't fail the appointment creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
              data: {
          id: appointment.id,
          doctorName: doctor.name,
          appointmentDate,
          appointmentTime,
          appointmentType: appointment.appointmentType,
          status: appointment.status,
          condition: appointment.condition,
          fee: appointment.fee
        }
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ message: 'Failed to create appointment', error: error.message });
  }
};

// Get user appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const { Appointment, Doctor } = getModels();
    const userId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { patientId: userId },
      include: [
        { model: Doctor, as: 'doctor', attributes: ['name', 'specializations', 'profilePicture'] }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

// Get doctor appointments
exports.getDoctorAppointments = async (req, res) => {
  try {
    const { Appointment, User } = getModels();
    const doctorId = req.user.id;
    const appointments = await Appointment.findAll({
      where: { doctorId },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email', 'phone'] }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { Appointment, Doctor, User } = getModels();
    const { appointmentId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to update this appointment
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    const oldStatus = appointment.status;
    await appointment.update({ status, notes });

    // Send status update email if status changed
    if (oldStatus !== status) {
      try {
        const user = await User.findByPk(appointment.userId);
        const doctor = await Doctor.findByPk(appointment.doctorId);

        if (user && doctor) {
          const subject = `Appointment Status Updated - ${status}`;
          const html = `
            <h2>Appointment Status Update</h2>
            <p>Your appointment with Dr. ${doctor.name} has been updated to: <strong>${status}</strong></p>
            <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
            ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
          `;
          
          await sendEmail(user.email, subject, html);
        }
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    res.json({ success: true, message: 'Appointment status updated', data: appointment });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Failed to update appointment status', error: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { Appointment, User, Doctor } = getModels();
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to cancel this appointment
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    // Check if appointment can be cancelled (not too close to appointment time)
    const appointmentDateTime = new Date(`${appointment.appointmentDate} ${appointment.appointmentTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilAppointment < 24) {
      return res.status(400).json({ message: 'Appointments can only be cancelled 24 hours in advance' });
    }

    await appointment.update({ status: 'cancelled' });

    // Send cancellation email
    try {
      const user = await User.findByPk(appointment.userId);
      const doctor = await Doctor.findByPk(appointment.doctorId);

      if (user && doctor) {
        const subject = 'Appointment Cancelled - WeCure';
        const html = `
          <h2>Appointment Cancelled</h2>
          <p>Your appointment with Dr. ${doctor.name} has been cancelled.</p>
          <p><strong>Date:</strong> ${appointment.appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
          <p>To reschedule, please book a new appointment through our platform.</p>
        `;
        
        await sendEmail(user.email, subject, html);
        await sendEmail(doctor.email, `Appointment Cancelled - ${user.name}`, html);
      }
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
    }

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Failed to cancel appointment', error: error.message });
  }
};

// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, newTime } = req.body;
    const userId = req.user.id;

    if (!newDate || !newTime) {
      return res.status(400).json({ message: 'New date and time are required' });
    }

    const appointment = await Appointment.findByPk(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to reschedule this appointment
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to reschedule this appointment' });
    }

    // Check for conflicts with new time
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId: appointment.doctorId,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: { [Op.notIn]: ['cancelled', 'completed'] },
        id: { [Op.ne]: appointmentId }
      }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const oldDate = appointment.appointmentDate;
    const oldTime = appointment.appointmentTime;

    await appointment.update({
      appointmentDate: newDate,
      appointmentTime: newTime
    });

    // Send reschedule email
    try {
      const user = await User.findByPk(appointment.userId);
      const doctor = await Doctor.findByPk(appointment.doctorId);

      if (user && doctor) {
        const subject = 'Appointment Rescheduled - WeCure';
        const html = `
          <h2>Appointment Rescheduled</h2>
          <p>Your appointment with Dr. ${doctor.name} has been rescheduled.</p>
          <p><strong>Old Date:</strong> ${oldDate} at ${oldTime}</p>
          <p><strong>New Date:</strong> ${newDate} at ${newTime}</p>
          <p>Please update your calendar accordingly.</p>
        `;
        
        await sendEmail(user.email, subject, html);
        await sendEmail(doctor.email, `Appointment Rescheduled - ${user.name}`, html);
      }
    } catch (emailError) {
      console.error('Failed to send reschedule email:', emailError);
    }

    res.json({ success: true, message: 'Appointment rescheduled successfully', data: appointment });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment', error: error.message });
  }
};

// Get appointment by ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findByPk(appointmentId, {
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Doctor, attributes: ['name', 'specializations', 'profilePicture'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to view this appointment
    if (appointment.patientId !== userId && appointment.doctorId !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    console.error('Get appointment by ID error:', error);
    res.status(500).json({ message: 'Failed to fetch appointment', error: error.message });
  }
};

// Search appointments
exports.searchAppointments = async (req, res) => {
  try {
    const { date, status, doctorId, appointmentType } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let whereClause = {};
    
    // Filter by user role
    if (userRole === 'doctor') {
      whereClause.doctorId = userId;
    } else {
      whereClause.patientId = userId;
    }

    // Add search filters
    if (date) whereClause.appointmentDate = date;
    if (status) whereClause.status = status;
    if (doctorId) whereClause.doctorId = doctorId;
    if (appointmentType) whereClause.appointmentType = appointmentType;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ['name', 'email', 'phone'] },
        { model: Doctor, attributes: ['name', 'specializations', 'profilePicture'] }
      ],
      order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']]
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Search appointments error:', error);
    res.status(500).json({ message: 'Failed to search appointments', error: error.message });
  }
};

module.exports = exports;
