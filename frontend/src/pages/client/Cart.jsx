import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const total = getCartTotal();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">السلة</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مشترياتك</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">راجع المنتجات قبل إنهاء الطلب.</p>
          </div>
          <Link to="/shop/products" className="text-gold-600 hover:text-gold-700 font-semibold">
            متابعة التسوق
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            {cartItems.length === 0 ? (
              <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                السلة فارغة.{' '}
                <Link to="/shop/products" className="text-gold-600 font-semibold">
                  تسوق المنتجات
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item, idx) => (
                  <div key={`${item.productId}-${item.variant?.value || 'no-variant'}-${idx}`} className="p-4 flex gap-4 items-center">
                    <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.productType}</p>
                        {item.variant && (
                          <p className="text-sm text-gold-600 dark:text-gold-400 font-medium">
                            المتغير: {item.variant.name || item.variant.value}
                            {item.variant.additionalPrice > 0 && (
                              <span className="text-gray-500"> (+{item.variant.additionalPrice} TND)</span>
                            )}
                          </p>
                        )}
                        {item.selectedOptions && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.selectedOptions.optionA?.value} + {item.selectedOptions.optionB?.value}
                          </p>
                        )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <button
                            onClick={() => updateQuantity(idx, item.quantity - 1)}
                            className="px-3 py-2 text-gray-700 dark:text-gray-200"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-gray-900 dark:text-gray-100">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="px-3 py-2 text-gray-700 dark:text-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {(item.price * item.quantity).toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-gold-500 hover:text-gold-600"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ملخص الطلب</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} TND</span>
              </div>
            </div>
            <button
              disabled={!cartItems.length}
              onClick={() => navigate('/shop/checkout')}
              className="w-full bg-gold-600 text-white py-3 rounded-xl font-semibold hover:bg-gold-700 transition disabled:opacity-50"
            >
              المتابعة للدفع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
