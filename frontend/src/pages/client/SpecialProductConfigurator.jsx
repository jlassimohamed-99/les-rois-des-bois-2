import { useEffect, useMemo, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ImageOff } from 'lucide-react';
import clientApi from '../../utils/clientAxios';
import { useCart } from '../../contexts/CartContext';
import toast from 'react-hot-toast';
import { withBase } from '../../utils/imageUrl';

const SpecialProductConfigurator = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chooses, setChooses] = useState({ optionA: '', optionB: '' });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    const loadDetail = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get(`/special-products/${id}`);
        const sp = res.data.data;
        setDetail(sp);
        const firstCombo = sp.combinations?.[0];
        setChooses({
          optionA: firstCombo?.optionA?.value || sp.baseProductA?.variants?.[0]?.value || '',
          optionB: firstCombo?.optionB?.value || sp.baseProductB?.variants?.[0]?.value || '',
        });
        setQuantity(1);
      } catch (error) {
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const activeCombination = useMemo(() => {
    if (!detail) return null;
    return (
      detail.combinations?.find(
        (c) => c.optionA?.value === chooses.optionA && c.optionB?.value === chooses.optionB
      ) || detail.combinations?.[0] || null
    );
  }, [detail, chooses]);

  const price = useMemo(() => {
    if (!detail) return 0;
    return detail.finalPrice + (activeCombination?.additionalPrice || 0);
  }, [detail, activeCombination]);

  if (!id) return <Navigate to="/shop/special-products" replace />;

  if (loading && !detail) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">جار تحميل المكوّن...</div>;
  }

  const handleAddToCart = () => {
    if (!detail || !activeCombination) {
      toast.error('هذه التركيبة غير متاحة');
      return;
    }
    const qty = Math.max(1, quantity || 1);
    const item = {
      productId: detail._id,
      productType: 'special',
      name: detail.name,
      price,
      image: withBase(activeCombination.finalImage),
      quantity: qty,
      combinationId: activeCombination._id,
      selectedOptions: {
        optionA: detail.baseProductA?.variants?.find((v) => v.value === chooses.optionA),
        optionB: detail.baseProductB?.variants?.find((v) => v.value === chooses.optionB),
      },
      combinationImage: withBase(activeCombination.finalImage),
    };
    addToCart(item);
    toast.success('تمت إضافة المنتج المركب للسلة');
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">المكوّن</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              اصنع منتجك المركب
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">اختر كل جزء وشاهد النتيجة فوراً.</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-sm">
            <Sparkles className="text-gold-600" size={20} />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">ابتداءً من</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{detail?.finalPrice || 0} TND</p>
            </div>
          </div>
        </header>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                1) {detail?.baseProductA?.name || 'الجزء الأول'}
              </label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detail?.baseProductA?.variants?.map((variant) => (
                  <button
                    key={variant.value}
                    onClick={() => setChooses((prev) => ({ ...prev, optionA: variant.value }))}
                    className={`p-3 rounded-lg border text-right ${
                      chooses.optionA === variant.value
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700'
                        : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {variant.image && (
                      <img src={withBase(variant.image)} alt={variant.value} className="h-20 w-full object-cover rounded mb-2" />
                    )}
                    <div className="font-semibold">{variant.value}</div>
                    <div className="text-xs text-gray-500">
                      {variant.additionalPrice ? `+${variant.additionalPrice} TND` : 'بدون زيادة'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">
                2) {detail?.baseProductB?.name || 'الجزء الثاني'}
              </label>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {detail?.baseProductB?.variants?.map((variant) => (
                  <button
                    key={variant.value}
                    onClick={() => setChooses((prev) => ({ ...prev, optionB: variant.value }))}
                    className={`p-3 rounded-lg border text-right ${
                      chooses.optionB === variant.value
                        ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700'
                        : 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {variant.image && (
                      <img src={withBase(variant.image)} alt={variant.value} className="h-20 w-full object-cover rounded mb-2" />
                    )}
                    <div className="font-semibold">{variant.value}</div>
                    <div className="text-xs text-gray-500">
                      {variant.additionalPrice ? `+${variant.additionalPrice} TND` : 'بدون زيادة'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 min-h-[320px] flex items-center justify-center">
              {activeCombination?.finalImage ? (
                <img
                  src={withBase(activeCombination.finalImage)}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-2xl"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                  <ImageOff size={36} />
                  <p className="mt-3 text-sm">التركيبة غير متوفرة</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">الملخص</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-semibold">{detail?.baseProductA?.name || 'الجزء الأول'}:</span>{' '}
                  {chooses.optionA || 'اختر خياراً'}
                </p>
                <p>
                  <span className="font-semibold">{detail?.baseProductB?.name || 'الجزء الثاني'}:</span>{' '}
                  {chooses.optionB || 'اختر خياراً'}
                </p>
                <p className="text-lg font-bold text-gold-600">الإجمالي: {price} TND</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-400">الكمية</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-24 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!activeCombination}
                className="w-full flex items-center justify-center gap-2 bg-gold-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-gold-700 transition disabled:opacity-50"
              >
                أضف المنتج المركب
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialProductConfigurator;
