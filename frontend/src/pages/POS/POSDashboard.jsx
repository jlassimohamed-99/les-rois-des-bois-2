import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { ShoppingCart, Package, TrendingUp, Play, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import POSInterface from './POSInterface';

const POSDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayRevenue: 0,
  });
  const [showInterface, setShowInterface] = useState(false);
  const [loading, setLoading] = useState(true);

  // Protect POS route - redirect if not authenticated or not a cashier
  useEffect(() => {
    // Only redirect after auth has finished loading
    if (!authLoading) {
      const token = localStorage.getItem('token');
      
      // If no token at all and no user, redirect to login
      if (!token && !user) {
        navigate('/login', { replace: true });
        return;
      }
      
      // If we have a user, check their role
      if (user) {
        const cashierRoles = ['cashier', 'store_cashier', 'saler', 'admin'];
        if (!cashierRoles.includes(user.role)) {
          // If not a cashier, redirect based on role
          if (user.role === 'client' || user.role === 'user') {
            navigate('/shop', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }
        // If user is a cashier, they're allowed - stay on POS
      } else if (token) {
        // We have a token but no user - backend might be down
        // Don't redirect to login immediately - keep token and stay on POS
        // This allows user to continue working if backend comes back online
        // Only redirect if we're absolutely sure the token is invalid
        return;
      }
      // If no token and no user, redirect will happen above
    }
    // If still loading, don't do anything
  }, [user, authLoading, navigate]);

  // Block browser back button - keep cashiers on POS
  useEffect(() => {
    // Push current route to history to have control
    if (window.location.pathname !== '/pos') {
      window.history.pushState(null, '', '/pos');
    }
    
    const handlePopState = (e) => {
      const currentPath = window.location.pathname;
      // If trying to go back to /shop or any non-POS route, redirect to /pos
      if (!currentPath.startsWith('/pos')) {
        window.history.pushState(null, '', '/pos');
        navigate('/pos', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    if (user && (authLoading === false)) {
      fetchStats();
    }
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      // Get today's date range (start of day to end of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const todayEndISO = todayEnd.toISOString();

      // Fetch POS orders (source: 'pos' and status: 'completed') created today
      const ordersRes = await api.get('/orders', { 
        params: { 
          source: 'pos',
          status: 'completed',
          startDate: todayStart,
          endDate: todayEndISO
        } 
      }).catch(() => ({ data: { data: [] } }));

      const orders = ordersRes.data.data || [];

      setStats({
        todaySales: orders.length,
        todayRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching POS stats:', error);
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  if (showInterface) {
    return <POSInterface />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">نقاط البيع</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">لوحة تحكم نقاط البيع</p>
        </div>
        <button
          onClick={() => setShowInterface(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Play size={20} />
          <span>فتح واجهة البيع</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مبيعات اليوم</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {stats.todaySales}
              </p>
            </div>
            <ShoppingCart className="text-gold-500" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إيرادات اليوم</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {stats.todayRevenue.toFixed(2)} TND
              </p>
            </div>
            <TrendingUp className="text-gold-500" size={32} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-center py-8">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            اضغط على "فتح واجهة البيع" لبدء عملية البيع
          </p>
          <button
            onClick={() => setShowInterface(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Play size={20} />
            <span>فتح واجهة البيع</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSDashboard;

