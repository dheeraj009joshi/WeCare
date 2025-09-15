import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { registerUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    gender: "male",
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
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
        damping: 10
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
     setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Field validation
      const errors = {};
      if (!formData.full_name || formData.full_name.trim().length < 2) {
        errors.full_name = 'Name must be at least 2 characters';
      }
      if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
        errors.email = 'Enter a valid email address';
      }
      if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      // Real backend integration
      const res = await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
      });
      const data = res.data;
      if (res.status === 201) {
        // Use AuthContext to handle login after successful registration
        const userDataForAuth = {
          ...data.user,
          token: data.token,
          role: data.user.role || 'patient'
        };
        
        console.log('🔐 Calling AuthContext login after signup with:', userDataForAuth);
        login(userDataForAuth);
        
        navigate("/home");
      } else {
        throw new Error(data.message || "Registration failed");
      }
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
    // Phone: only allow digits, max 10
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, phone: digits }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "radio" ? value : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e2e8f0] flex items-center justify-center p-4 md:p-8">
      <motion.div 
        className="w-full max-w-2xl"
        initial="hidden"
        animate="show"
        variants={container}
      >
        {/* Header Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center border border-[#e9d5ff]"
          variants={item}
        >
          <motion.h1 
            className="pt-[50px] text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Join WeCure
          </motion.h1>
          <motion.p 
            className="text-[#5a6d82] text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Create your account to get started with our health services
          </motion.p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e9d5ff]"
          variants={item}
        >
          {/* Decorative Header */}
          <div className="h-2 bg-gradient-to-r from-[#6d28d9] to-[#7c3aed]"></div>

          <div className="p-8 md:p-10">
            {error && (
              <motion.div 
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit}
              className="space-y-6"
              variants={container}
            >
              {/* Two Column Layout for Name and Email */}
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={container}>
                {/* Name Field */}
                <motion.div variants={item}>
                  <label className="block text-[#4f7cac] font-medium mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                    />
                    {fieldErrors.name && (
                      <span className="text-red-500 text-xs mt-1 block">{fieldErrors.name}</span>
                    )}
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={item}>
                  <label className="block text-[#4f7cac] font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                    />
                    {fieldErrors.email && (
                      <span className="text-red-500 text-xs mt-1 block">{fieldErrors.email}</span>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Two Column Layout for Passwords */}
              <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6" variants={container}>
                {/* Password Field */}
                <motion.div variants={item}>
                  <label className="block text-[#4f7cac] font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength="8"
                      className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    {fieldErrors.password && (
                      <span className="text-red-500 text-xs mt-1 block">{fieldErrors.password}</span>
                    )}
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={item}>
                  <label className="block text-[#4f7cac] font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                    {fieldErrors.confirmPassword && (
                      <span className="text-red-500 text-xs mt-1 block">{fieldErrors.confirmPassword}</span>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Phone Field */}
              <motion.div variants={item}>
                <label className="block text-[#4f7cac] font-medium mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <input
                    name="phone"
                    type="tel"
                    className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                  />
                  {fieldErrors.phone && (
                    <span className="text-red-500 text-xs mt-1 block">{fieldErrors.phone}</span>
                  )}
                </div>
              </motion.div>

              {/* Address Field */}
              <motion.div variants={item}>
                <label className="block text-[#4f7cac] font-medium mb-2">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    name="address"
                    type="text"
                    className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, Country"
                  />
                </div>
              </motion.div>

              {/* Gender Field */}
              <motion.div variants={item}>
                <label className="block text-[#4f7cac] font-medium mb-2">
                  Gender
                </label>
                <div className="flex space-x-6">
                  {['male', 'female', 'other'].map((gender) => (
                    <motion.label 
                      key={gender} 
                      className="flex items-center space-x-2 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.gender === gender ? 'border-[#7c3aed]' : 'border-[#ddd6fe]'}`}>
                        {formData.gender === gender && (
                          <motion.div 
                            className="w-3 h-3 rounded-full bg-[#7c3aed]"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="capitalize text-[#4f7cac]">{gender}</span>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={item}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold text-white shadow-lg transition-all ${loading ? 'bg-[#7c3aed]/90' : 'bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:from-[#5b21b6] hover:to-[#6d28d9]'}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            <motion.div 
              className="mt-8 text-center text-[#5a6d82]"
              variants={item}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
              >
                Log in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
export default SignupPage;