import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AmbulanceTracker = () => {
  const [emergency, setEmergency] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingEmergency, setCancellingEmergency] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [ambulanceDetails, setAmbulanceDetails] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Check if token is valid
  const isTokenValid = () => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    if (!token || !isTokenValid()) {
      console.log("No valid token found, redirecting to login");
      localStorage.removeItem("token");
      navigate("/login");
      return;
    }
    
    // Check if Google Maps API is loaded
    const checkGoogleMaps = () => {
      if (typeof google === 'undefined') {
        console.log("Google Maps API not loaded yet, retrying...");
        setTimeout(checkGoogleMaps, 1000);
        return;
      }
      console.log("Google Maps API loaded successfully");
      initializeTracker();
    };
    
    checkGoogleMaps();
  }, [token, navigate]);

  // Initialize map when user location is available
  useEffect(() => {
    if (userLocation && mapRef.current) {
      // Simple initialization without complex timing
      initializeMap();
    }
  }, [userLocation]);

  const initializeTracker = async () => {
    try {
      setLoading(true);
      setMapError(null);
      
      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(userLoc);
          },
                  (error) => {
          console.error("Error getting location:", error);
          // Default to Delhi coordinates (more central location)
          const defaultLocation = { lat: 28.7041, lng: 77.1025 };
          setUserLocation(defaultLocation);
          setMapError("Location access denied. Using default location. Please allow location access for better tracking.");
        }
        );
      } else {
        // Default to Delhi coordinates
        const defaultLocation = { lat: 28.7041, lng: 77.1025 };
        setUserLocation(defaultLocation);
        setMapError("Geolocation not supported. Using default location.");
      }

      // Fetch latest emergency
      await fetchLatestEmergency();
      
    } catch (error) {
      console.error("Error initializing tracker:", error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    console.log("Initializing map...", { mapRef: mapRef.current, userLocation });
    
    if (!mapRef.current || !userLocation) {
      console.log("Missing required data:", { mapRef: !!mapRef.current, userLocation: !!userLocation });
      return;
    }

    try {
      // Check if Google Maps API is loaded
      if (typeof google === 'undefined') {
        console.error("Google Maps API not loaded");
        setMapError("Google Maps API not loaded. Please check your API key.");
        return;
      }

      console.log("Creating map with location:", userLocation);
      
      const map = new google.maps.Map(mapRef.current, {
        center: userLocation,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      console.log("Map created successfully");
      setMapInstance(map);

      // Add user location marker
      new google.maps.Marker({
        position: userLocation,
        map: map,
        title: "Your Location"
      });

      console.log("User marker added successfully");

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your API key.");
    }
  };

  const fetchLatestEmergency = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/emergency/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Emergency history response not ok:", response.status, response.statusText);
        if (response.status === 401) {
          console.error("Token expired or invalid, redirecting to login");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.data.emergencies.length > 0) {
        const latestEmergency = data.data.emergencies[0];
        setEmergency(latestEmergency);

        // If emergency has ambulance requested, fetch ambulance details and start tracking
        if (latestEmergency.ambulanceRequested && 
            (latestEmergency.status === "active" || latestEmergency.status === "assigned")) {
          await fetchAmbulanceDetails(latestEmergency.id);
          startAmbulanceTracking(latestEmergency);
        }
      }
    } catch (error) {
      console.error("Error fetching emergency:", error);
    }
  };

  const fetchAmbulanceDetails = async (emergencyId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/${emergencyId}/ambulance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error("Ambulance details response not ok:", response.status, response.statusText);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setAmbulanceDetails(data.data.ambulance);
      }
    } catch (error) {
      console.error("Error fetching ambulance details:", error);
    }
  };

  const startAmbulanceTracking = (emergency) => {
    setTracking(true);
    
    let ambulanceMarker = null;
    
    // Simulate ambulance location (in real app, this would come from ambulance GPS)
    const simulateAmbulanceLocation = () => {
      if (!userLocation || !mapInstance) return;

      // Simulate ambulance approaching user location
      const ambulanceLat = userLocation.lat + (Math.random() - 0.5) * 0.01;
      const ambulanceLng = userLocation.lng + (Math.random() - 0.5) * 0.01;
      
      const newAmbulanceLocation = {
        lat: ambulanceLat,
        lng: ambulanceLng
      };

      setAmbulanceLocation(newAmbulanceLocation);

      // Update or create ambulance marker
      if (ambulanceMarker) {
        ambulanceMarker.setPosition(newAmbulanceLocation);
      } else {
        ambulanceMarker = new google.maps.Marker({
          position: newAmbulanceLocation,
          map: mapInstance,
          title: "Ambulance",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" fill="#FF4444"/>
                <rect x="6" y="8" width="12" height="8" fill="white"/>
                <circle cx="8" cy="12" r="1" fill="#FF4444"/>
                <circle cx="16" cy="12" r="1" fill="#FF4444"/>
                <path d="M4 8h2M18 8h2" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          }
        });
      }

      // Calculate estimated time (simplified)
      const distance = calculateDistance(userLocation, newAmbulanceLocation);
      const estimatedMinutes = Math.max(1, Math.round(distance * 2)); // Rough estimate
      setEstimatedTime(estimatedMinutes);

      // Draw route line
      if (mapInstance) {
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true // We'll add our own markers
        });

        directionsService.route({
          origin: newAmbulanceLocation,
          destination: userLocation,
          travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        });
      }
    };

    // Update ambulance location every 10 seconds
    const trackingInterval = setInterval(simulateAmbulanceLocation, 10000);
    simulateAmbulanceLocation(); // Initial position

    return () => {
      clearInterval(trackingInterval);
      if (ambulanceMarker) {
        ambulanceMarker.setMap(null);
      }
    };
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const cancelTracking = () => {
    setTracking(false);
    setAmbulanceLocation(null);
    setEstimatedTime(null);
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

      if (!response.ok) {
        console.error("Cancel emergency response not ok:", response.status, response.statusText);
        if (response.status === 401) {
          console.error("Token expired or invalid, redirecting to login");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        alert("Failed to cancel emergency. Please try again.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Refresh emergency data
        await fetchLatestEmergency();
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

      if (!response.ok) {
        console.error("Cancel emergency response not ok:", response.status, response.statusText);
        if (response.status === 401) {
          console.error("Token expired or invalid, redirecting to login");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        alert("Failed to cancel emergency. Please try again.");
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert("Emergency cancelled successfully!");
        // Refresh emergency data
        await fetchLatestEmergency();
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
      <div className="pt-[100px] min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Ambulance Tracker
          </h1>
          <p className="text-gray-600">
            Track your ambulance in real-time
          </p>
        </motion.div>

        {/* Emergency Info */}
        {emergency && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Emergency Details</h3>
              {(emergency.status === "active" || emergency.status === "assigned") && (
                <button
                  onClick={() => handleCancelClick(emergency)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel Emergency
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Emergency Type</h3>
                <p className="text-gray-600 capitalize">{emergency.emergencyType}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Location</h3>
                <p className="text-gray-600">{emergency.location}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Status</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                  emergency.status === "active" ? "bg-red-500" :
                  emergency.status === "assigned" ? "bg-yellow-500" :
                  emergency.status === "resolved" ? "bg-green-500" : "bg-gray-500"
                }`}>
                  {emergency.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ambulance Details */}
        {ambulanceDetails && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
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

        {/* Google Maps Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Tracking Map</h3>
            {tracking && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live tracking active</span>
                </div>
                <button
                  onClick={cancelTracking}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                >
                  Stop Tracking
                </button>
              </div>
            )}
            {mapError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                ⚠️ {mapError}
              </div>
            )}
          </div>
          
          <div 
            ref={mapRef}
            className="w-full h-96 rounded-lg border border-gray-200"
            style={{ minHeight: '400px' }}
          >
            {mapError && (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p className="text-sm">Map not available</p>
                  <p className="text-xs text-gray-400 mt-1">{mapError}</p>
                </div>
              </div>
            )}
            {!mapError && !mapInstance && (
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-sm">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Tracking Status */}
          {tracking && ambulanceLocation && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Your Location</h4>
                <p className="text-sm text-blue-700">
                  Lat: {userLocation?.lat.toFixed(6)}<br />
                  Lng: {userLocation?.lng.toFixed(6)}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Ambulance Location</h4>
                <p className="text-sm text-red-700">
                  Lat: {ambulanceLocation.lat.toFixed(6)}<br />
                  Lng: {ambulanceLocation.lng.toFixed(6)}
                </p>
                {estimatedTime && (
                  <p className="text-red-700 font-semibold mt-2">
                    ETA: {estimatedTime} minutes
                  </p>
                )}
              </div>
            </div>
          )}

          {!tracking && (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-gray-600">No active tracking</p>
            </div>
          )}
        </motion.div>

        {/* Tracking Controls */}
        {emergency && emergency.ambulanceRequested && !tracking && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => startAmbulanceTracking(emergency)}
              className="bg-[#083567] text-white px-6 py-3 rounded-lg hover:bg-[#062a4a] transition-colors"
            >
              Start Ambulance Tracking
            </button>
          </motion.div>
        )}

        {/* Instructions */}

      </div>

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
    </motion.div>
  );
};

export default AmbulanceTracker; 
