import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { FolderTree, Package, Boxes, Users, ShoppingCart, FileText, CreditCard, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    specialProducts: 0,
    users: 0,
    orders: 0,
    pendingOrders: 0,
    revenue: 0,
    creditInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, productsRes, specialProductsRes, ordersRes, invoicesRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/special-products'),
        api.get('/orders'),
        api.get('/invoices'),
      ]);

      const orders = ordersRes.data.data || [];
      const invoices = invoicesRes.data.data || [];

      setStats({
        categories: categoriesRes.data.count || 0,
        products: productsRes.data.count || 0,
        specialProducts: specialProductsRes.data.count || 0,
        users: 0, // Placeholder - requires user count endpoint
        orders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
        creditInvoices: invoices.filter((i) => i.status === 'partial' || i.status === 'overdue').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'إجمالي الفئات', value: stats.categories, icon: FolderTree, color: 'bg-blue-500' },
    { label: 'إجمالي المنتجات', value: stats.products, icon: Package, color: 'bg-green-500' },
    { label: 'المنتجات الخاصة', value: stats.specialProducts, icon: Boxes, color: 'bg-purple-500' },
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'bg-yellow-500' },
    { label: 'إجمالي الطلبات', value: stats.orders, icon: ShoppingCart, color: 'bg-indigo-500' },
    { label: 'الطلبات المعلقة', value: stats.pendingOrders, icon: FileText, color: 'bg-gold-600' },
    { label: 'إجمالي الإيرادات', value: `${stats.revenue.toLocaleString()} TND`, icon: TrendingUp, color: 'bg-gold-500' },
    { label: 'فواتير الائتمان', value: stats.creditInvoices, icon: CreditCard, color: 'bg-red-500' },
  ];

  // Dummy chart data
  const salesData = [
    { month: 'يناير', sales: 4000 },
    { month: 'فبراير', sales: 3000 },
    { month: 'مارس', sales: 5000 },
    { month: 'أبريل', sales: 4500 },
    { month: 'مايو', sales: 6000 },
    { month: 'يونيو', sales: 5500 },
  ];

  const topProducts = [
    { name: 'منتج 1', sales: 400 },
    { name: 'منتج 2', sales: 300 },
    { name: 'منتج 3', sales: 200 },
    { name: 'منتج 4', sales: 150 },
    { name: 'منتج 5', sales: 100 },
  ];

  const stockData = [
    { name: 'متوفر', value: 65, color: '#10b981' },
    { name: 'منخفض', value: 25, color: '#c08a25' },
    { name: 'نفد', value: 10, color: '#ef4444' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">لوحة التحكم</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">نظرة عامة على النظام</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">المبيعات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#c08a25" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">أفضل 5 منتجات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#c08a25" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Distribution */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">توزيع المخزون</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

