import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  HeartPulse,
  Scale,
  Droplet,
  AlertCircle,
  Calendar,
  FileText,
  Bell,
  Shield,
  Activity,
  Camera,
  Trash2,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserProfile, updateUserProfile } from "../api/userApi";
import ProfileSkeleton from "./ProfileSkeleton";
import { useAuth } from "../context/AuthContext";

// Helper: Caret SVG for dropdown (left pointing)
const CaretLeft = () => (
  <svg
    width="8"
    height="16"
    viewBox="0 0 8 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 1L1 8L7 15"
      stroke="#d1d5db"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren",
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const popIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  },
};

const cardHover = {
  hover: {
    y: -5,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const buttonHover = {
  hover: {
    scale: 1.05,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
  },
};

const inputHover = {
  hover: {
    backgroundColor: "#f0e9ff",
    transition: {
      duration: 0.2,
    },
  },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    age: "",
    weight: "",
    height: "",
    bloodGroup: "",
    allergies: "",
    lifestyle: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });
  const [profilePicPreview, setProfilePicPreview] = useState("");
  const [showPicMenu, setShowPicMenu] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [imgError, setImgError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await getUserProfile(token);
        const data = res.data;
        setUserData(data.user);
        setFormData(data.user);
        setProfilePicPreview(data.user.profilePicture || "");
      } catch (err) {
        navigate("/");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  // Close menu on outside click
  useEffect(() => {
    if (!showPicMenu) return;
    const handleClick = (e) => {
      if (
        !e.target.closest(".profile-pic-menu") &&
        !e.target.closest(".profile-pic-edit-btn")
      ) {
        setShowPicMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicMenu]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImgError("Image size is too large (max 5MB)");
        return;
      } else {
        setImgError("");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    // Clear additional localStorage items
    localStorage.removeItem("chatSessions");
    localStorage.removeItem("currentChatId");
    localStorage.removeItem("sessionIdMap");
    
    // Use AuthContext logout function
    logout();
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    if (imgError) {
      errors.profilePicture = imgError;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    try {
      const res = await updateUserProfile(token, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        bloodGroup: formData.bloodGroup,
        allergies: formData.allergies,
        lifestyle: formData.lifestyle,
        profilePicture: formData.profilePicture || "",
      });
      const data = res.data;
      setUserData(data.user);
      setFormData(data.user);
      setProfilePicPreview(data.user.profilePicture || "");
      setIsEditing(false);
    } catch (err) {
      // Optionally show error
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }
  const fieldContainerStyle = `flex items-center p-3 rounded-xl ${
    isEditing ? "bg-[#f5f3ff]" : "bg-[#f5f3ff]"
  }`;
  const inputStyle =
    "w-full bg-[#f5f3ff] focus:bg-[#f5f3ff] focus:outline-none text-[#4f7cac]";
  const selectStyle =
    "w-full bg-[#f5f3ff] focus:bg-[#f5f3ff] focus:outline-none text-[#4f7cac]";

  return (
    <motion.div
      className="min-h-screen p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto pt-12">
        {/* Header Section */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          whileHover="hover"
          variants1={cardHover}
        >
          <motion.div
            className="flex flex-col md:flex-row items-start gap-6"
            variants={itemVariants}
          >
            {/* Profile Picture */}
            <div className="relative group">
              <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] flex items-center justify-center text-white font-bold text-3xl overflow-hidden shadow-md ring-4 ring-white ring-offset-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {profilePicPreview ? (
                  <motion.img
                    src={profilePicPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    {userData.name?.charAt(0)?.toUpperCase() || "U"}
                  </motion.span>
                )}
              </motion.div>
              {isEditing && (
                <>
                  <motion.button
                    type="button"
                    className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 cursor-pointer shadow-lg border border-blue-200 flex items-center justify-center hover:bg-blue-50 transition z-20"
                    title="Edit profile picture"
                    onClick={() => setShowPicMenu((v) => !v)}
                    style={{ outline: "none" }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Pencil className="w-4 h-4 text-[#083567]" />
                  </motion.button>
                  <AnimatePresence>
                    {showPicMenu && (
                      <motion.div
                        className="profile-pic-menu absolute top-1/2 left-full ml-3 -translate-y-1/2 bg-white rounded shadow-lg border border-gray-200 z-[9999] min-w-[150px] flex flex-col text-sm items-stretch text-left"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center -ml-2 mb-1">
                          <CaretLeft />
                        </div>
                        <motion.label
                          className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                          whileHover={{ x: 2 }}
                        >
                          <Camera className="w-4 h-4 text-[#083567]" />
                          <span>Change photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              handleProfilePicChange(e);
                              setShowPicMenu(false);
                            }}
                          />
                        </motion.label>
                        <motion.button
                          type="button"
                          className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 w-full"
                          onClick={() => {
                            setProfilePicPreview("");
                            setFormData((prev) => ({
                              ...prev,
                              profilePicture: "",
                            }));
                            setShowPicMenu(false);
                          }}
                          whileHover={{ x: 2 }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
              {imgError && (
                <motion.span
                  className="block text-xs text-red-500 mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {imgError}
                </motion.span>
              )}
              {isEditing && fieldErrors.profilePicture && (
                <motion.span
                  className="block text-xs text-red-500 mt-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {fieldErrors.profilePicture}
                </motion.span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                variants={itemVariants}
              >
                <div>
                  <motion.h1
                    className="text-3xl font-bold text-[#4f7cac]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {userData.name}
                  </motion.h1>
                  <motion.div
                    className="flex items-center gap-2 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.span
                      className="bg-[#f3e8ff] text-[#7c3aed] text-xs px-2 py-1 rounded-full"
                      whileHover={{ scale: 1.05 }}
                    >
                      Patient ID: #{userData.id || "P001245"}
                    </motion.span>
                    <span className="text-[#5a6d82] text-sm">
                      {userData.age} years • {userData.gender} •{" "}
                      {userData.address}
                    </span>
                  </motion.div>
                </div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {!isEditing ? (
                    <motion.button
                      whileHover={buttonHover.hover}
                      whileTap={buttonHover.tap}
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white py-2 px-6 rounded-lg shadow-md"
                    >
                      Edit Profile
                    </motion.button>
                  ) : (
                    <motion.div
                      className="flex gap-3"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ staggerChildren: 0.1 }}
                    >
                      <motion.button
                        onClick={() => setIsEditing(false)}
                        className="border border-[#ddd6fe] hover:bg-[#f5f3ff] text-[#4f7cac] py-2 px-4 rounded-lg"
                        whileHover={buttonHover.hover}
                        whileTap={buttonHover.tap}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white py-2 px-6 rounded-lg shadow-md"
                        whileHover={buttonHover.hover}
                        whileTap={buttonHover.tap}
                      >
                        Save Changes
                      </motion.button>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={handleLogout}
                    className="bg-red-700 text-white hover:bg-red-500 px-4 py-3 rounded-lg font-medium text-sm"
                    whileHover={buttonHover.hover}
                    whileTap={buttonHover.tap}
                  >
                    Logout
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8 border border-[#e9d5ff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover="hover"
              variants={cardHover}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[#4f7cac]">
                <User className="mr-2 text-[#7c3aed]" size={20} />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <User className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Full Name",
                    name: "name",
                  },
                  {
                    icon: <Mail className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Email",
                    name: "email",
                  },
                  {
                    icon: <Phone className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Phone",
                    name: "phone",
                  },
                  {
                    icon: <MapPin className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Address",
                    name: "address",
                  },
                  {
                    icon: <User className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Gender",
                    name: "gender",
                  },
                  {
                    icon: <User className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Age",
                    name: "age",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-[#5a6d82] mb-2">
                      {field.label}
                    </label>
                    <motion.div
                      className={fieldContainerStyle}
                      whileHover={inputHover.hover}
                    >
                      {field.icon}
                      {isEditing ? (
                        <div className="ml-3 flex-1">
                          {field.name === "gender" ? (
                            <select
                              name={field.name}
                              value={formData[field.name] || ""}
                              onChange={handleInputChange}
                              className={selectStyle}
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <input
                              name={field.name}
                              type={field.name === "email" ? "email" : "text"}
                              value={formData[field.name] || ""}
                              onChange={handleInputChange}
                              className={inputStyle}
                            />
                          )}
                        </div>
                      ) : (
                        <p className="ml-3 text-[#4f7cac]">
                          {userData[field.name] || "Not provided"}
                        </p>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health Summary */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8 border border-[#e9d5ff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover="hover"
              variants={cardHover}
            >
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[#4f7cac]">
                <HeartPulse className="mr-2 text-[#7c3aed]" size={20} />
                Health Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: <Scale className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Weight",
                    name: "weight",
                    unit: "kg",
                  },
                  {
                    icon: <Activity className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Height",
                    name: "height",
                  },
                  {
                    icon: <Droplet className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Blood Group",
                    name: "bloodGroup",
                  },
                  {
                    icon: <AlertCircle className="h-5 w-5 text-[#7c3aed]" />,
                    label: "Allergies",
                    name: "allergies",
                  },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-[#5a6d82] mb-2">
                      {field.label}
                    </label>
                    <motion.div
                      className={`flex items-center p-3 rounded-xl ${
                        isEditing ? "bg-[#f5f3ff]" : "bg-[#f5f3ff]"
                      }`}
                      whileHover={inputHover.hover}
                    >
                      {field.icon}
                      {isEditing ? (
                        field.name === "bloodGroup" ? (
                          <select
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            className="ml-3 flex-1 bg-transparent focus:outline-none text-[#4f7cac]"
                          >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                          </select>
                        ) : (
                          <input
                            name={field.name}
                            value={formData[field.name] || ""}
                            onChange={handleInputChange}
                            className="ml-3 flex-1 bg-transparent focus:outline-none text-[#4f7cac]"
                          />
                        )
                      ) : (
                        <p className="ml-3 text-[#4f7cac]">
                          {userData[field.name] || "Not provided"}{" "}
                          {field.unit || ""}
                        </p>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover="hover"
              variants={cardHover}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-[#4f7cac]">
                <Calendar className="mr-2 text-[#7c3aed]" size={20} />
                Upcoming Appointments
              </h2>
              <motion.div
                className="p-4 bg-[#f5f3ff] rounded-xl"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="bg-[#e9d5ff] p-2 rounded-full"
                    whileHover={{ rotate: 10 }}
                  >
                    <Calendar className="w-5 h-5 text-[#7c3aed]" />
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#4f7cac]">
                      Dr. Anita Patel
                    </h3>
                    <p className="text-sm text-[#7c3aed]">Cardiologist</p>
                    <p className="text-sm text-[#5a6d82] mt-1">
                      April 30, 2024 at 10:00 AM
                    </p>
                    <div className="flex gap-3 mt-3">
                      <motion.button
                        whileHover={buttonHover.hover}
                        whileTap={buttonHover.tap}
                        className="bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] text-white py-1 px-4 rounded-lg text-sm shadow-sm"
                      >
                        Join Video Call
                      </motion.button>
                      <motion.button
                        className="border border-[#ddd6fe] hover:bg-[#f5f3ff] py-1 px-4 rounded-lg text-sm text-[#4f7cac]"
                        whileHover={buttonHover.hover}
                        whileTap={buttonHover.tap}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Prescriptions & Reports */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover="hover"
              variants={cardHover}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-[#4f7cac]">
                <FileText className="mr-2 text-[#7c3aed]" size={20} />
                Prescriptions & Reports
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-[#5a6d82] mb-2">
                    Prescriptions
                  </p>
                  <motion.div
                    className="bg-[#f5f3ff] p-3 rounded-xl border border-[#e9d5ff]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="font-medium text-[#4f7cac]">Amlodipine</p>
                    <p className="text-xs text-[#7c3aed]">10 mg</p>
                  </motion.div>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#5a6d82] mb-2">
                    Lab Reports
                  </p>
                  <motion.div
                    className="bg-[#f5f3ff] p-3 rounded-xl border border-[#e9d5ff]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="font-medium text-[#4f7cac]">
                      Thyroid Profile
                    </p>
                    <p className="text-xs text-[#7c3aed]">Feb 2024</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Health Suggestions */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover="hover"
              variants={cardHover}
            >
              <h2 className="text-xl font-semibold mb-4 flex items-center text-[#4f7cac]">
                <Bell className="mr-2 text-[#7c3aed]" size={20} />
                Health Suggestions
              </h2>
              <motion.div
                className="bg-[#f5f3ff] border-l-4 border-[#7c3aed] p-4 rounded-r-xl"
                whileHover={{ scale: 1.01 }}
              >
                <p className="text-[#4f7cac]">
                  Your sugar level was high in the last test.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
