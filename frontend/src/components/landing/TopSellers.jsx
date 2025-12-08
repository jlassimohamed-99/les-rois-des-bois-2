import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Star, Sparkles } from 'lucide-react';
import SimpleProductCard from './SimpleProductCard';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { fadeIn } from '../../utils/animations';

const TopSellers = ({ products = [], featuredProducts = [], loading = false, onAddToCart }) => {
  // Limit number of products to display
  const MAX_PRODUCTS = 8;

  const renderSlider = (title, icon, list, link, highlightTop = false) => {
    // If loading, show skeleton
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(MAX_PRODUCTS)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-80" />
            ))}
          </div>
        </div>
      );
    }

    // Limit the number of products displayed
    const limitedList = list.slice(0, MAX_PRODUCTS);

    // If no products, show message
    if (!limitedList || limitedList.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
            </div>
            <Link
              to={link}
              className="text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 font-semibold text-sm flex items-center gap-1"
            >
              عرض الكل
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            لا توجد منتجات متاحة حالياً
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
          </div>
          <Link
            to={link}
            className="text-gold-600 hover:text-gold-700 dark:text-gold-400 dark:hover:text-gold-300 font-semibold text-sm flex items-center gap-1"
          >
            عرض الكل
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {limitedList.map((product, idx) => {
            if (!product || !product._id) return null;
            return (
              <div key={`${product._id}-${idx}`} className="relative h-full">
                {highlightTop && idx < 3 && (
                  <div className="absolute -top-2 -right-2 z-30 bg-gold-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xl whitespace-nowrap">
                    <Star className="fill-white" size={14} />
                    <span>الأكثر مبيعاً</span>
                  </div>
                )}
                <SimpleProductCard product={product} onAdd={onAddToCart} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {renderSlider(
          'الأكثر مبيعاً',
          <TrendingUp className="text-gold-600" size={24} />,
          products,
          '/shop/products',
          true
        )}

        {renderSlider(
          'منتجات جديدة',
          <Sparkles className="text-blue-600" size={24} />,
          featuredProducts,
          '/shop/products?sort=newest',
          false
        )}
      </div>
    </section>
  );
};

export default TopSellers;
