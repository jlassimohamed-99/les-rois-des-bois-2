import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import clientApi from '../../utils/clientAxios';
import ProductCard from '../../components/client/ProductCard';
import { withBase } from '../../utils/imageUrl';

const CategoryProducts = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', sort: 'newest' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get(`/categories/${id}`);
        setCategory(res.data.data?.category);
        setProducts(res.data.data?.products || []);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (filters.minPrice) {
      list = list.filter((p) => p.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      list = list.filter((p) => p.price <= Number(filters.maxPrice));
    }
    if (filters.sort === 'price-low') list.sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') list.sort((a, b) => b.price - a.price);
    if (filters.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, filters]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">فئة</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{category?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{category?.description}</p>
          </div>
          <Link to="/shop/categories" className="text-gold-600 font-semibold">
            العودة للفئات
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
          <input
            type="number"
            placeholder="الحد الأدنى"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            placeholder="الحد الأقصى"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
          />
          <select
            value={filters.sort}
            onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
          >
            <option value="newest">الأحدث</option>
            <option value="price-low">السعر: تصاعدي</option>
            <option value="price-high">السعر: تنازلي</option>
            <option value="name">الاسم</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-80 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={{ ...product, images: [withBase(product.images?.[0])] }} />
            ))}
            {!filteredProducts.length && (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                لا توجد منتجات في هذه الفئة.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
