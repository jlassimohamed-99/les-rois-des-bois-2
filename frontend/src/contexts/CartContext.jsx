import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAddedItem, setLastAddedItem] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        // Silent error handling
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item, triggerAnimation = true) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (i) =>
          i.productId === item.productId &&
          i.productType === item.productType &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
      );

      if (existingItem) {
        const updated = prevItems.map((i) =>
          i.productId === item.productId &&
          i.productType === item.productType &&
          JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
        if (triggerAnimation) {
          setLastAddedItem({ ...item, action: 'updated' });
          setTimeout(() => setLastAddedItem(null), 500);
        }
        return updated;
      }

      const newItems = [...prevItems, { ...item, quantity: item.quantity || 1 }];
      if (triggerAnimation) {
        setLastAddedItem({ ...item, action: 'added' });
        setTimeout(() => setLastAddedItem(null), 500);
      }
      return newItems;
    });
  }, []);

  const removeFromCart = useCallback((index) => {
    setCartItems((prevItems) => prevItems.filter((_, i) => i !== index));
  }, []);

  const updateQuantity = useCallback((index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item, i) => (i === index ? { ...item, quantity } : item))
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  }, [cartItems]);

  const getCartItemsCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    lastAddedItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

