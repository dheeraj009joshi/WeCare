import { useAuth } from "../context/AuthContext.jsx";
import log from "../assets/log.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const UserAvatar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const getNameInitial = () => {
    if (!user?.name) return "U";
    const names = user.name.trim().split(" ");
    return names
      .filter((name) => name.length > 0)
      .map((name) => name[0].toUpperCase())
      .join("")
      .slice(0, 2);
  };
  const handleProfileClick = () => {
    if (user?.role === "admin") {
      navigate("/system/admin");
    } else {
      navigate("/profile");
    }
  };

  const initial = getNameInitial();

  if (!user) {
    return (
      <Link to="/login" className="text-white px-4 py-2 rounded-md font-medium">
        Login/SignUp
      </Link>
    );
  }

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer group"
      onClick={handleProfileClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {user?.profilePicture ? (
        <div className="relative">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-[#083567] transition-all ml-4"
          />
          {isHovered && (
            <div className="absolute -bottom-8 right-0 bg-white text-xs text-[#083567] px-2 py-1 rounded shadow-md whitespace-nowrap">
              View Profile
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div
            className={`ml-4 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium transition-all
            ${isHovered ? "bg-[#3f6c9e] scale-105" : "bg-[#083567]"}`}
          >
            {initial || "U"}
          </div>
          {isHovered && (
            <div className="absolute -bottom-8 right-0 bg-white text-xs text-[#083567] px-2 py-1 rounded shadow-md whitespace-nowrap ">
              {user.role === "admin" ? "Admin Dashboard" : "View Profile"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const isEmergency = location.pathname.startsWith("/emergency");
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  if (
    location.pathname === "/profile" ||
    location.pathname === "/system/admin"
  ) {
    return null;
  }

  return (
    <header className="shadow-md shadow-cyan-800 rounded-lg">
      {/* Desktop Navigation */}
      <nav className="nav-links desktop-nav">
        <Link to="/home">Home</Link>
        <Link to="/services">Services</Link>
        <Link to="/doctors">For Doctors</Link>
      </nav>

      {/* Logo */}
      <div className="logo">
        <Link to="/home">
          <img src={log} alt="We Cure Consultancy Logo" />
        </Link>
      </div>

      {/* Auth Buttons */}
      <div className="auth-buttons desktop-auth">
        <Link to="/medicine-store">Medicine Store</Link>
        {isAuthenticated && isEmergency && (
          <Link to="/emergency/tracker">Track Ambulance</Link>
        )}
        <Link to="/askai">Ask our AI</Link>

        {isAuthenticated ? <UserAvatar /> : <Link to="/login">Login/SignUp</Link>}
      </div>
      {/* Mobile Header */}
      <div className="mobile-header">
        {isAuthenticated ? (
          <UserAvatar />
        ) : (
          <div className="nav-links">
            <Link to="/login" className="text-[#083567]">
              Login/SignUp
            </Link>
          </div>
        )}

        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <nav className="nav-links">
            <div>
              <Link to="/home" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </div>
            <div>
              <Link to="/services" onClick={() => setMenuOpen(false)}>
                Services
              </Link>
            </div>
            <div>
              <Link to="/doctors" onClick={() => setMenuOpen(false)}>
                For Doctors
              </Link>
            </div>
          </nav>
          <div className="auth-buttons">
            <div>
              <Link to="/medicine-store">Medicine Store</Link>
            </div>
            {isAuthenticated && isEmergency && (
              <div>
                <Link
                  to="/emergency/tracker"
                  onClick={() => setMenuOpen(false)}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Track Ambulance
                </Link>
              </div>
            )}
            <div>
              <Link to="/askai" onClick={() => setMenuOpen(false)}>
                Ask our AI
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
