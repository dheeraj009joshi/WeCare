import React from "react";
import { motion } from "framer-motion";

const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white p-6 rounded-xl shadow-sm ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
    </div>
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonTable = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="px-6 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {[...Array(5)].map((_, i) => (
            <tr key={i}>
              {[...Array(6)].map((_, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminMedicineStoreSkeleton = () => {
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
      className="min-h-screen bg-gray-50 p-4 sm:p-6"
    >
      {/* Header Skeleton */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
      >
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </motion.div>

      {/* Stats Cards Skeleton */}
      <motion.div variants={staggerContainer} className="mb-8">
        <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Products and Orders Section Skeleton */}
        <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </motion.div>

        {/* Table Section Skeleton */}
        <motion.div variants={fadeIn} className="mt-8">
          <SkeletonTable />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AdminMedicineStoreSkeleton;
