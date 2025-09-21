import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function CallToActionChat() {
  const navigate = useNavigate();

  const handleStartChat = () => {
    console.log("Start Chat button clicked!");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("User not logged in, redirecting to login");
      // If not logged in, redirect to login page
      navigate("/login");
      return;
    }
    console.log("User logged in, redirecting to emergency video chat");
    // If logged in, go to emergency video chat form
    navigate("/emergency/video-chat");
  };

  return (
    <section className="flex flex-col md:flex-row justify-between items-center gap-8 px-4 py-8 min-h-screen mt-[100px] md:mt-0">
      {/* Slide in from the left */}
      <motion.div
        className="call-to-action text-center  bg-white text-[#4f7cac] py-[50px] px-[20px] rounded-4xl shadow-md shadow-cyan-800 relative overflow-hidden max-w-lg mx-auto "
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-xl font-semibold mb-4">Chat with a doctor now</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleStartChat}
            className="bg-[linear-gradient(to_right,_#de3c78,_#6658d3)] text-white px-6 py-2 text-lg hover:shadow-md hover:shadow-cyan-800 transition duration-300 ease-in-out"
          >
            🤙 Start Chat
          </Button>
        </motion.div>
      </motion.div>

      {/* Slide in from the right */}
      <motion.div
        className="call-to-action text-center bg-white text-[#4f7cac] py-[50px] px-[20px] rounded-4xl shadow-md shadow-cyan-800 relative overflow-hidden max-w-xl mx-auto "
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          Critical situation? Let's get you help.
        </h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => navigate("/emergency/call-ambulance")}
            className="bg-[linear-gradient(to_right,_#de3c78,_#6658d3)] text-white px-6 py-2 text-lg hover:shadow-md hover:shadow-cyan-800 transition duration-300 ease-in-out"
          >
            🚑 Call Ambulance
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default CallToActionChat;
