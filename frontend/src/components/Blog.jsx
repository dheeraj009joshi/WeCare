import { useState } from "react";
import { motion } from "framer-motion";
import regularhealth from "../assets/regularhealth.jpg";
import mentalhealth from "../assets/mentalhealth.jpg";
import aihealth from "../assets/aihealthcare.jpg";

export default function Blog() {
  const posts = [
    {
      title: "Top 5 Ways to Improve Your Mental Health",
      excerpt:
        "Discover daily habits, mindfulness techniques, and expert tips to help you maintain mental wellness.",
      author: "Dr. Meera Patel",
      date: "August 1, 2025",
      image: mentalhealth,
      content: `
        Mental health is just as important as physical health.
        Here are 5 ways you can improve your mental well-being:
        1. Practice mindfulness daily.
        2. Exercise regularly to release stress.
        3. Maintain a strong social connection.
        4. Get quality sleep.
        5. Seek professional help when needed.
      `,
    },
    {
      title: "Why Regular Health Checkups Matter",
      excerpt:
        "Routine health checkups can save lives. Learn what to check and when with our preventive care guide.",
      author: "Dr. Arjun Rao",
      date: "July 25, 2025",
      image: regularhealth,
      content: `
        Regular health checkups allow early detection of diseases,
        help in managing chronic conditions, and promote preventive care.
        Visiting your doctor annually can reduce risks significantly.
      `,
    },
    {
      title: "Understanding AI in Modern Healthcare",
      excerpt:
        "AI is revolutionizing patient care. Let's explore how Wecure uses AI to empower patients and doctors alike.",
      author: "Aastha Yuli",
      date: "July 10, 2025",
      image: aihealth,
      content: `
        AI is being used in diagnostics, personalized medicine,
        remote monitoring, and predictive healthcare.
        Wecure integrates AI to provide smarter recommendations
        and empower both patients and doctors.
      `,
    },
  ];

  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <main className="min-h-screen p-6">
      {/* Blog Title */}
      <section className="text-center mb-16">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-purple-700 mb-3"
        >
          Welcome to Wecure's Blog
        </motion.h1>
        <p className="text-gray-600 text-lg">
          Tips, research, and real stories to help you live healthier, happier,
          and smarter.
        </p>
      </section>

      {/* Blog Section */}
      {selectedPost ? (
        // 👉 Article Detail View
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6"
        >
          <img
            src={selectedPost.image}
            alt={selectedPost.title}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
          <h2 className="text-3xl font-bold text-purple-700 mb-4">
            {selectedPost.title}
          </h2>
          <div className="text-sm text-gray-500 mb-6">
            <span>{selectedPost.author}</span> •{" "}
            <span>{selectedPost.date}</span>
          </div>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {selectedPost.content}
          </p>

          <button
            onClick={() => setSelectedPost(null)}
            className="mt-6 px-5 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
          >
            ← Back to Blog
          </button>
        </motion.section>
      ) : (
        // 👉 Blog Cards Grid
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              onClick={() => setSelectedPost(post)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden p-4 cursor-pointer hover:scale-105 transition duration-300 ease-in-out hover:shadow-md hover:shadow-purple-600"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover rounded-xl"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-purple-700 mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4">{post.excerpt}</p>
                <div className="text-xs text-gray-500">
                  <span>{post.author}</span> • <span>{post.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>
      )}
    </main>
  );
}
