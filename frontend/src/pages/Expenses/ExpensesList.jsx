import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { DollarSign, Plus, Edit, Trash2, Search } from 'lucide-react';
import ExpenseModal from './ExpenseModal';

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/expenses', { params });
      setExpenses(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب المصروفات');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      return;
    }

    try {
      await api.delete(`/expenses/${id}`);
      toast.success('تم حذف المصروف بنجاح');
      fetchExpenses();
    } catch (error) {
      const message = error.response?.data?.message || 'حدث خطأ أثناء حذف المصروف';
      toast.error(message);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    fetchExpenses();
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المصروفات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة المصروفات والنفقات</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>إضافة مصروف</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {totalExpenses.toFixed(2)} TND
              </p>
            </div>
            <DollarSign className="text-red-500" size={32} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">عدد المصروفات</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                {expenses.length}
              </p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field"
          >
            <option value="">جميع الفئات</option>
            <option value="مصاريف تشغيلية">مصاريف تشغيلية</option>
            <option value="مصاريف إدارية">مصاريف إدارية</option>
            <option value="مصاريف تسويق">مصاريف تسويق</option>
            <option value="مصاريف صيانة">مصاريف صيانة</option>
            <option value="مصاريف نقل">مصاريف نقل</option>
            <option value="مصاريف أخرى">مصاريف أخرى</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input-field"
            placeholder="من تاريخ"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input-field"
            placeholder="إلى تاريخ"
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">لا توجد مصروفات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium">رقم المصروف</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الفئة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الوصف</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">المبلغ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">التاريخ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4">{expense.expenseNumber}</td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4">{expense.description}</td>
                    <td className="py-3 px-4 font-medium">{expense.amount} TND</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(expense.expenseDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
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
        <ExpenseModal expense={editingExpense} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ExpensesList;

