import { useState, useEffect } from "react";
import { HiMenuAlt3, HiX, HiHome, HiCalendar, HiCurrencyDollar, HiUser, HiLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const DoctorSidebar = () => {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const doctor = state?.doctor || {
    name: "",
    profilePicture: "",
    specializations: "",
    certificates: "",
  };

  // Define navigation items with icons and paths
  const navigationItems = [
    {
      name: "Dashboard",
      path: "dashboard",
      icon: HiHome,
      label: "Dashboard"
    },
    {
      name: "Appointments", 
      path: "appointments",
      icon: HiCalendar,
      label: "Appointments"
    },
    {
      name: "Earnings",
      path: "earnings", 
      icon: HiCurrencyDollar,
      label: "Earnings"
    },
    {
      name: "Profile",
      path: "editprofile",
      icon: HiUser,
      label: "Edit Profile"
    }
  ];

  // Get current active path
  const getCurrentPath = () => {
    const path = pathname.split('/').pop();
    return path || 'dashboard';
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar when switching to mobile view if it was open
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleButtonClick = (item) => {
    navigate(`/doctors/pages/${item.path}`, {
      state: { doctor },
    });
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    // Clear doctor data from localStorage
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorData');
    navigate('/doctors/login');
  };

  return (
    <div>
      {/* Hamburger button - visible only on mobile screens */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-gradient-to-r from-[#5b21b6] to-[#1e1b4b] text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <HiMenuAlt3 className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Overlay with transition - only on mobile */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${
            sidebarOpen
              ? "opacity-50 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always visible on large screens, with transition on mobile */}
      <aside
        className={`lg:static lg:translate-x-0 h-screen fixed top-0 left-0 z-50 w-[280px] bg-gradient-to-b from-[#1e1b4b] to-[#5b21b6] text-white transition-transform duration-300 shadow-2xl ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                WECURE
              </h1>
              <span className="text-sm text-blue-200 font-medium">Doctor Portal</span>
            </div>
            {/* Close button - only visible on mobile */}
            {isMobile && (
              <button
                className="text-2xl hover:rotate-90 transition-transform duration-300 p-1 rounded-full hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <HiX />
              </button>
            )}
          </div>
        </div>

        {/* Doctor Profile Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              👨‍⚕️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate">
                {doctor.name || doctor.full_name || 'Dr. Doctor'}
              </h3>
              <p className="text-sm text-blue-200 truncate">
                {doctor.specializations || doctor.specialization || 'Medical Professional'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = getCurrentPath() === item.path || 
                           (getCurrentPath() === '' && item.path === 'dashboard');
            
            return (
              <button
                onClick={() => handleButtonClick(item)}
                key={item.name}
                className={`group flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-white/15 text-white shadow-lg border border-white/20" 
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <IconComponent className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                  isActive ? "text-white" : "text-blue-200 group-hover:text-white"
                }`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-300 shadow-lg"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-4 py-3 text-left rounded-xl transition-all duration-200 text-red-200 hover:bg-red-500/20 hover:text-red-100"
          >
            <HiLogout className="mr-3 h-5 w-5 transition-colors duration-200" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default DoctorSidebar;
