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
      // Helper function to compare variants
      const variantsMatch = (variant1, variant2) => {
        if (!variant1 && !variant2) return true; // Both have no variant
        if (!variant1 || !variant2) return false; // One has variant, the other doesn't
        // Compare by value first (most reliable), then by name
        return variant1.value === variant2.value || 
               (variant1.name === variant2.name && variant1.value === variant2.value);
      };

      // Find existing item - must match productId, productType, and variant
      const existingItem = prevItems.find((i) => {
        // Must match productId and productType
        if (i.productId !== item.productId || i.productType !== item.productType) {
          return false;
        }

        // For special products, check selectedOptions
        if (item.productType === 'special') {
          return JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions);
        }

        // For regular products, check variant
        if (item.productType === 'regular') {
          return variantsMatch(i.variant, item.variant);
        }

        // For other product types, just check productId and productType
        return true;
      });

      if (existingItem) {
        // Check stock availability before updating quantity
        const availableStock = item.variant?.stock !== undefined ? item.variant.stock : item.stock;
        const newQuantity = existingItem.quantity + (item.quantity || 1);
        
        // Validate stock for regular products
        if (item.productType === 'regular' && availableStock !== undefined && newQuantity > availableStock) {
          if (availableStock === 0) {
            // Don't add if out of stock
            return prevItems;
          }
          // Limit to available stock
          const limitedQuantity = availableStock;
          const updated = prevItems.map((i) => {
            if (i.productId !== item.productId || i.productType !== item.productType) {
              return i;
            }
            if (item.productType === 'regular' && variantsMatch(i.variant, item.variant)) {
              return { ...i, quantity: limitedQuantity };
            }
            return i;
          });
          return updated;
        }
        
        // Update existing item quantity
        const updated = prevItems.map((i) => {
          // Check if this is the matching item
          if (i.productId !== item.productId || i.productType !== item.productType) {
            return i;
          }

          if (item.productType === 'special') {
            if (JSON.stringify(i.selectedOptions) === JSON.stringify(item.selectedOptions)) {
              return { ...i, quantity: i.quantity + (item.quantity || 1) };
            }
          } else if (item.productType === 'regular') {
            if (variantsMatch(i.variant, item.variant)) {
              return { ...i, quantity: i.quantity + (item.quantity || 1) };
            }
          } else {
            return { ...i, quantity: i.quantity + (item.quantity || 1) };
          }

          return i;
        });
        
        if (triggerAnimation) {
          setLastAddedItem({ ...item, action: 'updated' });
          setTimeout(() => setLastAddedItem(null), 500);
        }
        return updated;
      }

      // Check stock before adding new item
      const availableStock = item.variant?.stock !== undefined ? item.variant.stock : item.stock;
      const quantityToAdd = item.quantity || 1;
      
      if (item.productType === 'regular' && availableStock !== undefined) {
        if (availableStock <= 0) {
          // Don't add if out of stock
          return prevItems;
        }
        if (quantityToAdd > availableStock) {
          // Limit to available stock
          const limitedItem = { ...item, quantity: availableStock };
          const newItems = [...prevItems, limitedItem];
          if (triggerAnimation) {
            setLastAddedItem({ ...limitedItem, action: 'added' });
            setTimeout(() => setLastAddedItem(null), 500);
          }
          return newItems;
        }
      }

      // Add as new item - different variant means different item
      const newItems = [...prevItems, { ...item, quantity: quantityToAdd }];
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
    setCartItems((prevItems) => {
      const item = prevItems[index];
      if (!item) return prevItems;
      
      // Check stock availability
      const availableStock = item.variant?.stock !== undefined ? item.variant.stock : item.stock;
      
      if (item.productType === 'regular' && availableStock !== undefined && quantity > availableStock) {
        // Limit to available stock
        return prevItems.map((i, idx) => 
          idx === index ? { ...i, quantity: availableStock } : i
        );
      }
      
      return prevItems.map((item, i) => (i === index ? { ...item, quantity } : item));
    });
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

