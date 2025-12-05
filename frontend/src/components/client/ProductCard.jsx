import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { withBase } from '../../utils/imageUrl';
import VariantSelectionModal from './VariantSelectionModal';

const ProductCard = ({ product, onAdd }) => {
  const { addToCart } = useCart();
  const [showVariantModal, setShowVariantModal] = useState(false);

  const handleAdd = () => {
    // Si le produit a des variants, afficher le modal
    if (product.variants && product.variants.length > 0) {
      setShowVariantModal(true);
    } else {
      // Sinon, ajouter directement au panier
      const item = {
        productId: product._id,
        productType: 'regular',
        name: product.name,
        price: product.price,
        image: withBase(product.images?.[0]),
        quantity: 1,
      };
      addToCart(item);
      if (onAdd) onAdd(item);
    }
  };

  const handleModalAddToCart = (productWithVariant) => {
    const variantPrice = productWithVariant.selectedVariant?.additionalPrice || 0;
    const finalPrice = productWithVariant.variantPrice || (product.price + variantPrice);
    const displayImage = productWithVariant.displayImage || product.images?.[0];
    const quantity = productWithVariant.quantity || 1;

    const item = {
      productId: product._id,
      productType: 'regular',
      name: product.name,
      price: finalPrice,
      image: withBase(displayImage),
      quantity: quantity,
      variant: productWithVariant.selectedVariant ? {
        name: productWithVariant.selectedVariant.name,
        value: productWithVariant.selectedVariant.value,
        image: productWithVariant.selectedVariant.image,
        additionalPrice: productWithVariant.selectedVariant.additionalPrice || 0,
      } : undefined,
    };
    addToCart(item);
    if (onAdd) onAdd(item);
    setShowVariantModal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
      <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {product.images?.length ? (
          <img
            src={withBase(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
            {product.name}
          </h3>
        </div>
        {/* Prices Section */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">السعر على التفاصيل:</span>
            <span className="text-gold-600 font-bold text-sm">{product.price} TND</span>
          </div>
          {product.facebookPrice > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">السعر على صفحة:</span>
              <span className="text-blue-600 font-bold text-sm">{product.facebookPrice} TND</span>
            </div>
          )}
          {product.wholesalePrice > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">سعر الجملة:</span>
              <span className="text-green-600 font-bold text-sm">{product.wholesalePrice} TND</span>
            </div>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between pt-2">
          <Link to={`/shop/products/${product._id}`} className="text-sm font-semibold text-gold-600 hover:text-gold-700">
            عرض التفاصيل
          </Link>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-gold-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gold-700 transition"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
        {product.variants && product.variants.length > 0 && (
          <div className="text-xs text-gold-600 mt-1">
            {product.variants.length} متغير متاح
          </div>
        )}
      </div>
      <VariantSelectionModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default ProductCard;
