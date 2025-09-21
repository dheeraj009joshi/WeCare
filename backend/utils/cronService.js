const cron = require('node-cron');
const { Appointment, User, Doctor } = require('../src/models');
const { sendEmail, emailTemplates } = require('./email');
const { Op } = require('sequelize');

// Send appointment reminders
const sendAppointmentReminders = async () => {
  try {
    console.log('🕐 Running appointment reminder cron job...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const nextDay = new Date(tomorrow);
    nextDay.setDate(tomorrow.getDate() + 1);

    // Find appointments for tomorrow
    const tomorrowAppointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.between]: [tomorrow, nextDay]
        },
        status: 'confirmed'
      },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: Doctor, as: 'doctor', attributes: ['name'] }
      ]
    });

    console.log(`📅 Found ${tomorrowAppointments.length} appointments for tomorrow`);

    for (const appointment of tomorrowAppointments) {
      try {
        const html = emailTemplates.reminder(
          appointment.patient.name,
          appointment.doctor.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          '1 day'
        );

        await sendEmail(
          appointment.patient.email,
          '⏰ Appointment Reminder - Tomorrow - WeCure',
          html
        );

        console.log(`✅ Reminder sent to ${appointment.patient.name} for tomorrow's appointment`);
              } catch (error) {
          console.error(`❌ Failed to send reminder to ${appointment.patient.name}:`, error.message);
        }
    }

  } catch (error) {
    console.error('❌ Appointment reminder cron job error:', error);
  }
};

