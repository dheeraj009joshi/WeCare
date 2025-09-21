import { useState, useEffect } from "react";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const DoctorSidebar = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeButton, setActiveButton] = useState("Dashboard");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); // Assuming 1024px as the breakpoint for large screens

  const doctor = state?.doctor || {
    name: "",
    profilePicture: "",
    specializations: "",
    certificates: "",
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
    navigate(`/doctors/pages/${item.toLowerCase()}`, {
      state: { doctor },
    });
    setActiveButton(item);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div>
      {/* Hamburger button - visible only on mobile screens */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="my-8 p-2 text-2xl text-[#084B83] hover:scale-110 transition-transform duration-200"
        >
          <HiMenuAlt3 />
        </button>
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
        className={`lg:static lg:translate-x-0 h-full fixed top-0 left-0 z-50 w-[220px] bg-[#5b21b6] text-white transition-transform duration-300 ${
          isMobile
            ? sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
      >
        <div className="p-5 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">WECURE</h1>
            <span className="text-sm text-gray-300">WELLNESS</span>
          </div>
          {/* Close button - only visible on mobile */}
          {isMobile && (
            <button
              className="text-2xl hover:rotate-90 transition-transform duration-300"
              onClick={() => setSidebarOpen(false)}
            >
              <HiX />
            </button>
          )}
        </div>
        <nav className="px-5 space-y-3 mt-6">
          {["Dashboard", "Appointments", "Earnings", "EditProfile"].map(
            (item) => (
              <button
                onClick={() => handleButtonClick(item)}
                key={item}
                className={`block w-full text-left px-3 py-2 rounded hover:bg-white/10 transition-colors duration-200 ${
                  activeButton === item ? "bg-white/10" : "bg-[#5b21b6]"
                }`}
              >
                {item}
              </button>
            )
          )}
        </nav>
      </aside>
    </div>
  );
};

export default DoctorSidebar;
