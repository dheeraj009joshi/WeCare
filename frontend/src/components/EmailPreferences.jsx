import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  EnvelopeIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import emailNotificationService from '../services/emailNotificationService';

const EmailPreferences = () => {
  const [preferences, setPreferences] = useState({
    registrationEmails: true,
    loginEmails: true,
    appointmentConfirmations: true,
    appointmentReminders: true,
    orderUpdates: true,
    emergencyNotifications: true,
    marketingEmails: false,
    newsletter: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const data = await emailNotificationService.getEmailPreferences();
      setPreferences(data.preferences || preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load email preferences' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await emailNotificationService.updateEmailPreferences(preferences);
      setMessage({ type: 'success', text: 'Email preferences updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update email preferences' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async (type) => {
    setTesting(true);
    setMessage({ type: '', text: '' });
    
    try {
      await emailNotificationService.testEmailNotification(type);
      setMessage({ type: 'success', text: `Test ${type} email sent successfully!` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to send test ${type} email` });
    } finally {
      setTesting(false);
    }
  };

  const preferenceItems = [
    {
      key: 'registrationEmails',
      title: 'Registration Confirmations',
      description: 'Receive welcome emails when you create an account',
      icon: EnvelopeIcon
    },
    {
      key: 'loginEmails',
      title: 'Login Notifications',
      description: 'Get notified when someone logs into your account',
      icon: BellIcon
    },
    {
      key: 'appointmentConfirmations',
      title: 'Appointment Confirmations',
      description: 'Receive confirmation emails for booked appointments',
      icon: CheckIcon
    },
    {
      key: 'appointmentReminders',
      title: 'Appointment Reminders',
      description: 'Get daily reminders for upcoming appointments',
      icon: BellIcon
    },
    {
      key: 'orderUpdates',
      title: 'Order Status Updates',
      description: 'Notifications about your medicine orders',
      icon: EnvelopeIcon
    },
    {
      key: 'emergencyNotifications',
      title: 'Emergency Notifications',
      description: 'Important alerts about emergency requests',
      icon: ExclamationTriangleIcon
    },
    {
      key: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive promotional offers and updates',
      icon: EnvelopeIcon
    },
    {
      key: 'newsletter',
      title: 'Newsletter',
      description: 'Weekly health tips and updates',
      icon: EnvelopeIcon
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a78bfa]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Notification Preferences
          </h1>
          <p className="text-gray-600">
            Manage how and when you receive email notifications from WeCure
          </p>
        </motion.div>

        {/* Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckIcon className="h-5 w-5 text-green-600" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-red-600" />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Preferences Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Toggle the notifications you want to receive
            </p>
          </div>

          <div className="p-6 space-y-6">
            {preferenceItems.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start justify-between"
              >
                <div className="flex items-start gap-3 flex-1">
                  <item.icon className="h-6 w-6 text-[#a78bfa] mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 ${
                    preferences[item.key] ? 'bg-[#a78bfa]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => handleTestEmail('appointment')}
                disabled={testing}
                className="px-4 py-2 text-sm font-medium text-[#a78bfa] bg-white border border-[#a78bfa] rounded-md hover:bg-[#a78bfa] hover:text-white transition-colors disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Test Appointment Email'}
              </button>
              <button
                onClick={() => handleTestEmail('reminder')}
                disabled={testing}
                className="px-4 py-2 text-sm font-medium text-[#a78bfa] bg-white border border-[#a78bfa] rounded-md hover:bg-[#a78bfa] hover:text-white transition-colors disabled:opacity-50"
              >
                {testing ? 'Sending...' : 'Test Reminder Email'}
              </button>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#a78bfa] text-white font-medium rounded-md hover:bg-[#8b5cf6] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </motion.div>

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            About Email Notifications
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              • <strong>Security:</strong> Login notifications help you monitor account activity
            </p>
            <p>
              • <strong>Appointments:</strong> Get reminders 24 hours and 1 hour before your scheduled time
            </p>
            <p>
              • <strong>Orders:</strong> Stay updated on your medicine delivery status
            </p>
            <p>
              • <strong>Emergency:</strong> Critical notifications for urgent medical situations
            </p>
            <p>
              • <strong>Unsubscribe:</strong> You can change these preferences at any time
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailPreferences;

