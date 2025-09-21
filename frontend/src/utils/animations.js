// Animation configurations for consistent animations across the app

export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInDown = {
  initial: { opacity: 0, y: -30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { opacity: 1, scale: 1 },
  transition: { 
    type: "spring",
    stiffness: 200,
    damping: 10,
    mass: 0.5
  }
};

export const slideInUp = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const slideInDown = {
  initial: { opacity: 0, y: -50 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" }
};

// Hover animations
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

export const hoverLift = {
  whileHover: { 
    y: -5,
    boxShadow: "0 10px 25px rgba(139, 92, 246, 0.3)"
  },
  transition: { duration: 0.3 }
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)"
  },
  transition: { duration: 0.3 }
};

// Loading animations
export const spin = {
  animate: { rotate: 360 },
  transition: { 
    duration: 1,
    repeat: Infinity,
    ease: "linear"
  }
};

export const pulse = {
  animate: { 
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1]
  },
  transition: { 
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export const breathe = {
  animate: { 
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1]
  },
  transition: { 
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 }
};

// Card animations
export const cardHover = {
  whileHover: { 
    y: -10,
    scale: 1.02,
    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)"
  },
  transition: { duration: 0.3 }
};

// Button animations
export const buttonHover = {
  whileHover: { 
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(139, 92, 246, 0.3)"
  },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

// Text animations
export const textReveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const textGlow = {
  whileHover: { 
    textShadow: "0 0 10px rgba(139, 92, 246, 0.5)"
  },
  transition: { duration: 0.3 }
};

// Utility functions
export const createStaggerDelay = (index, delay = 0.1) => ({
  transition: { delay: index * delay }
});

export const createScrollTrigger = (threshold = 0.1) => ({
  viewport: { 
    once: true, 
    amount: threshold,
    margin: "-50px"
  }
});

// Theme-specific animations
export const purpleGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)"
  },
  transition: { duration: 0.3 }
};

export const blueGlow = {
  whileHover: { 
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)"
  },
  transition: { duration: 0.3 }
};

export const gradientShift = {
  animate: {
    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
  },
  transition: { 
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
}; 