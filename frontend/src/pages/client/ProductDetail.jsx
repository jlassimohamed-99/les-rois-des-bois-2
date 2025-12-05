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
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await clientApi.get(`/products/${id}`);
        const productData = res.data.data;
        setProduct(productData);

        // Set default variant and image
        if (productData?.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
          setSelectedImage(productData.variants[0]?.image || productData.images?.[0]);
        } else {
          setSelectedImage(productData.images?.[0]);
        }

        if (productData?.category?._id) {
          const similarRes = await clientApi.get('/products', {
            params: { category: productData.category._id, limit: 4 },
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
    
    // Validation: Si le produit a des variants, un variant doit être sélectionné
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast.error('يرجى اختيار المتغير قبل الإضافة إلى السلة');
      return;
    }
    
    // Calculate price with variant additional price
    const variantPrice = selectedVariant?.additionalPrice || 0;
    const finalPrice = product.price + variantPrice;
    
    addToCart({
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: finalPrice,
      image: withBase(selectedImage || product.images?.[0]),
      quantity,
      variant: selectedVariant ? {
        name: selectedVariant.name,
        value: selectedVariant.value,
        image: selectedVariant.image,
        additionalPrice: selectedVariant.additionalPrice || 0,
      } : undefined,
    });
    
    const variantName = selectedVariant ? ` (${selectedVariant.name || selectedVariant.value})` : '';
    toast.success(`تمت إضافة ${product.name}${variantName} إلى السلة`);
  };

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    // Update displayed image to variant image or main product image
    setSelectedImage(variant?.image || product.images?.[0]);
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
            <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
              {selectedImage ? (
                <img 
                  src={withBase(selectedImage)} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  loading="lazy" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
              )}
              {selectedVariant && (
                <div className="absolute top-4 right-4 bg-gold-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  {selectedVariant.name || selectedVariant.value}
                </div>
              )}
            </div>
            {/* Product images gallery */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(img);
                      // Si l'image sélectionnée appartient à un variant, sélectionner ce variant
                      const matchingVariant = product.variants?.find(v => v.image === img);
                      if (matchingVariant) {
                        setSelectedVariant(matchingVariant);
                      }
                    }}
                    className={`h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? 'border-gold-600 ring-2 ring-gold-300'
                        : 'border-transparent hover:border-gold-500'
                    }`}
                  >
                    <img src={withBase(img)} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-wide text-gold-600 font-semibold">منتج</p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{product.name}</h1>
              
              {/* Prices Section */}
              <div className="mt-4 space-y-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">السعر على التفاصيل:</span>
                    <span className="text-lg font-bold text-gold-600">
                      {product.price + (selectedVariant?.additionalPrice || 0)} TND
                    </span>
                  </div>
                  {product.facebookPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">السعر على صفحة:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {product.facebookPrice + (selectedVariant?.additionalPrice || 0)} TND
                      </span>
                    </div>
                  )}
                  {product.wholesalePrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">سعر الجملة:</span>
                      <span className="text-lg font-bold text-green-600">
                        {product.wholesalePrice + (selectedVariant?.additionalPrice || 0)} TND
                      </span>
                    </div>
                  )}
                  {selectedVariant?.additionalPrice > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-600">
                      (السعر الأساسي: {product.price} TND + {selectedVariant.additionalPrice} TND للمتغير المختار)
                    </div>
                  )}
                  {product.variants && product.variants.length > 0 && !selectedVariant && (
                    <div className="text-sm text-gold-600 dark:text-gold-400 pt-2">
                      يرجى اختيار متغير لمعرفة السعر النهائي
                    </div>
                  )}
                </div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{product.description}</p>

            {/* Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-bold text-gray-900 dark:text-gray-100">
                    اختر المتغير المطلوب:
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedVariant ? '✓ تم الاختيار' : 'مطلوب'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVariantChange(variant)}
                      className={`relative p-3 rounded-xl border-2 text-right transition-all hover:scale-105 ${
                        selectedVariant?.value === variant.value
                          ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20 text-gold-700 shadow-lg ring-2 ring-gold-300'
                          : 'border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:border-gold-500 bg-white dark:bg-gray-800'
                      }`}
                    >
                      {variant.image ? (
                        <img
                          src={withBase(variant.image)}
                          alt={variant.name || variant.value}
                          className="h-24 w-full object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="h-24 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-400">
                          {variant.name || variant.value}
                        </div>
                      )}
                      <div className="font-semibold text-sm mb-1">{variant.name || variant.value}</div>
                      {variant.additionalPrice > 0 ? (
                        <div className="text-xs text-gold-600 font-medium">
                          +{variant.additionalPrice} TND
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">بدون زيادة</div>
                      )}
                      {selectedVariant?.value === variant.value && (
                        <div className="absolute top-2 left-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedVariant && (
                  <p className="text-sm text-gold-600 dark:text-gold-400 font-medium text-center">
                    ⚠️ يرجى اختيار متغير قبل الإضافة إلى السلة
                  </p>
                )}
              </div>
            )}

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
                disabled={product.variants && product.variants.length > 0 && !selectedVariant}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                  product.variants && product.variants.length > 0 && !selectedVariant
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gold-600 text-white hover:bg-gold-700'
                }`}
              >
                {product.variants && product.variants.length > 0 && !selectedVariant
                  ? 'اختر المتغير أولاً'
                  : 'أضف إلى السلة'}
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
