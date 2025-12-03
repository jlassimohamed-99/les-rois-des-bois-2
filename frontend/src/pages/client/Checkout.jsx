import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clientApi from '../../utils/clientAxios';
import { useCart } from '../../contexts/CartContext';
import { useClientAuth } from '../../contexts/ClientAuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useClientAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    zip: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/shop/checkout' } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        street: user.addresses?.[0]?.street || '',
        city: user.addresses?.[0]?.city || '',
        zip: user.addresses?.[0]?.zip || '',
      }));
    }
  }, [user]);

  const total = getCartTotal();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cartItems.length) {
      toast.error('Your cart is empty');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          productType: item.productType,
          quantity: item.quantity,
          unitPrice: item.price,
          combinationId: item.combinationId,
          variant: item.variant, // Include variant with image
          productName: item.name,
        })),
        paymentMethod: 'cash',
        discount: 0,
        shippingAddress: {
          fullName: form.fullName,
          street: form.street,
          city: form.city,
          zip: form.zip,
          phone: form.phone,
          email: form.email,
        },
      };

      const res = await clientApi.post('/orders', payload);
      const createdOrder = res.data.data?.order || res.data.data;
      const orderId = createdOrder?._id || createdOrder?.id;
      toast.success('تم إنشاء الطلب بنجاح');
      clearCart();
      navigate(orderId ? `/shop/orders/${orderId}` : '/shop/profile');
    } catch (error) {
      const message = error.response?.data?.message || 'تعذر إنشاء الطلب';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">الدفع</p>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">أكمل طلبك</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">أدخل عنوانك وطريقة الدفع.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">تفاصيل الشحن</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الاسم الكامل</label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الهاتف</label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">المدينة</label>
                  <input
                    required
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">العنوان</label>
                  <input
                    required
                    value={form.street}
                    onChange={(e) => handleChange('street', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الرمز البريدي</label>
                  <input
                    required
                    value={form.zip}
                    onChange={(e) => handleChange('zip', e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">الدفع</h3>
              <p className="text-gray-600 dark:text-gray-400">الدفع عند الاستلام متاح حالياً.</p>
            </div>

            <button
              type="submit"
              disabled={saving || !cartItems.length}
              className="w-full bg-gold-600 text-white py-3 rounded-xl font-semibold hover:bg-gold-700 transition disabled:opacity-50"
            >
              {saving ? 'جار إنشاء الطلب...' : 'تأكيد الطلب'}
            </button>
          </form>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ملخص الطلب</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} TND</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} TND</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
