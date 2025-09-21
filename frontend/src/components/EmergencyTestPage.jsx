import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EmergencyTestPage = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const addTestResult = (test, success, message) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testEmergencyCreation = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyType: "medical",
          severity: "medium",
          description: "Test emergency request",
          location: "Test Location, Mumbai",
          ambulanceRequested: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult("Create Emergency", true, "Emergency created successfully");
      } else {
        addTestResult("Create Emergency", false, data.message || "Failed to create emergency");
      }
    } catch (error) {
      addTestResult("Create Emergency", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testEmergencyHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult("Get Emergency History", true, `Found ${data.data.total} emergencies`);
      } else {
        addTestResult("Get Emergency History", false, data.message || "Failed to get history");
      }
    } catch (error) {
      addTestResult("Get Emergency History", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testEmergencyStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult("Get Emergency Stats", true, `Total: ${data.data.totalEmergencies}, Active: ${data.data.activeEmergencies}`);
      } else {
        addTestResult("Get Emergency Stats", false, data.message || "Failed to get stats");
      }
    } catch (error) {
      addTestResult("Get Emergency Stats", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testAddContact = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: "Test Contact",
          relationship: "friend",
          phone: "9876543210",
          email: "test@example.com",
          isPrimary: false,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult("Add Emergency Contact", true, "Contact added successfully");
      } else {
        addTestResult("Add Emergency Contact", false, data.message || "Failed to add contact");
      }
    } catch (error) {
      addTestResult("Add Emergency Contact", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testGetContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/contacts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        addTestResult("Get Emergency Contacts", true, `Found ${data.data.length} contacts`);
      } else {
        addTestResult("Get Emergency Contacts", false, data.message || "Failed to get contacts");
      }
    } catch (error) {
      addTestResult("Get Emergency Contacts", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testFindAmbulances = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/emergency/ambulances?city=Mumbai&state=Maharashtra");
      const data = await response.json();
      
      if (data.success) {
        addTestResult("Find Ambulances", true, `Found ${data.data.length} ambulances`);
      } else {
        addTestResult("Find Ambulances", false, data.message || "Failed to find ambulances");
      }
    } catch (error) {
      addTestResult("Find Ambulances", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const testCancelEmergency = async () => {
    setLoading(true);
    try {
      // First create an emergency
      const createResponse = await fetch("http://localhost:5000/api/emergency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyType: "medical",
          severity: "medium",
          description: "Test emergency for cancellation",
          location: "Test Location, Mumbai",
          ambulanceRequested: false,
        }),
      });

      const createData = await createResponse.json();

      if (createData.success) {
        const emergencyId = createData.data.emergency.id;
        
        // Now cancel the emergency
        const cancelResponse = await fetch(`http://localhost:5000/api/emergency/status/${emergencyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "cancelled"
          }),
        });

        const cancelData = await cancelResponse.json();

        if (cancelData.success) {
          addTestResult("Cancel Emergency", true, "Emergency created and cancelled successfully");
        } else {
          addTestResult("Cancel Emergency", false, cancelData.message || "Failed to cancel emergency");
        }
      } else {
        addTestResult("Cancel Emergency", false, createData.message || "Failed to create emergency for testing");
      }
    } catch (error) {
      addTestResult("Cancel Emergency", false, "Network error");
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    await testEmergencyCreation();
    await testEmergencyHistory();
    await testEmergencyStats();
    await testAddContact();
    await testGetContacts();
    await testFindAmbulances();
    await testCancelEmergency(); // Added this line
  };

  if (!token) {
    return (
      <div className="pt-[100px] min-h-screen p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-[#083567] mb-4">
            Emergency Backend Test
          </h1>
          <p className="text-gray-600 mb-6">
            Please login to test the emergency backend functionality
          </p>
          <button
            onClick={() => navigate("/login")}
            className="bg-[#083567] text-white px-6 py-3 rounded-lg hover:bg-[#062a4a] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-[100px] min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Emergency Backend Test
          </h1>
          <p className="text-gray-600">
            Test the emergency backend API endpoints
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Controls
            </h2>
            
            <div className="space-y-3">
              <button
                onClick={testEmergencyCreation}
                disabled={loading}
                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Test Create Emergency
              </button>
              
              <button
                onClick={testEmergencyHistory}
                disabled={loading}
                className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Test Get Emergency History
              </button>
              
              <button
                onClick={testEmergencyStats}
                disabled={loading}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Test Get Emergency Stats
              </button>
              
              <button
                onClick={testAddContact}
                disabled={loading}
                className="w-full p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Test Add Emergency Contact
              </button>
              
              <button
                onClick={testGetContacts}
                disabled={loading}
                className="w-full p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
              >
                Test Get Emergency Contacts
              </button>
              
              <button
                onClick={testFindAmbulances}
                disabled={loading}
                className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Test Find Ambulances
              </button>

              <button
                onClick={testCancelEmergency}
                disabled={loading}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Test Cancel Emergency
              </button>
              
              <button
                onClick={runAllTests}
                disabled={loading}
                className="w-full p-3 bg-[#083567] text-white rounded-lg hover:bg-[#062a4a] disabled:opacity-50 font-bold"
              >
                Run All Tests
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={() => navigate("/emergency/dashboard")}
                className="w-full p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go to Emergency Dashboard
              </button>
              
              <button
                onClick={() => navigate("/emergency/create")}
                className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Create Emergency Request
              </button>
            </div>
          </motion.div>

          {/* Test Results */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Results
            </h2>
            
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#083567] mx-auto"></div>
                <p className="text-gray-600 mt-2">Running test...</p>
              </div>
            )}
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tests run yet. Click a test button to start.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {result.test}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.success
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {result.success ? "PASS" : "FAIL"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {result.timestamp}
                    </p>
                  </div>
                ))
              )}
            </div>
            
            {testResults.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Summary:</strong> {testResults.filter(r => r.success).length} passed, {testResults.filter(r => !r.success).length} failed
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* API Documentation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Emergency API Endpoints
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="p-2 bg-blue-50 rounded">
                <strong>POST /api/emergency/create</strong> - Create emergency request
              </div>
              <div className="p-2 bg-green-50 rounded">
                <strong>GET /api/emergency/history</strong> - Get emergency history
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <strong>GET /api/emergency/stats</strong> - Get emergency statistics
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="p-2 bg-orange-50 rounded">
                <strong>POST /api/emergency/contacts</strong> - Add emergency contact
              </div>
              <div className="p-2 bg-teal-50 rounded">
                <strong>GET /api/emergency/contacts</strong> - Get emergency contacts
              </div>
              <div className="p-2 bg-red-50 rounded">
                <strong>GET /api/emergency/ambulances</strong> - Find nearby ambulances
              </div>
              <div className="p-2 bg-purple-50 rounded">
                <strong>PUT /api/emergency/status/:id</strong> - Cancel emergency request
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyTestPage; 