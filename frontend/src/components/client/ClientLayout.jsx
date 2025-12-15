import { Outlet, Navigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useAuth } from '../../contexts/AuthContext';
import EnhancedHeader from './EnhancedHeader';
import AnimatedPage from '../shared/AnimatedPage';
import Logo from '../shared/Logo';

const ClientLayout = () => {
  const { isAuthenticated, loading: clientLoading, user: clientUser } = useClientAuth();
  const { user: adminUser, loading: adminLoading } = useAuth();
  
  const user = adminUser || clientUser;
  const loading = clientLoading || adminLoading;
  
  // Block cashiers from accessing e-commerce
  const cashierRoles = ['cashier', 'store_cashier', 'saler'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect cashiers to POS
  if (user && cashierRoles.includes(user.role)) {
    return <Navigate to="/pos" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedHeader />
      
      <main className="pt-20 lg:pt-24">
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mt-auto border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Logo size="md" to="/shop" clickable={true} className="flex-shrink-0" />
                <h3 className="text-base md:text-lg font-bold text-gold-600 dark:text-gold-500">Les Rois Du Bois</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">نصنع الأثاث بمواد عالية الجودة مع حرفية دقيقة وتسليم سريع ودفع آمن.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/shop" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition">
                    الرئيسية
                  </a>
                </li>
                <li>
                  <a href="/shop/categories" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition">
                    الفئات
                  </a>
                </li>
                <li>
                  <a href="/shop/products" className="text-gray-600 dark:text-gray-400 hover:text-gold-600 dark:hover:text-gold-500 transition">
                    المنتجات
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>البريد: info@lesroisdubois.tn</li>
                <li>الهاتف: +216 12 345 678</li>
                <li>العنوان: تونس</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm">
            <p className="text-gold-600 dark:text-gold-500">&copy; {new Date().getFullYear()} Les Rois Du Bois. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout;
