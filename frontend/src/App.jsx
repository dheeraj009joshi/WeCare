import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AiChatSection from "./components/AiChatSection";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import AppointmentFlow from "./components/AppointmentFlow";
import CallToActionChat from "./components/CallToActionChat";
import Doctors from "./components/Doctors";
import AmbulanceCall from "./components/AmbulanceCall";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import SimpleMedicineStore from "./components/SimpleMedicineStore";

import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";

import { useLocation } from "react-router-dom";
import Services from "./components/Services";
import ScrollToTop from "./components/ScrollToTop";
import DoctorRegistration from "./components/DoctorRegistration";
import DoctorDashboard from "./components/DoctorDashboard";
import EditDoctorProfile from "./components/EditDoctorProfile";
import DoctorEarnings from "./components/DoctorEarnings";
import DoctorAppointment from "./components/DoctorAppointment";
import DoctorPages from "./components/DoctorPages";

import AssistantCharacter from "./components/AssistantCharacter";
import DrLogin from "./components/DrLogin";
import AboutDoctor from "./components/AboutDoctor";
import Support from "./components/Support";
import AboutUs from "./components/AboutUs";
import Blog from "./components/Blog";
import Careers from "./components/Careers";
import CareerPage from "./components/CareerPage";
import Advertisement from "./components/Advertisement";
import { autoLogin } from "./utils/autoLogin";
import FoodDelivery from "./components/FoodDelivery";
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, login } = useAuth();
  const [autoLoginAttempted, setAutoLoginAttempted] = React.useState(false);
  
  // Auto login for development (only if not already authenticated and not attempted)
  React.useEffect(() => {
    if (!isAuthenticated && !autoLoginAttempted) {
      setAutoLoginAttempted(true);
      autoLogin().then((success) => {
        if (success) {
          console.log("Auto login completed");
          // Get the stored user data and update the auth context
          const storedUser = localStorage.getItem('user');
          const storedToken = localStorage.getItem('token');
          if (storedUser && storedToken) {
            try {
              const userData = JSON.parse(storedUser);
              // Create the expected login response format for AuthContext
              const loginData = {
                user: userData,
                token: {
                  access_token: storedToken,
                  token_type: 'bearer',
                  user_type: userData.role || 'user'
                }
              };
              login(loginData);
            } catch (error) {
              console.error("Failed to update auth context after auto login:", error);
            }
          }
        }
      });
    }
  }, [isAuthenticated, autoLoginAttempted, login]);
  const location = useLocation();
  const isService = location.pathname.startsWith("/services");
  const isDoctorRoute = location.pathname.startsWith("/doctors");
  const isChatbot = location.pathname.startsWith("/askai");
  const inEmergency = location.pathname.startsWith("/emergency");
  const ambulanceCalled = location.pathname.startsWith(
    "/emergency/call-ambulance"
  );
  const isVideoChat = location.pathname.startsWith("/emergency-video-chat");
  const isAdminDashboard = location.pathname.startsWith("/admin");
  const isMedicineStore = location.pathname.startsWith("/medicine-store");
  const isProfile = location.pathname === "/profile";
  const isAdmin = location.pathname.startsWith("/system");
  const isMedicine = location.pathname.startsWith("/medicine-store");
  const isFooterPage = location.pathname.startsWith("/direct");
  const isFoodDelivery = location.pathname.startsWith("/food-delivery");
  const yogapage = location.pathname.startsWith("/yoga");
  const isLogin = location.pathname === "/login";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ScrollToTop />
      {!isDoctorRoute && !isLogin && <Navbar />}

<Routes>
        <Route path="/" element={<AiChatSection />} />
        <Route path="/home" element={<AiChatSection />} />
        <Route path="/services" element={<Services />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/askai" element={<ChatBot />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/medicine-store" element={<SimpleMedicineStore />} />

        {/* Appointment Flow - Unified */}
        <Route element={<ProtectedRoute />}>
          <Route path="/appointments" element={<AppointmentFlow />} />
          <Route path="/bookings/:doctorName" element={<AppointmentFlow />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/food-delivery" element={<FoodDelivery />} />
        </Route>

        {/* Emergency */}
        <Route path="/emergency" element={<CallToActionChat />} />
        <Route path="/emergency/call-ambulance" element={<AmbulanceCall />} />

        {/* Static Pages */}
        <Route path="/support" element={<Support />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/:jobTitle" element={<CareerPage />} />
        <Route path="/about-doctor/:doctorId" element={<AboutDoctor />} />
        
        {/* Doctor Routes */}
        <Route path="/doctors/register" element={<DoctorRegistration />} />
        <Route path="/doctors/login" element={<DrLogin />} />
        <Route path="/doctors/pages" element={<DoctorPages />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="editprofile" element={<EditDoctorProfile />} />
          <Route path="earnings" element={<DoctorEarnings />} />
          <Route path="appointments" element={<DoctorAppointment />} />
          <Route path="appointments/:date" element={<DoctorAppointment />} />
        </Route>

        {/* Global catch-all route */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>

<Footer />
      {!isDoctorRoute && !isChatbot && <AssistantCharacter />}
    </div>
  );
}

export default App;
