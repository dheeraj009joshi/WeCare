const cron = require('node-cron');
const { Appointment, User, Doctor } = require('../models');
const { sendAppointmentReminder } = require('./emailService');
const { Op } = require('sequelize');

// Function to send appointment reminders
const sendAppointmentReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find appointments scheduled for tomorrow
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.gte]: tomorrow,
          [Op.lt]: dayAfterTomorrow
        },
        status: 'confirmed',
        reminderSent: false // Add this field to track if reminder was sent
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${appointments.length} appointments for tomorrow`);

    for (const appointment of appointments) {
      try {
        if (appointment.patient && appointment.patient.email && appointment.doctor) {
          // Send reminder email
          await sendAppointmentReminder(
            appointment.patient.name,
            appointment.patient.email,
            appointment.doctor.name,
            appointment.appointmentDate,
            appointment.appointmentTime
          );

          // Mark reminder as sent
          await appointment.update({ reminderSent: true });
          
          console.log(`Reminder sent for appointment ${appointment.id}`);
        }
      } catch (error) {
        console.error(`Failed to send reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending appointment reminders:', error);
  }
};

// Function to send same-day appointment reminders
const sendSameDayReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find appointments scheduled for today
    const appointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: 'confirmed',
        sameDayReminderSent: false // Add this field to track if same-day reminder was sent
      },
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'name']
        }
      ]
    });

    console.log(`Found ${appointments.length} appointments for today`);

    for (const appointment of appointments) {
      try {
        if (appointment.patient && appointment.patient.email && appointment.doctor) {
          // Send same-day reminder email
          await sendAppointmentReminder(
            appointment.patient.name,
            appointment.patient.email,
            appointment.doctor.name,
            appointment.appointmentDate,
            appointment.appointmentTime
          );

          // Mark same-day reminder as sent
          await appointment.update({ sameDayReminderSent: true });
          
          console.log(`Same-day reminder sent for appointment ${appointment.id}`);
        }
      } catch (error) {
        console.error(`Failed to send same-day reminder for appointment ${appointment.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending same-day appointment reminders:', error);
  }
};

// Initialize cron jobs
const initializeCronJobs = () => {
  // Send appointment reminders at 9 AM every day for appointments scheduled for tomorrow
  cron.schedule('0 9 * * *', () => {
    console.log('Running appointment reminder cron job...');
    sendAppointmentReminders();
  });

  // Send same-day reminders at 8 AM every day for appointments scheduled for today
  cron.schedule('0 8 * * *', () => {
    console.log('Running same-day appointment reminder cron job...');
    sendSameDayReminders();
  });

  console.log('Cron jobs initialized successfully');
};

module.exports = {
  initializeCronJobs,
  sendAppointmentReminders,
  sendSameDayReminders
};

