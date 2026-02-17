import { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import POSInterface from './POS/POSInterface';
import POSDashboard from './POS/POSDashboard';

const PosLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') || 'interface'; // 'dashboard' or 'interface'

  // Ensure we stay on /pos when refreshing
  useEffect(() => {
    if (location.pathname !== '/pos') {
      navigate('/pos', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Block navigation to /shop - redirect back to /pos
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/shop')) {
        // Prevent going to shop - push /pos to history instead
        window.history.pushState(null, '', '/pos');
        navigate('/pos', { replace: true });
      }
    };

    // Push current route to history to have control
    window.history.pushState(null, '', '/pos');
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or not authorized
  useEffect(() => {
    if (!loading) {
      const token = localStorage.getItem('token');
      const cashierId = localStorage.getItem('cashierId');
      
      // For cashiers: if we have cashierId OR token, allow access (they stay logged in)
      // Don't redirect immediately - wait for AuthContext to fetch user
      if (cashierId || token) {
        // User has credentials - allow access, AuthContext will fetch user data
        // Only redirect if we're absolutely sure there's no way to authenticate
        return;
      }
      
      // Only redirect if we have NO credentials AND NO user
      if (!token && !cashierId && !user) {
        console.log('❌ [POS] No credentials found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      
      // If we have a user, check their role
      if (user) {
        const allowedRoles = ['cashier', 'store_cashier', 'saler', 'admin', 'commercial'];
        if (!allowedRoles.includes(user.role)) {
          if (user.role === 'commercial') {
            navigate('/commercial', { replace: true });
          } else if (user.role === 'client' || user.role === 'user') {
            navigate('/shop', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }
      }
    }
  }, [user, loading, navigate]);

  // If not authenticated or not a cashier, show loading or nothing
  // Don't block rendering if we have credentials but user is still loading
  const token = localStorage.getItem('token');
  const cashierId = localStorage.getItem('cashierId');
  const hasCredentials = token || cashierId;
  
  if (!loading && !hasCredentials && (!user || !['cashier', 'store_cashier', 'saler', 'admin', 'commercial'].includes(user.role))) {
    return null;
  }
  
  // If still loading and we have credentials, show loading
  if (loading && hasCredentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  // Show dashboard or interface based on view parameter
  if (view === 'dashboard') {
    return <POSDashboard />;
  }

  // Default: show POS interface
  return <POSInterface />;
};

export default PosLanding;
