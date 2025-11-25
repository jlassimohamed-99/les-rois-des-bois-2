import { Outlet, Navigate } from 'react-router-dom';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import EnhancedHeader from './EnhancedHeader';
import AnimatedPage from '../shared/AnimatedPage';

const ClientLayout = () => {
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <EnhancedHeader />
      
      <main className="pt-20 lg:pt-24">
        <AnimatedPage>
          <Outlet />
        </AnimatedPage>
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
                  <a href="/shop" className="hover:text-gold-400 transition">
                    الرئيسية
                  </a>
                </li>
                <li>
                  <a href="/shop/categories" className="hover:text-gold-400 transition">
                    الفئات
                  </a>
                </li>
                <li>
                  <a href="/shop/products" className="hover:text-gold-400 transition">
                    المنتجات
                  </a>
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
  );
};

export default ClientLayout;
