import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import POSDashboard from './POS/POSDashboard';

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

  // If not authenticated or not a cashier, redirect will be handled by POSDashboard
  return <POSDashboard />;
};

export default PosLanding;
