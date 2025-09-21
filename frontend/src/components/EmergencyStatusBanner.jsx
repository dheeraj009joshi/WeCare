import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

const EmergencyStatusBanner = () => {
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    checkActiveEmergency();
    // Check every 30 seconds for active emergencies
    const interval = setInterval(checkActiveEmergency, 30000);
    
    return () => clearInterval(interval);
  }, [token]);

  const checkActiveEmergency = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/emergency/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("token");
          setError("Authentication required");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data.emergencies.length > 0) {
        const latestEmergency = data.data.emergencies[0];
        
        // Show banner if there's an active emergency with ambulance requested
        if (latestEmergency.ambulanceRequested && 
            (latestEmergency.status === "active" || latestEmergency.status === "assigned")) {
          setActiveEmergency(latestEmergency);
          setShowBanner(true);
        } else {
          setShowBanner(false);
        }
      } else {
        setShowBanner(false);
      }
    } catch (error) {
      console.error("Error checking emergency status:", error);
      setError(error.message);
      // Don't show banner on network errors
      setShowBanner(false);
    } finally {
      setLoading(false);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  // Don't render anything if user is not authenticated or there are errors
  if (!token || error || loading || !showBanner || !activeEmergency) {
    return null;
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg"
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-semibold">Active Emergency</span>
              </div>
              <div className="text-sm">
                <span className="capitalize">{activeEmergency.emergencyType}</span> emergency at{" "}
                <span className="font-medium">{activeEmergency.location}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/emergency/tracker")}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Track Ambulance
              </button>
              <button
                onClick={dismissBanner}
                className="text-white hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyStatusBanner; 