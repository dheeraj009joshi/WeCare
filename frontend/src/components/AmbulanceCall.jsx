import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AmbulanceCall = () => {
  const [location, setLocation] = useState("");
  const [emergencyType, setEmergencyType] = useState("medical");
  const [isCalling, setIsCalling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCalling(true);

    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Please login to request ambulance service");
      setIsCalling(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/emergency/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyType: emergencyType,
          severity: "high",
          description: `${emergencyType} emergency at ${location}`,
          location: location,
          ambulanceRequested: true,
        }),
      });

      if (!response.ok) {
        console.error("Emergency creation response not ok:", response.status, response.statusText);
        if (response.status === 401) {
          console.error("Token expired or invalid, redirecting to login");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const errorData = await response.json();
        alert(errorData.message || "Failed to request ambulance");
        return;
      }

      const data = await response.json();

      if (data.success) {
        setEmergencyData({
          location: location,
          emergencyType: emergencyType,
          emergencyId: data.data.emergency.id
        });
        setShowSuccessModal(true);
      } else {
        alert(data.message || "Failed to request ambulance");
      }
    } catch (error) {
      console.error("Error requesting ambulance:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsCalling(false);
    }
  };

  // Animation variants
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

  const emergencyPulse = {
    hover: {
      scale: 1.02,
      boxShadow: "0 0 15px rgba(255, 0, 0, 0.3)",
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1.5,
      },
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-[100px] min-h-screen p-6 "
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 mt-[50px]"
      >
        <motion.h1
          className="text-2xl font-bold text-[#083567] mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Emergency Ambulance Request
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div className="mb-4" variants={item}>
            <label className="block text-gray-700 mb-2">Your Location</label>
            <motion.input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your exact location"
              className="w-full p-2 border border-[#083567] rounded"
              required
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 0 2px rgba(8, 53, 103, 0.2)",
              }}
            />
          </motion.div>

          <motion.div className="mb-4" variants={item}>
            <label className="block text-gray-700 mb-2">Emergency Type</label>
            <motion.select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full p-2 border border-[#083567] rounded"
              whileFocus={{
                scale: 1.01,
                boxShadow: "0 0 0 2px rgba(8, 53, 103, 0.2)",
              }}
                         >
               <option value="accident">Accident</option>
               <option value="cardiac">Heart Attack</option>
               <option value="medical">Medical Emergency</option>
               <option value="respiratory">Breathing Difficulty</option>
               <option value="trauma">Trauma</option>
               <option value="other">Other Emergency</option>
             </motion.select>
          </motion.div>

          <motion.div variants={item}>
            <motion.button
              type="submit"
              disabled={isCalling}
              className={`w-full py-3 px-4 rounded-md text-white font-bold ${
                isCalling ? "bg-[#3a6494]" : "bg-[#083567] hover:bg-red-700"
              }`}
              whileHover={!isCalling ? emergencyPulse.hover : {}}
              whileTap={emergencyPulse.tap}
            >
              {isCalling ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Calling Ambulance...
                </span>
              ) : (
                "Call Ambulance Now"
              )}
            </motion.button>
          </motion.div>
        </motion.form>

        <motion.div
          className="mt-6 bg-[#8ba3bd] p-4 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-bold text-white mb-2">Important:</h3>
          <motion.ul
            className="list-disc pl-5 text-white space-y-1"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {[
              "Stay on the line until help arrives",
              "Clear the area for emergency personnel",
              "Don't move the patient if unsafe",
              "Keep your phone accessible",
            ].map((item, index) => (
              <motion.li key={index} variants={item}>
                {item}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSuccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🚨 Ambulance Dispatched!
                </h3>
                
                <p className="text-sm text-gray-600 mb-6">
                  Emergency response team is on the way to your location.
                </p>

                {emergencyData && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <span className="font-medium text-blue-900">Location:</span>
                        <p className="text-blue-700">{emergencyData.location}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Emergency Type:</span>
                        <p className="text-blue-700 capitalize">{emergencyData.emergencyType.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-blue-900">Emergency ID:</span>
                        <p className="text-blue-700 font-mono text-sm">#{emergencyData.emergencyId}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Important Instructions:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Stay calm and wait for emergency personnel</li>
                    <li>• Clear the area for ambulance access</li>
                    <li>• Keep your phone accessible</li>
                    <li>• Don't move the patient if unsafe</li>
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate("/emergency/dashboard");
                    }}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Track Ambulance
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AmbulanceCall;
