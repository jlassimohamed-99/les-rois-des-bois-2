import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { DollarSign } from 'lucide-react';

const ExpensesList = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get('/expenses');
      setExpenses(response.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">المصروفات</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة المصروفات والنفقات</p>
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

export default ExpensesList;

