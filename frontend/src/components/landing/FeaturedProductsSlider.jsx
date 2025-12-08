import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react';
import { withBase } from '../../utils/imageUrl';
import EnhancedProductCard from '../client/EnhancedProductCard';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { fadeIn, slideUp } from '../../utils/animations';

const FeaturedProductsSlider = ({ products = [], loading = false, onAddToCart }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const sliderRef = useRef(null);

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) setItemsPerView(4);
      else if (window.innerWidth >= 768) setItemsPerView(3);
      else if (window.innerWidth >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };

    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerView);
  const maxIndex = Math.max(0, (totalPages - 1) * itemsPerView);

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const next = prev + itemsPerView;
      if (next >= products.length) return 0;
      return Math.min(next, maxIndex);
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const prevSlide = prev - itemsPerView;
      if (prevSlide < 0) return maxIndex;
      return Math.max(prevSlide, 0);
    });
  };

  const goToSlide = (pageIndex) => {
    const targetIndex = pageIndex * itemsPerView;
    setCurrentIndex(Math.min(targetIndex, maxIndex));
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <Sparkles className="text-gold-600" size={32} />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">منتجات مميزة</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeIn}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-gold-500 to-gold-600 p-3 rounded-xl shadow-lg">
              <Sparkles className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">منتجات مميزة</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">أحدث الإضافات إلى مجموعتنا</p>
            </div>
          </div>
          <Link
            to="/shop/products?sort=newest"
            className="group flex items-center gap-2 text-gold-600 hover:text-gold-700 font-semibold text-lg transition-all"
          >
            عرض الكل
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </motion.div>

        <div className="relative">
          {/* Slider Container */}
          <div className="overflow-hidden rounded-2xl">
            <motion.div
              ref={sliderRef}
              className="flex"
              animate={{
                x: `-${currentIndex * (100 / itemsPerView)}%`,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="flex-shrink-0 px-3"
                  style={{ width: `${100 / itemsPerView}%` }}
                >
                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={slideUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EnhancedProductCard product={product} index={index} onAdd={onAddToCart} />
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Arrows */}
          {products.length > itemsPerView && (
            <>
              <motion.button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: currentIndex > 0 ? 1.1 : 1 }}
                whileTap={{ scale: currentIndex > 0 ? 0.9 : 1 }}
                aria-label="Previous"
              >
                <ChevronRight size={24} />
              </motion.button>
              <motion.button
                onClick={nextSlide}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-all z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: currentIndex < maxIndex ? 1.1 : 1 }}
                whileTap={{ scale: currentIndex < maxIndex ? 0.9 : 1 }}
                aria-label="Next"
              >
                <ChevronLeft size={24} />
              </motion.button>
            </>
          )}

          {/* Pagination Dots */}
          {products.length > itemsPerView && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, index) => {
                const pageStart = index * itemsPerView;
                const isActive = currentIndex >= pageStart && currentIndex < pageStart + itemsPerView;
                return (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-gold-600 w-8'
                        : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gold-400'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSlider;

