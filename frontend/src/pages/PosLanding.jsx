import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import POSInterface from './POS/POSInterface';

const PosLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      
      // For cashiers: check cashierId instead of token (they stay logged in)
      if (cashierId && !token) {
        // Cashier is logged in via ID - allow access
        // If we don't have user data yet, it will be fetched by AuthContext
        return;
      }
      
      if (!token && !cashierId && !user) {
        navigate('/login', { replace: true });
        return;
      }
      
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

  // If not authenticated or not a cashier, don't render
  if (!loading && (!user || !['cashier', 'store_cashier', 'saler', 'admin', 'commercial'].includes(user.role))) {
    return null;
  }

  // Directly show POS interface (no dashboard)
  return <POSInterface />;
};

export default PosLanding;
