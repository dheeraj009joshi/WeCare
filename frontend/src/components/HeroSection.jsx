import { useState, useEffect } from "react";
import AnimatedButton from "./AnimatedButton";
import ScrollAnimation from "./ScrollAnimation";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function HeroSection() {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div className="bg-transparent">
      <section className="hero-section ">
        {/* Enhanced Floating Purple Particles */}
        <div className="floating-particles">
          <motion.div
            className="particle particle-1"
            variants={floatingVariants}
            animate="animate"
          ></motion.div>
          <motion.div
            className="particle particle-2"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 0.5 }}
          ></motion.div>
          <motion.div
            className="particle particle-3"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          ></motion.div>
          <motion.div
            className="particle particle-4"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1.5 }}
          ></motion.div>
          <motion.div
            className="particle particle-5"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          ></motion.div>
          <motion.div
            className="particle particle-6"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2.5 }}
          ></motion.div>
          <motion.div
            className="particle particle-7"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 3 }}
          ></motion.div>
          <motion.div
            className="particle particle-8"
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 3.5 }}
          ></motion.div>
        </div>

        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-gradient"
            variants={itemVariants}
            whileHover={{
              scale: 1.02,
              textShadow: "0 8px 30px rgba(139, 92, 246, 0.6)",
            }}
          >
            Consult Trusted Doctors Anytime, Anywhere
          </motion.h1>

          <motion.p
            className="text-lg text-white/90 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Get expert medical advice, prescriptions, and follow-ups without
            stepping out of your home.
          </motion.p>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatedButton
              onClick={() => navigate("/services")}
              size="large"
              className="mt-8"
            >
              Start Consultation
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

export default HeroSection;
