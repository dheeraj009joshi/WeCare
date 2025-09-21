import React from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AiChatSection from "./components/AiChatSection";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import BookingForm from "./components/BookingForm";
import CallToActionChat from "./components/CallToActionChat";
import Doctors from "./components/Doctors";
import AmbulanceCall from "./components/AmbulanceCall";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import MedicineStore from "./components/MedicineStore";
import SimpleMedicineStore from "./components/SimpleMedicineStore";
import AdminDashboard from "./components/AdminDashboard";
import AdminMedicineStore from "./components/AdminMedicineStore";
import DoctorsManagement from "./components/DoctorsManagement";

import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ProfilePage from "./components/ProfilePage";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";

import { useLocation } from "react-router-dom";
import Services from "./components/Services";
import ScrollToTop from "./components/ScrollToTop";
import DoctorRegistration from "./components/DoctorRegistration";
import DoctorDashboard from "./components/DoctorDashboard";
import EditDoctorProfile from "./components/EditDoctorProfile";
import DoctorEarnings from "./components/DoctorEarnings";
import DoctorAppointment from "./components/DoctorAppointment";
import AppointmentList from "./components/AppointmentList";
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
import EmergencyDashboard from "./components/EmergencyDashboard";
import EmergencyRequestForm from "./components/EmergencyRequestForm";
import EmergencyContactForm from "./components/EmergencyContactForm";
import EmergencyTestPage from "./components/EmergencyTestPage";
import AmbulanceTracker from "./components/AmbulanceTracker";
import EmergencyStatusBanner from "./components/EmergencyStatusBanner";
import EmergencyChat from "./components/EmergencyChat";
import DoctorEmergencyChat from "./components/DoctorEmergencyChat";
import EmergencyVideoChat from "./components/EmergencyVideoChat";
import DoctorEmergencyVideoChat from "./components/DoctorEmergencyVideoChat";
import EmergencyVideoChatForm from "./components/EmergencyVideoChatForm";
import { autoLogin, isLoggedIn } from "./utils/autoLogin";
import FoodDelivery from "./components/FoodDelivery";
import EmailDemoPage from "./components/EmailDemoPage";

function App() {
  // Auto login for development (only if not already logged in)
  // Disabled for now to prevent CORS issues
  // React.useEffect(() => {
  //   if (!isLoggedIn()) {
  //     autoLogin().then((success) => {
  //       if (success) {
  //         console.log("Auto login completed");
  //         window.location.reload(); // Refresh to apply the token
  //       }
  //     });
  //   }
  // }, []);
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
      {/* Emergency Status Banner */}
      <EmergencyStatusBanner />

      {/* Animated Background for Home Page */}
      <div className="animated-theme-bg">
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-circle"></div>
        <div className="bg-grid"></div>
      </div>
      <ScrollToTop />
      {!isDoctorRoute &&
        !isVideoChat &&
        !isAdmin &&
        !isMedicine &&
        !isFooterPage &&
        !isFoodDelivery &&
        !isLogin && <Navbar />}

      <Routes>
        <Route path="/" element={<AiChatSection />} />
        <Route path="/home" element={<AiChatSection />} />
        <Route path="/bookings/:doctorName" element={<BookingForm />} />
        <Route path="/services" element={<Services />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/askai" element={<ChatBot />} />
        <Route path="/new-chat" element={<ChatBot isNewChat={true} />} />
        <Route path="/yoga" element={<ChatBot initialPanel="yoga" />} />
        <Route
          path="/meditation"
          element={<ChatBot initialPanel="meditation" />}
        />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/food-delivery" element={<FoodDelivery />} />
        </Route>
        {/* Hidden Admin Routes - Using unusual path */}
        <Route element={<AdminRoute />}>
          <Route path="/system/admin" element={<AdminDashboard />} />
          <Route
            path="/system/admin/medicine"
            element={<AdminMedicineStore />}
          />
          <Route path="/system/admin/doctors" element={<DoctorsManagement />} />
        </Route>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/emergency" element={<CallToActionChat />} />
        <Route path="/emergency/call-ambulance" element={<AmbulanceCall />} />
        <Route path="/medicine-store" element={<SimpleMedicineStore />} />

        {/* Emergency Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/emergency/dashboard" element={<EmergencyDashboard />} />
          <Route path="/emergency/create" element={<EmergencyRequestForm />} />
          <Route
            path="/emergency/contacts/add"
            element={<EmergencyContactForm />}
          />
          <Route
            path="/emergency/contacts/edit/:id"
            element={<EmergencyContactForm />}
          />
          <Route path="/emergency/tracker" element={<AmbulanceTracker />} />
          <Route
            path="/emergency-chat/:sessionId"
            element={<EmergencyChat />}
          />
          <Route
            path="/emergency-video-chat/:sessionId"
            element={<EmergencyVideoChat />}
          />
          <Route
            path="/emergency/video-chat"
            element={<EmergencyVideoChatForm />}
          />
        </Route>
        <Route path="/emergency/test" element={<EmergencyTestPage />} />

        {/* Email Testing Routes */}
        <Route path="/email-test" element={<EmailDemoPage />} />

        {/* Doctor Emergency Chat Routes */}
        <Route
          path="/doctor/emergency-chat"
          element={<DoctorEmergencyChat />}
        />
        <Route
          path="/doctor/emergency-video-chat"
          element={<DoctorEmergencyVideoChat />}
        />

        {/* Support and About Routes */}
        <Route path="/direct/24/7support" element={<Support />} />
        <Route path="/direct/aboutus" element={<AboutUs />} />
        <Route path="/direct/services" element={<Services />} />
        <Route path="/direct/blog" element={<Blog />} />
        <Route path="/direct/careers" element={<Careers />} />
        <Route path="/direct/apply/:jobTitle" element={<CareerPage />} />
        <Route path="/direct/advertisement" element={<Advertisement />} />
        <Route path="/direct/doctors" element={<Doctors />} />
        <Route path="/about-doctor" element={<AboutDoctor />} />
        <Route path="/about-doctor/:doctorId" element={<AboutDoctor />} />
        <Route path="/doctors/register" element={<DoctorRegistration />} />
        <Route path="/doctors/login" element={<DrLogin />} />

        {/* New doctor routes */}
        <Route path="/doctors/pages" element={<DoctorPages />}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="editprofile" element={<EditDoctorProfile />} />
          <Route path="earnings" element={<DoctorEarnings />} />
          <Route path="appointments">
            <Route index element={<DoctorAppointment />} />
            <Route path=":date" element={<AppointmentList />} />
          </Route>
          <Route index element={<DoctorDashboard />} />
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

      {!isChatbot && !isVideoChat && !isAdmin && <Footer />}
      {!isDoctorRoute &&
        !isChatbot &&
        !inEmergency &&
        !ambulanceCalled &&
        !isAdminDashboard &&
        !isMedicineStore &&
        !isService &&
        !isProfile &&
        !isAdmin &&
        !isFoodDelivery &&
        !yogapage && <AssistantCharacter />}
    </div>
  );
}

export default App;
