import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import StockAdjustModal from '../../components/Inventory/StockAdjustModal';
import InventoryLogTable from '../../components/Inventory/InventoryLogTable';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, alertsRes] = await Promise.all([
        api.get('/products'),
        api.get('/inventory/alerts'),
      ]);
      setProducts(productsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  const lowStockProducts = products.filter((p) => (p.stock || 0) <= 10);
  const totalValue = products.reduce((sum, p) => sum + (p.stock || 0) * (p.price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">إدارة المخزون</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة المخزون والتنبيهات</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {products.length}
              </p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">منتجات منخفضة</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                {lowStockProducts.length}
              </p>
            </div>
            <AlertTriangle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي القيمة</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {totalValue.toLocaleString()} TND
              </p>
            </div>
            <TrendingUp className="text-green-500" size={32} />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">تنبيهات نشطة</p>
              <p className="text-2xl font-bold text-gold-600 dark:text-gold-400 mt-2">
                {alerts.length}
              </p>
            </div>
            <AlertTriangle className="text-gold-600" size={32} />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            تنبيهات المخزون المنخفض
          </h2>
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="p-4 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {alert.productId?.name || 'منتج غير معروف'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    المخزون الحالي: {alert.currentStock} | الحد الأدنى: {alert.threshold}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/inventory/alerts/${alert._id}/resolve`);
                      toast.success('تم حل التنبيه');
                      fetchData();
                    } catch (error) {
                      toast.error('حدث خطأ');
                    }
                  }}
                  className="btn-secondary text-sm"
                >
                  حل التنبيه
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">المنتجات</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  المنتج
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  المخزون
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  السعر
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  القيمة
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {product.name}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        (product.stock || 0) <= 10
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : (product.stock || 0) <= 50
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {product.stock || 0} قطعة
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {product.price} TND
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {((product.stock || 0) * (product.price || 0)).toLocaleString()} TND
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleAdjustStock(product)}
                      className="btn-secondary text-sm"
                    >
                      تعديل المخزون
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Logs */}
      <InventoryLogTable />

      {isModalOpen && (
        <StockAdjustModal product={selectedProduct} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default InventoryManagement;

