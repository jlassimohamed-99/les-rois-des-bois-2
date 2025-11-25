import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { ShoppingCart, Package, TrendingUp, Play, BarChart3 } from 'lucide-react';
import POSInterface from './POSInterface';

const POSDashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayRevenue: 0,
    activeOrders: 0,
  });
  const [showInterface, setShowInterface] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [salesRes, ordersRes] = await Promise.all([
        api.get('/pos/sales', { params: { startDate: today } }).catch(() => ({ data: { data: [] } })),
        api.get('/orders', { params: { status: 'pending,preparing' } }).catch(() => ({ data: { data: [] } })),
      ]);

      const sales = salesRes.data.data || [];
      const orders = ordersRes.data.data || [];

      setStats({
        todaySales: sales.length,
        todayRevenue: sales.reduce((sum, sale) => sum + (sale.total || 0), 0),
        activeOrders: orders.length,
      });
    } catch (error) {
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">مبيعات اليوم</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {stats.todaySales}
              </p>
            </div>
            <ShoppingCart className="text-green-500" size={32} />
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
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">الطلبات الجارية</p>
              <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                {stats.activeOrders}
              </p>
            </div>
            <Package className="text-blue-500" size={32} />
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

