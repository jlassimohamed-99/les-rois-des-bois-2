import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import clientApi from '../../utils/clientAxios';
import { ShoppingBag, Award, Truck, Shield, ArrowLeft } from 'lucide-react';
import { withBase } from '../../utils/imageUrl';
import LoadingSkeleton from '../../components/shared/LoadingSkeleton';
import EnhancedProductCard from '../../components/client/EnhancedProductCard';
import { fadeIn, slideUp, staggerContainer } from '../../utils/animations';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        clientApi.get('/products?limit=6'),
        clientApi.get('/categories'),
      ]);
      setFeaturedProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Check stock availability
    const availableStock = product.selectedVariant && product.selectedVariant.stock !== undefined
      ? product.selectedVariant.stock
      : product.stock || 0;
    
    if (availableStock <= 0) {
      toast.error('المنتج غير متوفر في المخزون');
      return;
    }
    
    const variantPrice = product.selectedVariant?.additionalPrice || 0;
    const finalPrice = product.variantPrice || (product.price + variantPrice);
    const displayImage = product.displayImage || product.images?.[0];
    const quantity = Math.min(product.quantity || 1, availableStock);
    
    if ((product.quantity || 1) > availableStock) {
      toast.warning(`الكمية المتاحة فقط: ${availableStock}. سيتم إضافة ${availableStock} فقط`);
    }
    
    addToCart({
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: finalPrice,
      image: withBase(displayImage),
      quantity: quantity,
      stock: availableStock,
      variant: product.selectedVariant ? {
        name: product.selectedVariant.name,
        value: product.selectedVariant.value,
        image: product.selectedVariant.image,
        stock: product.selectedVariant.stock,
      } : undefined,
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <div>
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold"
            >
              ملوك الخشب
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300"
            >
              أثاث فاخر بتصاميم عصرية وجودة عالية
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop/products"
                  className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition inline-block"
                >
                  تسوق المنتجات
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/shop/categories"
                  className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition inline-block"
                >
                  استكشف الفئات
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="py-16 bg-white dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
          >
            لماذا تختارنا؟
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Award, title: 'مواد فاخرة', desc: 'اختيار دقيق لأفضل الأخشاب' },
              { icon: ShoppingBag, title: 'تصاميم حديثة', desc: 'ستايل معاصر يناسب منزلك' },
              { icon: Truck, title: 'توصيل سريع', desc: 'خدمة تسليم موثوقة' },
              { icon: Shield, title: 'دفع آمن', desc: 'حماية كاملة لبياناتك' },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={slideUp}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gold-100 dark:bg-gold-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <item.icon className="text-gold-600" size={32} />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">منتجات مميزة</h2>
            <Link to="/shop/products" className="text-gold-600 hover:text-gold-700 font-semibold flex items-center gap-2">
              استعرض الكل
              <ArrowLeft size={20} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-64" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {featuredProducts.map((product, index) => (
                <EnhancedProductCard key={product._id} product={product} index={index} onAdd={handleAddToCart} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">الفئات</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <LoadingSkeleton key={i} variant="card" className="h-32" />
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
            >
              {categories.map((category, index) => (
                <motion.div
                  key={category._id}
                  variants={fadeIn}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Link
                    to={`/shop/categories/${category._id}`}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center hover:bg-gold-100 dark:hover:bg-gold-900/20 transition block"
                  >
                    {category.image ? (
                      <motion.img
                        src={withBase(category.image)}
                        alt={category.name}
                        className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                        whileHover={{ scale: 1.1 }}
                      />
                    ) : (
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
