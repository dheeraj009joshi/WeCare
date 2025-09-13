import {
  Stethoscope,
  Brain,
  Salad,
  HeartPulse,
  Syringe,
  Baby,
  Activity,
  Shield,
  Users,
  Clock,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import doctor from "../assets/R.png";
import { Link } from "react-router-dom";
import specializations from "../data/specializations";

const ServicesSection = () => {
  const navigate = useNavigate();

  const handleCardClick = (serviceId) => {
    navigate(`/doctors/${serviceId}`); // Navigates to e.g., "/doctor/general-physician"
  };
  const services = [
    {
      id: "general-physician",
      icon: <Stethoscope className="w-22 h-22 text-[#083567]" />,
      title: "General Physician",
      description:
        "24/7 access to AI-powered medical consultations and prescription services.",
    },
    {
      id: "mental-health",
      icon: <Brain className="w-22 h-22 text-[#083567]" />,
      title: "Mental Health",
      description:
        "Confidential AI therapy sessions with human specialist backup.",
    },
    {
      id: "nutrition",
      icon: <Salad className="w-22 h-22 text-[#083567]" />,
      title: "Nutrition",
      description:
        "Personalized diet plans powered by nutritionist-trained AI models.",
    },
    {
      id: "cardiology",
      icon: <HeartPulse className="w-22 h-22 text-[#083567]" />,
      title: "Cardiology",
      description: "Heart health monitoring with ECG analysis algorithms.",
    },
    {
      id: "vaccinations",
      icon: <Syringe className="w-22 h-22 text-[#083567]" />,
      title: "Vaccinations",
      description: "AI-powered vaccine scheduler with side-effect predictor.",
    },
    {
      id: "pediatrics",
      icon: <Baby className="w-22 h-22 text-[#083567]" />,
      title: "Pediatrics",
      description: "Child health tracker with developmental milestone AI.",
    },
  ];

  return (
    <div className="services-section">
      {/* Floating Particles for Services */}
      <div className="services-particles">
        <div className="service-particle service-particle-1"></div>
        <div className="service-particle service-particle-2"></div>
        <div className="service-particle service-particle-3"></div>
        <div className="service-particle service-particle-4"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h1 className="services-title">Our Services</h1>
      </motion.div>

      <div className="services-container">
        {/* Fixed Content (left) - */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="services-image-container"
          style={{ backgroundImage: `url(${doctor})` }}
        ></motion.div>

        {/* Scrollable Cards (right) - */}
        <div className="services-cards-container">
          <div className="services-cards-grid">
            {specializations.slice(0, 6).map((spec, idx) => {
              const icons = [
                Stethoscope,
                Brain,
                HeartPulse,
                Shield,
                Users,
                Activity,
              ];
              const IconComponent = icons[idx % icons.length];

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => navigate("/services", { state: { spec } })}
                  className="service-card"
                  whileHover={{
                    scale: 1.05,
                    y: -5,
                    transition: { duration: 0.3 },
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="service-card-content">
                    <div className="service-icon-container">
                      <IconComponent className="service-icon" />
                    </div>
                    <div className="service-text">
                      <h3 className="service-title">{spec}</h3>
                      <p className="service-description">
                        Expert care and specialized treatment for{" "}
                        {spec.toLowerCase()}.
                      </p>
                      <div className="service-features">
                        <span className="feature-tag">24/7 Available</span>
                        <span className="feature-tag">Expert Doctors</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              className="see-more-container"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              <Link to="/services" className="see-more-button">
                <span>Explore More</span>
                <Star className="see-more-icon" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
