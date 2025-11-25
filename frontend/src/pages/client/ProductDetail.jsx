import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ArrowLeft } from 'lucide-react';
import clientApi from '../../utils/clientAxios';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';
import ProductCard from '../../components/client/ProductCard';
import { withBase } from '../../utils/imageUrl';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get(`/products/${id}`);
        setProduct(res.data.data);

        if (res.data.data?.category?._id) {
          const similarRes = await clientApi.get('/products', {
            params: { category: res.data.data.category._id, limit: 4 },
          });
          setSimilar(similarRes.data.data?.filter((p) => p._id !== id) || []);
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addToCart({
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: product.price,
      image: withBase(product.images?.[0]),
      quantity,
    });
    toast.success('تمت الإضافة إلى السلة');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-800 h-96 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-6">المنتج غير متاح.</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg bg-gold-600 text-white hover:bg-gold-700">
          رجوع
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="aspect-square bg-gray-100 dark:bg-gray-700">
              {product.images?.length ? (
                <img src={withBase(product.images[0])} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3 p-4">
                {product.images.map((img, idx) => (
                  <div key={idx} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img src={withBase(img)} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">منتج</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{product.name}</h1>
              <p className="text-lg text-gold-600 font-semibold mt-2">{product.price} TND</p>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3 text-gray-600 dark:text-gray-300">
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="p-3 text-gray-600 dark:text-gray-300">
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={handleAdd}
                className="flex-1 bg-gold-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gold-700 transition"
              >
                أضف إلى السلة
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <ArrowLeft size={16} className="text-gold-600" />
              <Link to="/shop/products" className="font-semibold text-gold-600 hover:text-gold-700">
                عودة للمنتجات
              </Link>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">منتجات مشابهة</h2>
              <Link to="/shop/products" className="text-gold-600 hover:text-gold-700 text-sm font-semibold">
                استعرض الكل
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similar.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
