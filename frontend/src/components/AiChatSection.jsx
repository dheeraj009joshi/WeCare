import { motion } from "framer-motion";
import botImage from "../assets/botImage.png";
import ServicesSection from "./ServicesSection";
import HeroSection from "./HeroSection";
import DoctorsSection from "./DoctorsSection";
import TestimonialsSection from "./TestimonialsSection";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Link } from "react-router-dom";

const AiChatSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);

  const scrollToHero = () => {
    heroRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const services = [
    {
      name: "Food Delivery",
      icon: "🥪",
      route: "/food-delivery",
    },
    {
      name: "Medicine Store",
      icon: "💊",
      route: "/medicine-store",
    },
    {
      name: "Consult Doctors",
      icon: "🩺",
      route: "/appointments",
    },
    {
      name: "Meditation",
      icon: "🧘‍♀️",
      route: "/meditation",
    },
    {
      name: "Yoga",
      icon: "🧘🏻‍♀️",
      route: "/yoga",
    },
    {
      name: "Emergency",
      icon: "🚑",
      route: "/emergency",
    },
  ];
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.8,
      },
    },
  };

  const imageAnim = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.4,
      },
    },
  };

  const buttonAnim = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.6,
      },
    },
    hover: {
      scale: 1.05,
      y: -3,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <section>
      <motion.div
        className="ai-chatbot-section min-h-screen flex justify-center items-center"
        initial="hidden"
        animate="visible"
        variants={container}
      >
        <div className="flex flex-col md:flex-row ">
          <div className="p-6 max-w-3xl mx-auto my-22">
            {/* Heading animation */}
            <motion.h1
              className="text-3xl font-bold mb-2 text-purple-800"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Services at your doorstep
            </motion.h1>

            <div className="rounded-xl shadow-md shadow-gray-400 p-6">
              <motion.h2
                className="text-lg font-semibold mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                What are you looking for?
              </motion.h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                  >
                    <Link
                      to={service.route}
                      style={{ textDecoration: "none" }}
                      className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg cursor-pointer transition"
                    >
                      <motion.span className="text-4xl mb-2">
                        {service.icon}
                      </motion.span>
                      <motion.p
                        className="text-center font-medium"
                        whileHover={{ scale: 1.15 }}
                      >
                        {service.name}
                      </motion.p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center rounded-xl shadow-md shadow-gray-400 mt-22 pt-5">
            <motion.h2 variants={item} className="text-center">
              <span className="brand-color">Ladoo™</span> - Your AI Health
              Assistant
            </motion.h2>
            <motion.p
              className="subheading text-base sm:text-lg md:text-xl"
              variants={item}
            >
              Always Here to Guide & Support You
            </motion.p>
            <motion.img
              src={botImage}
              alt="AI Chatbot Character"
              className="chatbot-image w-32 sm:w-40 md:w-48"
              variants={imageAnim}
              initial="hidden"
              animate="visible"
              whileHover={{
                scale: 1.1,
                transition: { type: "spring", stiffness: 200, damping: 8 },
              }}
            />

            <br />

            <motion.button
              className="chatbot-button px-4 py-2 rounded w-48 mb-7"
              onClick={() => navigate("/askai")}
              variants={buttonAnim}
              whileHover="hover"
              whileTap="tap"
            >
              <span>Try Free AI Chat</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Hero Section with ref */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <HeroSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <ServicesSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <DoctorsSection />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <TestimonialsSection />
      </motion.div>
    </section>
  );
};

export default AiChatSection;
