import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
import aiofiles
import asyncio
from typing import List, Optional, Dict, Any
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.email_user = settings.email_user
        self.email_password = settings.email_password
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        is_html: bool = True,
        attachments: Optional[List[str]] = None
    ) -> bool:
        """Send email with optional attachments"""
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            if is_html:
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    try:
                        async with aiofiles.open(file_path, "rb") as attachment:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(await attachment.read())
                            encoders.encode_base64(part)
                            part.add_header(
                                'Content-Disposition',
                                f'attachment; filename= {file_path.split("/")[-1]}'
                            )
                            msg.attach(part)
                    except Exception as e:
                        logger.error(f"Failed to attach file {file_path}: {e}")
            
            # Send email
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.email_user, self.email_password)
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_welcome_email(self, user_email: str, user_name: str) -> bool:
        """Send welcome email to new user"""
        subject = "Welcome to WeCure - Your Health Journey Starts Here!"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .features {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to WeCure!</h1>
                    <p>Your trusted healthcare companion</p>
                </div>
                <div class="content">
                    <h2>Hello {user_name}!</h2>
                    
                    <p>Thank you for joining WeCure, your comprehensive healthcare platform. We're excited to be part of your health journey!</p>
                    
                    <div class="features">
                        <h3>🏥 What you can do with WeCure:</h3>
                        <ul>
                            <li><strong>Book Doctor Appointments</strong> - Schedule consultations with verified doctors</li>
                            <li><strong>AI Health Assistant</strong> - Get instant health guidance and support</li>
                            <li><strong>Medicine Store</strong> - Order medicines with prescription support</li>
                            <li><strong>Healthy Food Delivery</strong> - Get nutritious meals delivered</li>
                            <li><strong>Emergency Services</strong> - Quick access to emergency medical help</li>
                            <li><strong>Health Tracking</strong> - Monitor your health metrics and progress</li>
                        </ul>
                    </div>
                    
                    <p>Ready to get started? Explore our services and take the first step towards better health!</p>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173" class="button">Explore WeCure</a>
                    </div>
                    
                    <p>If you have any questions, our support team is here to help 24/7.</p>
                    
                    <p>Best regards,<br>
                    <strong>The WeCure Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, body, is_html=True)
    
    async def send_doctor_registration_email(self, doctor_email: str, doctor_name: str) -> bool:
        """Send registration confirmation email to doctor"""
        subject = "Doctor Registration - WeCure Platform"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .alert {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome Dr. {doctor_name}!</h1>
                    <p>WeCure Healthcare Provider Platform</p>
                </div>
                <div class="content">
                    <h2>Registration Received Successfully</h2>
                    
                    <p>Thank you for registering as a healthcare provider with WeCure. Your application has been received and is currently under review.</p>
                    
                    <div class="alert">
                        <strong>⏳ Next Steps:</strong><br>
                        • Our verification team will review your credentials<br>
                        • You'll receive an email once verification is complete<br>
                        • The review process typically takes 24-48 hours<br>
                        • You'll gain access to the doctor dashboard upon approval
                    </div>
                    
                    <p><strong>What happens after verification?</strong></p>
                    <ul>
                        <li>Access to doctor dashboard and patient management tools</li>
                        <li>Ability to set availability and appointment schedules</li>
                        <li>Patient consultation and prescription management</li>
                        <li>Revenue tracking and payment management</li>
                    </ul>
                    
                    <p>If you have any questions during the verification process, please contact our support team.</p>
                    
                    <p>Best regards,<br>
                    <strong>WeCure Verification Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(doctor_email, subject, body, is_html=True)
    
    async def send_appointment_confirmation_email(
        self, 
        patient_email: str, 
        patient_name: str,
        doctor_name: str,
        appointment_date: str,
        appointment_time: str,
        calendar_link: Optional[str] = None,
        meet_link: Optional[str] = None
    ) -> bool:
        """Send appointment confirmation email"""
        subject = f"Appointment Confirmed - Dr. {doctor_name} | WeCure"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .appointment-details {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }}
                .button {{ display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Appointment Confirmed</h1>
                    <p>Your healthcare appointment is scheduled</p>
                </div>
                <div class="content">
                    <h2>Hello {patient_name}!</h2>
                    
                    <p>Your appointment has been successfully confirmed. Here are the details:</p>
                    
                    <div class="appointment-details">
                        <h3>📅 Appointment Details</h3>
                        <p><strong>Doctor:</strong> Dr. {doctor_name}</p>
                        <p><strong>Date:</strong> {appointment_date}</p>
                        <p><strong>Time:</strong> {appointment_time}</p>
                        <p><strong>Type:</strong> Consultation</p>
                    </div>
                    
                    <p><strong>📋 Before your appointment:</strong></p>
                    <ul>
                        <li>Prepare a list of your symptoms and concerns</li>
                        <li>Bring any previous medical records or test results</li>
                        <li>List all current medications you're taking</li>
                        <li>Arrive 10 minutes early for check-in</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/profile" class="button">View Appointment</a>
                        {f'<a href="{calendar_link}" class="button" style="background: #4285f4;">📅 Add to Calendar</a>' if calendar_link else ''}
                        {f'<a href="{meet_link}" class="button" style="background: #0f9d58;">🎥 Join Video Call</a>' if meet_link else ''}
                    </div>
                    
                    <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                    
                    <p>Best regards,<br>
                    <strong>WeCure Appointments Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(patient_email, subject, body, is_html=True)
    
    async def send_doctor_appointment_notification(
        self,
        doctor_email: str,
        doctor_name: str,
        patient_name: str,
        appointment_date: str,
        appointment_time: str,
        symptoms: str,
        calendar_link: Optional[str] = None,
        meet_link: Optional[str] = None
    ) -> bool:
        """Send appointment notification email to doctor"""
        subject = f"New Appointment Scheduled - {patient_name} | WeCure"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .appointment-details {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }}
                .button {{ display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>👨‍⚕️ New Appointment</h1>
                    <p>A patient has scheduled an appointment with you</p>
                </div>
                <div class="content">
                    <h2>Hello Dr. {doctor_name}!</h2>
                    
                    <p>You have a new patient appointment scheduled. Here are the details:</p>
                    
                    <div class="appointment-details">
                        <h3>📅 Appointment Details</h3>
                        <p><strong>Patient:</strong> {patient_name}</p>
                        <p><strong>Date:</strong> {appointment_date}</p>
                        <p><strong>Time:</strong> {appointment_time}</p>
                        <p><strong>Symptoms/Reason:</strong> {symptoms}</p>
                        <p><strong>Type:</strong> Consultation</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:5173/doctors/dashboard" class="button">View Dashboard</a>
                        {f'<a href="{calendar_link}" class="button" style="background: #4285f4;">📅 Add to Calendar</a>' if calendar_link else ''}
                        {f'<a href="{meet_link}" class="button" style="background: #0f9d58;">🎥 Join Video Call</a>' if meet_link else ''}
                    </div>
                    
                    <p><strong>📋 Preparation notes:</strong></p>
                    <ul>
                        <li>Review patient's symptoms and medical history</li>
                        <li>Prepare relevant examination questions</li>
                        <li>Ensure you have access to prescription tools</li>
                        <li>Join the video call 5 minutes early</li>
                    </ul>
                    
                    <p>Thank you for providing excellent healthcare services!</p>
                    
                    <p>Best regards,<br>
                    <strong>WeCure Medical Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(doctor_email, subject, body, is_html=True)
    
    async def send_appointment_emails(
        self,
        patient_email: str,
        patient_name: str,
        doctor_email: str,
        doctor_name: str,
        appointment_date: str,
        appointment_time: str,
        symptoms: str,
        calendar_link: Optional[str] = None,
        meet_link: Optional[str] = None
    ) -> Dict[str, bool]:
        """Send appointment confirmation emails to both patient and doctor"""
        try:
            # Send emails concurrently
            import asyncio
            
            patient_task = self.send_appointment_confirmation_email(
                patient_email, patient_name, doctor_name, 
                appointment_date, appointment_time, calendar_link, meet_link
            )
            
            doctor_task = self.send_doctor_appointment_notification(
                doctor_email, doctor_name, patient_name,
                appointment_date, appointment_time, symptoms, calendar_link, meet_link
            )
            
            patient_result, doctor_result = await asyncio.gather(patient_task, doctor_task)
            
            return {
                'patient_email_sent': patient_result,
                'doctor_email_sent': doctor_result
            }
            
        except Exception as e:
            logger.error(f"Error sending appointment emails: {e}")
            return {
                'patient_email_sent': False,
                'doctor_email_sent': False
            }
    
    async def send_order_confirmation_email(
        self,
        user_email: str,
        user_name: str,
        order_number: str,
        order_details: Dict[str, Any]
    ) -> bool:
        """Send order confirmation email"""
        subject = f"Order Confirmation #{order_number} - WeCure"
        
        items_html = ""
        for item in order_details.get("items", []):
            items_html += f"""
            <tr>
                <td>{item.get('name', 'Product')}</td>
                <td>{item.get('quantity', 1)}</td>
                <td>₹{item.get('price', 0):.2f}</td>
            </tr>
            """
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .order-summary {{ background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }}
                table {{ width: 100%; border-collapse: collapse; margin: 15px 0; }}
                th, td {{ padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }}
                th {{ background: #f8f9fa; }}
                .total {{ font-weight: bold; font-size: 1.2em; color: #FF6B6B; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🛒 Order Confirmed!</h1>
                    <p>Thank you for your purchase</p>
                </div>
                <div class="content">
                    <h2>Hello {user_name}!</h2>
                    
                    <p>Your order has been successfully placed and is being processed.</p>
                    
                    <div class="order-summary">
                        <h3>📦 Order Summary</h3>
                        <p><strong>Order Number:</strong> #{order_number}</p>
                        <p><strong>Order Date:</strong> {order_details.get('date', 'Today')}</p>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items_html}
                                <tr class="total">
                                    <td colspan="2">Total Amount:</td>
                                    <td>₹{order_details.get('total', 0):.2f}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <p><strong>📍 Delivery Address:</strong><br>
                    {order_details.get('address', 'Address on file')}</p>
                    
                    <p><strong>🚚 Estimated Delivery:</strong> {order_details.get('delivery_date', '3-5 business days')}</p>
                    
                    <p>You'll receive a tracking notification once your order ships.</p>
                    
                    <p>Best regards,<br>
                    <strong>WeCure Orders Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, body, is_html=True)
    
    async def send_password_reset_email(self, user_email: str, reset_token: str) -> bool:
        """Send password reset email"""
        subject = "Reset Your Password - WeCure"
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        
        body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .button {{ display: inline-block; background: #FF6B6B; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                .warning {{ background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Password Reset Request</h1>
                    <p>Secure your WeCure account</p>
                </div>
                <div class="content">
                    <h2>Password Reset Requested</h2>
                    
                    <p>We received a request to reset your password for your WeCure account.</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        • This link expires in 1 hour<br>
                        • If you didn't request this reset, please ignore this email<br>
                        • Never share this link with anyone
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p><code>{reset_link}</code></p>
                    
                    <p>Best regards,<br>
                    <strong>WeCure Security Team</strong></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, body, is_html=True)

# Create global instance
email_service = EmailService()