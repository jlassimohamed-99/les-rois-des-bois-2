import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fadeIn } from '../../utils/animations';

const CTA = () => {
  return (
    <section className="relative py-20 bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-200/30 to-gray-100/30 dark:from-gray-800/50 dark:to-gray-600/50"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center space-y-8"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white"
          >
            جاهز لتجربة الفخامة؟
          </motion.h2>
            <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto"
          >
            اكتشف مجموعتنا الكاملة من الأثاث الفاخر واصنع منزلك المثالي
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/shop/products"
                className="group bg-gold-600 text-white hover:bg-gold-700 dark:bg-gold-600 dark:hover:bg-gold-700 px-10 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center gap-2 shadow-lg"
              >
                تصفح المنتجات
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/shop/special-products"
                className="group bg-gray-800 dark:bg-white/10 hover:bg-gray-700 dark:hover:bg-white/20 backdrop-blur-sm text-white border-2 border-gray-700 dark:border-white/30 hover:border-gray-600 dark:hover:border-white/50 px-10 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center gap-2"
              >
                المنتجات المركبة
                <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

