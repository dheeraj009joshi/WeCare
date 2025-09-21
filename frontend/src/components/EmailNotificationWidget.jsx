import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import emailNotificationService from '../services/emailNotificationService';

const EmailNotificationWidget = () => {
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    delivered: 0,
    failed: 0,
    pending: 0
  });
  const [recentEmails, setRecentEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmailStats();
  }, []);

  const loadEmailStats = async () => {
    try {
      setLoading(true);
      const [statsData, recentData] = await Promise.all([
        emailNotificationService.getEmailStats(),
        emailNotificationService.getEmailHistory(1, 5)
      ]);
      
      setStats(statsData.stats || stats);
      setRecentEmails(recentData.emails || []);
    } catch (error) {
      console.error('Failed to load email stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckIcon className="h-4 w-4 text-green-600" />;
      case 'delivered':
        return <CheckIcon className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return <EnvelopeIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-600 bg-green-50';
      case 'delivered':
        return 'text-blue-600 bg-blue-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Email Notifications
          </h3>
          <button
            onClick={() => window.location.href = '/email-preferences'}
            className="text-sm text-[#a78bfa] hover:text-[#8b5cf6] transition-colors"
          >
            Manage Preferences
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>

        {/* Recent Emails */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Recent Notifications
          </h4>
          
          {recentEmails.length === 0 ? (
            <div className="text-center py-6">
              <EnvelopeIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No recent emails</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEmails.slice(0, 3).map((email) => (
                <div
                  key={email.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(email.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {email.type.charAt(0).toUpperCase() + email.type.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(email.sentAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(email.status)}`}>
                    {email.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.href = '/email-history'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#a78bfa] bg-[#a78bfa] bg-opacity-10 rounded-md hover:bg-opacity-20 transition-colors"
            >
              View All Emails
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => window.location.href = '/email-preferences'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#a78bfa] rounded-md hover:bg-[#8b5cf6] transition-colors"
            >
              <EnvelopeIcon className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmailNotificationWidget;

