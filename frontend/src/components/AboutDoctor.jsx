import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "./Button";
import PopupModal from "./PopupModal";
import BookingForm from "./BookingForm";
import { BadgeCheck, Info, X } from "lucide-react";
import {
  getDoctorDetails,
  getDoctorAvailability,
  bookAppointment,
} from "../api/aboutDoctorApi";
import { getPopupMessage, createCustomPopup } from "../utils/popupUtils";

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
  const [doctor, setDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    reason: "",
    date: "",
    time: "",
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

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    // Update form data with selected time
    setFormData((prev) => ({
      ...prev,
      time: time,
    }));
  };

  const openBookingForm = () => {
    if (!selectedTime) {
      const timeSlotPopup = getPopupMessage("SELECT_TIME_SLOT");
      showPopup(timeSlotPopup.type, timeSlotPopup.title, timeSlotPopup.message);
      return;
    }

    setShowBookingForm(true);
  };

  const closeBookingForm = () => {
    setShowBookingForm(false);
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
      {/* Top Section */}
      <div className="flex justify-around flex-col md:flex-row ">
        {/* Doctor Image */}
        <img
          src={
            doctor?.image ||
            "https://img.freepik.com/free-photo/young-doctor-man-with-stethoscope-isolated-purple-background-has-realized-something-has-intentional-error_1368-162767.jpg"
          }
          alt="Doctor"
          className="rounded-3xl w-64 h-64 object-cover"
        />

        {/* Doctor Info */}
        <Card className="rounded-3xl ">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Dr. {doctor?.name || "Richard James"}{" "}
              <BadgeCheck className="text-purple-500 w-5 h-5" />
            </h2>
            <p className="text-sm text-gray-600">
              {doctor?.specialization || "MBBS - General Physician"}
            </p>
            <p className="text-sm text-gray-600">
              {doctor?.experience || "4 Years"}
            </p>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>
                {doctor?.bio ||
                  "Dr. " + doctor?.name + " has not provided their bio."}
              </span>
            </div>
            <p className="text-lg font-semibold">
              Appointment fee: {doctor?.fee || "₹1000"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Slots */}
      <div className="mt-10 space-y-4">
        <h3 className="text-xl font-semibold">Booking slots</h3>

        {/* Dates */}
        <div className="flex gap-4 overflow-auto pb-2">
          {availability.map((day, index) => (
            <div
              key={index}
              className={`rounded-full px-4 py-2 text-sm font-medium border cursor-pointer ${
                index === selectedDate
                  ? "bg-purple-600 text-white"
                  : "text-gray-700"
              }`}
              onClick={() => handleDateSelect(index)}
            >
              {day.day}
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="flex gap-4 flex-wrap">
          {availability[selectedDate]?.timeSlots.map((slot, index) => (
            <div
              key={index}
              className={`border rounded-full px-4 py-2 text-sm cursor-pointer transition-colors ${
                selectedTime === slot
                  ? "bg-purple-600 text-white border-purple-600"
                  : "text-gray-800 hover:bg-gray-100"
              }`}
              onClick={() => handleTimeSelect(slot)}
            >
              {slot}
            </div>
          ))}
        </div>

        <Button
          className="mt-4 px-6 py-2 text-white bg-purple-600 hover:bg-purple-800 rounded-full"
          onClick={openBookingForm}
        >
          Book an appointment
        </Button>
      </div>

      {/* Full Screen Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-purple-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={closeBookingForm}
              className="absolute top-4 right-4 text-white hover:text-gray-700 z-10 mt-[70px] bg-purple-600 rounded-md"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Booking Form */}
            <div className="p-4">
              <BookingForm
                doctorName={doctor?.name || "Doctor"}
                selectedDate={
                  formatDateForInput(availability[selectedDate]?.date) || ""
                }
                selectedTime={selectedTime || ""}
              />
            </div>
          </div>
        </div>
      )}

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
