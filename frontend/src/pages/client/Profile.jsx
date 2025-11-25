import { useEffect, useState } from 'react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import clientApi from '../../utils/clientAxios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const tabs = [
  { key: 'account', label: 'معلومات الحساب' },
  { key: 'addresses', label: 'العناوين' },
  { key: 'orders', label: 'طلباتي' },
  { key: 'password', label: 'تغيير كلمة المرور' },
];

const Profile = () => {
  const { user, updateProfile, logout, loading: authLoading } = useClientAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await clientApi.get('/orders');
      setOrders(res.data.data || []);
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const saveProfile = async () => {
    const result = await updateProfile({ name: profileForm.name, phone: profileForm.phone, addresses });
    if (result?.success) {
      toast.success('تم تحديث الملف');
    }
  };

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      { fullName: user?.name || '', street: '', city: '', zip: '', phone: profileForm.phone || '' },
    ]);
  };

  const updateAddress = (index, field, value) => {
    setAddresses((prev) => prev.map((addr, i) => (i === index ? { ...addr, [field]: value } : addr)));
  };

  const removeAddress = (index) => {
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  const changePassword = async () => {
    try {
      await clientApi.put('/auth/change-password', passwordForm);
      toast.success('Password updated');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        Please <Link to="/login" className="text-gold-600 font-semibold">login</Link> to view your profile.
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">حسابي</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مرحباً، {user.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">أدر معلوماتك الشخصية وطلباتك.</p>
            </div>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gold-400"
          >
            تسجيل الخروج
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-semibold ${
                  activeTab === tab.key
                    ? 'text-gold-600 border-b-2 border-gold-600'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'account' && (
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الاسم</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">البريد الإلكتروني</label>
                  <input
                    value={user.email}
                    disabled
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-3 py-2 text-gray-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الهاتف</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 rounded-lg bg-gold-600 text-white font-semibold hover:bg-gold-700 transition"
                >
                  حفظ التغييرات
                </button>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">العناوين</h3>
                  <button
                    onClick={addAddress}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold"
                  >
                    إضافة عنوان
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
                      <input
                        value={addr.fullName}
                        onChange={(e) => updateAddress(idx, 'fullName', e.target.value)}
                        placeholder="الاسم الكامل"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      />
                      <input
                        value={addr.street}
                        onChange={(e) => updateAddress(idx, 'street', e.target.value)}
                        placeholder="الشارع"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      />
                      <input
                        value={addr.city}
                        onChange={(e) => updateAddress(idx, 'city', e.target.value)}
                        placeholder="المدينة"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      />
                      <input
                        value={addr.zip}
                        onChange={(e) => updateAddress(idx, 'zip', e.target.value)}
                        placeholder="الرمز البريدي"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      />
                      <input
                        value={addr.phone}
                        onChange={(e) => updateAddress(idx, 'phone', e.target.value)}
                        placeholder="الهاتف"
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      />
                      <div className="flex justify-between items-center pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={addr.isDefault || false}
                            onChange={(e) => updateAddress(idx, 'isDefault', e.target.checked)}
                          />
                          افتراضي
                        </label>
                        <button onClick={() => removeAddress(idx)} className="text-red-500 text-sm">
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                  {!addresses.length && (
                    <div className="text-gray-500 dark:text-gray-400 text-sm">لا توجد عناوين بعد.</div>
                  )}
                </div>
                <button
                  onClick={saveProfile}
                  className="px-4 py-2 rounded-lg bg-gold-600 text-white font-semibold hover:bg-gold-700 transition"
                >
                  حفظ العناوين
                </button>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                {loadingOrders ? (
                  <p className="text-gray-500 dark:text-gray-400">جار التحميل...</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/shop/orders/${order._id}`}
                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gold-400"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">طلب #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gold-600">{order.total?.toFixed(2)} TND</p>
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize">
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {!orders.length && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">لا توجد طلبات بعد.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">كلمة المرور الحالية</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={changePassword}
                  className="px-4 py-2 rounded-lg bg-gold-600 text-white font-semibold hover:bg-gold-700 transition"
                >
                  تحديث كلمة المرور
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
