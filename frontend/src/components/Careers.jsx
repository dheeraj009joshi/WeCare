import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaLaptopCode,
  FaUserNurse,
  FaGlobeAsia,
  FaHandshake,
} from "react-icons/fa";

export default function Careers() {
  const navigate = useNavigate();
  const jobs = [
    {
      title: "Frontend Developer (React)",
      location: "Remote · Full-time",
      description:
        "Build beautiful interfaces for our AI-powered health platform using React + Tailwind CSS.",
    },
    {
      title: "Healthcare Advisor",
      location: "Gurugram · Full-time",
      description:
        "Guide our users toward better wellness outcomes with empathy and professionalism.",
    },
    {
      title: "AI Research Intern",
      location: "Remote · Internship",
      description:
        "Help us improve our chatbot's intelligence and NLP accuracy through R&D.",
    },
  ];

  const perkVariant = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, type: "spring" },
    }),
  };

  return (
    <main className="min-h-screen p-6 text-gray-800">
      {/* Intro Section */}
      <section className="text-center max-w-4xl mx-auto mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-purple-700 mb-4"
        >
          Join the Wecure Team
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-gray-600"
        >
          We're building the future of digital healthcare — and we need
          passionate people like you to help us get there.
        </motion.p>
      </section>

      {/* Perks & Benefits */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
        {[
          {
            icon: (
              <FaLaptopCode className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Remote Flexibility",
            text: "Work from anywhere, anytime.",
          },
          {
            icon: (
              <FaUserNurse className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Wellness Coverage",
            text: "Health benefits, therapy, and wellness plans.",
          },
          {
            icon: (
              <FaGlobeAsia className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Diverse Culture",
            text: "We embrace diversity, ideas, and cultures.",
          },
          {
            icon: (
              <FaHandshake className="text-purple-600 text-3xl mx-auto mb-3" />
            ),
            title: "Meaningful Work",
            text: "Make a real impact in people's lives.",
          },
        ].map((perk, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={perkVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            }}
            className="bg-white rounded-2xl shadow-md p-5 text-center"
          >
            {perk.icon}
            <h2 className="font-semibold text-lg">{perk.title}</h2>
            <p className="text-sm text-gray-600">{perk.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Open Positions */}
      <section className="max-w-5xl mx-auto">
        <div className="space-y-6">
          {jobs.map((job, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6, type: "spring" }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              }}
              className="bg-white rounded-xl shadow-md p-6 transition"
            >
              <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                <h3 className="text-xl font-semibold text-purple-800">
                  {job.title}
                </h3>
                <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  {job.location}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{job.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition"
                onClick={() =>
                  navigate(`/direct/apply/${encodeURIComponent(job.title)}`)
                }
              >
                Apply Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
