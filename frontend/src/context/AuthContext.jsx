import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = (userData) => {
    console.log('🔐 Login function called with:', userData);
    
    // Ensure we have the essential data
    if (!userData || !userData.token) {
      console.error('❌ Invalid login data - missing token');
      return;
    }

    // Normalize user data structure
    const userWithRole = {
      id: userData.id || userData._id,
      name: userData.name || userData.username || 'User',
      email: userData.email,
      role: userData.role || 'patient',
      token: userData.token,
      // Preserve any other user properties
      ...userData
    };

    console.log('👤 Normalized user with role:', userWithRole);
    
    // Validate essential fields
    if (!userWithRole.id || !userWithRole.name) {
      console.error('❌ Missing essential user data after normalization');
      return;
    }
    
    setUser(userWithRole);
    localStorage.setItem('user', JSON.stringify(userWithRole));
    localStorage.setItem('userId', userWithRole.id.toString());
    localStorage.setItem('token', userData.token);
    localStorage.setItem('loginTime', Date.now().toString());
    console.log('✅ User logged in and stored in localStorage');
    console.log('📦 Stored data:', {
      user: !!localStorage.getItem('user'),
      userId: !!localStorage.getItem('userId'),
      token: !!localStorage.getItem('token'),
      loginTime: !!localStorage.getItem('loginTime')
    });
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logout function called');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
    console.log('✅ User logged out and localStorage cleared');
    console.log('📦 Stored data after logout:', {
      user: !!localStorage.getItem('user'),
      userId: !!localStorage.getItem('userId'),
      token: !!localStorage.getItem('token'),
      loginTime: !!localStorage.getItem('loginTime')
    });
  };

  // Simple session restoration
  const restoreSession = () => {
    try {
      console.log('🔍 Restoring session...');
      
      // Debug: Check all localStorage contents
      console.log('🔍 All localStorage contents:');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`  ${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`);
      }
      
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      console.log('📦 Stored data:', { 
        hasUser: !!storedUser, 
        hasToken: !!storedToken,
        userLength: storedUser ? storedUser.length : 0,
        tokenLength: storedToken ? storedToken.length : 0
      });

      if (!storedUser || !storedToken) {
        console.log('❌ No stored user or token found');
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      console.log('👤 Parsed user:', { 
        id: parsedUser.id || parsedUser._id, 
        name: parsedUser.name, 
        role: parsedUser.role,
        hasId: !!(parsedUser.id || parsedUser._id),
        hasName: !!parsedUser.name
      });
      
      // Basic validation
      if (parsedUser && (parsedUser.id || parsedUser._id) && parsedUser.name) {
        // Normalize the user ID field
        const normalizedUser = {
          ...parsedUser,
          id: parsedUser.id || parsedUser._id
        };
        
        // If no role is specified, default to 'patient'
        if (!normalizedUser.role) {
          normalizedUser.role = 'patient';
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          console.log('🔄 Added default role "patient" to user');
        }
        
        // Ensure userId is also stored separately
        localStorage.setItem('userId', normalizedUser.id.toString());
        
        console.log('✅ Setting user state with:', normalizedUser);
        setUser(normalizedUser);
        console.log('✅ Session restored successfully');
      } else {
        console.log('❌ Invalid user data, clearing session');
        console.log('❌ Validation failed:', {
          hasUser: !!parsedUser,
          hasId: !!(parsedUser.id || parsedUser._id),
          hasName: !!parsedUser.name
        });
        logout();
      }
    } catch (error) {
      console.error('❌ Failed to restore session:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Check existing session on load
  useEffect(() => {
    console.log('🔄 AuthContext initializing...');
    restoreSession();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAdmin: user?.role === 'admin',
      isPatient: user?.role === 'patient',
      isDoctor: user?.role === 'doctor',
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;