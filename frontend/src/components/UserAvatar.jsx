import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserAvatar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const getNameInitial = () => {
    if (!user?.name) return 'U';
    const names = user.name.trim().split(' ');
    return names
      .filter(name => name.length > 0)
      .map(name => name[0].toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
            navigate(user?.role === 'admin' ? '/system/admin' : '/patient-profile');
    
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Link 
        to="/login" 
        className="text-white bg-[#3f6c9e] hover:bg-[#083567] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      >
        Login/SignUp
      </Link>
    );
  }

  const initial = getNameInitial();

  return (
    <div className="relative">
      <div 
        className="flex items-center space-x-2 cursor-pointer group"
        onClick={() => setShowDropdown(!showDropdown)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {user?.profilePicture ? (
          <div className="relative">
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-[#083567] transition-all"
            />
            {isHovered && !showDropdown && (
              <div className="absolute -bottom-8 right-0 bg-white text-xs text-[#083567] px-2 py-1 rounded shadow-md whitespace-nowrap">
                {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium transition-all
              ${isHovered ? 'bg-[#3f6c9e] scale-105' : 'bg-[#083567]'}`}
            >
              {initial || 'U'}
            </div>
            {isHovered && !showDropdown && (
              <div className="absolute -bottom-8 right-0 bg-white text-xs text-[#083567] px-2 py-1 rounded shadow-md whitespace-nowrap">
                {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
              </div>
            )}
          </div>
        )}
        
        {user?.name && (
          <span className="hidden md:inline text-[#083567] font-medium group-hover:text-[#3f6c9e] transition-colors">
            {user.name.split(' ')[0]}
          </span>
        )}
      </div>

      {showDropdown && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button
            onClick={handleProfileClick}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f0f7ff] hover:text-[#083567] transition-colors"
          >
            {user.role === 'admin' ? 'Admin Dashboard' : 'My Profile'}
          </button>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f0f7ff] hover:text-[#083567] transition-colors border-t border-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;