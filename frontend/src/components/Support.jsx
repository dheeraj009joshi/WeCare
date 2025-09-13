import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";

export default function Support() {
  // Variants for cards (stagger effect)
  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, type: "spring" },
    }),
  };

  return (
    <main className="min-h-screen text-gray-800 p-6">
      {/* Heading */}
      <section className="max-w-5xl mx-auto text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-purple-700 mb-4"
        >
          24/7 Support
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-gray-600"
        >
          We're here for you anytime, anywhere. Reach out for help, guidance, or
          to just ask a question.
        </motion.p>
      </section>

      {/* Support Options */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {[
          {
            icon: <FaPhoneAlt className="text-purple-600 text-3xl mb-4" />,
            title: "Call Us",
            text: "+91 98765 43210",
          },
          {
            icon: <FaEnvelope className="text-purple-600 text-3xl mb-4" />,
            title: "Email Support",
            text: "support@wecure.in",
          },
          {
            icon: <FaClock className="text-purple-600 text-3xl mb-4" />,
            title: "Available",
            text: "24 hours · 7 days a week",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            }}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center"
          >
            {item.icon}
            <h2 className="text-xl font-semibold">{item.title}</h2>
            <p className="text-sm text-gray-500">{item.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Support Form */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-2xl font-semibold mb-4 text-purple-700">
          Send us a message
        </h2>
        <form className="space-y-4">
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="text"
            placeholder="Your Name"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="email"
            placeholder="Your Email"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <motion.textarea
            whileFocus={{ scale: 1.02 }}
            placeholder="Your Message"
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400"
          ></motion.textarea>
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 6px 15px rgba(139,92,246,0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition"
          >
            Submit
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}
