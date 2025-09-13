import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EmergencyVideoChatForm = () => {
  const [formData, setFormData] = useState({
    emergencyType: "",
    severity: "medium",
    description: "",
    location: "",
    patientName: "",
    patientPhone: ""
  });
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const navigate = useNavigate();

  const emergencyTypes = [
    { value: "cardiac", label: "Cardiac Emergency", specialist: "Cardiologist", icon: "❤️" },
    { value: "respiratory", label: "Respiratory Emergency", specialist: "Pulmonologist", icon: "🫁" },
    { value: "neurological", label: "Neurological Emergency", specialist: "Neurologist", icon: "🧠" },
    { value: "trauma", label: "Trauma/Emergency", specialist: "Emergency Medicine", icon: "🚑" },
    { value: "pediatric", label: "Pediatric Emergency", specialist: "Pediatrician", icon: "👶" },
    { value: "obstetric", label: "Obstetric Emergency", specialist: "Obstetrician", icon: "🤱" },
    { value: "psychiatric", label: "Psychiatric Emergency", specialist: "Psychiatrist", icon: "🧠" },
    { value: "dental", label: "Dental Emergency", specialist: "Dentist", icon: "🦷" },
    { value: "general", label: "General Medical", specialist: "General Physician", icon: "👨‍⚕️" }
  ];

  const severityLevels = [
    { value: "low", label: "Low", color: "text-green-600", bg: "bg-green-100" },
    { value: "medium", label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
    { value: "high", label: "High", color: "text-orange-600", bg: "bg-orange-100" },
    { value: "critical", label: "Critical", color: "text-red-600", bg: "bg-red-100" }
  ];

  // Fetch user info on component mount
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.user) {
        setUserInfo(data.user);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleAutoFill = () => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        patientName: userInfo.name || "",
        patientPhone: userInfo.phone || ""
      }));
      setAutoFilled(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Create emergency request with video chat
      const response = await fetch("http://localhost:5000/api/emergency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          ambulanceRequested: false,
          videoChatRequested: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // Navigate to video chat if session was created
        if (data.data.chatSession) {
          setTimeout(() => {
            navigate(`/emergency-video-chat/${data.data.chatSession.id}`);
          }, 2000);
        } else {
          setTimeout(() => {
            navigate("/emergency/dashboard");
          }, 3000);
        }
      } else {
        setError(data.message || "Failed to create emergency video chat request");
      }
    } catch (error) {
      console.error("Error creating emergency video chat:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSpecialist = () => {
    const selectedType = emergencyTypes.find(type => type.value === formData.emergencyType);
    return selectedType ? selectedType.specialist : "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-[100px] min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4"
          >
            <span className="text-3xl">🚨</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emergency Video Chat
          </h1>
          <p className="text-gray-600">
            Connect immediately with a specialist doctor for your emergency
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
          >
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Emergency Video Chat Request Submitted!
            </h2>
            <p className="text-green-700 mb-4">
              We're connecting you with a {getSelectedSpecialist()} immediately.
            </p>
            <div className="space-y-2 text-sm text-green-600">
              <p>• Emergency services have been notified</p>
              <p>• Specialist doctor will be assigned based on your emergency type</p>
              <p>• Video call will start automatically</p>
              <p>• You'll be connected to a doctor immediately via video</p>
              <p>• Stay at your location for assistance</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Information - Minimal */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-blue-900">Patient Information</h3>
                  {userInfo && !autoFilled && (
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      Auto-fill from Profile
                    </button>
                  )}
                  {autoFilled && (
                    <span className="text-green-600 text-sm">✓ Auto-filled</span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Emergency Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {emergencyTypes.map((type) => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id={type.value}
                        name="emergencyType"
                        value={type.value}
                        checked={formData.emergencyType === type.value}
                        onChange={handleInputChange}
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor={type.value}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.emergencyType === type.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {type.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {type.specialist}
                            </div>
                          </div>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Emergency Severity *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {severityLevels.map((level) => (
                    <motion.div
                      key={level.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        id={level.value}
                        name="severity"
                        value={level.value}
                        checked={formData.severity === level.value}
                        onChange={handleInputChange}
                        className="hidden"
                        required
                      />
                      <label
                        htmlFor={level.value}
                        className={`block p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          formData.severity === level.value
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className={`font-medium ${level.color}`}>
                          {level.label}
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Describe what happened and your current symptoms..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your current address or location..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Selected Specialist Info */}
              {formData.emergencyType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👨‍⚕️</span>
                    <div>
                      <div className="font-medium text-blue-900">
                        You will be connected to a {getSelectedSpecialist()}
                      </div>
                      <div className="text-sm text-blue-700">
                        Based on your emergency type: {emergencyTypes.find(t => t.value === formData.emergencyType)?.label}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center">
                <motion.button
                  type="submit"
                  disabled={loading || !formData.emergencyType}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                    loading || !formData.emergencyType
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting to Specialist...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🚨</span>
                      <span>Start Emergency Video Chat</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default EmergencyVideoChatForm; 