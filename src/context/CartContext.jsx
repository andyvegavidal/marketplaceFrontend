import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  // Cargar carrito solo desde localStorage (simplificado)
  const loadCart = () => {
    try {
      setCartLoading(true);
      
      // Solo usar localStorage por ahora
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const parsedCart = JSON.parse(localCart);
          setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
        } catch (error) {
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } catch (error) {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Agregar producto al carrito (simplificado)
  const addToCart = (productId, quantity = 1, productData = null) => {

    try {
      // Necesitamos los datos del producto para el carrito local
      const product = productData || { id: productId };
      
      // Asegurar que el producto tenga la información de tienda necesaria
      if (productData && !productData.storeId && !productData.store) {
        throw new Error('Producto sin información de tienda');
      }
      
      let newCartItems;
      const existingItem = cartItems.find(item => item.id === productId);
      
      if (existingItem) {
        newCartItems = cartItems.map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Asegurar que el producto mantenga el storeId
        const cartItem = { 
          ...product, 
          quantity,
          // Asegurar compatibilidad con ambos nombres de campo
          storeId: product.storeId || product.store,
          store: product.store || product.storeId
        };
        newCartItems = [...cartItems, cartItem];
      }
      
      // Guardar en localStorage y actualizar estado
      localStorage.setItem('cart', JSON.stringify(newCartItems));
      setCartItems(newCartItems);
      
      return { success: true, message: 'Producto agregado al carrito' };
    } catch (error) {
      return { success: false, message: 'Error al agregar producto' };
    }
  };

  // Remover producto del carrito (simplificado)
  const removeFromCart = (productId) => {
    try {
      const newCartItems = cartItems.filter(item => item.id !== productId);
      
      localStorage.setItem('cart', JSON.stringify(newCartItems));
      setCartItems(newCartItems);
      
      return { success: true, message: 'Producto removido del carrito' };
    } catch (error) {
      return { success: false, message: 'Error al remover producto' };
    }
  };

  // Actualizar cantidad de producto en el carrito usando API
  const updateCartItem = async (productId, quantity) => {
    try {
      setCartLoading(true);

      if (quantity <= 0) {
        return await removeFromCart(productId);
      }

      const response = await apiRequest(`/cart/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartItems(data.data.cart.items || []);
          return { success: true };
        }
      }
      
      return { success: false, message: 'Error al actualizar cantidad' };
    } catch (error) {
      return { success: false, message: 'Error al actualizar cantidad' };
    } finally {
      setCartLoading(false);
    }
  };

  // Actualizar cantidad de producto (simplificado)
  const updateQuantity = (productId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeFromCart(productId);
      }
      
      const newCartItems = cartItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      );
      
      localStorage.setItem('cart', JSON.stringify(newCartItems));
      setCartItems(newCartItems);
      
      return { success: true, message: 'Cantidad actualizada' };
    } catch (error) {
      return { success: false, message: 'Error al actualizar cantidad' };
    }
  };

  // Limpiar carrito (simplificado)
  const clearCart = () => {
    try {
      localStorage.removeItem('cart');
      setCartItems([]);
      return { success: true, message: 'Carrito limpiado' };
    } catch (error) {
      return { success: false, message: 'Error al limpiar carrito' };
    }
  };

  // Obtener total del carrito
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Obtener cantidad total de items
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Cargar carrito al montar el componente
  useEffect(() => {
    loadCart();
  }, []);

  const value = {
    cartItems,
    cartLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

export default CartContext;
