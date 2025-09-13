import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import doctorImage from "../assets/dotor.png";

const DoctorDetailPage = () => {
  const { serviceId } = useParams();

  const doctorData = {
    "general-physician": {
      name: "Dr. Priya Sharma",
      specialty: "General Physician",
      article:
        "Dr. Sharma is a board-certified physician with 12 years of experience in primary care. She completed her MD from AIIMS Delhi and specializes in preventive healthcare, chronic disease management, and comprehensive physical examinations. Her patient-centric approach focuses on holistic wellbeing.",
    },
    "mental-health": {
      name: "Dr. Arjun Kapoor",
      specialty: "Psychiatrist",
      article:
        "Dr. Kapoor is a renowned psychiatrist with 15 years of clinical experience. After training at NIMHANS Bangalore, he developed expertise in cognitive behavioral therapy and anxiety disorders. He believes in combining medication with psychotherapy for optimal mental health outcomes.",
    },
    nutrition: {
      name: "Dr. Neha Gupta",
      specialty: "Nutrition Specialist",
      article:
        "Dr. Gupta is a registered dietitian and nutrition scientist with a PhD in Clinical Nutrition. She creates personalized diet plans combining evidence-based nutrition with practical lifestyle adjustments. Her special focus is on diabetes management and sports nutrition.",
    },
    cardiology: {
      name: "Dr. Rajesh Khanna",
      specialty: "Cardiologist",
      article:
        "Dr. Khanna is a senior interventional cardiologist with over 18 years of experience. Trained at Cleveland Clinic, he has performed 5000+ angiographies. His research focuses on preventive cardiology and non-invasive heart care techniques.",
    },
    vaccinations: {
      name: "Dr. Anjali Mehta",
      specialty: "Immunization Specialist",
      article:
        "Dr. Mehta is a public health expert specializing in vaccination programs. With 10 years at WHO immunization projects, she provides expert guidance on vaccine schedules, travel immunizations, and pediatric vaccination protocols.",
    },
    pediatrics: {
      name: "Dr. Sneha Reddy",
      specialty: "Pediatrician",
      article:
        "Dr. Reddy is a child specialist with dual certification in Pediatrics and Neonatology. Her gentle approach and play therapy techniques make her popular among young patients. She specializes in growth monitoring and childhood immunity development.",
    },
  };
  const doctor = doctorData[serviceId] || doctorData["general-physician"];

  return (
    <div className="min-h-screen bg-gray-50 p-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Left Side (50%) */}
        <div className="lg:w-1/2 flex flex-col gap-8">
          {/* Doctor Image (Top Half) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl p-6 h-96 flex items-center justify-center"
          >
            <img src={doctor} alt="Doctor" className="h-full object-contain" />
          </motion.div>

          {/* Doctor Article (Bottom Half) */}
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="bg-white rounded-xl p-8"
          >
            <h2 className="text-3xl font-bold mb-4">{doctor.name}</h2>
            <p className="text-gray-600">{doctor.article}</p>
          </motion.div>
        </div>

        {/* Right Side (50%) - Bot */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:w-1/2  rounded-xl p-8 flex flex-col items-center justify-center"
        >
          <motion.img
            src={doctorImage}
            alt="Bot"
            className="w-3/4 mb-8"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
