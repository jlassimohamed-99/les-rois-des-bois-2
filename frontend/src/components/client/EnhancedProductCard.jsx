import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { hoverScale, hoverLift, fadeIn } from '../../utils/animations';
import { withBase } from '../../utils/imageUrl';
import VariantSelectionModal from './VariantSelectionModal';

/**
 * Enhanced Product Card with animations and variants display
 */
const EnhancedProductCard = ({ product, onAdd, index = 0 }) => {
  const [showVariantModal, setShowVariantModal] = useState(false);

  const imageUrl = product.images?.[0] ? withBase(product.images[0]) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if product is out of stock
    if (product.stock <= 0) {
      return; // Will be handled by the disabled button
    }
    
    // Si le produit a des variants, afficher le modal
    if (product.variants && product.variants.length > 0) {
      setShowVariantModal(true);
    } else {
      // Sinon, ajouter directement au panier
      if (onAdd) {
        onAdd({
          ...product,
          quantity: 1,
        });
      }
    }
  };

  const handleModalAddToCart = (productWithVariant) => {
    if (onAdd) {
      onAdd(productWithVariant);
    }
    setShowVariantModal(false);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ delay: index * 0.1 }}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl border overflow-hidden transition-all duration-300 ${
        product.stock <= 0
          ? 'opacity-50 border-red-300 dark:border-red-700'
          : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <Link to={`/shop/products/${product._id}`} className="block">
        <motion.div
          className="relative h-64 bg-gray-100 dark:bg-gray-700 overflow-hidden"
          whileHover={product.stock > 0 ? "hover" : ""}
          variants={{
            hover: { scale: 1.05 },
          }}
          transition={{ duration: 0.3 }}
        >
          {imageUrl ? (
            <>
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover ${product.stock <= 0 ? 'grayscale' : ''}`}
                loading="lazy"
              />
              {product.stock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60">
                  <span className="text-white font-bold text-xl">نفد</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              لا توجد صورة
            </div>
          )}
          {product.stock > 0 && (
            <motion.div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"
              initial={false}
            />
          )}
        </motion.div>
      </Link>

      <div className="p-4 space-y-3">
        <Link to={`/shop/products/${product._id}`}>
          <h3 className={`text-lg font-semibold line-clamp-2 transition-colors ${
            product.stock <= 0
              ? 'text-gray-400 dark:text-gray-500 line-through'
              : 'text-gray-900 dark:text-gray-100 group-hover:text-gold-600'
          }`}>
            {product.name}
          </h3>
        </Link>

        {/* Variants Indicator */}
        {product.variants && product.variants.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {product.variants.length} متغير متاح
            </span>
            <span className="text-xs text-gold-600">•</span>
            <span className="text-xs text-gold-600 cursor-pointer hover:underline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowVariantModal(true); }}>
              اختر المتغير
            </span>
          </div>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">السعر:</span>
            <span className="text-gold-600 font-bold text-lg">{product.wholesalePrice || product.price} TND</span>
          </div>
          
          {product.stock > 0 && product.stock <= 10 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
              ⚠️ المخزون منخفض: {product.stock} متوفر فقط
            </p>
          )}
          {product.stock <= 0 && (
            <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
              غير متوفر في المخزون
            </p>
          )}
          <div className="flex items-center justify-end gap-2 pt-1">
            <motion.button
              whileHover={product.stock > 0 ? hoverScale : {}}
              whileTap={product.stock > 0 ? { scale: 0.9 } : {}}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`p-2 rounded-lg transition-colors ${
                product.stock <= 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gold-600 text-white hover:bg-gold-700'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart size={18} />
            </motion.button>
            
            <Link to={`/shop/products/${product._id}`}>
              <motion.button
                whileHover={hoverScale}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="View details"
              >
                <Eye size={18} />
              </motion.button>
            </Link>
          </div>
        </div>
      </div>

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleModalAddToCart}
      />
    </motion.div>
  );
};

export default EnhancedProductCard;

