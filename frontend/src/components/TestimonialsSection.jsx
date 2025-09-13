import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import user1 from "../assets/user1.jpg";
import user2 from "../assets/user2.jpg";
import user3 from "../assets/user3.jpg";

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Ananya Singh",
      image: user1,
      feedback:
        "Amazing platform! I consulted a doctor within minutes and got my prescription instantly. The AI assistant was incredibly helpful and the doctor was very professional.",
    },
    {
      name: "Rahul Verma",
      image: user2,
      feedback:
        "Great experience. The doctor was very professional and gave excellent advice. The platform is so easy to use and the video consultation quality was perfect.",
    },
    {
      name: "Priya Desai",
      image: user3,
      feedback:
        "Quick, easy, and trustworthy. Highly recommend this telehealth service! The AI features are amazing and the doctors are very knowledgeable.",
    },
    {
      name: "Dr. Amit Kumar",
      image: user2,
      feedback:
        "As a doctor, I find this platform excellent for patient care. The AI integration helps me provide better diagnoses and the interface is very intuitive.",
    },
    {
      name: "Sneha Patel",
      image: user3,
      feedback:
        "The 24/7 availability is fantastic! I got help at 2 AM when I really needed it. The prescription service is so convenient and reliable.",
    },
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-sliding functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (newIndex) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  };

  return (
    <section className="testimonials-section">
      {/* Floating Particles */}
      <div className="testimonial-particles">
        <div className="testimonial-particle testimonial-particle-1"></div>
        <div className="testimonial-particle testimonial-particle-2"></div>
        <div className="testimonial-particle testimonial-particle-3"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="testimonials-title">What Our Users Say</h2>
      </motion.div>

      <div className="testimonials-container">
        <div className="testimonial-display">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="testimonial-card"
            >
              <div className="testimonial-content">
                <div className="quote-icon">
                  <Quote className="w-8 h-8" />
                </div>

                <div className="testimonial-image-container">
                  <img
                    src={testimonials[index].image}
                    alt={testimonials[index].name}
                    className="testimonial-image"
                  />
                </div>

                <div className="testimonial-text">
                  <p className="testimonial-feedback">
                    {testimonials[index].feedback}
                  </p>

                  <div className="testimonial-info">
                    <h4 className="testimonial-name">
                      {testimonials[index].name}
                    </h4>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="progress-indicators">
        {testimonials.map((_, i) => (
          <motion.button
            key={i}
            className={`progress-dot ${i === index ? "active" : ""}`}
            onClick={() => goToTestimonial(i)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          />
        ))}
      </div>
    </section>
  );
}

export default TestimonialsSection;
