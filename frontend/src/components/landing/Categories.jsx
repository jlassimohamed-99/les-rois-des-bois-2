import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { withBase } from '../../utils/imageUrl';
import LoadingSkeleton from '../shared/LoadingSkeleton';
import { fadeIn, staggerContainer, hoverLift } from '../../utils/animations';

const Categories = ({ categories = [], loading = false }) => {
  if (loading) {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">الفئات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" className="h-40" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">استكشف الفئات</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">اختر الفئة التي تناسب احتياجاتك</p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {categories.slice(0, 12).map((category, index) => (
            <motion.div
              key={category._id}
              variants={fadeIn}
              whileHover={hoverLift}
              className="group"
            >
              <Link
                to={`/shop/categories/${category._id}`}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 text-center hover:from-gold-50 hover:to-gold-100 dark:hover:from-gold-900/20 dark:hover:to-gold-800/20 transition-all duration-300 block shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-600 hover:border-gold-300 dark:hover:border-gold-600"
              >
                {category.image ? (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-lg">
                    <motion.img
                      src={withBase(category.image)}
                      alt={category.name}
                      className="w-full h-full object-contain"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-2xl shadow-lg"></div>
                )}
                <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-gold-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Categories;

