import { useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const StockAdjustModal = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    reason: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.quantity || !formData.reason) {
      toast.error('يرجى إدخال الكمية والسبب');
      return;
    }

    try {
      setLoading(true);
      await api.post('/inventory/adjust', {
        productId: product._id,
        productType: 'regular',
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        notes: formData.notes,
      });
      toast.success('تم تعديل المخزون بنجاح');
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            تعديل المخزون
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المنتج
            </label>
            <input
              type="text"
              value={product?.name || ''}
              disabled
              className="input-field bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              المخزون الحالي
            </label>
            <input
              type="text"
              value={product?.stock || 0}
              disabled
              className="input-field bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الكمية (موجب للزيادة، سالب للنقصان) *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="input-field"
              required
              placeholder="مثال: +10 أو -5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              السبب *
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="input-field"
              required
            >
              <option value="">اختر السبب</option>
              <option value="purchase">شراء</option>
              <option value="sale">بيع</option>
              <option value="return">إرجاع</option>
              <option value="adjustment">تعديل يدوي</option>
              <option value="damage">تلف</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ملاحظات
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows="3"
            />
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustModal;

