import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Load cart from local storage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to local storage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  const addToCart = (product, quantity = 1, selectedOptions = {}, openDrawer = false) => {
    // Generate a unique ID based on product ID and selected options string
    const optionsString = Object.entries(selectedOptions)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const cartItemId = `${product._id}-${optionsString}`;

    // Calculate item price (base price + any selected option price modifiers)
    let itemPrice = product.price;
    Object.entries(selectedOptions).forEach(([optName, optVal]) => {
      const selection = product.selections?.find(
        (s) => s.name.toLowerCase() === optName.toLowerCase()
      );
      if (selection) {
        const valObj = selection.values?.find(
          (v) => v.value.toLowerCase() === optVal.toLowerCase()
        );
        if (valObj) {
          itemPrice += valObj.priceModifier;
        }
      }
    });

    const existingItemIndex = cartItems.findIndex((item) => item.cartItemId === cartItemId);

    let newCartItems = [...cartItems];
    if (existingItemIndex > -1) {
      // Check stock limit before updating quantity
      const newQty = newCartItems[existingItemIndex].quantity + quantity;
      if (newQty <= product.stock) {
        newCartItems[existingItemIndex].quantity = newQty;
      } else {
        newCartItems[existingItemIndex].quantity = product.stock;
      }
    } else {
      newCartItems.push({
        cartItemId,
        product: product._id,
        name: product.name,
        image: product.images?.[0] || 'https://via.placeholder.com/150',
        price: itemPrice,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
        selectedOptions,
        allowKoko: product.allowKoko
      });
    }

    saveCart(newCartItems);
    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      showToast(`${product.name} added to cart!`);
    }
  };

  const removeFromCart = (cartItemId) => {
    const newCartItems = cartItems.filter((item) => item.cartItemId !== cartItemId);
    saveCart(newCartItems);
  };

  const updateQuantity = (cartItemId, quantity) => {
    const targetItem = cartItems.find((item) => item.cartItemId === cartItemId);
    if (!targetItem) return;

    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    // Limit quantity to stock
    const finalQty = Math.min(quantity, targetItem.stock);

    const newCartItems = cartItems.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: finalQty } : item
    );
    saveCart(newCartItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        cartTotalCount,
        toast,
        setToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
