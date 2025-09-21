import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  BellIcon, 
  Cog6ToothIcon,
  ChartBarIcon,
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import EmailNotificationBanner from './EmailNotificationBanner';
import EmailNotificationWidget from './EmailNotificationWidget';
import EmailNotificationMenu from './EmailNotificationMenu';
import EmailPreferences from './EmailPreferences';
import EmailHistory from './EmailHistory';
import EmailTestPage from './EmailTestPage';

const EmailDemoPage = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showBanner, setShowBanner] = useState(true);

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      description: 'Main dashboard with email widget'
    },
    {
      id: 'preferences',
      name: 'Email Preferences',
      icon: Cog6ToothIcon,
      description: 'Manage notification settings'
    },
    {
      id: 'history',
      name: 'Email History',
      icon: ChartBarIcon,
      description: 'View email notification history'
    },
    {
      id: 'test',
      name: 'Test Emails',
      icon: EnvelopeIcon,
      description: 'Test all email functionality'
    }
  ];

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <EmailNotificationWidget />
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentView('preferences')}
                      className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <Cog6ToothIcon className="h-5 w-5 text-[#a78bfa]" />
                      Manage Preferences
                    </button>
                    <button
                      onClick={() => setCurrentView('history')}
                      className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <ChartBarIcon className="h-5 w-5 text-[#a78bfa]" />
                      View Email History
                    </button>
                    <button
                      onClick={() => setCurrentView('test')}
                      className="w-full flex items-center gap-3 p-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                    >
                      <EnvelopeIcon className="h-5 w-5 text-[#a78bfa]" />
                      Test Email System
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Email Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">System Status:</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Email:</span>
                      <span className="text-sm text-gray-900">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Emails Today:</span>
                      <span className="text-sm text-gray-900">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return <EmailPreferences />;
      case 'history':
        return <EmailHistory />;
      case 'test':
        return <EmailTestPage />;
      default:
        return <div>Select a view</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900">
                Email Notification Demo
              </h1>
              
              {/* Navigation */}
              <nav className="flex items-center gap-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentView === item.id
                        ? 'bg-[#a78bfa] text-white'
                        : 'text-gray-700 hover:text-[#a78bfa] hover:bg-[#a78bfa] hover:bg-opacity-10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Email Notification Menu */}
              <EmailNotificationMenu />
              
              {/* Banner Toggle */}
              <button
                onClick={() => setShowBanner(!showBanner)}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#a78bfa] transition-colors"
              >
                {showBanner ? 'Hide Banner' : 'Show Banner'}
              </button>
              
              {/* User Info */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
                <UserIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Demo User</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Email Notification Banner */}
      {showBanner && (
        <EmailNotificationBanner />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              This is a demo page showcasing the complete email notification system.
            </p>
            <p className="text-xs mt-2">
              Use the navigation above to explore different features.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EmailDemoPage;

