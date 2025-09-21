const nodemailer = require('nodemailer');

// Create transporter for Gmail SMTP
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  
  console.log('Email configuration:', {
    user: emailUser,
    password: emailPassword ? '***SET***' : '***NOT SET***',
    hasUser: !!emailUser,
    hasPassword: !!emailPassword
  });

  if (!emailUser || !emailPassword) {
    throw new Error('Email configuration missing: EMAIL_USER and EMAIL_PASSWORD must be set');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

// Email templates
const emailTemplates = {
  // User registration success
  userRegistrationSuccess: (userName, email) => ({
    subject: 'Welcome to WeCure - Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to WeCure!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with WeCure! Your account has been successfully created.
          </p>
          <p style="color: #666; line-height: 1.6;">
            You can now:
          </p>
          <ul style="color: #666; line-height: 1.6;">
            <li>Book appointments with our qualified doctors</li>
            <li>Shop for medicines and health products</li>
            <li>Chat with healthcare professionals</li>
          </ul>
          <p style="color: #666; line-height: 1.6;">
            If you have any questions, feel free to contact our support team.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              Get Started
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email from WeCure. Please do not reply.</p>
        </div>
      </div>
    `
  }),

  // Doctor registration success
  doctorRegistrationSuccess: (doctorName, email) => ({
    subject: 'Welcome to WeCure - Doctor Registration Successful!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome Dr. ${doctorName}!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello Dr. ${doctorName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Welcome to WeCure! Your doctor account has been successfully created and is pending verification.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Once verified, you'll be able to:
          </p>
          <ul style="color: #666; line-height: 1.6;">
            <li>Accept patient appointments</li>
            <li>Provide online consultations</li>
            <li>Manage your schedule</li>
            <li>Earn from consultations</li>
          </ul>
          <p style="color: #666; line-height: 1.6;">
            Our admin team will review your credentials and verify your account within 24-48 hours.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/doctor/login" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              Access Dashboard
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email from WeCure. Please do not reply.</p>
        </div>
      </div>
    `
  }),

  // Login success
  loginSuccess: (userName, email, role) => ({
    subject: 'WeCure - Login Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">Login Successful!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6;">
            You have successfully logged into your WeCure account.
          </p>
          <p style="color: #666; line-height: 1.6;">
            <strong>Account Type:</strong> ${role}
          </p>
          <p style="color: #666; line-height: 1.6;">
            If this wasn't you, please contact our support team immediately.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>This is an automated email from WeCure. Please do not reply.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, templateName, templateData) => {
  try {
    const transporter = createTransporter();
    
    if (!emailTemplates[templateName]) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = emailTemplates[templateName](...templateData);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Email notification functions
const sendUserRegistrationEmail = async (userName, email) => {
  return await sendEmail(email, 'userRegistrationSuccess', [userName, email]);
};

const sendDoctorRegistrationEmail = async (doctorName, email) => {
  return await sendEmail(email, 'doctorRegistrationSuccess', [doctorName, email]);
};

const sendLoginEmail = async (userName, email, role) => {
  return await sendEmail(email, 'loginSuccess', [userName, email, role]);
};

module.exports = {
  sendUserRegistrationEmail,
  sendDoctorRegistrationEmail,
  sendLoginEmail,
  sendEmail
};

