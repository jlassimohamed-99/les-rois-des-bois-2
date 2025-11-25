import { Link } from 'react-router-dom';
import { withBase } from '../../utils/imageUrl';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/shop/categories/${category._id}`}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
    >
      <div className="h-32 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {category.image ? (
          <img
            src={withBase(category.image)}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">{category.description}</p>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;
