import { motion } from 'framer-motion';

/**
 * Reusable loading skeleton component
 */
const LoadingSkeleton = ({ className = '', count = 1, variant = 'default' }) => {
  const variants = {
    default: 'h-4 bg-gray-200 dark:bg-gray-700 rounded',
    card: 'h-64 bg-gray-200 dark:bg-gray-700 rounded-xl',
    avatar: 'h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full',
    text: 'h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4',
  };

  const baseClass = variants[variant] || variants.default;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`${baseClass} ${className}`}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 0.1,
          }}
        />
      ))}
    </>
  );
};

export default LoadingSkeleton;

