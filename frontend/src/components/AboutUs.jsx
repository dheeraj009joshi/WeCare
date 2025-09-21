import { motion } from "framer-motion";
import { FaHeartbeat, FaPeopleCarry, FaLightbulb } from "react-icons/fa";
import member1 from "../assets/member1.jpg";
import member2 from "../assets/member2.jpg";

export default function AboutUs() {
  // Card animations
  const cardVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.6, type: "spring" },
    }),
  };

  return (
    <main className="min-h-screen text-gray-800 p-6">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-purple-700 mb-4"
        >
          About Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Wecure is a modern wellness consultancy dedicated to improving lives
          through personalized healthcare, AI-powered solutions, and
          compassionate care.
        </motion.p>
      </section>

      {/* Mission, Vision, Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
        {[
          {
            icon: (
              <FaHeartbeat className="text-purple-600 text-4xl mb-4 mx-auto" />
            ),
            title: "Our Mission",
            text: "To empower individuals and families with accessible, personalized, and compassionate wellness solutions—anytime, anywhere.",
          },
          {
            icon: (
              <FaLightbulb className="text-purple-600 text-4xl mb-4 mx-auto" />
            ),
            title: "Our Vision",
            text: "To be the most trusted name in digital health innovation and holistic wellness care.",
          },
          {
            icon: (
              <FaPeopleCarry className="text-purple-600 text-4xl mb-4 mx-auto" />
            ),
            title: "Our Values",
            text: "Integrity, empathy, innovation, and unwavering commitment to health equity and community care.",
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
            className="bg-white rounded-2xl shadow-lg p-6 text-center"
          >
            {item.icon}
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-sm text-gray-600">{item.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Team Section */}
      <section className="max-w-5xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold text-purple-700 mb-6"
        >
          Meet the Team
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-gray-600 mb-8"
        >
          A passionate blend of doctors, developers, designers, and health
          advocates working together to bring you the best in digital wellness.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-6">
          {[
            {
              img: member1,
              name: "Dr. Priya Sharma",
              role: "Chief Medical Officer",
            },
            { img: member2, name: "Ankit Mehta", role: "CTO & Co-Founder" },
          ].map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl shadow-md p-4 w-60"
            >
              <motion.img
                src={member.img}
                alt="Team member"
                className="rounded-xl mb-4 w-full"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <h3 className="font-semibold">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
