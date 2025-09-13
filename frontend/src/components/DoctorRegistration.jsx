import { useState } from "react";
import { useForm } from "react-hook-form";
import Collapse from "./Collapse";
import { useNavigate } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import log from "../assets/log.png";
import doctors from "../assets/drimages/doctors.png";
import { motion } from "framer-motion";
import { doctorAuthService } from "../services/doctorService";
import { Link } from "react-router-dom";

const DoctorRegistration = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [currentStep, setCurrentStep] = useState(1);
  const [specializations, setSpecializations] = useState([]);
  const [newSpecialization, setNewSpecialization] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

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

  const bounceIn = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const onSubmit = async (data) => {
    // Validate specializations before submission
    if (specializations.length === 0) {
      setSubmitError("Please add at least one specialization before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMsg("");
    setFieldErrors({});

    try {
      const profilePictureFile = data.profilePicture[0];
      let profilePictureBase64 = "";

      if (profilePictureFile) {
        profilePictureBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(profilePictureFile);
        });
      }

      const certificatesBase64 = await Promise.all(
        certificates.map(
          (file) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );

      const payload = {
        ...data,
        password: data.password,
        profilePicture: profilePictureBase64,
        specializations,
        certificates: certificatesBase64,
      };
      delete payload.confirmPassword;

      // Debug: Log the payload being sent
      console.log('Sending registration payload:', {
        ...payload,
        profilePicture: profilePictureBase64 ? 'Base64 Image Data' : 'No Image',
        certificates: certificatesBase64.length > 0 ? `${certificatesBase64.length} Base64 Files` : 'No Certificates'
      });

      const response = await doctorAuthService.register(payload);
      setSuccessMsg("Registration successful! Redirecting...");
      if (response?.token) {
        localStorage.setItem("doctorToken", response.token);
      }
      setTimeout(() => navigate("/doctors/pages/dashboard"), 2000);
    } catch (error) {
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      console.log('Error message:', error.message);
      
      // Clear previous field errors
      setFieldErrors({});
      
      // Handle detailed backend validation errors
      if (error.response?.data) {
        const errorData = error.response.data;
        console.log('Backend error data:', errorData);
        
        if (errorData.missingFields) {
          // Handle missing fields error
          const missingFieldsList = errorData.missingFields.map(f => f.field).join(', ');
          setSubmitError(
            `Missing required fields: ${missingFieldsList}. ${errorData.suggestion || ''}`
          );
          
          // Set field-specific errors for missing fields
          const newFieldErrors = {};
          errorData.missingFields.forEach(field => {
            newFieldErrors[field.field] = field.message;
          });
          setFieldErrors(newFieldErrors);
        } else if (errorData.field) {
          // Handle specific field validation error
          setSubmitError(
            `${errorData.message} (${errorData.field}). ${errorData.suggestion || ''}`
          );
          
          // Set field-specific error
          setFieldErrors({
            [errorData.field]: errorData.message
          });
        } else if (errorData.message) {
          // Handle general validation error
          setSubmitError(
            `${errorData.message}. ${errorData.suggestion || ''}`
          );
        } else {
          setSubmitError("Registration failed. Please try again.");
        }
      } else if (error.response?.status === 400) {
        // Handle 400 Bad Request without specific error data
        setSubmitError("Bad Request: The server could not process your registration. Please check all required fields and try again.");
      } else if (error.response?.status === 500) {
        // Handle 500 Internal Server Error
        setSubmitError("Server Error: Something went wrong on our end. Please try again later.");
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        // Handle network errors
        setSubmitError("Network Error: Unable to connect to the server. Please check your internet connection and try again.");
      } else if (error.message) {
        // Handle other errors with messages
        setSubmitError(`Error: ${error.message}`);
      } else {
        setSubmitError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-md shadow-purple-100"
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="logo">
            <Link to="/home">
              <img src={log} alt="We Cure Consultancy Logo" />
            </Link>
          </div>

          <motion.h2
            className="font-extrabold text-gray-600 flex items-center justify-center"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Stethoscope className="w-7 h-7 md:w-10 md:h-10" />
            <span className="text-2xl md:text-4xl text-purple-700">
              &nbsp; Create your Profile
            </span>
          </motion.h2>

          <div className="w-20"></div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="pt-32 pb-16 container mx-auto px-4">
        {/* Status Messages */}
        <motion.div className="mb-8">
          {submitError && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-red-100 text-red-700 rounded-lg shadow-md"
            >
              {submitError}
            </motion.div>
          )}
          {successMsg && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 bg-green-100 text-green-700 rounded-lg shadow-md"
            >
              {successMsg}
            </motion.div>
          )}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 justify-around">
          {/* Illustration */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center"
          >
            <motion.img
              src={doctors}
              alt="Doctors"
              className="w-full hover:scale-105 transition-transform"
              whileHover={{ scale: 1.02 }}
            />
          </motion.div>

          {/* Registration Form */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:w-1/2 bg-white rounded-xl shadow-lg p-8 border border-purple-100"
          >
            <motion.h2
              className="text-2xl font-semibold text-purple-700 mb-3"
              whileHover={{ scale: 1.01 }}
            >
              Registration
            </motion.h2>

            {/* Step Indicators */}
            <motion.div className="flex mb-4">
              {[1, 2, 3].map((step) => (
                <motion.div
                  key={step}
                  className={`flex-1 h-2 mx-1 rounded-full ${
                    currentStep >= step ? "bg-purple-600" : "bg-gray-200"
                  }`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: step * 0.1 }}
                />
              ))}
            </motion.div>

            {/* Step 1: Personal Information */}
            <Collapse isOpen={currentStep === 1}>
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.h3
                  variants={item}
                  className="text-xl font-semibold text-purple-700 mb-4"
                >
                  1. Personal Information
                </motion.h3>

                <motion.div
                  variants={container}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {[
                    {
                      label: "Full Name",
                      name: "name",
                      type: "text",
                      validation: { required: "*Name is required" },
                    },
                    {
                      label: "Email",
                      name: "email",
                      type: "email",
                      validation: {
                        required: "*Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      },
                    },
                    {
                      label: "Password",
                      name: "password",
                      type: "password",
                      validation: {
                        required: "*Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      },
                    },
                    {
                      label: "Confirm Password",
                      name: "confirmPassword",
                      type: "password",
                      validation: {
                        required: "*Please confirm your password",
                        validate: (value) =>
                          value === watch("password") ||
                          "Passwords do not match",
                      },
                    },
                    {
                      label: "Phone Number",
                      name: "phone",
                      type: "tel",
                      validation: {
                        required: "*Phone is required",
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: "Invalid phone number",
                        },
                      },
                    },
                    {
                      label: "Date of Birth",
                      name: "dob",
                      type: "date",
                      validation: { required: "*DOB is required" },
                    },
                    {
                      label: "Gender",
                      name: "gender",
                      type: "select",
                      options: ["", "male", "female", "other"],
                      optionLabels: ["Select", "Male", "Female", "Other"],
                      validation: { required: "*Gender is required" },
                    },

                    {
                      label: "Profile Picture",
                      name: "profilePicture",
                      type: "file",
                      accept: "image/*",
                      validation: { required: "*Profile picture is required" },
                    },
                  ].map((field, index) => (
                    <motion.div key={index} variants={item}>
                      <label className="block text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          {...register(field.name, field.validation)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {field.options.map((option, i) => (
                            <option key={i} value={option}>
                              {field.optionLabels[i]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          {...register(field.name, field.validation)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          accept={field.accept}
                        />
                      )}
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {errors[field.name].message}
                        </motion.p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div className="mt-6 flex justify-end" variants={item}>
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Next
                  </motion.button>
                </motion.div>
              </motion.div>
            </Collapse>

            {/* Step 2: Professional Information */}
            <Collapse isOpen={currentStep === 2}>
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.h3
                  variants={item}
                  className="text-xl font-semibold text-purple-700 mb-4"
                >
                  2. Professional Information
                </motion.h3>

                <motion.div
                  variants={container}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {[
                    {
                      label: "Medical License Number",
                      name: "licenseNumber",
                      type: "text",
                      validation: { required: "*License number is required" },
                    },
                    {
                      label: "Years of Experience",
                      name: "experience",
                      type: "number",
                      validation: {
                        required: "*Experience is required",
                        min: { value: 0, message: "Invalid experience" },
                      },
                    },
                  ].map((field, index) => (
                    <motion.div key={index} variants={item}>
                      <label className="block text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        {...register(field.name, field.validation)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {errors[field.name].message}
                        </motion.p>
                      )}
                    </motion.div>
                  ))}

                  <motion.div variants={item} className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">
                      Specializations
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        placeholder="Add specialization"
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <motion.button
                        type="button"
                        onClick={addSpecialization}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        Add
                      </motion.button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {specializations.map((spec, index) => (
                        <motion.div
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          layout
                        >
                          {spec}
                          <motion.button
                            type="button"
                            onClick={() => removeSpecialization(index)}
                            className="ml-2 text-purple-600 hover:text-purple-900"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.8 }}
                          >
                            x
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={item} className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">
                      Qualifications
                    </label>
                    <textarea
                      {...register("qualifications", {
                        required: "*Qualifications are required",
                      })}
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                    {errors.qualifications && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.qualifications.message}
                      </motion.p>
                    )}
                  </motion.div>
                  <motion.div variants={item} className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Bio</label>
                    <textarea
                      {...register("bio", {
                        required: "*Bio is required",
                      })}
                      placeholder="Tell about yourself."
                      rows="2"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    ></textarea>
                    {errors.bio && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors.bio.message}
                      </motion.p>
                    )}
                  </motion.div>
                </motion.div>

                <motion.div
                  className="mt-6 flex justify-between"
                  variants={item}
                >
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Next
                  </motion.button>
                </motion.div>
              </motion.div>
            </Collapse>

            {/* Step 3: Practice Information */}
            <Collapse isOpen={currentStep === 3}>
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.h3
                  variants={item}
                  className="text-xl font-semibold text-purple-700 mb-4"
                >
                  3. Practice Information
                </motion.h3>

                <motion.div
                  variants={container}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {[
                    {
                      label: "Clinic/Hospital Name",
                      name: "practiceName",
                      type: "text",
                      validation: { required: "*Practice name is required" },
                    },
                    {
                      label: "Address",
                      name: "address",
                      type: "text",
                      validation: { required: "*Address is required" },
                    },
                    {
                      label: "City",
                      name: "city",
                      type: "text",
                      validation: { required: "*City is required" },
                    },
                    {
                      label: "State",
                      name: "state",
                      type: "text",
                      validation: { required: "*State is required" },
                    },
                    {
                      label: "Zip Code",
                      name: "zipCode",
                      type: "text",
                      validation: { required: "*Zip code is required" },
                    },
                    {
                      label: "Country",
                      name: "country",
                      type: "select",
                      options: ["", "India", "USA", "UK"],
                      optionLabels: [
                        "Select Country",
                        "India",
                        "United States",
                        "United Kingdom",
                      ],
                      validation: { required: "*Country is required" },
                    },
                  ].map((field, index) => (
                    <motion.div key={index} variants={item}>
                      <label className="block text-gray-700 mb-2">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          {...register(field.name, field.validation)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {field.options.map((option, i) => (
                            <option key={i} value={option}>
                              {field.optionLabels[i]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          {...register(field.name, field.validation)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                      )}
                      {errors[field.name] && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {errors[field.name].message}
                        </motion.p>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div variants={item} className="mt-6">
                  <label className="block text-gray-700 mb-2">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    {...register("consultationFee", {
                      required: "*Fee is required",
                      min: { value: 0, message: "Invalid fee amount" },
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {errors.consultationFee && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors.consultationFee.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div variants={item} className="mt-6">
                  <label className="block text-gray-700 mb-2">
                    Upload Certificates (PDF/Image)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <div className="mt-2">
                    {certificates.map((file, index) => (
                      <motion.div
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <svg
                          className="w-4 h-4 mr-2 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          ></path>
                        </svg>
                        {file.name}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  className="mt-6 flex justify-between"
                  variants={item}
                >
                  <motion.button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Processing...
                      </span>
                    ) : (
                      "Complete Registration"
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            </Collapse>
          </motion.form>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorRegistration;
