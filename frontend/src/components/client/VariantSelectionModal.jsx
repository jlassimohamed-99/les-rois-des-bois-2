import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';
import { withBase } from '../../utils/imageUrl';
import toast from 'react-hot-toast';

const VariantSelectionModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Sélectionner le premier variant par défaut
      setSelectedVariant(product.variants[0]);
      setSelectedImage(product.variants[0]?.image || product.images?.[0]);
    } else {
      setSelectedImage(product?.images?.[0]);
    }
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(variant?.image || product.images?.[0]);
  };

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      return;
    }

    // Vérifier le stock disponible pour la variante sélectionnée
    if (selectedVariant && selectedVariant.stock !== undefined && quantity > selectedVariant.stock) {
      toast.error(`الكمية المتاحة: ${selectedVariant.stock}`);
      return;
    }

    const finalPrice = product.price;

    onAddToCart({
      ...product,
      selectedVariant,
      variantPrice: finalPrice,
      displayImage: selectedImage,
      quantity,
    });

    onClose();
  };

  const finalPrice = product.price;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {product.name}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Product Image */}
                <div className="relative h-64 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
                  {selectedImage ? (
                    <img
                      src={withBase(selectedImage)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      لا توجد صورة
                    </div>
                  )}
                </div>

                {/* Variants Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {product.variantName ? `اختر ${product.variantName}` : 'اختر المتغير'}
                      </h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({product.variants.length} متغير متاح)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {product.variants.map((variant, idx) => (
                        <motion.button
                          key={idx}
                          onClick={() => handleVariantSelect(variant)}
                          disabled={variant.stock !== undefined && variant.stock <= 0}
                          whileHover={{ scale: variant.stock > 0 ? 1.05 : 1 }}
                          whileTap={{ scale: variant.stock > 0 ? 0.95 : 1 }}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all p-2 ${
                            selectedVariant?.value === variant.value
                              ? 'border-gold-500 ring-2 ring-gold-300 bg-gold-50 dark:bg-gold-900/20'
                              : variant.stock !== undefined && variant.stock <= 0
                              ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gold-500 bg-white dark:bg-gray-700'
                          }`}
                        >
                          {variant.image ? (
                            <img
                              src={withBase(variant.image)}
                              alt={variant.value}
                              className="w-full h-24 object-cover rounded-lg mb-2"
                            />
                          ) : (
                            <div className="w-full h-24 bg-gray-200 dark:bg-gray-600 rounded-lg mb-2 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                              {variant.value}
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {variant.value}
                            </p>
                            {variant.stock !== undefined && (
                              <p className={`text-xs mt-1 ${
                                variant.stock > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {variant.stock > 0 ? `متوفر: ${variant.stock}` : 'غير متوفر'}
                              </p>
                            )}
                          </div>
                          {selectedVariant?.value === variant.value && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الكمية
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center font-semibold"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-gray-900 dark:text-gray-100 w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        const maxStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : Infinity;
                        setQuantity((q) => Math.min(maxStock, q + 1));
                      }}
                      disabled={selectedVariant?.stock !== undefined && quantity >= selectedVariant.stock}
                      className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  {selectedVariant?.stock !== undefined && quantity > selectedVariant.stock && (
                    <p className="text-xs text-red-600">الكمية المطلوبة تتجاوز المخزون المتاح</p>
                  )}
                </div>

                {/* Price Display */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">السعر على التفاصيل:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {product.price} TND
                    </span>
                  </div>
                  {product.facebookPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">السعر على صفحة:</span>
                      <span className="text-blue-600 font-medium">
                        {product.facebookPrice} TND
                      </span>
                    </div>
                  )}
                  {product.wholesalePrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">سعر الجملة:</span>
                      <span className="text-green-600 font-medium">
                        {product.wholesalePrice} TND
                      </span>
                    </div>
                  )}
                  {selectedVariant && selectedVariant.stock !== undefined && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        الكمية المتاحة:
                      </span>
                      <span className={`text-xs font-medium ${
                        selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedVariant.stock}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      الإجمالي:
                    </span>
                    <span className="text-2xl font-bold text-gold-600">
                      {finalPrice * quantity} TND
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={product.variants && product.variants.length > 0 && !selectedVariant}
                  className="flex-1 px-6 py-3 rounded-lg bg-gold-600 text-white hover:bg-gold-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  أضف إلى السلة
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VariantSelectionModal;

