import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  ClockIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import emailNotificationService from '../services/emailNotificationService';

const EmailHistory = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resending, setResending] = useState(null);

  useEffect(() => {
    loadEmailHistory();
  }, [currentPage]);

  const loadEmailHistory = async () => {
    try {
      setLoading(true);
      const data = await emailNotificationService.getEmailHistory(currentPage, 10);
      setEmails(data.emails || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to load email history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (notificationId) => {
    setResending(notificationId);
    try {
      await emailNotificationService.resendEmail(notificationId);
      // Reload the list to show updated status
      loadEmailHistory();
    } catch (error) {
      console.error('Failed to resend email:', error);
    } finally {
      setResending(null);
    }
  };

  const getEmailIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CheckIcon className="h-5 w-5 text-green-600" />;
      case 'reminder':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'emergency':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <EnvelopeIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEmailTypeLabel = (type) => {
    switch (type) {
      case 'appointment':
        return 'Appointment';
      case 'reminder':
        return 'Reminder';
      case 'emergency':
        return 'Emergency';
      case 'registration':
        return 'Registration';
      case 'login':
        return 'Login';
      case 'order':
        return 'Order Update';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      sent: { color: 'bg-green-100 text-green-800', text: 'Sent' },
      delivered: { color: 'bg-blue-100 text-blue-800', text: 'Delivered' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#a78bfa]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Notification History
          </h1>
          <p className="text-gray-600">
            Track all email notifications sent to your account
          </p>
        </motion.div>

        {/* Refresh Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex justify-end"
        >
          <button
            onClick={loadEmailHistory}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#a78bfa] text-white rounded-md hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {/* Email List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Emails ({emails.length})
            </h2>
          </div>

          {emails.length === 0 ? (
            <div className="p-12 text-center">
              <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No emails yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Email notifications will appear here once you start using the platform.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {emails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {getEmailIcon(email.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {getEmailTypeLabel(email.type)} Notification
                          </h3>
                          {getStatusBadge(email.status)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {email.subject || `${getEmailTypeLabel(email.type)} notification`}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Sent: {formatDate(email.sentAt)}</span>
                          {email.deliveredAt && (
                            <span>Delivered: {formatDate(email.deliveredAt)}</span>
                          )}
                          {email.openedAt && (
                            <span className="flex items-center gap-1">
                              <EyeIcon className="h-3 w-3" />
                              Opened: {formatDate(email.openedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {email.status === 'failed' && (
                        <button
                          onClick={() => handleResend(email.id)}
                          disabled={resending === email.id}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-[#a78bfa] bg-[#a78bfa] bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors disabled:opacity-50"
                        >
                          {resending === email.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#a78bfa]"></div>
                              Resending...
                            </>
                          ) : (
                            'Resend'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex justify-center"
          >
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </motion.div>
        )}

        {/* Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Understanding Email Status
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              • <strong>Sent:</strong> Email has been sent from our servers
            </p>
            <p>
              • <strong>Delivered:</strong> Email has been delivered to your inbox
            </p>
            <p>
              • <strong>Opened:</strong> Email has been opened (if tracking is enabled)
            </p>
            <p>
              • <strong>Failed:</strong> Email delivery failed (you can resend)
            </p>
            <p>
              • <strong>Pending:</strong> Email is queued for delivery
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailHistory;