// Send same-day reminders
const sendSameDayReminders = async () => {
  try {
    console.log('🕐 Running same-day reminder cron job...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const currentHour = new Date().getHours();

    // Find appointments for today (within next 2 hours)
    const upcomingAppointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.between]: [today, tomorrow]
        },
        status: 'confirmed',
        appointmentTime: {
          [Op.between]: [
            `${String(currentHour).padStart(2, '0')}:00`,
            `${String(currentHour + 2).padStart(2, '0')}:00`
          ]
        }
      },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: Doctor, as: 'doctor', attributes: ['name'] }
      ]
    });

    console.log(`📅 Found ${upcomingAppointments.length} upcoming appointments today`);

    for (const appointment of upcomingAppointments) {
      try {
        const [hours, minutes] = appointment.appointmentTime.split(':');
        const appointmentHour = parseInt(hours);
        const timeUntil = appointmentHour - currentHour;
        
        const html = emailTemplates.reminder(
          appointment.patient.name,
          appointment.doctor.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          `${timeUntil} hour${timeUntil > 1 ? 's' : ''}`
        );

        await sendEmail(
          appointment.patient.email,
          '⏰ Appointment Reminder - Today - WeCure',
          html
        );

        console.log(`✅ Same-day reminder sent to ${appointment.patient.name}`);
      } catch (error) {
        console.error(`❌ Failed to send same-day reminder to ${appointment.patient.name}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Same-day reminder cron job error:', error);
  }
};

// Send hourly reminders for appointments within 1 hour
const sendHourlyReminders = async () => {
  try {
    console.log('🕐 Running hourly reminder cron job...');
    
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const currentHour = now.getHours();

    // Find appointments within the next hour
    const urgentAppointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.between]: [today, tomorrow]
        },
        status: 'confirmed',
        appointmentTime: {
          [Op.between]: [
            `${String(currentHour).padStart(2, '0')}:00`,
            `${String(currentHour + 1).padStart(2, '0')}:00`
          ]
        }
      },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: Doctor, as: 'doctor', attributes: ['name'] }
      ]
    });

    console.log(`📅 Found ${urgentAppointments.length} urgent appointments within 1 hour`);

    for (const appointment of urgentAppointments) {
      try {
        const html = emailTemplates.reminder(
          appointment.patient.name,
          appointment.doctor.name,
          appointment.appointmentDate,
          appointment.appointmentTime,
          '1 hour'
        );

        await sendEmail(
          appointment.patient.email,
          '🚨 URGENT: Appointment in 1 Hour - WeCure',
          html
        );

        console.log(`✅ Urgent reminder sent to ${appointment.patient.name}`);
      } catch (error) {
        console.error(`❌ Failed to send urgent reminder to ${appointment.patient.name}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Hourly reminder cron job error:', error);
  }
};

// Send weekly appointment summaries
const sendWeeklySummaries = async () => {
  try {
    console.log('📅 Running weekly summary cron job...');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);

    // Find all users with appointments in the last week
    const recentAppointments = await Appointment.findAll({
      where: {
        appointmentDate: {
          [Op.between]: [weekAgo, today]
        },
        status: { [Op.in]: ['confirmed', 'completed', 'cancelled'] }
      },
      include: [
        { model: User, as: 'patient', attributes: ['name', 'email'] },
        { model: Doctor, as: 'doctor', attributes: ['name'] }
      ]
    });

    // Group appointments by user
    const userAppointments = {};
    recentAppointments.forEach(appointment => {
      const userId = appointment.patientId;
      if (!userAppointments[userId]) {
        userAppointments[userId] = {
          user: appointment.patient,
          appointments: []
        };
      }
      userAppointments[userId].appointments.push(appointment);
    });

    console.log(`📊 Sending weekly summaries to ${Object.keys(userAppointments).length} users`);

    for (const [userId, data] of Object.entries(userAppointments)) {
      try {
        const { user, appointments } = data;
        
        const completedCount = appointments.filter(a => a.status === 'completed').length;
        const upcomingCount = appointments.filter(a => a.status === 'confirmed').length;
        const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Summary - WeCure</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
              .stat-box { background: white; padding: 20px; border-radius: 10px; text-align: center; border: 2px solid #667eea; }
              .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Weekly Summary</h1>
                <p>Your healthcare activity this week</p>
              </div>
              <div class="content">
                <h2>Hello ${user.name}!</h2>
                <p>Here's a summary of your healthcare activity for the past week:</p>
                
                <div class="stats">
                  <div class="stat-box">
                    <div class="stat-number">${completedCount}</div>
                    <div>Completed</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-number">${upcomingCount}</div>
                    <div>Upcoming</div>
                  </div>
                  <div class="stat-box">
                    <div class="stat-number">${cancelledCount}</div>
                    <div>Cancelled</div>
                  </div>
                </div>
                
                <p>Keep up the great work with your health! If you have any questions, our team is here to help.</p>
              </div>
              <div class="footer">
                <p>© 2024 WeCure. All rights reserved.</p>
                <p>This is your weekly healthcare summary from WeCure.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendEmail(
          user.email,
          '📊 Your Weekly Healthcare Summary - WeCure',
          html
        );

        console.log(`✅ Weekly summary sent to ${user.name}`);
      } catch (error) {
        console.error(`❌ Failed to send weekly summary to user ${userId}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Weekly summary cron job error:', error);
  }
};

// Initialize all cron jobs
const initializeCronJobs = () => {
  try {
    // Daily reminder at 9 AM for next day appointments
    cron.schedule('0 9 * * *', () => {
      console.log('🕐 Daily reminder cron job triggered');
      sendAppointmentReminders();
    });

    // Same-day reminders at 8 AM
    cron.schedule('0 8 * * *', () => {
      console.log('🕐 Same-day reminder cron job triggered');
      sendSameDayReminders();
    });

    // Hourly reminders for urgent appointments
    cron.schedule('0 * * * *', () => {
      console.log('🕐 Hourly reminder cron job triggered');
      sendHourlyReminders();
    });

    // Weekly summaries on Monday at 10 AM
    cron.schedule('0 10 * * 1', () => {
      console.log('📅 Weekly summary cron job triggered');
      sendWeeklySummaries();
    });

    console.log('✅ All cron jobs initialized successfully');
    console.log('📅 Cron Schedule:');
    console.log('   - Daily reminders: 9:00 AM');
    console.log('   - Same-day reminders: 8:00 AM');
    console.log('   - Hourly reminders: Every hour');
    console.log('   - Weekly summaries: Monday 10:00 AM');

  } catch (error) {
    console.error('❌ Failed to initialize cron jobs:', error);
  }
};

// Manual trigger functions for testing
const triggerReminders = {
  daily: sendAppointmentReminders,
  sameDay: sendSameDayReminders,
  hourly: sendHourlyReminders,
  weekly: sendWeeklySummaries
};

module.exports = {
  initializeCronJobs,
  triggerReminders,
  sendAppointmentReminders,
  sendSameDayReminders,
  sendHourlyReminders,
  sendWeeklySummaries
};
