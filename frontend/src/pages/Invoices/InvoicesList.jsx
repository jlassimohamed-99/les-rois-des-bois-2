import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { Receipt, Eye, Download } from 'lucide-react';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await api.get('/invoices', { params });
      setInvoices(response.data.data || []);
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const statusLabels = {
    draft: 'مسودة',
    sent: 'مرسلة',
    paid: 'مدفوعة',
    partial: 'مدفوعة جزئياً',
    overdue: 'متأخرة',
    canceled: 'ملغاة',
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    sent: 'bg-gold-100 text-gold-800',
    paid: 'bg-gold-100 text-gold-800',
    partial: 'bg-gold-100 text-gold-800',
    overdue: 'bg-gold-100 text-gold-800',
    canceled: 'bg-gold-100 text-gold-800',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">الفواتير</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة جميع الفواتير</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input-field"
          >
            <option value="">جميع الحالات</option>
            <option value="draft">مسودة</option>
            <option value="sent">مرسلة</option>
            <option value="paid">مدفوعة</option>
            <option value="partial">مدفوعة جزئياً</option>
            <option value="overdue">متأخرة</option>
          </select>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="input-field"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="input-field"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400">لا توجد فواتير</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-right py-3 px-4 text-sm font-medium">رقم الفاتورة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">العميل</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الإجمالي</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">المدفوع</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">تاريخ الاستحقاق</th>
                  <th className="text-right py-3 px-4 text-sm font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                    <td className="py-3 px-4">{invoice.clientName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[invoice.status]}`}>
                        {statusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{invoice.total} TND</td>
                    <td className="py-3 px-4">{invoice.paidAmount} TND</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/invoices/${invoice._id}`)}
                          className="p-2 text-gold-600 hover:bg-gold-50 rounded-lg"
                        >
                          <Eye size={18} />
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
    </div>
  );
};

export default InvoicesList;

