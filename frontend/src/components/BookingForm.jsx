import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "./Button";
import { getUserProfileForBooking } from "../api/bookingApi";
import BookingFormSkeleton from "./BookingFormSkeleton";

function BookingForm({ doctorName: propDoctorName, selectedDate, selectedTime }) {
  const { doctorName: urlDoctorName } = useParams();
  
  // Use prop doctorName if provided, otherwise fall back to URL parameter
  const doctorName = propDoctorName || urlDoctorName;
  
  const [selectedSlot, setSelectedSlot] = useState(selectedTime || null);
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: ""
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    appointmentDate: selectedDate || "",
    appointmentTime: selectedTime || "",
    problemDescription: ""
  });
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
        duration: 0.5,
      },
    },
  };

  const availableSlots = [
    "09:00 AM",
    "10:30 AM",
    "12:00 PM",
    "02:00 PM",
    "03:30 PM",
    "05:00 PM",
  ];

  const slotItem = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 4px 12px rgba(139, 92, 246, 0.15)",
    },
    tap: {
      scale: 0.98,
    },
  };

  const inputFocus = {
    focus: {
      scale: 1.01,
      boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)",
      transition: { duration: 0.2 },
    },
  };

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const response = await getUserProfileForBooking(userId);
          if (response.success) {
            const user = response.data;
            setUserData(user);
            setFormData(prev => ({
              ...prev,
              name: user.name || "",
              email: user.email || "",
              phone: user.phone || "",
              age: user.age || "",
              gender: user.gender || "",
              // Preserve the selected date and time from props
              appointmentDate: selectedDate || prev.appointmentDate,
              appointmentTime: selectedTime || prev.appointmentTime
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedDate, selectedTime]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.phone || !formData.appointmentDate || !selectedSlot || !formData.problemDescription) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const bookingData = {
        doctorName: decodeURIComponent(doctorName || ""),
        patientName: formData.name,
        phone: formData.phone,
        email: formData.email,
        age: formData.age,
        gender: formData.gender,
        appointmentDate: formData.appointmentDate,
        appointmentTime: selectedSlot,
        problemDescription: formData.problemDescription,
        termsAccepted: true
      };

      // Import and call the createBooking API
      const { createBooking } = await import('../api/bookingApi');
      const response = await createBooking(bookingData);
      
      if (response.success) {
        alert('Appointment booked successfully!');
        // Reset form or redirect
        setFormData({
          name: "",
          email: "",
          phone: "",
          age: "",
          gender: "",
          appointmentDate: "",
          appointmentTime: "",
          problemDescription: ""
        });
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    }
  };

  if (loading) {
    return <BookingFormSkeleton />;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="booking-form px-6 py-12  shadow-2xl rounded-2xl max-w-2xl mx-auto my-12 backdrop-blur-sm bg-white/90"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-[#4f7cac] mb-2">
          Book a Consultation
        </h2>
        <p className="text-[#5a6d82]">
          Complete the form below to schedule your appointment
        </p>
      </motion.div>

      <motion.form
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Personal Information Section */}
        <motion.div 
          variants={item}
          className="bg-[#f8f9fa] p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-[#4f7cac] mb-4">
            Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[#4f7cac] font-medium mb-1">
                Full Name<span className="text-red-500">*</span>
              </label>
              <motion.input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                whileFocus="focus"
                variants={inputFocus}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4f7cac] font-medium mb-1">
                  Phone Number<span className="text-red-500">*</span>
                </label>
                <motion.input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                  whileFocus="focus"
                  variants={inputFocus}
                />
              </div>
              <div>
                <label className="block text-[#4f7cac] font-medium mb-1">
                  Email
                </label>
                <motion.input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                  whileFocus="focus"
                  variants={inputFocus}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#4f7cac] font-medium mb-1">
                  Age
                </label>
                <motion.input
                  type="number"
                  name="age"
                  placeholder="25"
                  min="0"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                  whileFocus="focus"
                  variants={inputFocus}
                />
              </div>
              <div>
                <label className="block text-[#4f7cac] font-medium mb-1">
                  Gender
                </label>
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none appearance-none cursor-pointer bg-white text-[#4f7cac] font-medium"
                    whileFocus={{
                      scale: 1.01,
                      boxShadow: "0 0 0 2px rgba(167, 139, 250, 0.3)",
                      borderColor: "#a78bfa",
                      transition: { duration: 0.2 }
                    }}
                    whileHover={{
                      borderColor: "#a78bfa",
                      boxShadow: "0 2px 8px rgba(167, 139, 250, 0.1)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option value="" className="text-gray-400">Choose...</option>
                    <option value="male" className="text-[#4f7cac]">Male</option>
                    <option value="female" className="text-[#4f7cac]">Female</option>
                    <option value="other" className="text-[#4f7cac]">Other</option>
                    <option value="prefer_not_to_say" className="text-[#4f7cac]">Prefer not to say</option>
                  </motion.select>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointment Details Section */}
        <motion.div 
          variants={item}
          className="bg-[#f8f9fa] p-6 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-[#4f7cac] mb-4">
            Appointment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[#4f7cac] font-medium mb-1">
                Consultation With
              </label>
              <motion.input
                type="text"
                readOnly
                value={`Dr. ${decodeURIComponent(doctorName || "")}`}
                className="w-full px-4 py-3 bg-[#f0f9ff] border border-[#ddd6fe] rounded-lg text-[#4f7cac] font-medium"
              />
            </div>

            <div>
              <label className="block text-[#4f7cac] font-medium mb-1">
                Available Time Slots
                {selectedTime && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (Pre-selected: {selectedTime})
                  </span>
                )}
              </label>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                variants={container}
              >
                {availableSlots.map((slot, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      selectedSlot === slot
                        ? "bg-[#7c3aed] text-black border-[#7c3aed]"
                        : slot === selectedTime
                        ? "bg-[#3b82f6] text-white border-[#3b82f6] ring-2 ring-[#3b82f6] ring-opacity-50"
                        : "bg-[#f3e8ff] text-[#4f7cac] border-[#a78bfa] hover:bg-[#e9d5ff]"
                    }`}
                    variants={slotItem}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </motion.button>
                ))}
              </motion.div>
            </div>

            <div>
              <label className="block text-[#4f7cac] font-medium mb-1">
                Preferred Date
                {selectedDate && (
                  <span className="ml-2 text-sm text-blue-600 font-normal">
                    (Pre-selected)
                  </span>
                )}
              </label>
              <motion.input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                whileFocus="focus"
                variants={inputFocus}
              />
            </div>

            <div>
              <label className="block text-[#4f7cac] font-medium mb-1">
                Describe Your Problem
              </label>
              <motion.textarea
                rows="4"
                name="problemDescription"
                placeholder="Describe symptoms, history, or concerns..."
                value={formData.problemDescription}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#ddd6fe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                whileFocus="focus"
                variants={inputFocus}
              ></motion.textarea>
            </div>
          </div>
        </motion.div>

        {/* Terms and Submit */}
        <motion.div variants={item} className="space-y-4">
          <motion.div
            className="flex items-start"
            whileHover={{ scale: 1.01 }}
          >
            <motion.input
              type="checkbox"
              required
              className="mt-1 mr-2"
              whileTap={{ scale: 0.9 }}
            />
            <label className="text-sm text-[#5a6d82]">
              I agree to the{" "}
              <motion.a
                href="#"
                className="text-[#7c3aed] underline"
                whileHover={{ scale: 1.05 }}
              >
                Terms & Conditions
              </motion.a>{" "}
              and{" "}
              <motion.a
                href="#"
                className="text-[#7c3aed] underline"
                whileHover={{ scale: 1.05 }}
              >
                Privacy Policy
              </motion.a>
            </label>
          </motion.div>

          <Button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirm Booking
          </Button>
        </motion.div>
      </motion.form>
    </motion.section>
  );
}

export default BookingForm;