import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { withBase } from '../../utils/imageUrl';

const ProductCard = ({ product, onAdd }) => {
  const { addToCart } = useCart();

  const handleAdd = () => {
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
          <span className="text-gold-600 font-bold whitespace-nowrap">{product.price} TND</span>
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
      </div>
    </div>
  );
};

export default ProductCard;
