import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const EmailNotificationBanner = () => {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show banner for new users or when there are important notifications
    if (user && user.email) {
      checkEmailStatus();
    }
  }, [user]);

  const checkEmailStatus = async () => {
    try {
      // This would typically check with your backend for email status
      // For now, we'll simulate some common scenarios
      const hasRecentEmails = localStorage.getItem('hasRecentEmails');
      const emailVerified = localStorage.getItem('emailVerified');
      
      if (!emailVerified && user.email) {
        setEmailStatus({
          type: 'verification',
          message: 'Please verify your email address to receive important notifications',
          action: 'verify'
        });
        setShowBanner(true);
      } else if (hasRecentEmails === 'true') {
        setEmailStatus({
          type: 'success',
          message: 'You have new email notifications',
          action: 'view'
        });
        setShowBanner(true);
      }
    } catch (error) {
      console.error('Error checking email status:', error);
    }
  };

  const handleAction = async (action) => {
    setLoading(true);
    
    try {
      switch (action) {
        case 'verify':
          // Send verification email
          await sendVerificationEmail();
          setEmailStatus({
            type: 'success',
            message: 'Verification email sent! Check your inbox.',
            action: null
          });
          break;
        case 'view':
          // Navigate to email history
          window.location.href = '/email-history';
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error handling action:', error);
      setEmailStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
        action: null
      });
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationEmail = async () => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem('emailVerified', 'true');
        resolve();
      }, 1000);
    });
  };

  const getBannerStyle = (type) => {
    switch (type) {
      case 'verification':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'verification':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'success':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <EnvelopeIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  if (!showBanner || !emailStatus) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -50, height: 0 }}
        className={`border-b ${getBannerStyle(emailStatus.type)}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon(emailStatus.type)}
              <p className="text-sm font-medium">
                {emailStatus.message}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {emailStatus.action && (
                <button
                  onClick={() => handleAction(emailStatus.action)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    emailStatus.type === 'verification'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                      {emailStatus.action === 'verify' ? 'Sending...' : 'Loading...'}
                    </>
                  ) : (
                    <>
                      {emailStatus.action === 'verify' ? (
                        <>
                          <EnvelopeIcon className="h-3 w-3" />
                          Send Email
                        </>
                      ) : (
                        <>
                          <BellIcon className="h-3 w-3" />
                          View
                        </>
                      )}
                    </>
                  )}
                </button>
              )}
              
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EmailNotificationBanner;

