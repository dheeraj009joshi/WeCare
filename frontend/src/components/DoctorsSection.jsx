import { Star, User } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { doctorsAPI } from "../config/api";
function DoctorsSection() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorsAPI.getAllDoctors({
        is_verified: true,
        is_active: true,
        limit: 6 // Show top 6 doctors
      });
      setDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.5,
        ease: "backOut",
      },
    },
  };

  if (loading) {
    return (
      <section className="doctors-section">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="doctors-section">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="doctors-section">
      <motion.div
        variants={headerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.h2
          whileHover={{
            scale: 1.02,
            textShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
          }}
        >
          Our Trusted Medical Experts
        </motion.h2>
        <motion.h1 className="m-4 text-xl" whileHover={{ scale: 1.01 }}>
          A dedicated team of doctors and specialists committed to delivering
          safe, personalized, and evidence-based healthcare for every
          individual.
        </motion.h1>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {doctors.slice(0, 3).map((doc, idx) => (
          <motion.div
            key={doc.id || idx}
            className="doctor-card"
            variants={cardVariants}
            whileHover={{
              scale: 1.08,
              y: -15,
              transition: { duration: 0.4, ease: "easeOut" },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <User className="w-12 h-12 text-purple-600" />
            </motion.div>
            <motion.h3
              whileHover={{ color: "#3b82f6" }}
              transition={{ duration: 0.3 }}
            >
              {doc.full_name || doc.name}
            </motion.h3>
            <motion.p
              whileHover={{ color: "#6b7280" }}
              transition={{ duration: 0.3 }}
            >
              {doc.specialization} specialist
            </motion.p>
            <motion.p
              whileHover={{ color: "#6b7280" }}
              transition={{ duration: 0.3 }}
            >
              {doc.experience_years} years experience
            </motion.p>
            <motion.div
              className="mt-2 flex justify-center items-center text-yellow-400"
              variants={starVariants}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Star className="w-4 h-4" />
              </motion.div>
              <span className="ml-1 text-gray-700">4.8</span>
            </motion.div>
            <motion.p className="mt-2 text-green-600 font-semibold">
              ₹{doc.consultation_fee || 500}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default DoctorsSection;
