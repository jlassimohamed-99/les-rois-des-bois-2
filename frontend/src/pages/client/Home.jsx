import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clientApi from '../../utils/clientAxios';
import { ShoppingBag, Award, Truck, Shield, ArrowLeft } from 'lucide-react';
import { withBase } from '../../utils/imageUrl';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold">ملوك الخشب</h1>
            <p className="text-xl md:text-2xl text-gray-300">أثاث فاخر بتصاميم عصرية وجودة عالية</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/shop/products"
                className="bg-gold-600 hover:bg-gold-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                تسوق المنتجات
              </Link>
              <Link
                to="/shop/categories"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                استكشف الفئات
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">لماذا تختارنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gold-100 dark:bg-gold-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-gold-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">مواد فاخرة</h3>
              <p className="text-gray-600 dark:text-gray-400">اختيار دقيق لأفضل الأخشاب</p>
            </div>
            <div className="text-center">
              <div className="bg-gold-100 dark:bg-gold-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-gold-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">تصاميم حديثة</h3>
              <p className="text-gray-600 dark:text-gray-400">ستايل معاصر يناسب منزلك</p>
            </div>
            <div className="text-center">
              <div className="bg-gold-100 dark:bg-gold-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-gold-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">توصيل سريع</h3>
              <p className="text-gray-600 dark:text-gray-400">خدمة تسليم موثوقة</p>
            </div>
            <div className="text-center">
              <div className="bg-gold-100 dark:bg-gold-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-gold-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">دفع آمن</h3>
              <p className="text-gray-600 dark:text-gray-400">حماية كاملة لبياناتك</p>
            </div>
          </div>
        </div>
      </section>

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
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Link
                  key={product._id}
                  to={`/shop/products/${product._id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={withBase(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h3>
                    <p className="text-gold-600 font-bold text-xl">{product.price} TND</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">الفئات</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/shop/categories/${category._id}`}
                  className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center hover:bg-gold-100 dark:hover:bg-gold-900/20 transition"
                >
                  {category.image ? (
                    <img
                      src={withBase(category.image)}
                      alt={category.name}
                      className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
