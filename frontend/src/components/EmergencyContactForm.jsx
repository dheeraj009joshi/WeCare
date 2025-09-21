import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const EmergencyContactForm = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    isPrimary: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const relationships = [
    "spouse",
    "parent",
    "child",
    "sibling",
    "friend",
    "neighbor",
    "colleague",
    "other"
  ];

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency/contacts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Error fetching contact:", error);
      setError("Failed to load contact details");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError("Please login to manage emergency contacts");
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.relationship || !formData.phone) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEditing 
        ? `http://localhost:5000/api/emergency/contacts/${id}`
        : "http://localhost:5000/api/emergency/contacts";
      
      const method = isEditing ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/emergency/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to save emergency contact");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Contact {isEditing ? "Updated" : "Added"} Successfully!
            </h2>
            <p className="text-gray-600 mb-4">
              Emergency contact has been {isEditing ? "updated" : "added"} to your profile.
            </p>
            
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
            {isEditing ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? "Update your emergency contact information"
              : "Add someone to be notified during emergencies"
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                placeholder="Enter full name"
                required
              />
            </motion.div>

            {/* Relationship */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Relationship *
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                required
              >
                <option value="">Select relationship</option>
                {relationships.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel.charAt(0).toUpperCase() + rel.slice(1)}
                  </option>
                ))}
              </select>
            </motion.div>

            {/* Phone */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                placeholder="Enter phone number"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                placeholder="Enter email address (optional)"
              />
            </motion.div>

            {/* Address */}
            <motion.div variants={item}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#083567] focus:border-[#083567]"
                placeholder="Enter address (optional)"
              />
            </motion.div>

            {/* Primary Contact */}
            <motion.div variants={item} className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isPrimary"
                checked={formData.isPrimary}
                onChange={handleInputChange}
                className="w-4 h-4 text-[#083567] border-gray-300 rounded focus:ring-[#083567]"
              />
              <label className="text-sm font-medium text-gray-700">
                Set as primary emergency contact
              </label>
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
            <motion.div variants={item} className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate("/emergency/dashboard")}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-bold transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#083567] hover:bg-[#062a4a]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? "Updating..." : "Saving..."}
                  </span>
                ) : (
                  isEditing ? "Update Contact" : "Add Contact"
                )}
              </button>
            </motion.div>
          </form>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Emergency Contacts</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Emergency contacts will be notified during emergencies</li>
              <li>• You can have multiple emergency contacts</li>
              <li>• Only one contact can be set as primary</li>
              <li>• Primary contact will be contacted first</li>
              <li>• All contacts will receive emergency notifications</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyContactForm; 