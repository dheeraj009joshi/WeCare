import React, { useState, useEffect } from "react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiActivity,
  FiUsers,
  FiPackage,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiUserPlus,
  FiRefreshCw,
  FiSearch,
  FiClock,
  FiMessageSquare
} from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import AdminMedicineStore from "./AdminMedicineStore";
import AdminMessages from "./AdminMessages";

import DoctorsManagement from "./DoctorsManagement";
import AdminDashboardSkeleton from "./AdminDashboardSkeleton";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { logoutUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";

const StatsBox = ({ icon, title, value, colorName, currency }) => {
  // Define color classes for each possible colorName
  const colorClasses = {
    border: {
      blue: "border-blue-500",
      green: "border-green-500",
      teal: "border-teal-500",
      pink: "border-pink-500",
      indigo: "border-indigo-500",
      purple: "border-purple-500",
    },
    text: {
      blue: "text-blue-500",
      green: "text-green-500",
      teal: "text-teal-500",
      pink: "text-pink-500",
      indigo: "text-indigo-500",
      purple: "text-purple-500",
    },
  };

  // Get the specific classes based on colorName
  const borderColor = colorClasses.border[colorName] || "border-gray-500";
  const textColor = colorClasses.text[colorName] || "text-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        y: -5,
        boxShadow: "0 15px 30px rgba(79, 124, 172, 0.2)",
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.5,
      }}
      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border-l-4 ${borderColor}`}
    >
      <div className="flex items-center">
        <motion.div
          whileHover={{ rotate: 10 }}
          className="p-3 rounded-full bg-white mr-4 border border-gray-200 shadow-lg transition-all duration-300" // Changed to white bg with border
        >
          {React.cloneElement(icon, { className: `${textColor} w-5 h-5` })}
        </motion.div>
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <motion.p
            className="text-2xl font-bold text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currency && "$"}
            {typeof value === "number" ? value.toLocaleString() : value}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    appointments: 0,
    runningNow: 0,
    scheduledToday: 0,
    completedToday: 0,
    earningsToday: 0,
    totalDoctors: 0,
    totalPatients: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await logoutUser(token);
      }
      
      // Use AuthContext logout function
      logout();
      
      // Navigate to home page
      navigate("/home");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if backend call fails, logout and redirect
      logout();
      navigate("/home");
    }
  };

  const loadData = async () => {
    setIsRefreshing(true);
    setError(null);

    // Use hardcoded data since backend is removed
    setStats({
      appointments: 125,
      runningNow: 5,
      scheduledToday: 23,
      completedToday: 17,
      earningsToday: 1200,
      totalDoctors: 50,
      totalPatients: 1200,
    });
    
    setIsRefreshing(false);
    setLoading(false);
  };

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Sugar Patel",
      age: 28,
      gender: "Female",
      lastVisit: "2 days ago",
      status: "Active",
      appointments: 5,
    },
    {
      id: 2,
      name: "Anita Gupta",
      age: 34,
      gender: "Female",
      lastVisit: "3 days ago",
      status: "Active",
      appointments: 12,
    },
    {
      id: 3,
      name: "Ravi Singh",
      age: 45,
      gender: "Male",
      lastVisit: "1 week ago",
      status: "Inactive",
      appointments: 3,
    },
  ]);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(167, 139, 250, 0.2)",
    },
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 p-4 sm:p-6"
    >
      {/* Header */}
      <motion.div
        variants={{
          hidden: { opacity: 0, y: -20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 120,
            },
          },
        }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
      >
        <motion.div
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#083567]">
            We Cure Admin
          </h1>
          <motion.p
            className="text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Welcome back, Admin
          </motion.p>
        </motion.div>
        <div className="flex gap-4">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-red-700 px-4 py-2 rounded-lg shadow-sm text-white font-medium hover:bg-red-500 transition-colors"
          >
            Logout
          </motion.button>
          <motion.button
            onClick={loadData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center bg-[#a78bfa] px-4 py-2 rounded-lg shadow-sm text-white font-medium hover:bg-[#a78bfa] transition-colors"
            disabled={isRefreshing}
          >
            <div>
              <FiRefreshCw
                className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </div>
            {isRefreshing ? "Refreshing..." : "Refresh Data"}
          </motion.button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Navigation Tabs with ripple effect */}
      <motion.div
        variants={fadeIn}
        className="flex overflow-x-auto mb-8 border-b border-gray-200 scrollbar-hide"
      >
        {[
          { id: "dashboard", icon: <FiActivity />, label: "Dashboard" },
          { id: "patients", icon: <FiUsers />, label: "Patients" },
          { id: "medicine", icon: <FiPackage />, label: "Medicine Store" },
          {
            id: "doctors-management",
            icon: <FaStethoscope />,
            label: "Doctors Management",
          },
          { id: "messages", icon: <FiMessageSquare />, label: "Messages" },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === tab.id
                ? "text-[#083567] border-b-2 border-[#083567]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <motion.span className="mr-2" whileHover={{ rotate: 10 }}>
              {tab.icon}
            </motion.span>
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#083567]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        ))}
      </motion.div>

      {activeTab === "dashboard" && (
        <motion.div variants={staggerContainer}>
          {/* Stats Cards */}
          <motion.div
            variants={fadeIn}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          >
            <StatsBox
              icon={<FiCalendar />}
              title="Total Appointments"
              value={stats.appointments}
              colorName="blue"
            />
            <StatsBox
              icon={<FiActivity />}
              title="Running Now"
              value={stats.runningNow}
              colorName="green"
            />
            <StatsBox
              icon={<FiCheckCircle />}
              title="Completed Today"
              value={stats.completedToday}
              colorName="teal"
            />
            <StatsBox
              icon={<FiDollarSign />}
              title="Earnings Today"
              value={stats.earningsToday}
              colorName="pink"
            />
            <StatsBox
              icon={<FiUserPlus />}
              title="Total Doctors"
              value={stats.totalDoctors}
              colorName="indigo"
            />
            <StatsBox
              icon={<FiUsers />}
              title="Total Patients"
              value={stats.totalPatients}
              colorName="purple"
            />
            <StatsBox
              icon={<FiClock />}
              title="Scheduled Today"
              value={stats.scheduledToday}
              colorName="teal"
            />
          </motion.div>

          {/* Appointments Section */}
          <motion.div
            variants={cardVariants}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#083567]">
                  Running Now
                </h2>
                <span className="text-sm text-gray-500">
                  {stats.runningNow} active
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border-l-4 border-blue-500 shadow-xs">
                  <p className="font-medium text-gray-800">
                    Sugar Patel - Dr. Priya Sharma
                  </p>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>Started: 2:30 PM</span>
                    <span className="mx-2">•</span>
                    <span>Duration: 15 min</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#083567]">
                  Scheduled Today
                </h2>
                <span className="text-sm text-gray-500">
                  {stats.scheduledToday} appointments
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    patient: "Anita Gupta",
                    doctor: "Dr. Rajesh Kumar",
                    time: "4:00 PM",
                  },
                  {
                    patient: "Ravi Singh",
                    doctor: "Dr. Priya Sharma",
                    time: "5:30 PM",
                  },
                ].map((appt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                  >
                    <p className="font-medium text-gray-800">
                      {appt.patient} - {appt.doctor}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Time: {appt.time}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === "patients" && (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-[#a78bfa] p-6 rounded-xl shadow-sm"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-white">
              Patients Management
            </h2>
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-[#a78bfa]" />
              </div>
              <input
                type="text"
                placeholder="Search patients..."
                className="bg-white pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a78bfa] focus:border-[#9377e6] transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients
                  .filter(
                    (patient) =>
                      patient.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      patient.age.toString().includes(searchTerm) ||
                      patient.appointments.toString().includes(searchTerm)
                  )
                  .map((patient) => (
                    <motion.tr
                      key={patient.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {patient.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {patient.appointments}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {patient.lastVisit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "medicine" && <AdminMedicineStore />}
      {activeTab === "doctors-management" && <DoctorsManagement />}
       {activeTab === "messages" && <AdminMessages />}
    </motion.div>
  );
};

export default AdminDashboard;
