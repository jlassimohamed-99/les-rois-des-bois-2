import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { FileText } from 'lucide-react';

const POList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPurchaseOrders(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">أوامر الشراء</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة أوامر الشراء من الموردين</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
          </div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">لا توجد أوامر شراء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium">رقم الأمر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">المورد</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الإجمالي</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr
                    key={po._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">{po.poNumber}</td>
                    <td className="py-3 px-4">{po.supplierId?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{po.total} TND</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(po.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default POList;

