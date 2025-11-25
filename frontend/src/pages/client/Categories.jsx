import { useEffect, useMemo, useState } from 'react';
import { Search, Grid } from 'lucide-react';
import clientApi from '../../utils/clientAxios';
import CategoryCard from '../../components/client/CategoryCard';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await clientApi.get('/categories');
        setCategories(res.data.data || []);
      } catch (error) {
        console.error('Failed to load categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));
  }, [categories, search]);

  const suggestions = useMemo(() => filtered.slice(0, 5), [filtered]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pb-16">
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">استعراض</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                اكتشف الفئات
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3">ابحث عن الفئة المناسبة للتسوق بسرعة.</p>
            </div>
            <div className="w-full md:w-96 relative">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-3 shadow-inner">
                <Search className="text-gray-400" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في الفئات..."
                  className="bg-transparent outline-none px-3 text-gray-900 dark:text-gray-100 w-full"
                />
              </div>
              {search && suggestions.length > 0 && (
                <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10">
                  {suggestions.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSearch(cat.name)}
                      className="w-full text-right px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gold-50 dark:bg-gold-900/20 text-gold-700 flex items-center justify-center">
              <Grid size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-gold-600">الفئات</p>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">كل المجموعات</h2>
            </div>
          </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 h-52 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
            {!filtered.length && (
              <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                No categories match your search.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Categories;
