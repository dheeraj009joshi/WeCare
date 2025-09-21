import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckIcon, 
  ExclamationTriangleIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import emailNotificationService from '../services/emailNotificationService';

const EmailTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const testFunctions = [
    {
      name: 'Test User Registration Email',
      description: 'Send a welcome email for new user registration',
      icon: EnvelopeIcon,
      test: () => emailNotificationService.testEmailNotification('registration'),
      color: 'bg-blue-500'
    },
    {
      name: 'Test Doctor Registration Email',
      description: 'Send a welcome email for new doctor registration',
      icon: EnvelopeIcon,
      test: () => emailNotificationService.testEmailNotification('doctor-registration'),
      color: 'bg-green-500'
    },
    {
      name: 'Test Login Email',
      description: 'Send a login confirmation email',
      icon: BellIcon,
      test: () => emailNotificationService.testEmailNotification('login'),
      color: 'bg-purple-500'
    },
    {
      name: 'Test Appointment Confirmation',
      description: 'Send an appointment confirmation email',
      icon: CheckIcon,
      test: () => emailNotificationService.testEmailNotification('appointment'),
      color: 'bg-green-500'
    },
    {
      name: 'Test Appointment Reminder',
      description: 'Send an appointment reminder email',
      icon: BellIcon,
      test: () => emailNotificationService.testEmailNotification('reminder'),
      color: 'bg-yellow-500'
    },
    {
      name: 'Test Order Update',
      description: 'Send an order status update email',
      icon: Cog6ToothIcon,
      test: () => emailNotificationService.testEmailNotification('order'),
      color: 'bg-indigo-500'
    },
    {
      name: 'Test Emergency Notification',
      description: 'Send an emergency notification email',
      icon: ExclamationTriangleIcon,
      test: () => emailNotificationService.testEmailNotification('emergency'),
      color: 'bg-red-500'
    }
  ];

  const runTest = async (testFunction) => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const result = await testFunction.test();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [...prev, {
        name: testFunction.name,
        success: true,
        duration,
        timestamp: new Date().toISOString(),
        result
      }]);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestResults(prev => [...prev, {
        name: testFunction.name,
        success: false,
        duration,
        timestamp: new Date().toISOString(),
        error: error.message
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testFunction of testFunctions) {
      await runTest(testFunction);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getSuccessCount = () => testResults.filter(r => r.success).length;
  const getTotalCount = () => testResults.length;

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
            Email Notification Test Page
          </h1>
          <p className="text-gray-600">
            Test all email notification functionality from the frontend
          </p>
        </motion.div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Test Controls
              </h2>
              <p className="text-sm text-gray-600">
                Run individual tests or test all email functionality at once
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={runAllTests}
                disabled={loading}
                className="px-6 py-2 bg-[#a78bfa] text-white font-medium rounded-md hover:bg-[#8b5cf6] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Running Tests...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </button>
              
              <button
                onClick={clearResults}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear Results
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {testResults.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress: {getSuccessCount()}/{getTotalCount()} successful</span>
                <span>{Math.round((getSuccessCount() / getTotalCount()) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#a78bfa] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getSuccessCount() / getTotalCount()) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Test Functions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testFunctions.map((testFunction, index) => (
            <motion.div
              key={testFunction.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${testFunction.color} bg-opacity-10`}>
                  <testFunction.icon className={`h-6 w-6 ${testFunction.color.replace('bg-', 'text-')}`} />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    {testFunction.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {testFunction.description}
                  </p>
                  
                  <button
                    onClick={() => runTest(testFunction)}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-[#a78bfa] text-white text-sm font-medium rounded-md hover:bg-[#8b5cf6] transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Testing...' : 'Test Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Test Results ({getSuccessCount()}/{getTotalCount()} successful)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      )}
                      
                      <div>
                        <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                          {result.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Duration: {result.duration}ms | {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {!result.success && result.error && (
                    <div className="mt-3 p-3 bg-red-100 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Error:</strong> {result.error}
                      </p>
                    </div>
                  )}
                  
                  {result.success && result.result && (
                    <div className="mt-3 p-3 bg-green-100 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Result:</strong> {JSON.stringify(result.result, null, 2)}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to Use This Test Page
          </h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p>
              • <strong>Individual Tests:</strong> Click "Test Now" on any specific email type
            </p>
            <p>
              • <strong>Run All Tests:</strong> Use "Run All Tests" to test everything at once
            </p>
            <p>
              • <strong>Check Results:</strong> View test results below with success/failure status
            </p>
            <p>
              • <strong>Monitor Console:</strong> Check browser console for detailed logs
            </p>
            <p>
              • <strong>Check Email:</strong> Verify emails are received in your inbox
            </p>
            <p>
              • <strong>Backend Logs:</strong> Check backend console for email sending logs
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailTestPage;

