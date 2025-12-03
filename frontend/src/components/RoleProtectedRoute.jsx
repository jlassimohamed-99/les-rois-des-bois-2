import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClientAuth } from '../contexts/ClientAuthContext';

const getRedirectPath = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'commercial':
      return '/commercial';
    case 'saler':
    case 'store_cashier':
    case 'cashier':
      return '/pos';
    default:
      return '/shop';
  }
};

const RoleProtectedRoute = ({ children, allowedRoles, blockedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { user: clientUser, loading: clientLoading } = useClientAuth();
  const location = useLocation();

  const effectiveUser = user || clientUser;
  const isLoading = loading || clientLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جار التحميل...</p>
        </div>
      </div>
    );
  }

  if (!effectiveUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Block specific roles
  if (blockedRoles && blockedRoles.length > 0 && blockedRoles.includes(effectiveUser.role)) {
    return <Navigate to={getRedirectPath(effectiveUser.role)} replace />;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(effectiveUser.role)) {
    return <Navigate to={getRedirectPath(effectiveUser.role)} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
