import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import Collapse from "./Collapse";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaVenusMars,
} from "react-icons/fa";
import {
  FaBriefcaseMedical,
  FaIdCard,
  FaCalendarAlt,
  FaClinicMedical,
  FaPlus,
  FaTimes,
  FaGraduationCap,
} from "react-icons/fa";
import {
  FaHospital,
  FaMapMarkerAlt,
  FaCity,
  FaMap,
  FaMailBulk,
  FaGlobeAmericas,
  FaMoneyBillWave,
  FaFileUpload,
  FaFilePdf,
} from "react-icons/fa";

import { doctorAuthService } from "../services/doctorService";

// Skeleton Loading Components
const SkeletonProfileSection = () => (
  <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
    <div className="flex items-center mb-6">
      <div className="w-20 h-20 bg-gray-200 rounded-full mr-4"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  </div>
);

const SkeletonFormField = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

const SkeletonCertificate = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
      <div className="h-6 bg-gray-200 rounded w-6"></div>
    </div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const SkeletonSpecialization = () => (
  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-flex items-center mr-2 mb-2 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-16 mr-2"></div>
    <div className="h-4 bg-gray-200 rounded w-4"></div>
  </div>
);
const EditDoctorProfile = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isEditable, setIsEditable] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [specializations, setSpecializations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch } = useForm();

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
    show: { opacity: 1, y: 0 },
  };

  const bounce = {
    hidden: { scale: 0.8, opacity: 0 },
    show: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await doctorAuthService.getProfile();
        const doctorData = response.doctor;
        setDoctor(doctorData);
        Object.keys(doctorData).forEach((key) => {
          if (key !== "specializations" && key !== "certificates") {
            setValue(key, doctorData[key]);
          }
        });
        setSpecializations(
          Array.isArray(doctorData.specializations)
            ? doctorData.specializations
            : doctorData.specializations
            ? [doctorData.specializations]
            : []
        );
        setCertificates(
          Array.isArray(doctorData.certificates)
            ? doctorData.certificates
            : doctorData.certificates
            ? [doctorData.certificates]
            : []
        );
      } catch (err) {
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !specializations.includes(newSpecialization)
    ) {
      setSpecializations([...specializations, newSpecialization]);
      setNewSpecialization("");
    }
  };

  const removeSpecialization = (index) => {
    setSpecializations(specializations.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setCertificates([...certificates, ...files]);
  };

  const onSubmit = async (data) => {
    console.log("Form data received:", data);
    console.log("Current specializations:", specializations);
    console.log("Current certificates:", certificates);

    // Check if all required fields are present
    const requiredFields = [
      "name",
      "phone",
      "experience",
      "specializations",
      "qualifications",
      "practiceName",
      "address",
      "city",
      "state",
      "zipCode",
      "country",
      "consultationFee",
    ];

    const missingFields = requiredFields.filter((field) => {
      if (field === "specializations") {
        return !specializations || specializations.length === 0;
      }
      return !data[field];
    });

    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return;
    }

    const updatedProfile = {
      ...data,
      specializations,
      certificates,
    };

    console.log("Final updatedProfile:", updatedProfile);

    setSaving(true);

    try {
      console.log("Submitting profile update:", updatedProfile);
      const response = await doctorAuthService.updateProfile(updatedProfile);
      console.log("Profile update response:", response);

      // Update local state with the new data
      setDoctor(response.doctor);

      // Update form values
      Object.keys(response.doctor).forEach((key) => {
        if (key !== "specializations" && key !== "certificates") {
          setValue(key, response.doctor[key]);
        }
      });

      // Update specializations and certificates
      setSpecializations(
        Array.isArray(response.doctor.specializations)
          ? response.doctor.specializations
          : response.doctor.specializations
          ? [response.doctor.specializations]
          : []
      );
      setCertificates(
        Array.isArray(response.doctor.certificates)
          ? response.doctor.certificates
          : response.doctor.certificates
          ? [response.doctor.certificates]
          : []
      );

      setIsEditable(false);
    } catch (err) {
      console.error("Profile update error:", err);

      // Keep form in edit mode so user can fix errors
      // setIsEditable(false); // Commented out to keep editing mode
    } finally {
      setSaving(false);
    }
  };

  // Add logout handler for doctor
  const handleLogout = () => {
    localStorage.removeItem("doctorName");
    localStorage.removeItem("token");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("chatSessions");
    localStorage.removeItem("currentChatId");
    localStorage.removeItem("sessionIdMap");
    window.dispatchEvent(new Event("userChanged"));
    navigate("/doctors");
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-[100px] max-w-4xl mx-auto p-6"
      >
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-md shadow-cyan-900 rounded-xl w-full p-4 md:p-6 bg-white">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex flex-col">
              <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        </div>

        {/* Form Sections Skeleton */}
        <div className="space-y-6">
          {/* Personal Information Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonFormField key={i} />
              ))}
            </div>
          </div>

          {/* Professional Information Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonFormField key={i} />
              ))}
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <SkeletonSpecialization key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Practice Information Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonFormField key={i} />
              ))}
            </div>
          </div>

          {/* Certificates Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCertificate key={i} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!doctor) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-[100px] max-w-4xl mx-auto my-[150px] p-6 text-center"
      >
        <p>No doctor profile data found.</p>
        <p>Please complete your registration first.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className=""
    >
      <div className="max-w-4xl mx-auto p-6 h-fit">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-md shadow-cyan-900 rounded-xl w-full p-4 md:p-6 bg-white"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
            {doctor?.profilePicture && (
              <motion.img
                src={doctor.profilePicture}
                alt="Profile"
                className="w-12 h-12 rounded-full flex-shrink-0"
                whileHover={{ scale: 1.1 }}
              />
            )}
            <motion.div
              className="flex flex-col"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="flex flex-col leading-tight">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5b21b6] flex gap-2 items-center">
                  Dr. {doctor.name}
                </p>
                <p className="text-sm sm:text-base text-gray-600">
                  {Array.isArray(doctor.specializations)
                    ? doctor.specializations.join(", ")
                    : doctor.specializations || ""}{" "}
                  Specialist
                </p>
              </h2>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => setIsEditable(!isEditable)}
              className="bg-[#5b21b6] text-white px-4 py-2 rounded hover:bg-[#3f6c9e]/90 text-sm sm:text-base"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(8, 53, 103, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditable ? "Cancel Editing" : "Edit Profile"}
            </motion.button>
            <motion.button
              className="text-white px-4 py-2 rounded bg-red-800 text-sm sm:text-base"
              onClick={handleLogout}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 5px 15px rgba(200, 0, 0, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Log Out
            </motion.button>
          </motion.div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information */}
          <Collapse isOpen={true} title="Personal Information">
            <motion.div
              className="flex flex-col gap-3 px-4 sm:px-6 py-2 rounded-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.fieldset
                className="border border-[#5b21b6] rounded-xl p-3 sm:p-4 shadow-md shadow-cyan-900 bg-white"
                variants={bounce}
              >
                <motion.legend className="text-xl sm:text-2xl font-bold text-[#5b21b6] px-2 ml-2 flex gap-2 items-center">
                  <FaUserCircle className="text-[#5b21b6] text-lg sm:text-xl" />
                  Personal Information
                </motion.legend>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <motion.div variants={item}>
                    <div className="flex gap-2 items-center text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaUser className="text-sm sm:text-base" />
                      Full Name
                    </div>
                    <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                      {doctor.name}
                    </label>
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={item}>
                    <div className="flex gap-2 items-center text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaEnvelope className="text-sm sm:text-base" />
                      Email
                    </div>
                    {isEditable ? (
                      <input
                        type="email"
                        {...register("email", {
                          required: "*Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        className="w-full p-2 border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.email}
                      </p>
                    )}
                  </motion.div>

                  {/* Phone Number */}
                  <motion.div variants={item}>
                    <div className="flex gap-2 items-center text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaPhone className="text-sm sm:text-base" />
                      Phone Number
                    </div>
                    {isEditable ? (
                      <input
                        type="tel"
                        {...register("phone", {
                          required: "*Phone is required",
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Invalid phone number",
                          },
                        })}
                        className="w-full p-2 border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                        {doctor.phone}
                      </label>
                    )}
                  </motion.div>

                  {/* Date of Birth */}
                  <motion.div variants={item}>
                    <div className="flex gap-2 items-center text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaBirthdayCake className="text-sm sm:text-base" />
                      Date of Birth
                    </div>
                    <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                      {doctor.dob}
                    </label>
                  </motion.div>

                  {/* Gender */}
                  <motion.div variants={item}>
                    <div className="flex gap-2 items-center text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaVenusMars className="text-sm sm:text-base" />
                      Gender
                    </div>
                    <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                      {doctor.gender}
                    </label>
                  </motion.div>
                </motion.div>
              </motion.fieldset>
            </motion.div>
          </Collapse>

          {/* Professional Information */}
          <Collapse isOpen={true} title="Professional Information">
            <motion.div
              className="flex flex-col gap-3 px-4 sm:px-6 py-2 my-2 rounded-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.fieldset
                className="border border-[#5b21b6] rounded-xl p-3 sm:p-4 shadow-md shadow-cyan-900 bg-white"
                variants={bounce}
              >
                <motion.legend className="text-xl sm:text-2xl font-bold text-[#5b21b6] px-2 ml-2 flex gap-2 items-center">
                  <FaBriefcaseMedical className="text-[#5b21b6] text-lg sm:text-xl" />
                  Professional Information
                </motion.legend>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Medical License Number */}
                  <motion.div variants={item}>
                    <div className="text-[#5b21b6] flex gap-2 items-center font-bold text-sm sm:text-base">
                      <FaIdCard className="text-sm sm:text-base" />
                      Medical License Number
                    </div>
                    <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                      {doctor.licenseNumber}
                    </label>
                  </motion.div>

                  {/* Years of Experience */}
                  <motion.div variants={item}>
                    <div className="text-[#5b21b6] flex gap-2 items-center font-bold text-sm sm:text-base">
                      <FaCalendarAlt className="text-sm sm:text-base" />
                      Years of Experience
                    </div>
                    {isEditable ? (
                      <input
                        type="number"
                        {...register("experience", {
                          required: "*Experience is required",
                          min: { value: 0, message: "Invalid experience" },
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <label className="text-gray-800 font-medium text-sm sm:text-base block mt-1">
                        {doctor.experience}
                      </label>
                    )}
                  </motion.div>
                </motion.div>

                {/* Specializations - Full width */}
                <motion.div variants={item} className="mt-3">
                  <div className="text-[#5b21b6] flex gap-2 items-center font-bold text-sm sm:text-base">
                    <FaClinicMedical className="text-sm sm:text-base" />
                    Specializations
                  </div>
                  {isEditable ? (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2 mb-2 mt-1">
                        <input
                          type="text"
                          value={newSpecialization}
                          onChange={(e) => setNewSpecialization(e.target.value)}
                          placeholder="Add specialization"
                          className="flex-1 p-2 border px-3 sm:px-4 py-1 sm:py-2 rounded text-sm sm:text-base"
                        />
                        <motion.button
                          type="button"
                          onClick={addSpecialization}
                          className="bg-[#5b21b6] text-white px-3 sm:px-4 py-1 sm:py-2 rounded flex gap-2 items-center justify-center text-sm sm:text-base"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaPlus className="text-xs sm:text-sm" />
                          Add
                        </motion.button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                          {Array.isArray(specializations)
                            ? specializations.map((spec, index) => (
                                <motion.div
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full flex items-center text-xs sm:text-sm"
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  layout
                                >
                                  {spec}
                                  <motion.button
                                    type="button"
                                    onClick={() => removeSpecialization(index)}
                                    className="ml-1 sm:ml-2 text-red-500 hover:text-red-700 text-xs sm:text-sm"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                  >
                                    <FaTimes />
                                  </motion.button>
                                </motion.div>
                              ))
                            : null}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {Array.isArray(doctor.specializations) ? (
                        doctor.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                          >
                            {spec}
                          </span>
                        ))
                      ) : doctor.specializations ? (
                        <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                          {doctor.specializations}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs sm:text-sm">
                          No specializations added
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Qualifications - Full width */}
                <motion.div variants={item} className="mt-3">
                  <div className="text-[#5b21b6] flex gap-2 items-center font-bold text-sm sm:text-base">
                    <FaGraduationCap className="text-sm sm:text-base" />
                    Qualifications
                  </div>
                  {isEditable ? (
                    <textarea
                      {...register("qualifications", {
                        required: "*Qualifications are required",
                      })}
                      rows="3"
                      className="w-full p-2 border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      defaultValue={doctor.qualifications}
                    />
                  ) : (
                    <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                      {doctor.qualifications || "No qualifications added"}
                    </p>
                  )}
                </motion.div>
                <motion.div variants={item} className="mt-3">
                  <div className="text-[#5b21b6] flex gap-2 items-center font-bold text-sm sm:text-base">
                    <FaGraduationCap className="text-sm sm:text-base" />
                    Bio
                  </div>
                  {isEditable ? (
                    <textarea
                      {...register("bio", {
                        required: "*Bio is required",
                      })}
                      rows="3"
                      className="w-full p-2 border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      defaultValue={doctor.bio}
                    />
                  ) : (
                    <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                      {doctor.bio || "No bio added"}
                    </p>
                  )}
                </motion.div>
              </motion.fieldset>
            </motion.div>
          </Collapse>

          {/* Practice Information */}
          <Collapse isOpen={true} title="Practice Information">
            <motion.div
              className="flex flex-col gap-3 px-4 sm:px-6 py-2 my-2 rounded-2xl"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.fieldset
                className="border border-[#5b21b6] rounded-xl p-3 sm:p-4 shadow-md shadow-cyan-900 bg-white"
                variants={bounce}
              >
                <motion.legend className="text-xl sm:text-2xl font-bold text-[#5b21b6] px-2 ml-2">
                  <div className="flex items-center gap-2">
                    <FaHospital className="text-[#5b21b6] text-lg sm:text-xl" />
                    Practice Information
                  </div>
                </motion.legend>

                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Clinic/Hospital Name */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaClinicMedical className="text-sm sm:text-base" />
                      Clinic/Hospital Name
                    </div>
                    {isEditable ? (
                      <input
                        type="text"
                        {...register("practiceName", {
                          required: "*Practice name is required",
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.practiceName}
                      </p>
                    )}
                  </motion.div>

                  {/* Address */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaMapMarkerAlt className="text-sm sm:text-base" />
                      Address
                    </div>
                    {isEditable ? (
                      <input
                        type="text"
                        {...register("address", {
                          required: "*Address is required",
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.address}
                      </p>
                    )}
                  </motion.div>

                  {/* City */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaCity className="text-sm sm:text-base" />
                      City
                    </div>
                    {isEditable ? (
                      <input
                        type="text"
                        {...register("city", { required: "*City is required" })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.city}
                      </p>
                    )}
                  </motion.div>

                  {/* State */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaMap className="text-sm sm:text-base" />
                      State
                    </div>
                    {isEditable ? (
                      <input
                        type="text"
                        {...register("state", {
                          required: "*state is required",
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.state}
                      </p>
                    )}
                  </motion.div>

                  {/* Zip Code */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaMailBulk className="text-sm sm:text-base" />
                      Zip Code
                    </div>
                    {isEditable ? (
                      <input
                        type="text"
                        {...register("zipCode", {
                          required: "*zipCode is required",
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.zipCode}
                      </p>
                    )}
                  </motion.div>

                  {/* Country */}
                  <motion.div variants={item}>
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaGlobeAmericas className="text-sm sm:text-base" />
                      Country
                    </div>
                    {isEditable ? (
                      <select
                        {...register("country", {
                          required: "*Country is required",
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      >
                        <option value="">Select Country</option>
                        <option value="India">India</option>
                        <option value="USA">United States</option>
                        <option value="UK">United Kingdom</option>
                      </select>
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.country}
                      </p>
                    )}
                  </motion.div>

                  {/* Consultation Fee - Full width */}
                  <motion.div variants={item} className="sm:col-span-2">
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaMoneyBillWave className="text-sm sm:text-base" />
                      Consultation Fee (₹)
                    </div>
                    {isEditable ? (
                      <input
                        type="number"
                        {...register("consultationFee", {
                          required: "*Fee is required",
                          min: { value: 0, message: "Invalid fee amount" },
                        })}
                        className="w-full border px-3 sm:px-4 py-1 sm:py-2 mt-1 rounded text-sm sm:text-base"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium text-sm sm:text-base mt-1">
                        {doctor.consultationFee}
                      </p>
                    )}
                  </motion.div>

                  {/* Upload Certificates - Full width */}
                  <motion.div variants={item} className="sm:col-span-2">
                    <div className="flex items-center gap-2 text-[#5b21b6] font-bold text-sm sm:text-base">
                      <FaFileUpload className="text-sm sm:text-base" />
                      Upload Certificates (PDF/Image)
                    </div>
                    {isEditable ? (
                      <div className="mt-1">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="w-full border px-3 sm:px-4 py-1 sm:py-2 rounded text-sm sm:text-base"
                        />
                      </div>
                    ) : (
                      <div className="mt-1">
                        {Array.isArray(certificates)
                          ? certificates.map((file, index) => (
                              <motion.div
                                key={index}
                                className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 mt-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <FaFilePdf className="text-xs sm:text-sm" />{" "}
                                {file.name}
                              </motion.div>
                            ))
                          : null}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </motion.fieldset>
            </motion.div>
          </Collapse>

          {isEditable && (
            <motion.div
              className="mt-6 flex justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded text-white ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                whileHover={
                  !saving
                    ? {
                        scale: 1.05,
                        boxShadow: "0 5px 15px rgba(0, 200, 0, 0.4)",
                      }
                    : {}
                }
                whileTap={!saving ? { scale: 0.95 } : {}}
              >
                {saving ? "Saving..." : "Save Changes"}
              </motion.button>
            </motion.div>
          )}
        </form>
      </div>
    </motion.div>
  );
};

export default EditDoctorProfile;
