import { useEffect, useState } from 'react';
import { Filter, SlidersHorizontal, ArrowLeft, RefreshCcw } from 'lucide-react';
import clientApi from '../../utils/clientAxios';
import ProductCard from '../../components/client/ProductCard';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';
import { withBase } from '../../utils/imageUrl';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await clientApi.get('/categories');
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get('/products', {
          params: {
            ...filters,
            page,
            limit: 9,
          },
        });
        setProducts(res.data.data || []);
        setTotalPages(res.data.pagination?.pages || 1);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filters, page]);

  const handleFilterChange = (field, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest',
    });
    setPage(1);
  };

  const handleAddToCart = (product) => {
    addToCart({
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: product.price,
      image: withBase(product.images?.[0]),
      quantity: 1,
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">التسوق</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">المنتجات</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">صفّي وابحث للوصول إلى القطعة المثالية.</p>
          </div>
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gold-400"
          >
            <RefreshCcw size={16} />
            إعادة الضبط
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/20 text-gold-700 flex items-center justify-center">
                <Filter size={18} />
              </div>
              <div>
                <p className="text-xs uppercase font-semibold text-gold-600">التصفية</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">تحديد النتائج</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">بحث</label>
                <input
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">الفئة</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                >
                  <option value="">الكل</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الحد الأدنى</label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="0"
                    className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">الحد الأقصى</label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="1000"
                    className="mt-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400">الترتيب</label>
                <div className="mt-2 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                  <SlidersHorizontal size={16} className="text-gray-400" />
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-900 dark:text-gray-100"
                  >
                    <option value="newest">الأحدث</option>
                    <option value="price-low">السعر: تصاعدي</option>
                    <option value="price-high">السعر: تنازلي</option>
                    <option value="name">الاسم</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ArrowLeft size={16} className="text-gold-600" />
                عرض {products.length} نتيجة
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="h-80 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} onAdd={() => handleAddToCart(product)} />
                  ))}
                  {!products.length && (
                    <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">لا توجد منتجات.</div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                    >
                      السابق
                    </button>
                    <span className="text-gray-700 dark:text-gray-200">
                      صفحة {page} من {totalPages}
                    </span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-50"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Products;
