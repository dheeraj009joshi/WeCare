import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import doctorMobile from "../assets/doctormobile.png";
import mobileApp from "../assets/mobile.png";
import log from "../assets/log.png";

const Doctors = () => {
  const navigate = useNavigate();

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      className="min-h-screen "
    >
      {/* Header */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="fixed  w-full flex justify-between h-[100px] bg-[#ddd6fe] backdrop-blur-sm items-center px-4 z-50 shadow-md shadow-cyan-800 "
      >
        <div className="flex items-center justify-between w-full">
          <div className="nav-links ">
            <Link
              to="/home"
              className="text-purple-800 font-medium hover:text-purple-600 transition-colors no-underline hover:no-underline"
            >
              Home
            </Link>
          </div>
          <div className="logo">
            <Link to="/home">
              <img src={log} alt="We Cure Consultancy Logo" />
            </Link>
          </div>

          <div className="nav-links ">
            {localStorage.getItem("doctorName") ? (
              <div
                className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-800 text-white font-bold cursor-pointer"
                onClick={() => navigate("/doctors/pages/dashboard")}
              >
                {localStorage.getItem("doctorName").charAt(0).toUpperCase()}
              </div>
            ) : (
              <Link
                to="/doctors/login"
                className="text-purple-800 font-medium hover:text-purple-600 transition-colors no-underline hover:no-underline"
              >
                Login/Register
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="pt-24 pb-16 md:pt-32 md:pb-24 relative overflow-hidden ">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-800/50 z-0 "></div>
        <div className="container mx-auto px-4 relative z-10 mt-[70px]">
          <motion.div
            variants={container}
            className="flex flex-col lg:flex-row items-center"
          >
            <div className="lg:w-1/2"></div>

            <motion.div
              variants={container}
              className="lg:w-1/2 bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-xl border border-purple-100"
            >
              <motion.h1
                variants={item}
                className="text-4xl md:text-5xl lg:text-6xl font-bold my-6 "
              >
                Hello Doctor!👋
              </motion.h1>

              <motion.p
                variants={item}
                className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed"
              >
                "Streamline your practice, connect deeply with patients, and
                boost your online presence."
              </motion.p>

              <motion.button
                variants={item}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(109, 40, 217, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/doctors/register")}
                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-full shadow-lg transition-all"
              >
                Create your profile now
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Info Section */}
      <div className="container mx-auto px-4 py-16 space-y-20">
        {/* First Block */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row items-center gap-12 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="lg:w-1/2 order-2 lg:order-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                WeCure
              </span>{" "}
              - online consult and grow your practice.
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Reach new patients and connect with your patients online.
            </p>

            <ul className="space-y-3 text-gray-700 mb-8">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Answer medical queries & showcase your expertise
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Maximise your earnings with paid online consultations
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Offer online follow-ups to your clinic patients
              </li>
            </ul>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-purple-700 text-white rounded-lg shadow-md hover:bg-purple-800 transition-all"
            >
              Learn More
            </motion.button>
          </div>

          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="lg:w-1/2 order-1 lg:order-2 flex justify-center"
          >
            <img
              src={doctorMobile}
              alt="Doctor using mobile app"
              className="max-w-md w-full"
            />
          </motion.div>
        </motion.div>

        {/* Second Block */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row items-center gap-12 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
        >
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Download WeCure App Now
            </h2>

            <h3 className="text-xl text-gray-600 mb-6">
              A powerful app that lets you manage and grow your practice.
            </h3>

            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Manage your profile with advanced profile editor
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Respond to patient stories for your practice
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Provide online consultation to patients
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Manage your clinic with a Ray by WeCure subscription
              </li>
              <li className="flex items-start">
                <svg
                  className="w-5 h-5 text-purple-600 mr-2 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                See patient records from anywhere
              </li>
            </ul>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <motion.img
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              src={mobileApp}
              alt="Mobile app screens"
              className="max-w-md w-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Floating particles decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-purple-200/30"
            style={{
              width: Math.random() * 10 + 5 + "px",
              height: Math.random() * 10 + 5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 100],
              x: [0, (Math.random() - 0.5) * 100],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.section>
  );
};

export default Doctors;
