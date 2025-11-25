import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ExpenseModal = ({ expense, onClose }) => {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    supplierId: '',
    reference: '',
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    if (expense) {
      setFormData({
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount || '',
        expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: expense.paymentMethod || 'cash',
        supplierId: expense.supplierId?._id || expense.supplierId || '',
        reference: expense.reference || '',
      });
    }
  }, [expense]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (expense) {
        await api.put(`/expenses/${expense._id}`, formData);
        toast.success('تم تحديث المصروف بنجاح');
      } else {
        await api.post('/expenses', formData);
        toast.success('تم إضافة المصروف بنجاح');
      }
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = [
    'مصاريف تشغيلية',
    'مصاريف إدارية',
    'مصاريف تسويق',
    'مصاريف صيانة',
    'مصاريف نقل',
    'مصاريف أخرى',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {expense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الفئة *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">اختر الفئة</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المبلغ (TND) *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تاريخ المصروف *
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                طريقة الدفع
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
              >
                <option value="cash">نقدي</option>
                <option value="card">بطاقة</option>
                <option value="bank_transfer">تحويل بنكي</option>
                <option value="check">شيك</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المورد (اختياري)
              </label>
              <select
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">لا يوجد</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المرجع (اختياري)
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="رقم الفاتورة أو المرجع"
                className="input-field"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الوصف *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
                className="input-field"
                placeholder="وصف المصروف..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              إلغاء
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : expense ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;

