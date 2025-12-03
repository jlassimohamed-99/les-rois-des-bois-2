import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FileText, Plus, Edit, Eye, CheckCircle } from 'lucide-react';
import POModal from './POModal';

const POList = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setPurchaseOrders(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب أوامر الشراء');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/purchase-orders/${id}/status`, { status: newStatus });
      toast.success('تم تحديث الحالة بنجاح');
      fetchPOs();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const handleEdit = (po) => {
    setEditingPO(po);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPO(null);
    fetchPOs();
  };

  const statusLabels = {
    draft: 'مسودة',
    sent: 'مرسل',
    received: 'مستلم',
    completed: 'مكتمل',
    canceled: 'ملغي',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-gold-100 text-gold-800',
    received: 'bg-gold-100 text-gold-800',
    completed: 'bg-gold-100 text-gold-800',
    canceled: 'bg-gold-100 text-gold-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">أوامر الشراء</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة أوامر الشراء من الموردين</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إنشاء أمر شراء</span>
        </button>
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
                  <th className="text-right py-3 px-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr
                    key={po._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 font-medium">{po.poNumber}</td>
                    <td className="py-3 px-4">{po.supplierId?.name || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[po.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[po.status] || po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">{po.total?.toFixed(2)} TND</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(po.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(po)}
                          className="p-2 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded-lg"
                        >
                          <Edit size={18} />
                        </button>
                        {po.status === 'sent' && (
                          <button
                            onClick={() => handleStatusUpdate(po._id, 'received')}
                            className="p-2 text-gold-600 hover:bg-gold-50 dark:hover:bg-gold-900/20 rounded-lg"
                            title="تم الاستلام"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <POModal po={editingPO} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default POList;

