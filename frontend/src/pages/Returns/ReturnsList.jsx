import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { RotateCcw } from 'lucide-react';

const ReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const response = await api.get('/returns');
      setReturns(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المرتجعات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة المرتجعات والاستردادات</p>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
          </div>
        ) : returns.length === 0 ? (
          <div className="text-center py-12">
            <RotateCcw className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">لا توجد مرتجعات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium">رقم الإرجاع</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">رقم الطلب</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">مبلغ الاسترداد</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {returns.map((returnItem) => (
                  <tr
                    key={returnItem._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">{returnItem.returnNumber}</td>
                    <td className="py-3 px-4">{returnItem.orderId?.orderNumber || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {returnItem.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{returnItem.totalRefund} TND</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(returnItem.createdAt).toLocaleDateString('fr-FR')}
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

export default ReturnsList;

