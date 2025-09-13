import dotor from "../assets/dotor.png";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AssistantCharacter = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 10 }}
    >
      <Link to="/emergency">
        <div className="assistant-character w-[80px] md:w-[120px]">
          <motion.img
            src={dotor}
            alt="Assistant Character"
            initial={{ filter: "brightness(1)" }}
            animate={{
              filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"],
              scale: [1, 1.03, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.1 }}
          />
          <motion.h1
            className="text-red-500 leading-5 text-center font-semibold mt-1 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            🚑Emergency?
          </motion.h1>
        </div>
      </Link>
    </motion.div>
  );
};

export default AssistantCharacter;
