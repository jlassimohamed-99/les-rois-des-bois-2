import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Home,
  Grid,
  Package,
  Sparkles,
} from 'lucide-react';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useScrollDirection } from '../../hooks/useScrollDirection';
import clientApi from '../../utils/clientAxios';
import { slideDown, fadeIn, staggerContainer } from '../../utils/animations';
import Logo from '../shared/Logo';

const EnhancedHeader = () => {
  const { logout, isAuthenticated, user } = useClientAuth();
  const { getCartItemsCount, cartItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const scrollDirection = useScrollDirection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const categoriesRef = useRef(null);
  const profileRef = useRef(null);
  const cartRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await clientApi.get('/categories');
        setCategories(res.data.data || []);
      } catch (error) {
        // Silent fail
      }
    };
    fetchCategories();
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategoriesDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setShowCartDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/shop', label: 'الرئيسية', icon: Home },
    { to: '/shop/products', label: 'المنتجات', icon: Package },
    { to: '/shop/special-products', label: 'المنتجات المركبة', icon: Sparkles },
  ];

  const cartCount = getCartItemsCount();
  const shouldShowNavbar = scrollDirection !== 'down' || window.scrollY < 100;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: shouldShowNavbar ? 0 : -100 }}
      transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white dark:bg-gray-800'
      }`}
    >
      {/* Desktop Navbar */}
      <nav className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
              className="flex justify-center items-center"
            >
              <Logo size="md" showText={false} to="/shop" clickable={true} />
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-1 rtl:space-x-reverse"
            >
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative group"
                  >
                    <link.icon size={18} />
                    <span className="font-medium">{link.label}</span>
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-600 scale-x-0 group-hover:scale-x-100 origin-right"
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              ))}

              {/* Categories Dropdown */}
              <div ref={categoriesRef} className="relative">
                <motion.button
                  onMouseEnter={() => setShowCategoriesDropdown(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Grid size={18} />
                  <span className="font-medium">الفئات</span>
                  <ChevronDown size={16} />
                </motion.button>

                <AnimatePresence>
                  {showCategoriesDropdown && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={slideDown}
                      onMouseLeave={() => setShowCategoriesDropdown(false)}
                      className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-2">
                        {categories.slice(0, 8).map((category) => (
                          <Link
                            key={category._id}
                            to={`/shop/categories/${category._id}`}
                            onClick={() => setShowCategoriesDropdown(false)}
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            {category.name}
                          </Link>
                        ))}
                        <Link
                          to="/shop/categories"
                          onClick={() => setShowCategoriesDropdown(false)}
                          className="block px-4 py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 text-gold-600 font-semibold text-center border-t border-gray-200 dark:border-gray-700 mt-2"
                        >
                          عرض جميع الفئات
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center space-x-3 rtl:space-x-reverse"
            >
              {/* Cart */}
              <div ref={cartRef} className="relative">
                <motion.button
                  onClick={() => navigate('/shop/cart')}
                  className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gold-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showCartDropdown && cartItems.length > 0 && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={slideDown}
                      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 max-h-96 overflow-y-auto">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                          السلة ({cartCount})
                        </h3>
                        <div className="space-y-3">
                          {cartItems.slice(0, 3).map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity} × {item.price} TND
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Link
                          to="/shop/cart"
                          onClick={() => setShowCartDropdown(false)}
                          className="block mt-4 w-full bg-gold-600 text-white text-center py-2 rounded-lg hover:bg-gold-700 transition-colors font-semibold"
                        >
                          عرض السلة
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>

              {/* Profile */}
              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <motion.button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={24} />
                  </motion.button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={slideDown}
                        className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <div className="p-2">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {user?.name || 'المستخدم'}
                            </p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                          <Link
                            to="/shop/profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            الملف الشخصي
                          </Link>
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              logout();
                            }}
                            className="w-full text-right px-4 py-2 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 text-gold-600"
                          >
                            تسجيل الخروج
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-gold-600 text-white px-4 py-2 rounded-lg hover:bg-gold-700 transition-colors font-semibold"
                >
                  تسجيل الدخول
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <motion.button
            onClick={() => setMobileMenuOpen(true)}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} className="text-gray-700 dark:text-gray-300" />
          </motion.button>

          <div className="flex-1 flex justify-center">
            <Logo size="sm" showText={false} to="/shop" clickable={true} />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/shop/cart')}
              className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xl font-bold text-gold-600">القائمة</span>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={link.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <link.icon size={20} />
                          <span>{link.label}</span>
                        </Link>
                      </motion.div>
                    ))}

                    <Link
                      to="/shop/categories"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      <Grid size={20} />
                      <span>الفئات</span>
                    </Link>

                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/shop/profile"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          <User size={20} />
                          <span>الملف الشخصي</span>
                        </Link>
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gold-50 dark:hover:bg-gold-900/20 text-gold-600"
                        >
                          <LogOut size={20} />
                          <span>تسجيل الخروج</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full bg-gold-600 text-white text-center px-4 py-3 rounded-lg hover:bg-gold-700 font-semibold"
                      >
                        تسجيل الدخول
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default EnhancedHeader;

