import { motion } from "framer-motion";
import { FaBullhorn, FaUsers, FaHandshake, FaChartLine } from "react-icons/fa";

export default function Advertisement() {
  // Stagger Animation for Cards
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, type: "spring" },
    }),
  };

  return (
    <main className="min-h-screen  p-6 text-gray-800">
      {/* Page Header */}
      <section className="text-center max-w-3xl mx-auto mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-purple-700 mb-4"
        >
          Advertise with Wecure
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-gray-600"
        >
          Connect your brand with thousands of wellness-conscious users through
          our trusted health platform.
        </motion.p>
      </section>

      {/* Why Advertise Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
        {[
          {
            icon: <FaUsers className="text-purple-600 text-3xl mx-auto mb-3" />,
            title: "Engaged Users",
            desc: "Reach a loyal and health-focused audience actively seeking trusted wellness solutions.",
          },
          {
            icon: (
              <FaChartLine className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Proven Performance",
            desc: "We offer analytics and transparent reporting to help you track ad effectiveness.",
          },
          {
            icon: (
              <FaHandshake className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Trusted Brand",
            desc: "Advertise in a respectful, non-intrusive way that builds credibility and customer trust.",
          },
          {
            icon: (
              <FaBullhorn className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Multiple Ad Channels",
            desc: "Display ads, sponsored content, wellness newsletter spots, chatbot promos & more.",
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
            }}
            className="bg-white rounded-xl shadow-md p-6 text-center"
          >
            {card.icon}
            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Ad Inquiry Form */}
      <motion.section
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.01, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
        className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6"
      >
        <h2 className="text-2xl font-semibold text-purple-700 mb-6 text-center">
          Advertising Inquiry Form
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
              required
            />
          </motion.div>

          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
              required
            />
          </motion.div>

          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-sm font-medium text-gray-700">
              Advertising Interest
            </label>
            <select className="w-full mt-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-300 outline-none">
              <option>Banner Ads</option>
              <option>Newsletter Sponsorship</option>
              <option>Influencer Collaboration</option>
              <option>Chatbot Promotion</option>
              <option>Other</option>
            </select>
          </motion.div>

          <motion.div whileFocus={{ scale: 1.02 }}>
            <label className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              rows="4"
              className="w-full mt-1 px-4 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-purple-300 outline-none"
              placeholder="Tell us what you're looking for..."
            />
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Submit Inquiry
          </motion.button>
        </form>
      </motion.section>
    </main>
  );
}
