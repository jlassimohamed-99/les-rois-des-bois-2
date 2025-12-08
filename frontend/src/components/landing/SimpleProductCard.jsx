import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { withBase } from '../../utils/imageUrl';

const SimpleProductCard = ({ product, onAdd }) => {
  const imageUrl = product.images?.[0] ? withBase(product.images[0]) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0 && onAdd) {
      onAdd({ ...product, quantity: 1 });
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gold-300 dark:hover:border-gold-600 hover:shadow-xl transition-all h-full flex flex-col relative">
      <Link to={`/shop/products/${product._id}`} className="flex flex-col flex-1">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden rounded-t-xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              بدون صورة
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-bold">نفد</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-gold-600 transition-colors min-h-[3rem]">
            {product.name}
          </h3>
          <div className="mt-auto">
            <p className="text-gold-600 font-bold text-xl">{product.wholesalePrice || product.price} TND</p>
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        {product.stock > 0 ? (
          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gold-600 text-white py-2 rounded-lg hover:bg-gold-700 transition-colors flex items-center justify-center gap-2 font-semibold"
            aria-label="Add to cart"
          >
            <ShoppingCart size={18} />
            <span>إضافة للسلة</span>
          </motion.button>
        ) : (
          <button
            disabled
            className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 py-2 rounded-lg cursor-not-allowed font-semibold"
          >
            غير متوفر
          </button>
        )}
      </div>
    </div>
  );
};

export default SimpleProductCard;

