const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'tanukum.ss784@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Reusable email sender function
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'tanukum.ss784@gmail.com',
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}: ${subject}`);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// HTML Email Templates
const emailTemplates = {
  // Welcome email for new users
  welcome: (userName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to WeCure</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to WeCure!</h1>
          <p>Your journey to better health starts here</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>Welcome to WeCure, your trusted healthcare platform. We're excited to have you on board!</p>
          <p>With WeCure, you can:</p>
          <ul>
            <li>📅 Book appointments with qualified doctors</li>
            <li>💊 Order medicines from our secure store</li>
    
            <li>📱 Access healthcare services 24/7</li>
          </ul>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">Get Started</a>
          <p>If you have any questions, our support team is here to help!</p>
        </div>
        <div class="footer">
          <p>© 2024 WeCure. All rights reserved.</p>
          <p>This email was sent to you as part of your WeCure account registration.</p>
          <p>📧 Official Email: tanukum.ss784@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Login notification email
  loginNotification: (userName, loginTime, deviceInfo) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login Notification - WeCure</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Login Notification</h1>
          <p>WeCure Security Alert</p>
        </div>
        <div class="content">
          <h2>Hello ${userName}!</h2>
          <p>We detected a new login to your WeCure account.</p>
          
          <div class="alert">
            <strong>Login Details:</strong><br>
            📅 Date: ${loginTime}<br>
            💻 Device: ${deviceInfo || 'Unknown device'}<br>
            🌐 Location: ${process.env.NODE_ENV === 'production' ? 'Secure location' : 'Development environment'}
          </div>
          
          <p>If this was you, no action is needed. If you didn't log in, please:</p>
          <ol>
            <li>Change your password immediately</li>
            <li>Contact our support team</li>
            <li>Review your account activity</li>
          </ol>
          
          <p>Stay safe and healthy!</p>
        </div>
        <div class="footer">
          <p>© 2024 WeCure. All rights reserved.</p>
          <p>This is a security notification from your WeCure account.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Appointment confirmation email
  appointmentConfirmation: (patientName, doctorName, appointmentDate, appointmentTime, appointmentType) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Confirmed - WeCure</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #17a2b8; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-details { background: white; border: 2px solid #17a2b8; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #17a2b8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Appointment Confirmed!</h1>
          <p>Your healthcare appointment is scheduled</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName}!</h2>
          <p>Great news! Your appointment has been confirmed. Here are the details:</p>
          
          <div class="appointment-details">
            <h3>📋 Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>Type:</strong> ${appointmentType}</p>
          </div>
          
          <p>Please arrive 10 minutes before your scheduled time. Don't forget to bring:</p>
          <ul>
            <li>Your ID or insurance card</li>
            <li>List of current medications</li>
            <li>Any relevant medical records</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" class="button">View Appointment</a>
          
          <p>Need to reschedule? Contact us at least 24 hours in advance.</p>
        </div>
        <div class="footer">
          <p>© 2024 WeCure. All rights reserved.</p>
          <p>Thank you for choosing WeCure for your healthcare needs.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  // Appointment reminder email
  reminder: (patientName, doctorName, appointmentDate, appointmentTime, timeUntil) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Appointment Reminder - WeCure</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ffc107; color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .urgent { background: #f8d7da; border-color: #f5c6cb; }
        .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
          <p>${timeUntil} until your appointment</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName}!</h2>
          <p>This is a friendly reminder about your upcoming appointment.</p>
          
          <div class="reminder-box ${timeUntil.includes('hour') ? 'urgent' : ''}">
            <h3>📅 Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>Time Remaining:</strong> ${timeUntil}</p>
          </div>
          
          <p>Please ensure you:</p>
          <ul>
            <li>✅ Arrive on time</li>
            <li>✅ Bring necessary documents</li>
            <li>✅ Have your questions ready</li>
          </ul>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/appointments" class="button">View Details</a>
          
          <p>Can't make it? Please reschedule at least 24 hours in advance.</p>
        </div>
        <div class="footer">
          <p>© 2024 WeCure. All rights reserved.</p>
          <p>We look forward to seeing you!</p>
        </div>
      </div>
    </body>
    </html>
  `,



  // Video call appointment email
  videoCallAppointment: (patientName, doctorName, appointmentDate, appointmentTime, joinLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Video Call Appointment - WeCure</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6f42c1; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .video-box { background: white; border: 2px solid #6f42c1; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .join-button { display: inline-block; background: #6f42c1; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 18px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📹 Video Call Appointment</h1>
          <p>Join your virtual consultation</p>
        </div>
        <div class="content">
          <h2>Hello ${patientName}!</h2>
          <p>Your video call appointment with Dr. ${doctorName} is scheduled.</p>
          
          <div class="video-box">
            <h3>📅 Appointment Details</h3>
            <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
            <p><strong>Date:</strong> ${appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentTime}</p>
            <p><strong>Type:</strong> Video Consultation</p>
          </div>
          
          <h3>🎥 How to Join:</h3>
          <ol>
            <li>Ensure you have a stable internet connection</li>
            <li>Find a quiet, private location</li>
            <li>Click the "Join Call" button below</li>
            <li>Allow camera and microphone access when prompted</li>
          </ol>
          
          <a href="${joinLink}" class="join-button">🎥 Join Call</a>
          
          <p><strong>Important:</strong></p>
          <ul>
            <li>Test your camera and microphone before the call</li>
            <li>Have your medical history ready</li>
            <li>Be in a well-lit area</li>
            <li>Keep your phone charged</li>
          </ul>
          
          <p>Need technical support? Contact us immediately.</p>
        </div>
        <div class="footer">
          <p>© 2024 WeCure. All rights reserved.</p>
          <p>Secure video consultation powered by WeCure.</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = {
  sendEmail,
  emailTemplates
};
