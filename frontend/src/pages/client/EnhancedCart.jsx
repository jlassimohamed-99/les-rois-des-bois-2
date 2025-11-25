import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import Button from '../../components/shared/Button';
import { staggerContainer, fadeIn, slideUp } from '../../utils/animations';

const TAX_RATE = 0.19;

const EnhancedCart = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();

  const subtotal = getCartTotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <motion.header
          initial="hidden"
          animate="visible"
          variants={slideUp}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">السلة</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مشترياتك</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">راجع المنتجات قبل إنهاء الطلب.</p>
          </div>
          <Link
            to="/shop/products"
            className="text-gold-600 hover:text-gold-700 font-semibold transition-colors"
          >
            متابعة التسوق
          </Link>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 text-center"
              >
                <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
                <p className="text-gray-500 dark:text-gray-400 mb-4">السلة فارغة.</p>
                <Link to="/shop/products" className="text-gold-600 font-semibold hover:text-gold-700">
                  تسوق المنتجات
                </Link>
              </motion.div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <AnimatePresence>
                  {cartItems.map((item, idx) => (
                    <motion.div
                      key={`${item.productId}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 flex gap-4 items-center group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <motion.div
                        className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No image
                          </div>
                        )}
                      </motion.div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {item.productType}
                        </p>
                        {item.selectedOptions && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.selectedOptions.optionA?.value} + {item.selectedOptions.optionB?.value}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(idx, item.quantity - 1)}
                              className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Minus size={14} />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="px-3 text-gray-900 dark:text-gray-100 font-medium min-w-[2rem] text-center"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(idx, item.quantity + 1)}
                              className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Plus size={14} />
                            </motion.button>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {(item.price * item.quantity).toFixed(2)} TND
                          </span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(idx)}
                        className="text-red-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4 h-fit sticky top-24"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">ملخص الطلب</h3>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة (19%)</span>
                <span>{tax.toFixed(2)} TND</span>
              </div>
              <div className="flex justify-between font-semibold text-lg text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>الإجمالي</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-gold-600"
                >
                  {total.toFixed(2)} TND
                </motion.span>
              </div>
            </div>
            <Button
              onClick={() => navigate('/shop/checkout')}
              disabled={!cartItems.length}
              className="w-full"
              size="lg"
            >
              المتابعة للدفع
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCart;

