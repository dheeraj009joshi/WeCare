import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const EmergencyRequestForm = () => {
  const [formData, setFormData] = useState({
    emergencyType: "medical",
    severity: "medium",
    description: "",
    location: "",
    latitude: "",
    longitude: "",
    ambulanceRequested: false,
    videoChatRequested: false,
    contactPerson: "",
    contactPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const emergencyTypes = [
    { value: "medical", label: "Medical Emergency", icon: "🏥" },
    { value: "accident", label: "Accident", icon: "🚗" },
    { value: "cardiac", label: "Cardiac Emergency", icon: "❤️" },
    { value: "respiratory", label: "Respiratory Emergency", icon: "🫁" },
    { value: "trauma", label: "Trauma", icon: "🩸" },
    { value: "other", label: "Other", icon: "⚠️" },
  ];

  const severityLevels = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "critical", label: "Critical", color: "bg-red-600" },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your location. Please enter manually.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError("Please login to create an emergency request");
      return;
    }

    // Validate required fields
    if (!formData.description || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/emergency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        
        // If chat session was created, navigate to video chat
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
        setError(data.message || "Failed to create emergency request");
      }
    } catch (error) {
      console.error("Error creating emergency:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-[100px] min-h-screen p-6 bg-gray-50"
      >
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Emergency Request Created!
            </h2>
            <p className="text-gray-600 mb-4">
              Your emergency request has been submitted successfully. Help is on the way.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Emergency services have been notified</li>
                <li>• Available doctors will be assigned</li>
                                          <li>• Emergency video call will start automatically</li>
                          <li>• You'll be connected to a doctor immediately via video</li>
                <li>• Stay at your location for assistance</li>
              </ul>
            </div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gray-500"
            >
              Redirecting to dashboard...
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-[100px] min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Emergency Request
          </h1>
          <p className="text-gray-600">
            Please provide details about your emergency situation
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Emergency Type */}
            <motion.div variants={item} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Emergency Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {emergencyTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, emergencyType: type.value }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.emergencyType === type.value
                        ? "border-[#083567] bg-[#083567] text-white"
                        : "border-gray-300 hover:border-[#083567] hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Severity Level */}
            <motion.div variants={item} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Severity Level *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, severity: level.value }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.severity === level.value
                        ? "border-[#083567] bg-[#083567] text-white"
                        : "border-gray-300 hover:border-[#083567] hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${level.color} mx-auto mb-1`}></div>
                    <div className="text-xs font-medium">{level.label}</div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                placeholder="Describe the emergency situation in detail..."
                required
              />
            </motion.div>

            {/* Location */}
            <motion.div variants={item} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                  placeholder="Enter your exact location..."
                  required
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={loading}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {(formData.latitude && formData.longitude) && (
                <p className="text-sm text-green-600">
                  ✓ Location coordinates captured: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </motion.div>

            {/* Ambulance Request */}
            <motion.div variants={item} className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="ambulanceRequested"
                checked={formData.ambulanceRequested}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#083567] border-gray-300 rounded focus:ring-[#083567]"
              />
              <label className="text-sm font-medium text-gray-700">
                Request ambulance service
              </label>
            </motion.div>

            {/* Video Chat Request */}
            <motion.div variants={item} className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="videoChatRequested"
                checked={formData.videoChatRequested}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Start Emergency Video Chat with Specialist
              </label>
            </motion.div>

            {/* Contact Person */}
            <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                  placeholder="Name of person to contact"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                  placeholder="Phone number"
                />
              </div>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={item}>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Emergency Request...
                  </span>
                ) : (
                  "🚨 Create Emergency Request"
                )}
              </button>
            </motion.div>
          </form>

          {/* Important Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4"
          >
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Information</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• This is for emergency situations only</li>
              <li>• Emergency services will be notified immediately</li>
              <li>• Stay at your location until help arrives</li>
              <li>• Keep your phone accessible for updates</li>
              <li>• For immediate life-threatening emergencies, call emergency services directly</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyRequestForm; 