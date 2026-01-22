import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import clientApi from '../../utils/clientAxios';

const statusSteps = ['pending', 'preparing', 'ready', 'delivered', 'completed', 'canceled'];

const OrderDetailClient = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get(`/orders/${id}`);
        setOrder(res.data.data?.order || res.data.data);
        setActivities(res.data.data?.activities || []);
      } catch (error) {
        console.error('Failed to load order', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading order...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Order not found. <Link to="/profile" className="text-gold-600 font-semibold">Back to profile</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 space-y-4 sm:space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm uppercase tracking-wide text-gold-600 font-semibold">الطلب</p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 break-words">
              #{order._id}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              بتاريخ {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Link 
            to="/shop/profile" 
            className="text-sm sm:text-base text-gold-600 font-semibold hover:underline whitespace-nowrap"
          >
            العودة للملف
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-max sm:min-w-0">
              {statusSteps.map((step, idx) => {
                const active = statusSteps.indexOf(order.status) >= idx;
                return (
                  <div key={step} className="flex items-center gap-1.5 sm:gap-2">
                    <div
                      className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm flex-shrink-0 ${
                        active ? 'bg-gold-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className={`text-xs sm:text-sm capitalize whitespace-nowrap ${active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                      {step}
                    </span>
                    {idx < statusSteps.length - 1 && (
                      <div className="w-4 sm:w-6 md:w-8 h-px bg-gray-300 dark:bg-gray-700 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">التوصيل</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                {order.clientName}
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                {order.clientPhone}
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                {order.clientAddress?.street}, {order.clientAddress?.city} {order.clientAddress?.zip}
              </p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">الدفع</h3>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 capitalize">
                {order.paymentMethod}
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                الإجمالي: {order.total?.toFixed(2)} TND
              </p>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                الضريبة: {order.tax?.toFixed(2)} TND
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              المنتجات
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item, idx) => (
                <div 
                  key={idx} 
                  className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
                      {item.productName}
                    </p>
                    {item.variantA && item.variantB && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {item.variantA.value} + {item.variantB.value}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Qty: {item.quantity} x {item.unitPrice} TND
                    </p>
                  </div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-nowrap sm:ml-4">
                    {(item.unitPrice * item.quantity).toFixed(2)} TND
                  </p>
                </div>
              ))}
            </div>
          </div>

          {activities.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                المراحل
              </h3>
              <div className="space-y-3">
                {activities.map((act) => (
                  <div 
                    key={act._id} 
                    className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300"
                  >
                    <div className="w-2 h-2 rounded-full bg-gold-600 mt-1.5 sm:mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold capitalize break-words">{act.action}</p>
                      <p className="break-words">{new Date(act.createdAt).toLocaleString()}</p>
                      {act.notes && (
                        <p className="text-gray-500 text-xs sm:text-sm break-words mt-1">{act.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailClient;
