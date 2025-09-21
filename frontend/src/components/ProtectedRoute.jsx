import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading while AuthContext is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    console.log('🔒 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if user has required role (if specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🚫 User role not allowed:', user.role, 'Required:', allowedRoles);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('✅ User authenticated and authorized:', user.role);
  return <Outlet />;
};

// AdminRoute component for admin-only routes
const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    console.log('🚫 User not admin, redirecting to home');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  console.log('✅ Admin user authenticated:', user.role);
  return <Outlet />;
};

export default ProtectedRoute;
export { AdminRoute };