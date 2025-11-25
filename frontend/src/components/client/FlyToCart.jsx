import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

/**
 * Fly-to-cart animation component
 * Shows animated icon flying from product to cart icon
 */
const FlyToCart = ({ trigger, fromPosition, toPosition }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!fromPosition || !toPosition) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{
            position: 'fixed',
            left: fromPosition.x,
            top: fromPosition.y,
            x: 0,
            y: 0,
            zIndex: 9999,
          }}
          animate={{
            x: toPosition.x - fromPosition.x,
            y: toPosition.y - fromPosition.y,
            scale: [1, 0.5, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="pointer-events-none"
        >
          <div className="w-12 h-12 bg-gold-600 rounded-full flex items-center justify-center shadow-lg">
            <ShoppingCart className="text-white" size={20} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FlyToCart;

