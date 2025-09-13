import { Link, useNavigate, useLocation } from "react-router-dom";
import { AtSign, Lock } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { loginUser } from "../api/userApi";
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.registeredEmail || '',
    password: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // Field validation
      const errors = {};
      if (!formData.email) errors.email = "Email is required";
      if (!formData.password) errors.password = "Password is required";
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setLoading(false);
        return;
      }

      console.log("Attempting login with:", { email: formData.email });
      const res = await loginUser(formData);
      console.log("Full response:", res);
      
      // Handle the response from our updated authService
      if (res.success && res.data) {
        console.log("Login response data:", res.data);
        
        // The authService now returns { success: true, data: { user, token } }
        const responseData = res.data;
        
        if (responseData.user && responseData.token) {
          // Pass the full FastAPI response to AuthContext
          console.log('🔐 Calling AuthContext login with FastAPI format:', responseData);
          login(responseData);
          
          // Determine navigation based on user type from token
          const userType = responseData.token.user_type;
          if (responseData.user?.is_admin || userType === "admin") {
            navigate("/system/admin");
          } else if (userType === "doctor") {
            navigate("/doctors/pages/dashboard");
          } else {
            navigate("/home"); // Regular users go to home page instead of profile
          }
        } else {
          throw new Error("Invalid response format from server");
        }
      } else {
        // Handle error from authService
        const errorMessage = res.error || "Login failed. Please try again.";
        if (errorMessage.toLowerCase().includes("invalid credentials") || 
            errorMessage.toLowerCase().includes("incorrect")) {
          throw new Error("Wrong ID or password");
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check if the backend server is running.");
      } else if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        setError(errorData.message || `Login failed (${error.response.status})`);
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check if the backend is running.");
      } else {
        // Something else happened
        setError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-[50px]">
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
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            className="text-[#5a6d82] text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Login to your account
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
            {/* Show success message if redirected from signup */}
            {location.state?.successMessage && (
              <motion.div
                className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {location.state.successMessage}
              </motion.div>
            )}

            {/* Show error message if any */}
            {error && (
              <motion.div
                className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                {error}
              </motion.div>
            )}

            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              variants={container}
            >
              {/* Email Field */}
              <motion.div variants={item}>
                <label className="block text-[#4f7cac] font-medium mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#7c3aed]">
                    <AtSign className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@gmail.com"
                    required
                    className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {fieldErrors.email && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {fieldErrors.email}
                    </span>
                  )}
                </div>
              </motion.div>

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
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="pl-10 block w-full border border-[#ddd6fe] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:border-transparent transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  {fieldErrors.password && (
                    <span className="text-red-500 text-xs mt-1 block">
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                className="flex items-center justify-between"
                variants={item}
              >
                <div className="flex items-center">
                  <motion.input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-[#7c3aed] focus:ring-[#a78bfa] border-[#ddd6fe] rounded"
                    whileTap={{ scale: 0.95 }}
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-[#5a6d82]"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={item}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-lg font-semibold text-white shadow-lg transition-all ${
                    loading
                      ? "bg-[#7c3aed]/90"
                      : "bg-gradient-to-r from-[#6d28d9] to-[#7c3aed] hover:from-[#5b21b6] hover:to-[#6d28d9]"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </motion.button>
              </motion.div>
            </motion.form>

            <motion.div
              className="mt-8 text-center text-[#5a6d82]"
              variants={item}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#7c3aed] hover:text-[#5b21b6] transition-colors"
              >
                Sign up
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
