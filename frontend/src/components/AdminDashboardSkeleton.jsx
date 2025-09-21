import React from "react";
import { motion } from "framer-motion";

const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-gray-200 ${className}`}>
    <div className="flex items-center">
      <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const AdminDashboardSkeleton = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-4 sm:p-6"
    >
      {/* Header Skeleton */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
      >
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </motion.div>

      {/* Navigation Tabs Skeleton */}
      <motion.div variants={fadeIn} className="flex space-x-8 mb-8 border-b border-gray-200">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="pb-3">
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
        ))}
      </motion.div>

      {/* Stats Cards Skeleton */}
      <motion.div variants={staggerContainer} className="mb-8">
        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(7)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </motion.div>

        {/* Appointments Section Skeleton */}
        <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="h-5 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 border-b border-gray-100 last:border-0">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboardSkeleton;
