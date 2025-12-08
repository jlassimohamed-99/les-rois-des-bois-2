import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { fadeIn, slideInRight } from '../../utils/animations';
import clientApi from '../../utils/clientAxios';
import { withBase } from '../../utils/imageUrl';

const Hero = () => {
  const [heroImage, setHeroImage] = useState(null);
  const [heroConfig, setHeroConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroConfig = async () => {
      try {
        // Use public API endpoint
        const publicApi = axios.create({ baseURL: '/api' });
        const res = await publicApi.get('/homepage/hero');
        if (res.data.success && res.data.data) {
          const config = res.data.data;
          setHeroConfig(config);
          if (config.hero_image) {
            setHeroImage(withBase(config.hero_image));
          } else {
            // Fallback to product image if no hero image set
            const productRes = await clientApi.get('/products/new?limit=1');
            const product = productRes.data.data?.[0];
            if (product?.images?.[0]) {
              setHeroImage(withBase(product.images[0]));
            }
          }
        }
      } catch (error) {
        // Silently fail and use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchHeroConfig();
  }, []);
  return (
    <section className="relative min-h-[90vh] bg-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 dark:bg-gradient-to-br text-gray-900 dark:text-white overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 -left-1/4 w-1/2 h-full bg-gold-600/5 dark:bg-gold-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-1/4 w-1/2 h-full bg-gold-500/5 dark:bg-gold-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-center lg:text-right"
          >
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.2 }}
            >
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-r from-gold-600 via-gold-500 to-gold-700 dark:from-gold-300 dark:via-gold-400 dark:to-gold-200 bg-clip-text text-transparent">
                  {heroConfig?.hero_title || 'ملوك الخشب'}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="text-xl md:text-2xl text-gray-800 dark:text-gray-300 mt-6 leading-relaxed"
              >
                {heroConfig?.hero_subtitle || 'أثاث فاخر بتصاميم عصرية وجودة عالية'}
              </motion.p>
              {heroConfig?.hero_description && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto lg:mx-0"
                >
                  {heroConfig.hero_description}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {heroConfig?.hero_cta_text && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={heroConfig.hero_cta_link || '/shop/products'}
                    className="group bg-gold-600 hover:bg-gold-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-gold-500/50 hover:shadow-xl hover:shadow-gold-500/60"
                  >
                    {heroConfig.hero_cta_text}
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </Link>
                </motion.div>
              )}
              {heroConfig?.hero_cta2_text && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={heroConfig.hero_cta2_link || '/shop/special-products'}
                    className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 backdrop-blur-sm text-gray-900 dark:text-white border-2 border-gray-300 dark:border-white/30 hover:border-gray-400 dark:hover:border-white/50 px-8 py-4 rounded-xl text-lg font-semibold transition-all inline-flex items-center justify-center gap-2"
                  >
                    {heroConfig.hero_cta2_text}
                    <Sparkles size={20} />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative flex items-center justify-center"
          >
            <motion.div
              className="relative w-full max-w-lg"
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              {/* Main Image Container */}
              <motion.div
                className="relative rounded-3xl overflow-hidden shadow-2xl"
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="aspect-square bg-gradient-to-br from-gold-600/20 to-gold-800/20 backdrop-blur-sm border border-gold-500/30 rounded-3xl overflow-hidden p-8">
                  {heroImage ? (
                    <motion.img
                      src={heroImage}
                      alt="Hero Product"
                      className="w-full h-full object-cover rounded-2xl"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8 }}
                      whileHover={{ scale: 1.05 }}
                    />
                  ) : (
                    <motion.div
                      className="w-full h-full bg-gradient-to-br from-gold-500/30 to-gold-700/30 rounded-2xl flex items-center justify-center"
                      animate={{
                        background: [
                          'linear-gradient(135deg, rgba(217, 119, 6, 0.3), rgba(146, 64, 14, 0.3))',
                          'linear-gradient(135deg, rgba(217, 119, 6, 0.4), rgba(146, 64, 14, 0.4))',
                          'linear-gradient(135deg, rgba(217, 119, 6, 0.3), rgba(146, 64, 14, 0.3))',
                        ],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <Sparkles className="text-gold-400" size={120} />
                    </motion.div>
                  )}
                </div>

                {/* Floating Decorative Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-24 h-24 bg-gold-500/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-32 h-32 bg-gold-600/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

