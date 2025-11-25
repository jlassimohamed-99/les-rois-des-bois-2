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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">الطلب</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">#{order._id}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              بتاريخ {new Date(order.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <Link to="/shop/profile" className="text-gold-600 font-semibold">العودة للملف</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {statusSteps.map((step, idx) => {
              const active = statusSteps.indexOf(order.status) >= idx;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      active ? 'bg-gold-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className={`text-sm capitalize ${active ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                    {step}
                  </span>
                  {idx < statusSteps.length - 1 && <div className="w-8 h-px bg-gray-300 dark:bg-gray-700" />}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">التوصيل</h3>
              <p className="text-gray-700 dark:text-gray-300">{order.clientName}</p>
              <p className="text-gray-700 dark:text-gray-300">{order.clientPhone}</p>
              <p className="text-gray-700 dark:text-gray-300">
                {order.clientAddress?.street}, {order.clientAddress?.city} {order.clientAddress?.zip}
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">الدفع</h3>
              <p className="text-gray-700 dark:text-gray-300 capitalize">{order.paymentMethod}</p>
              <p className="text-gray-700 dark:text-gray-300">الإجمالي: {order.total?.toFixed(2)} TND</p>
              <p className="text-gray-700 dark:text-gray-300">الضريبة: {order.tax?.toFixed(2)} TND</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">المنتجات</h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{item.productName}</p>
                    {item.variantA && item.variantB && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.variantA.value} + {item.variantB.value}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Qty: {item.quantity} x {item.unitPrice} TND
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {(item.unitPrice * item.quantity).toFixed(2)} TND
                  </p>
                </div>
              ))}
            </div>
          </div>

          {activities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">المراحل</h3>
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act._id} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-gold-600 mt-2" />
                    <div>
                      <p className="font-semibold capitalize">{act.action}</p>
                      <p>{new Date(act.createdAt).toLocaleString()}</p>
                      {act.notes && <p className="text-gray-500">{act.notes}</p>}
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
