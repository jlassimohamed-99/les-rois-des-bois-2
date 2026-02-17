import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { ShoppingCart, Package, TrendingUp, Play, BarChart3, ArrowLeft, Calendar, Receipt } from 'lucide-react';
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
  const [todayOrders, setTodayOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Protect POS route - redirect if not authenticated or not a cashier
  useEffect(() => {
    // Only redirect after auth has finished loading
    if (!authLoading) {
      const token = localStorage.getItem('token');
      const cashierId = localStorage.getItem('cashierId');
      
      // For cashiers: check cashierId instead of token (they stay logged in)
      if (cashierId && !token) {
        // Cashier is logged in via ID - allow access
        // If we don't have user data yet, it will be fetched by AuthContext
        return;
      }
      
      // If no token and no cashierId and no user, redirect to login
      if (!token && !cashierId && !user) {
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
      } else if (token || cashierId) {
        // We have a token/cashierId but no user - backend might be down
        // Don't redirect to login immediately - keep credentials and stay on POS
        // This allows user to continue working if backend comes back online
        return;
      }
      // If no token/cashierId and no user, redirect will happen above
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
      console.log('🔄 [POS Dashboard] User loaded, fetching data...');
      console.log('👤 [POS Dashboard] User object:', user);
      console.log('🆔 [POS Dashboard] User ID:', user._id || user.id);
      console.log('📧 [POS Dashboard] User email:', user.email);
      console.log('👔 [POS Dashboard] User role:', user.role);
      fetchStats();
      fetchTodayOrders();
    } else if (!authLoading && !user) {
      console.warn('⚠️ [POS Dashboard] No user data after auth loading');
      const token = localStorage.getItem('token');
      const cashierId = localStorage.getItem('cashierId');
      console.log('🔑 [POS Dashboard] Token exists:', !!token);
      console.log('🔑 [POS Dashboard] CashierId exists:', !!cashierId);
    }
  }, [user, authLoading]);

  const fetchStats = async () => {
    try {
      if (!user) {
        console.warn('⚠️ [POS Dashboard] No user data, cannot fetch stats');
        setLoading(false);
        return;
      }

      // Get today's date range (start of day to end of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const todayEndISO = todayEnd.toISOString();

      // Get cashier ID (API returns 'id' not '_id')
      let cashierId = user.id || user._id;
      if (cashierId && typeof cashierId === 'object') {
        cashierId = cashierId.toString();
      }
      if (!cashierId) {
        console.error('❌ [POS Dashboard] No cashier ID found in user object');
        console.error('❌ [POS Dashboard] User object keys:', Object.keys(user));
        console.error('❌ [POS Dashboard] User object:', JSON.stringify(user, null, 2));
        setLoading(false);
        return;
      }

      // Ensure cashierId is a string
      cashierId = String(cashierId);
      console.log('📊 [POS Dashboard] Fetching stats for cashier:', cashierId);
      console.log('📊 [POS Dashboard] Cashier ID type:', typeof cashierId);

      // Fetch POS orders created today by this cashier (all statuses for stats)
      const ordersRes = await api.get('/orders', { 
        params: { 
          source: 'pos',
          startDate: todayStart,
          endDate: todayEndISO,
          cashierId: cashierId
        } 
      }).catch((err) => {
        console.error('❌ [POS Dashboard] Error fetching orders:', err);
        return { data: { data: [] } };
      });

      const orders = ordersRes.data.data || [];
      console.log(`✅ [POS Dashboard] Found ${orders.length} orders for today`);

      // Calculate stats from all orders (not just completed)
      const completedOrders = orders.filter(order => order.status === 'completed');
      
      setStats({
        todaySales: completedOrders.length,
        todayRevenue: completedOrders.reduce((sum, order) => sum + (order.total || 0), 0),
      });
    } catch (error) {
      console.error('❌ [POS Dashboard] Error fetching stats:', error);
      setStats({
        todaySales: 0,
        todayRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayOrders = async () => {
    try {
      setLoadingOrders(true);
      
      if (!user) {
        console.warn('⚠️ [POS Dashboard] No user data, cannot fetch orders');
        setTodayOrders([]);
        setLoadingOrders(false);
        return;
      }

      // Get today's date range (start of day to end of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.toISOString();
      const todayEnd = new Date(today);
      todayEnd.setHours(23, 59, 59, 999);
      const todayEndISO = todayEnd.toISOString();

      // Get cashier ID (API returns 'id' not '_id')
      let cashierId = user.id || user._id;
      if (cashierId && typeof cashierId === 'object') {
        cashierId = cashierId.toString();
      }
      if (!cashierId) {
        console.error('❌ [POS Dashboard] No cashier ID found in user object');
        console.error('❌ [POS Dashboard] User object keys:', Object.keys(user));
        setTodayOrders([]);
        setLoadingOrders(false);
        return;
      }

      // Ensure cashierId is a string
      cashierId = String(cashierId);
      console.log('📋 [POS Dashboard] Fetching orders for cashier:', cashierId);
      console.log('📋 [POS Dashboard] Cashier ID type:', typeof cashierId);

      // Fetch POS orders created today by this cashier
      const ordersRes = await api.get('/orders', { 
        params: { 
          source: 'pos',
          startDate: todayStart,
          endDate: todayEndISO,
          cashierId: cashierId
        } 
      }).catch((err) => {
        console.error('❌ [POS Dashboard] Error fetching orders:', err);
        return { data: { data: [] } };
      });

      const orders = ordersRes.data.data || [];
      console.log(`✅ [POS Dashboard] Found ${orders.length} orders for today`);
      if (orders.length > 0) {
        console.log('📦 [POS Dashboard] Sample order:', {
          _id: orders[0]._id,
          orderNumber: orders[0].orderNumber,
          cashierId: orders[0].cashierId,
          createdAt: orders[0].createdAt,
          total: orders[0].total,
          status: orders[0].status
        });
      }
      
      // Sort by creation date (newest first)
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTodayOrders(orders);
    } catch (error) {
      console.error('❌ [POS Dashboard] Error fetching today orders:', error);
      setTodayOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (showInterface) {
    return <POSInterface />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/pos?view=interface')}
            className="flex-shrink-0 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            title="العودة إلى واجهة البيع"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">واجهة البيع</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">نقاط البيع</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">لوحة تحكم نقاط البيع</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/pos?view=interface')}
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

      {/* Today's Orders Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gold-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              طلبات اليوم
            </h2>
          </div>
          <button
            onClick={fetchTodayOrders}
            className="text-sm text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300"
          >
            تحديث
          </button>
        </div>

        {loadingOrders ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-600 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">جاري التحميل...</p>
          </div>
        ) : todayOrders.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">لا توجد طلبات اليوم</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">رقم الطلب</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">الوقت</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">عدد المنتجات</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">المجموع</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {order.orderNumber || order._id?.slice(-8)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleTimeString('ar-TN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.items?.length || 0}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {order.total?.toFixed(2) || '0.00'} TND
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {order.status === 'completed' ? 'مكتمل' : 
                         order.status === 'pending' ? 'قيد الانتظار' : 
                         order.status || 'غير معروف'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="text-center py-8">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            اضغط على "فتح واجهة البيع" لبدء عملية البيع
          </p>
          <button
            onClick={() => navigate('/pos?view=interface')}
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

