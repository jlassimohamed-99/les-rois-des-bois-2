import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const POModal = ({ po, onClose }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    supplierId: '',
    items: [{ productId: '', quantity: 1, unitCost: 0 }],
    expectedDeliveryDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    if (po) {
      setFormData({
        supplierId: po.supplierId?._id || po.supplierId || '',
        items: po.items || [{ productId: '', quantity: 1, unitCost: 0 }],
        expectedDeliveryDate: po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toISOString().split('T')[0] : '',
        notes: po.notes || '',
      });
    }
  }, [po]);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الموردين');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المنتجات');
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitCost: 0 }],
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      toast.error('يرجى اختيار مورد');
      return;
    }
    if (formData.items.length === 0 || formData.items.some(item => !item.productId)) {
      toast.error('يرجى إضافة منتجات');
      return;
    }

    try {
      setLoading(true);
      if (po) {
        await api.put(`/purchase-orders/${po._id}`, formData);
        toast.success('تم تحديث أمر الشراء بنجاح');
      } else {
        await api.post('/purchase-orders', formData);
        toast.success('تم إنشاء أمر الشراء بنجاح');
      }
      onClose();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {po ? 'تعديل أمر شراء' : 'إنشاء أمر شراء جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                المورد *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">اختر مورد</option>
                {suppliers.map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تاريخ التسليم المتوقع
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                المنتجات *
              </label>
              <button type="button" onClick={handleAddItem} className="btn-secondary text-sm flex items-center gap-1">
                <Plus size={16} />
                إضافة منتج
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">اختر منتج</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="الكمية"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      placeholder="التكلفة"
                      value={item.unitCost}
                      onChange={(e) => handleItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="input-field"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <span className="input-field flex-1 text-center">
                      {(item.quantity * item.unitCost).toFixed(2)} TND
                    </span>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              إلغاء
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'جاري الحفظ...' : po ? 'تحديث' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POModal;

