import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EnvelopeIcon, 
  BellIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const EmailNotificationMenu = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      title: 'Email Preferences',
      description: 'Manage notification settings',
      icon: Cog6ToothIcon,
      href: '/email-preferences',
      color: 'text-blue-600'
    },
    {
      title: 'Email History',
      description: 'View all sent emails',
      icon: ChartBarIcon,
      href: '/email-history',
      color: 'text-green-600'
    },
    {
      title: 'Notification Center',
      description: 'All platform notifications',
      icon: BellIcon,
      href: '/notifications',
      color: 'text-purple-600'
    }
  ];

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#a78bfa] transition-colors rounded-md hover:bg-gray-100"
      >
        <EnvelopeIcon className="h-5 w-5" />
        <span>Email</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Email Notifications
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your email preferences and view history
                </p>
              </div>

              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.title}
                    href={item.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#a78bfa] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="p-4 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Last email sent: {new Date().toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailNotificationMenu;

