import { motion } from 'framer-motion';
import { pageTransition } from '../../utils/animations';

/**
 * Wrapper component for page transitions
 */
const AnimatedPage = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;

