import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clientApi from '../../utils/clientAxios';
import { withBase } from '../../utils/imageUrl';

const SpecialProductsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await clientApi.get('/special-products');
        setItems(res.data.data || []);
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">المنتجات المركبة</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">اختر النموذج</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">تصفح كل المنتجات المركبة ثم خصّصها.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="h-64 bg-white dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((sp) => {
              const preview = withBase(sp.combinations?.[0]?.finalImage || sp.baseProductA?.images?.[0] || '');
              return (
                <div
                  key={sp._id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {preview ? (
                      <img src={preview} alt={sp.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">بدون صورة</div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{sp.name}</h3>
                    <p className="text-gold-600 font-bold">{sp.finalPrice} TND</p>
                    <Link
                      to={`/shop/special-products/${sp._id}`}
                      className="inline-block mt-2 bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition"
                    >
                      خصّص الآن
                    </Link>
                  </div>
                </div>
              );
            })}
            {!items.length && <div className="col-span-full text-center text-gray-500">لا توجد منتجات مركبة.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialProductsList;
