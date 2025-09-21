import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

export default function CareerPage() {
  const { jobTitle } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    resume: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Application submitted for:", jobTitle, formData);
    alert(`Application for ${decodeURIComponent(jobTitle)} submitted!`);
    navigate("/direct/careers");
  };

  return (
    <main className="min-h-screen p-6 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg"
      >
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          Apply for {decodeURIComponent(jobTitle)}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Resume Link (Google Drive / LinkedIn)
            </label>
            <input
              type="url"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/..."
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Cover Letter / Message
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-2"
            ></textarea>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            Submit Application
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
