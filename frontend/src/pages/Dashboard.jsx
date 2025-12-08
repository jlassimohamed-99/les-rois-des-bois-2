import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { FolderTree, Package, Boxes, Users, ShoppingCart, FileText, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// Custom Tooltip component that adapts to theme
const CustomTooltip = ({ active, payload, label }) => {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (active && payload && payload.length) {
    return (
      <div
        className={`rounded-lg border p-3 shadow-lg ${
          isDark
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        <p
          className={`mb-2 font-semibold ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className={`text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
            style={{ color: entry.color }}
          >
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Legend for Pie Chart
const CustomPieLegend = ({ stockData }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const total = stockData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="flex justify-center items-center gap-6 mt-4 flex-wrap">
      {stockData.map((item, index) => {
        const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
        return (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span
              className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              {item.name}: {percentage}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    products: 0,
    specialProducts: 0,
    users: 0,
    orders: 0,
    pendingOrders: 0,
    revenue: 0,
    profit: 0,
    creditInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchChartsData();
  }, []);

  const fetchStats = async () => {
    try {
      const [categoriesRes, productsRes, specialProductsRes, ordersRes, invoicesRes, usersRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/special-products'),
        api.get('/orders'),
        api.get('/invoices'),
        api.get('/users').catch(() => ({ data: { data: [] } })),
      ]);

      const orders = ordersRes.data.data || [];
      const invoices = invoicesRes.data.data || [];
      const users = usersRes.data.data || [];

      setStats({
        categories: categoriesRes.data.count || 0,
        products: productsRes.data.count || 0,
        specialProducts: specialProductsRes.data.count || 0,
        users: users.length || 0,
        orders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        revenue: orders.filter((o) => o.status !== 'canceled').reduce((sum, o) => sum + (o.total || 0), 0),
        profit: orders.filter((o) => o.status !== 'canceled').reduce((sum, o) => sum + (o.profit || 0), 0),
        creditInvoices: invoices.filter((i) => i.status === 'partial' || i.status === 'overdue').length,
      });
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'إجمالي الفئات', value: stats.categories, icon: FolderTree, color: 'bg-gold-500' },
    { label: 'إجمالي المنتجات', value: stats.products, icon: Package, color: 'bg-gold-600' },
    { label: 'المنتجات الخاصة', value: stats.specialProducts, icon: Boxes, color: 'bg-gold-500' },
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'bg-gold-500' },
    { label: 'إجمالي الطلبات', value: stats.orders, icon: ShoppingCart, color: 'bg-gold-600' },
    { label: 'الطلبات المعلقة', value: stats.pendingOrders, icon: FileText, color: 'bg-gold-600' },
    { label: 'إجمالي الإيرادات', value: `${stats.revenue.toLocaleString()} TND`, icon: TrendingUp, color: 'bg-gold-500' },
    { label: 'الربح', value: `${stats.profit.toLocaleString()} TND`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'فواتير الائتمان', value: stats.creditInvoices, icon: CreditCard, color: 'bg-gold-700' },
  ];

  const fetchChartsData = async () => {
    try {
      setLoadingCharts(true);
      
      // Get last 6 months data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const [salesRes, topProductsRes, stockDistributionRes, lowStockRes] = await Promise.all([
        api.get('/analytics/sales-over-time', {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            groupBy: 'month',
          },
        }).catch(() => ({ data: { data: [] } })),
        api.get('/analytics/top-products', {
          params: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            limit: 5,
          },
        }).catch(() => ({ data: { data: [] } })),
        api.get('/analytics/stock-distribution').catch(() => ({ data: { data: {} } })),
        api.get('/analytics/low-stock', { params: { threshold: 10 } }).catch(() => ({ data: { data: [] } })),
      ]);

      // Format sales data
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const formattedSalesData = (salesRes.data.data || []).map((item) => {
        // item.date is in format "YYYY-MM" or "YYYY-MM-DD"
        let monthIndex = 0;
        if (item.date) {
          const dateParts = item.date.split('-');
          if (dateParts.length >= 2) {
            monthIndex = parseInt(dateParts[1]) - 1; // Month is 0-indexed
          }
        }
        return {
          month: months[monthIndex] || item.date || 'غير محدد',
          sales: item.sales || 0,
          revenue: item.revenue || 0,
        };
      }).slice(-6); // Get last 6 months
      setSalesData(formattedSalesData);

      // Format top products
      const formattedTopProducts = (topProductsRes.data.data || []).slice(0, 5).map((product) => ({
        name: product.productName?.substring(0, 15) || 'غير محدد',
        sales: product.quantity || 0,
        revenue: product.revenue || 0,
      }));
      setTopProducts(formattedTopProducts);

      // Format stock distribution
      const stockDist = stockDistributionRes.data.data || {};
      const formattedStockData = [
        { name: 'متوفر', value: stockDist.available || 0, color: '#10B981' },
        { name: 'منخفض', value: stockDist.lowStock || 0, color: '#F59E0B' },
        { name: 'نفد', value: stockDist.outOfStock || 0, color: '#EF4444' },
      ];
      setStockData(formattedStockData);

      // Set low stock products
      setLowStockProducts(lowStockRes.data.data || []);
    } catch (error) {
      console.error('Error fetching charts data:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات الرسوم البيانية');
    } finally {
      setLoadingCharts(false);
    }
  };

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

      {/* Low Stock Products Table */}
      {lowStockProducts.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">المنتجات ذات المخزون المنخفض</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    اسم المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    المخزون المتاح
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    الحالة
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {lowStockProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.category?.name || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.stock || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock === 0
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {product.stock === 0 ? 'نفد' : 'منخفض'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">المبيعات الشهرية</h2>
          {loadingCharts ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
            </div>
          ) : salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="month" 
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'}
                />
                <YAxis 
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{
                    color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#111827'
                  }}
                />
                <Line type="monotone" dataKey="sales" stroke="#FFD700" strokeWidth={2} name="عدد المبيعات" />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="الإيرادات (TND)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              لا توجد بيانات متاحة
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">أفضل 5 منتجات</h2>
          {loadingCharts ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
            </div>
          ) : topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="name" 
                  angle={0} 
                  textAnchor="middle" 
                  height={80}
                  tick={{ 
                    fontSize: 12,
                    fill: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                  }}
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'}
                  interval={0}
                />
                <YAxis 
                  stroke={document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#FFD700" name="الكمية المباعة" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              لا توجد بيانات متاحة
            </div>
          )}
        </div>

        {/* Stock Distribution */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">توزيع المخزون</h2>
          {loadingCharts ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
            </div>
          ) : stockData.length > 0 && stockData.some((item) => item.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    fill="#FFD700"
                    dataKey="value"
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <CustomPieLegend stockData={stockData} />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              لا توجد بيانات متاحة
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

