import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import PopupModal from "./PopupModal";
import { BadgeCheck, Info } from "lucide-react";
import {
  getDoctorDetails,
  getDoctorAvailability,
  bookAppointment,
} from "../api/aboutDoctorApi";
import { appointmentsAPI } from "../config/api";
import { getPopupMessage, createCustomPopup } from "../utils/popupUtils";
import { autoLogin } from "../utils/autoLogin";

// Simple Card components
const Card = ({ children, className }) => (
  <div className={`w-2/3 rounded-xl shadow-lg p-6 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children }) => (
  <div className="space-y-4">{children}</div>
);

const AboutDoctor = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: ""
  });

  // Popup states
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Use doctorId from URL or default to 1
  const currentDoctorId = doctorId || 1;

  const showPopup = (type, title, message) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closePopup = () => {
    setPopup({
      isOpen: false,
      type: "info",
      title: "",
      message: "",
    });
  };

  // Helper function to format date for HTML date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // If dateString is already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Try to parse and format the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);

        // Fetch doctor details and availability in parallel
        const [doctorResponse, availabilityResponse] = await Promise.all([
          getDoctorDetails(currentDoctorId),
          getDoctorAvailability(currentDoctorId),
        ]);

        if (doctorResponse.success) {
          setDoctor(doctorResponse.data);
        }

        if (availabilityResponse.success) {
          setAvailability(availabilityResponse.data);
        }
      } catch (error) {
        console.error("Error fetching doctor data:", error);
        const errorPopup = createCustomPopup(
          "error",
          "Error",
          "Failed to fetch doctor information. Please try again."
        );
        showPopup(errorPopup.type, errorPopup.title, errorPopup.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, [currentDoctorId]);

  const handleDateSelect = (index) => {
    setSelectedDate(index);
    setSelectedTime(null);
    // Update form data with selected date
    setFormData((prev) => ({
      ...prev,
      date: availability[index]?.date || "",
    }));
  };

  const handleTimeSelect = (slot) => {
    // Handle both old string format and new object format
    const timeValue = typeof slot === 'string' ? slot : slot.display;
    const actualTime = typeof slot === 'string' ? slot : slot.time;
    
    setSelectedTime(timeValue);
    // Store the actual time for booking
    setFormData((prev) => ({
      ...prev,
      time: actualTime || timeValue,
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuickLogin = async () => {
    try {
      const success = await autoLogin();
      if (success) {
        showPopup("success", "Login Successful", "You are now logged in!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showPopup("error", "Login Failed", "Please try manual login.");
        navigate('/login');
      }
    } catch (error) {
      console.error('Quick login error:', error);
      navigate('/login');
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTime) {
      const timeSlotPopup = getPopupMessage("SELECT_TIME_SLOT");
      showPopup(timeSlotPopup.type, timeSlotPopup.title, timeSlotPopup.message);
      return;
    }

    if (!formData.symptoms.trim()) {
      showPopup("error", "Missing Information", "Please describe your symptoms or reason for consultation.");
      return;
    }

    if (!isAuthenticated) {
      showPopup("error", "Login Required", "Please login to book an appointment.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Check if we have a valid token
    const token = localStorage.getItem('token');
    if (!token) {
      showPopup("error", "Authentication Error", "Please login again to book an appointment.");
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    try {
      setBookingLoading(true);
      
      const appointmentData = {
        doctor_id: currentDoctorId,
        appointment_date: availability[selectedDate]?.date,
        appointment_time: formData.time || selectedTime,
        symptoms: formData.symptoms.trim(),
        consultation_fee: doctor?.consultation_fee || doctor?.fee || 500
      };

      const response = await appointmentsAPI.bookAppointment(appointmentData);
      
      if (response) {
        showPopup("success", "Appointment Booked!", "Your appointment has been successfully booked. You will receive a confirmation email shortly.");
        // Reset form
        setFormData({ symptoms: '' });
        setSelectedTime(null);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      showPopup("error", "Booking Failed", error.response?.data?.detail || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto px-4 py-8 mt-[100px] min-h-screen">
        <div className="animate-pulse">
          <div className="flex justify-around flex-col md:flex-row">
            <div className="rounded-3xl w-64 h-64 bg-gray-300"></div>
            <div className="rounded-3xl w-96 h-64 bg-gray-300"></div>
          </div>
          <div className="mt-10 space-y-4">
            <div className="h-6 bg-gray-300 rounded w-32"></div>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-10 w-16 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="h-10 w-20 bg-gray-300 rounded-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 py-8 mt-[100px] min-h-screen">
      {/* Doctor Profile Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Doctor Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {doctor?.full_name?.split(' ').map(n => n[0]).join('') || 'DR'}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full flex items-center justify-center">
              <BadgeCheck className="text-white w-5 h-5" />
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dr. {doctor?.full_name || doctor?.name || "Richard James"}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {doctor?.specialization || "General Physician"}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {doctor?.experience_years || doctor?.experience || "4"} Years Experience
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Verified Doctor
                </span>
              </div>
            </div>
            
            {/* Doctor Details Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Info className="w-4 h-4" />
                  <span className="font-medium">About</span>
                </div>
                <p className="text-sm text-gray-700">
                  {doctor?.bio || `Experienced ${doctor?.specialization || 'medical'} practitioner dedicated to providing quality healthcare.`}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <span className="font-medium">📋</span>
                  <span className="font-medium">Qualifications</span>
                </div>
                <div className="text-sm text-gray-700">
                  {doctor?.qualification?.map((qual, index) => (
                    <span key={index} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                      {qual}
                    </span>
                  )) || <span>MBBS, MD</span>}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <span className="font-medium">📍</span>
                  <span className="font-medium">Clinic Address</span>
                </div>
                <p className="text-sm text-gray-700">
                  {doctor?.clinic_address || "Medical Center, City"}
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <span className="font-medium">💰</span>
                  <span className="font-medium">Consultation Fee</span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  ₹{doctor?.consultation_fee || doctor?.fee || "1000"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Slots Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Appointment Slots</h2>
          <p className="text-gray-600">Select your preferred date and time for consultation</p>
        </div>

        {/* Date Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">📅 Choose Date</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {availability.map((day, index) => (
              <div
                key={index}
                className={`min-w-[120px] rounded-xl px-4 py-3 text-center border-2 cursor-pointer transition-all duration-200 ${
                  index === selectedDate
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600 shadow-lg transform scale-105"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                }`}
                onClick={() => handleDateSelect(index)}
              >
                <div className="font-semibold text-sm">{day.day}</div>
                <div className="text-xs mt-1 opacity-80">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Slots Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">⏰ Available Time Slots</h3>
          {availability[selectedDate]?.timeSlots?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availability[selectedDate].timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`rounded-lg px-4 py-3 text-center text-sm font-medium cursor-pointer transition-all duration-200 ${
                    selectedTime === (slot.display || slot)
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
                  }`}
                  onClick={() => handleTimeSelect(slot)}
                >
                  {slot.display || slot}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📅</div>
              <p>No slots available for this date</p>
              <p className="text-sm">Please select another date</p>
            </div>
          )}
        </div>

        {/* Booking Form Section */}
        {selectedTime && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Selected Summary */}
              <div>
                <p className="text-sm text-gray-600 mb-2">📅 Selected Appointment</p>
                <p className="font-semibold text-gray-800 mb-1">
                  {availability[selectedDate]?.day} - {selectedTime}
                </p>
                <p className="text-sm text-gray-600">Consultation Fee:</p>
                <p className="font-bold text-green-600 text-xl">
                  ₹{doctor?.consultation_fee || doctor?.fee || "1000"}
                </p>
              </div>
              
              {/* Symptoms Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🩺 Describe your symptoms or reason for consultation *
                </label>
                <textarea
                  name="symptoms"
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="Please describe your symptoms, concerns, or reason for this consultation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows="3"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Book Appointment Button */}
        <div className="text-center">
          <Button
            className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform ${
              selectedTime && formData.symptoms.trim()
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:scale-105" 
                : selectedTime
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={handleBookAppointment}
            disabled={!selectedTime || bookingLoading}
          >
            {bookingLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Booking...
              </span>
            ) : !isAuthenticated ? (
              "🔒 Login to Book Appointment"
            ) : selectedTime && formData.symptoms.trim() ? (
              "🎉 Book My Appointment"
            ) : selectedTime ? (
              "📝 Add symptoms to continue"
            ) : (
              "Select time slot first"
            )}
          </Button>
          {selectedTime && isAuthenticated && (
            <p className="text-sm text-gray-500 mt-2">
              💡 Tip: Describe your symptoms clearly to help the doctor prepare for your consultation
            </p>
          )}
          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-yellow-800 mb-3">🔒 Please login to book an appointment</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  onClick={handleQuickLogin}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  ⚡ Quick Login (Demo)
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  🔑 Full Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Custom Popup Modal */}
      <PopupModal
        isOpen={popup.isOpen}
        onClose={closePopup}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        autoClose={popup.type === "success"}
        autoCloseDelay={4000}
      />
    </div>
  );
};

export default AboutDoctor;
