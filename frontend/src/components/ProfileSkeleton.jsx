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

const SkeletonCircle = ({ size = "w-12 h-12" }) => (
  <motion.div
    className={`bg-gray-200 rounded-full ${size}`}
    variants={skeletonVariants}
    animate="animate"
  />
);

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto pt-12">
        {/* Header Section Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Picture Skeleton */}
            <div className="relative">
              <SkeletonCircle size="w-24 h-24" />
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg border border-blue-200">
                <SkeletonBox className="w-4 h-4" />
              </div>
            </div>

            {/* User Info Skeleton */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <SkeletonBox className="w-48 h-8 mb-2" />
                  <div className="flex items-center gap-2 mt-1">
                    <SkeletonBox className="w-24 h-6" />
                    <SkeletonBox className="w-32 h-4" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <SkeletonBox className="w-24 h-10" />
                  <SkeletonBox className="w-20 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e9d5ff]">
              <div className="flex items-center mb-6">
                <SkeletonCircle size="w-5 h-5 mr-2" />
                <SkeletonBox className="w-48 h-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index}>
                    <SkeletonBox className="w-20 h-4 mb-2" />
                    <div className="flex items-center p-3 rounded-xl bg-[#f5f3ff]">
                      <SkeletonCircle size="w-5 h-5" />
                      <SkeletonBox className="ml-3 flex-1 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Summary Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#e9d5ff]">
              <div className="flex items-center mb-6">
                <SkeletonCircle size="w-5 h-5 mr-2" />
                <SkeletonBox className="w-40 h-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index}>
                    <SkeletonBox className="w-24 h-4 mb-2" />
                    <div className="flex items-center p-3 rounded-xl bg-[#f5f3ff]">
                      <SkeletonCircle size="w-5 h-5" />
                      <SkeletonBox className="ml-3 flex-1 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]">
              <div className="flex items-center mb-4">
                <SkeletonCircle size="w-5 h-5 mr-2" />
                <SkeletonBox className="w-48 h-6" />
              </div>
              <div className="p-4 bg-[#f5f3ff] rounded-xl">
                <div className="flex items-start gap-4">
                  <SkeletonCircle size="w-10 h-10" />
                  <div className="flex-1">
                    <SkeletonBox className="w-32 h-5 mb-1" />
                    <SkeletonBox className="w-24 h-4 mb-2" />
                    <SkeletonBox className="w-40 h-4 mb-3" />
                    <div className="flex gap-3">
                      <SkeletonBox className="w-24 h-8" />
                      <SkeletonBox className="w-16 h-8" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prescriptions & Reports Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]">
              <div className="flex items-center mb-4">
                <SkeletonCircle size="w-5 h-5 mr-2" />
                <SkeletonBox className="w-48 h-6" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <SkeletonBox className="w-24 h-4 mb-2" />
                  <div className="bg-[#f5f3ff] p-3 rounded-xl border border-[#e9d5ff]">
                    <SkeletonBox className="w-20 h-4 mb-1" />
                    <SkeletonBox className="w-12 h-3" />
                  </div>
                </div>
                <div>
                  <SkeletonBox className="w-20 h-4 mb-2" />
                  <div className="bg-[#f5f3ff] p-3 rounded-xl border border-[#e9d5ff]">
                    <SkeletonBox className="w-24 h-4 mb-1" />
                    <SkeletonBox className="w-16 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health Suggestions Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-[#e9d5ff]">
              <div className="flex items-center mb-4">
                <SkeletonCircle size="w-5 h-5 mr-2" />
                <SkeletonBox className="w-40 h-6" />
              </div>
              <div className="bg-[#f5f3ff] border-l-4 border-[#7c3aed] p-4 rounded-r-xl">
                <SkeletonBox className="w-full h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton; 