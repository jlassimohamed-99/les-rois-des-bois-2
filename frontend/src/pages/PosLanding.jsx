import { useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import POSInterface from './POS/POSInterface';
import POSDashboard from './POS/POSDashboard';

const PosLanding = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Allow navigation between /pos and /pos/dashboard
  useEffect(() => {
    if (location.pathname !== '/pos' && !location.pathname.startsWith('/pos/')) {
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
      
      if (!token && !user) {
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

  // Route between POS interface and dashboard
  return (
    <Routes>
      <Route index element={<POSInterface />} />
      <Route path="dashboard" element={<POSDashboard />} />
    </Routes>
  );
};

export default PosLanding;
