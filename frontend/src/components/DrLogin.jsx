import Drindian from "../assets/drimages/doctor-indian.jpg";
import fb from "../assets/fb.png";
import google from "../assets/google.png";
import linkedin from "../assets/linkedin.png";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import log from "../assets/log.png";
import { doctorAuthService } from "../services/doctorService";

const DrLogin = () => {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
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

  const navigate = useNavigate();
  const [form, setForm] = useState({ professionalId: "", password: "" });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.professionalId || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setIsPending(true);
    try {
      const data = await doctorAuthService.login({
        professionalId: form.professionalId,
        password: form.password,
      });
      
      // Store doctor data in both formats for compatibility
      localStorage.setItem("doctorName", data.doctor?.name || form.professionalId);
      
      // Also store in AuthContext format for compatibility
      if (data.token && data.doctor) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data.doctor.id,
          name: data.doctor.name,
          email: data.doctor.email,
          role: "doctor",
          ...data.doctor
        }));
        localStorage.setItem("userId", data.doctor.id);
        localStorage.setItem("loginTime", Date.now().toString());
      }

      navigate("/doctors/pages/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.professionalId) {
      setError("Please enter your email address first");
      return;
    }

    setError("");
    try {
      await doctorAuthService.forgotPassword(form.professionalId);
      setError("Password reset instructions have been sent to your email");
    } catch (err) {
      setError(err.message || "Failed to process forgot password request");
    }
  };
  return (
    <div className="min-h-screen flex mb-7">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed  w-full flex justify-center items-center h-[100px] bg-[#ddd6fe] backdrop-blur-sm px-4 z-50 shadow-md shadow-cyan-800 "
      >
        <div className="logo">
          <Link to="/home">
            <img src={log} alt="We Cure Consultancy Logo" />
          </Link>
        </div>
      </motion.div>

      <div className="flex w-full flex-col mt-[100px] md:flex-row">
        {/* Left Side */}
        <div className="w-full md:w-2/3 bg-white flex flex-col justify-center items-center p-10">
          <div>
            <p className="text-2xl font-bold text-purple-800 mb-4">
              "Healing begins with you — Welcome back, Doctor."
            </p>
            <p className="text-gray-600 text-lg mb-6 max-w-md">
              Let's continue making lives better, one patient at a time
            </p>
            <img src={Drindian} alt="illustration" className="w-80" />
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full bg-purple-800 text-purple-700 flex flex-col justify-center items-center p-10">
          <motion.div
            className="w-full max-w-md p-6 bg-white/70 backdrop-blur-sm rounded-2xl"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.h2
              className="text-2xl font-semibold text-gray-800 mb-6"
              variants={item}
            >
              Login to Account
            </motion.h2>

            {error && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              variants={container}
            >
              <motion.div variants={item}>
                <label
                  htmlFor="professionalId"
                  className="block text-md font-bold text-purple-800 mb-1"
                >
                  Professional ID/ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <motion.input
                    id="professionalId"
                    name="professionalId"
                    type="text"
                    required
                    value={form.professionalId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3b82f6] text-black focus:border-[#3b82f6]"
                    placeholder="Enter Professional ID or Email"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </motion.div>

              <motion.div variants={item}>
                <label
                  htmlFor="password"
                  className="block text-md font-bold text-purple-800 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <motion.input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#3b82f6] text-black focus:border-[#3b82f6]"
                    placeholder="Enter Password"
                    whileFocus={{ scale: 1.02 }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col md:flex-row items-center gap-2"
                variants={item}
              >
                <motion.div
                  variants={item}
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-1/2 bg-purple-800 hover:bg-purple-600 rounded-lg shadow-sm border border-transparent flex justify-center py-3 px-4 "
                >
                  <motion.button
                    type="submit"
                    disabled={isPending}
                    className={` flex justify-center text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a5c8d] transition-colors ${
                      isPending ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isPending ? (
                      <>
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
                        Loging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </motion.button>
                </motion.div>
                <motion.div
                  className="text-sm py-3 px-4 w-full md:w-1/2 bg-purple-800 hover:bg-purple-600 rounded-lg shadow-sm border border-transparent flex justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.button
                    type="button"
                    onClick={handleForgotPassword}
                    className="font-medium text-white"
                  >
                    Forgot Password
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.form>

            <div className="text-center mt-6 text-sm">
              <h3 className="mb-4 text-lg text-black">Or login with</h3>
              <span className="ml-2 flex justify-center item-center space-x-4">
                <a
                  href="#"
                  className="hover:text-purple-800 flex justify-center items-end rounded-md"
                >
                  <img src={fb} alt="" className="w-7" />
                  Facebook
                </a>
                <a
                  href="#"
                  className="hover:text-purple-800 flex justify-center items-end rounded-md"
                >
                  <img src={google} alt="" className="w-7" />
                  Google
                </a>
                <a
                  href="#"
                  className="hover:text-purple-800 flex justify-center items-end rounded-md"
                >
                  <img
                    src={linkedin}
                    alt=""
                    className="w-7 flex justify-start"
                  />
                  Linkedin
                </a>
              </span>
            </div>

            <motion.div className="mt-6" variants={item}>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-purple-900 rounded-sm">
                    New to the platform?
                  </span>
                </div>
              </div>

              <motion.div className="mt-4" whileHover={{ scale: 1.02 }}>
                <Link
                  to="/doctors/register"
                  className="w-full flex justify-center py-2 px-4 border border-purple-300 rounded-lg shadow-sm text-sm font-medium text-purple-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2a5c8d]"
                >
                  Register
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DrLogin;
