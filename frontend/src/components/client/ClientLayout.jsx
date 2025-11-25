import { Link, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShoppingCart, User, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import clientApi from '../../utils/clientAxios';

const ClientLayout = () => {
  const { logout, isAuthenticated, loading } = useClientAuth();
  const { getCartItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [specialCount, setSpecialCount] = useState(0);

  useEffect(() => {
    const fetchSpecialCount = async () => {
      try {
        const res = await clientApi.get('/special-products');
        setSpecialCount(res.data.data?.length || 0);
      } catch {
        setSpecialCount(0);
      }
    };
    fetchSpecialCount();
  }, []);

  const linkClasses =
    'text-gray-700 dark:text-gray-300 hover:text-gold-600 dark:hover:text-gold-400 transition block px-3 py-2 rounded-lg';

  const NavLinks = () => (
    <>
      <Link to="/shop" className={linkClasses}>
        الرئيسية
      </Link>
      <Link to="/shop/categories" className={linkClasses}>
        الفئات
      </Link>
      <Link to="/shop/products" className={linkClasses}>
        المنتجات
      </Link>
      <Link to="/shop/special-products" className={linkClasses}>
        المنتجات المركبة
      </Link>
    </>
  );

  return (
    <>
      {loading && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
      )}
      {!loading && !isAuthenticated && <Navigate to="/login" replace />}
      {!loading && isAuthenticated && (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Navbar */}
      <nav className="hidden md:block bg-white dark:bg-gray-800 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/shop" className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-2xl font-bold text-gold-600">Les Rois Du Bois</span>
            </Link>
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <NavLinks />
              <Link to="/shop/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-gold-600">
                <ShoppingCart size={24} />
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <Link to="/shop/profile" className="text-gray-700 dark:text-gray-300 hover:text-gold-600">
                    <User size={24} />
                  </Link>
                  <button onClick={logout} className="text-gray-700 dark:text-gray-300 hover:text-red-600">
                    <LogOut size={24} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-30">
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">متجرنا</h2>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/shop/cart" className="relative text-gray-700 dark:text-gray-300 hover:text-gold-600">
            <ShoppingCart size={24} />
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-gold-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getCartItemsCount()}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="bg-white dark:bg-gray-800 w-72 p-4 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gold-600">القائمة</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X />
              </button>
            </div>
            <NavLinks />
            <Link
              to="/shop/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-gray-700 dark:text-gray-300 hover:text-gold-600"
            >
              <span>السلة</span>
              {getCartItemsCount() > 0 && (
                <span className="bg-gold-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/shop/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-gray-700 dark:text-gray-300 hover:text-gold-600"
                >
                  الحساب
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-right text-red-600 hover:text-red-700"
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block bg-gold-600 text-white px-4 py-2 rounded-lg text-center"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      <main className="p-4 md:p-8">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Les Rois Du Bois</h3>
              <p className="text-sm">نصنع الأثاث بمواد عالية الجودة مع حرفية دقيقة وتسليم سريع ودفع آمن.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/shop" className="hover:text-gold-400 transition">
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link to="/shop/categories" className="hover:text-gold-400 transition">
                    الفئات
                  </Link>
                </li>
                <li>
                  <Link to="/shop/products" className="hover:text-gold-400 transition">
                    المنتجات
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li>البريد: info@lesroisdubois.tn</li>
                <li>الهاتف: +216 12 345 678</li>
                <li>العنوان: تونس</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Les Rois Du Bois. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
      )}
    </>
  );
};

export default ClientLayout;
