import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import EmergencyVideoChatForm from "./EmergencyVideoChatForm";

const EmergencyDashboard = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingEmergency, setCancellingEmergency] = useState(null);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);
  const [showVideoChatForm, setShowVideoChatForm] = useState(false);
  
  // Debug log for video chat form state
  useEffect(() => {
    console.log("showVideoChatForm state:", showVideoChatForm);
  }, [showVideoChatForm]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchEmergencyData();
  }, [token, navigate]);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      
      // Fetch emergency history
      const emergencyResponse = await fetch("http://localhost:5000/api/emergency/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const emergencyData = await emergencyResponse.json();
      
      if (emergencyData.success) {
        setEmergencies(emergencyData.data.emergencies);
      }

      // Fetch emergency statistics
      const statsResponse = await fetch("http://localhost:5000/api/emergency/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch ambulance details for the latest emergency if it has ambulance requested
      if (emergencyData.success && emergencyData.data.emergencies.length > 0) {
        const latestEmergency = emergencyData.data.emergencies[0];
        if (latestEmergency.ambulanceRequested && 
            (latestEmergency.status === "active" || latestEmergency.status === "assigned")) {
          await fetchAmbulanceDetails(latestEmergency.id);
        }
      }

    } catch (error) {
      console.error("Error fetching emergency data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbulanceDetails = async (emergencyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/${emergencyId}/ambulance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAmbulanceDetails(data.data.ambulance);
      }
    } catch (error) {
      console.error("Error fetching ambulance details:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-red-500";
      case "assigned":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const handleCancelClick = (emergency) => {
    setCancellingEmergency(emergency);
    setShowCancelModal(true);
  };

  const confirmCancelEmergency = async () => {
    if (!cancellingEmergency) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/status/${cancellingEmergency.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled"
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchEmergencyData(); // Refresh data
        setShowCancelModal(false);
        setCancellingEmergency(null);
      } else {
        alert(data.message || "Failed to cancel emergency");
      }
    } catch (error) {
      console.error("Error cancelling emergency:", error);
      alert("Network error. Please try again.");
    }
  };

  const cancelEmergency = async (emergencyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/status/${emergencyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "cancelled"
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Emergency cancelled successfully!");
        fetchEmergencyData(); // Refresh data
      } else {
        alert(data.message || "Failed to cancel emergency");
      }
    } catch (error) {
      console.error("Error cancelling emergency:", error);
      alert("Network error. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="pt-[100px] min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Emergency Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your emergency requests and contacts
          </p>
          

        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Emergencies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmergencies || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEmergencies || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedEmergencies || 0}</p>
              </div>
            </div>
          </div>


        </motion.div>

        

        {/* Ambulance Details */}
        {ambulanceDetails && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Assigned Ambulance</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Ambulance Service</h4>
                <p className="text-blue-800 font-semibold">{ambulanceDetails.name}</p>
                <p className="text-blue-700 text-sm">{ambulanceDetails.location}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Driver Details</h4>
                <p className="text-green-800 font-semibold">{ambulanceDetails.driverName || "Driver Name"}</p>
                <p className="text-green-700 text-sm">{ambulanceDetails.phone}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Vehicle Info</h4>
                <p className="text-purple-800 font-semibold">{ambulanceDetails.vehicleNumber || "Vehicle Number"}</p>
                <p className="text-purple-700 text-sm">{ambulanceDetails.specialization || "Emergency Service"}</p>
              </div>
            </div>

            {ambulanceDetails.estimatedArrival && (
              <div className="mt-4 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-900">Estimated Arrival</h4>
                    <p className="text-yellow-800 text-lg font-semibold">{ambulanceDetails.estimatedArrival} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-700 text-sm">Based on current location</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "emergencies", label: "Emergency History", icon: "🚨" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-[#083567] text-[#083567]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Emergencies
                    </h3>
                    {emergencies.slice(0, 3).length > 0 ? (
                      <div className="space-y-3">
                        {emergencies.slice(0, 3).map((emergency) => (
                          <div
                            key={emergency.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(emergency.severity)}`}></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {emergency.emergencyType.charAt(0).toUpperCase() + emergency.emergencyType.slice(1)}
                                </p>
                                <p className="text-sm text-gray-500">{emergency.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(emergency.status)}`}>
                                {emergency.status}
                              </span>
                              {emergency.ambulanceRequested && (emergency.status === "active" || emergency.status === "assigned") && (
                                <button
                                  onClick={() => navigate("/emergency/tracker")}
                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                  title="Track Ambulance"
                                >
                                  Track
                                </button>
                              )}
                              {(emergency.status === "active" || emergency.status === "assigned") && (
                                <button
                                  onClick={() => handleCancelClick(emergency)}
                                  className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                                  title="Cancel Emergency"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No emergency history found</p>
                    )}
                  </div>


                </motion.div>
              )}

              {activeTab === "emergencies" && (
                <motion.div
                  key="emergencies"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Emergency History
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate("/emergency/tracker")}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Track Ambulance
                      </button>
                      <button
                        onClick={() => navigate("/emergency/create")}
                        className="bg-[#083567] text-white px-4 py-2 rounded-lg hover:bg-[#062a4a] transition-colors"
                      >
                        New Emergency
                      </button>
                    </div>
                  </div>
                  
                  {emergencies.length > 0 ? (
                    <div className="space-y-4">
                      {/* Debug Info - Remove this later */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-yellow-800 mb-2">Debug Info:</h4>
                        <p className="text-sm text-yellow-700">Total emergencies: {emergencies.length}</p>
                        {emergencies.map((emergency, index) => (
                          <p key={index} className="text-sm text-yellow-700">
                            Emergency {index + 1}: Status = "{emergency.status}", Ambulance = {emergency.ambulanceRequested ? "Yes" : "No"}
                          </p>
                        ))}
                      </div>
                      
                      {emergencies.map((emergency) => (
                        <div
                          key={emergency.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getSeverityColor(emergency.severity)}`}></div>
                              <h4 className="font-semibold text-gray-900">
                                {emergency.emergencyType.charAt(0).toUpperCase() + emergency.emergencyType.slice(1)}
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(emergency.status)}`}>
                                {emergency.status}
                              </span>
                              {(emergency.status === "active" || emergency.status === "assigned") && (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Are you sure you want to cancel this emergency?")) {
                                      cancelEmergency(emergency.id);
                                    }
                                  }}
                                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                  title="Cancel Emergency"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Location: {emergency.location}</p>
                              <p className="text-gray-600">Description: {emergency.description}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Created: {new Date(emergency.createdAt).toLocaleDateString()}</p>
                              {emergency.assignedDoctor && (
                                <p className="text-gray-600">Doctor: {emergency.assignedDoctor.name}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="mt-3 flex justify-end space-x-2">
                            {emergency.ambulanceRequested && (emergency.status === "active" || emergency.status === "assigned") && (
                              <button
                                onClick={() => navigate("/emergency/tracker")}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                              >
                                Track Ambulance
                              </button>
                            )}
                            {/* Cancel button only for active/assigned emergencies */}
                            {(emergency.status === "active" || emergency.status === "assigned") && (
                              <button
                                onClick={() => handleCancelClick(emergency)}
                                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                              >
                                Cancel Emergency
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No emergencies</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new emergency request.</p>
                      <div className="mt-6">
                        <button
                          onClick={() => navigate("/emergency/create")}
                          className="bg-[#083567] text-white px-4 py-2 rounded-lg hover:bg-[#062a4a] transition-colors"
                        >
                          Create Emergency Request
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}


            </AnimatePresence>
          </div>
        </motion.div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowCancelModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cancel Emergency
                  </h3>
                  
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to cancel this emergency? This action cannot be undone.
                  </p>

                  {cancellingEmergency && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-6 text-left">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Emergency Type:</span> {cancellingEmergency.emergencyType}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {cancellingEmergency.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Status:</span> {cancellingEmergency.status}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Keep Emergency
                    </button>
                    <button
                      onClick={confirmCancelEmergency}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Cancel Emergency
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emergency Video Chat Form Modal */}
        <AnimatePresence>
          {showVideoChatForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowVideoChatForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Emergency Video Chat</h2>
                  <button
                    onClick={() => setShowVideoChatForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Emergency Video Chat Form</h3>
                    <p className="text-gray-600 mb-4">This is a test modal. The form should appear here.</p>
                    <button
                      onClick={() => setShowVideoChatForm(false)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Close Modal
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EmergencyDashboard; 