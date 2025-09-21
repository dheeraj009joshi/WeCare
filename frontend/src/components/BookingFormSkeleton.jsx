import { motion } from "framer-motion";

// Skeleton animation variants
const skeletonVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const SkeletonBox = ({ className, height = "h-4" }) => (
  <motion.div
    className={`bg-gray-200 rounded ${height} ${className}`}
    variants={skeletonVariants}
    animate="animate"
  />
);

const SkeletonInput = ({ className = "" }) => (
  <motion.div
    className={`w-full h-12 bg-gray-200 rounded-lg ${className}`}
    variants={skeletonVariants}
    animate="animate"
  />
);

const SkeletonTextarea = ({ className = "" }) => (
  <motion.div
    className={`w-full h-24 bg-gray-200 rounded-lg ${className}`}
    variants={skeletonVariants}
    animate="animate"
  />
);

const SkeletonButton = ({ className = "" }) => (
  <motion.div
    className={`w-full h-12 bg-gray-200 rounded-lg ${className}`}
    variants={skeletonVariants}
    animate="animate"
  />
);

const BookingFormSkeleton = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="booking-form px-6 py-12 shadow-2xl rounded-2xl max-w-2xl mx-auto my-12 backdrop-blur-sm bg-white/90"
    >
      {/* Header Section Skeleton */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <SkeletonBox className="w-64 h-8 mb-2 mx-auto" />
        <SkeletonBox className="w-80 h-5 mx-auto" />
      </motion.div>

      {/* Form Skeleton */}
      <div className="space-y-6">
        {/* Personal Information Section Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#f8f9fa] p-6 rounded-xl"
        >
          <SkeletonBox className="w-48 h-6 mb-4" />
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <SkeletonBox className="w-24 h-4 mb-2" />
              <SkeletonInput />
            </div>

            {/* Phone and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SkeletonBox className="w-32 h-4 mb-2" />
                <SkeletonInput />
              </div>
              <div>
                <SkeletonBox className="w-16 h-4 mb-2" />
                <SkeletonInput />
              </div>
            </div>

            {/* Age and Gender Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SkeletonBox className="w-12 h-4 mb-2" />
                <SkeletonInput />
              </div>
              <div>
                <SkeletonBox className="w-20 h-4 mb-2" />
                <SkeletonInput />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Appointment Details Section Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#f8f9fa] p-6 rounded-xl"
        >
          <SkeletonBox className="w-52 h-6 mb-4" />
          <div className="space-y-4">
            {/* Consultation With */}
            <div>
              <SkeletonBox className="w-36 h-4 mb-2" />
              <SkeletonInput className="bg-[#f0f9ff]" />
            </div>

            {/* Available Time Slots */}
            <div>
              <SkeletonBox className="w-40 h-4 mb-2" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[...Array(6)].map((_, index) => (
                  <motion.div
                    key={index}
                    className="h-12 bg-gray-200 rounded-lg"
                    variants={skeletonVariants}
                    animate="animate"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <SkeletonBox className="w-32 h-4 mb-2" />
              <SkeletonInput />
            </div>

            {/* Problem Description */}
            <div>
              <SkeletonBox className="w-44 h-4 mb-2" />
              <SkeletonTextarea />
            </div>
          </div>
        </motion.div>

        {/* Terms and Submit Section Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Terms Checkbox */}
          <div className="flex items-start">
            <motion.div
              className="w-4 h-4 bg-gray-200 rounded mr-2 mt-1"
              variants={skeletonVariants}
              animate="animate"
            />
            <SkeletonBox className="w-80 h-4" />
          </div>

          {/* Submit Button */}
          <SkeletonButton className="h-14" />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default BookingFormSkeleton; 