import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const WishlistContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, apiRequest } = useAuth();
  const { showToast } = useNotification();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Cargar wishlist desde el servidor
  const loadWishlist = async () => {
    if (!isAuthenticated()) {
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await apiRequest('/wishlist');
      
      if (response.ok) {
        const data = await response.json();
        const items = data.data?.items || data.items || [];
        setWishlistItems(items);
      } else {
        const errorData = await response.json();
        showToast(errorData.message || 'Error al cargar la lista de deseos', 'error');
      }
    } catch (error) {
      showToast('Error de conexión al cargar la lista de deseos', 'error');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Agregar producto a la wishlist
  const addToWishlist = async (productId, productName = '') => {
    if (!isAuthenticated()) {
      return { success: false, message: 'Debes iniciar sesión para agregar productos a la lista de deseos' };
    }

    try {
      setWishlistLoading(true);
      const response = await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadWishlist();
        const message = productName 
          ? `${productName} agregado a tu lista de deseos`
          : 'Producto agregado a tu lista de deseos';
        showToast(message, 'success');
        return { success: true, message };
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Error al agregar a la lista de deseos';
        showToast(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión';
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setWishlistLoading(false);
    }
  };

  // Remover producto de la wishlist
  const removeFromWishlist = async (productId, productName = '') => {
    if (!isAuthenticated()) {
      showToast('Debes iniciar sesión para gestionar tu lista de deseos', 'error');
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await apiRequest(`/wishlist/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const data = await response.json();
        await loadWishlist();
        const message = productName 
          ? `${productName} eliminado de tu lista de deseos`
          : 'Producto eliminado de tu lista de deseos';
        showToast(message, 'success');
        return { success: true, message };
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Error al eliminar de la lista de deseos';
        showToast(errorMessage, 'error');
        return { success: false, message: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Error de conexión';
      showToast(errorMessage, 'error');
      return { success: false, message: errorMessage };
    } finally {
      setWishlistLoading(false);
    }
  };

  // Toggle producto en la wishlist (agregar si no está, remover si está)
  const toggleWishlist = async (productId, productName = '') => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId, productName);
    } else {
      return await addToWishlist(productId, productName);
    }
  };

  // Limpiar wishlist completa
  const clearWishlist = async () => {
    if (!isAuthenticated()) {
      showToast('Debes iniciar sesión para gestionar tu lista de deseos', 'error');
      return;
    }

    try {
      setWishlistLoading(true);
      const response = await apiRequest('/wishlist/clear', {
        method: 'DELETE',
      });

      if (response.ok) {
        setWishlistItems([]);
        return { success: true, message: 'Lista de deseos vaciada' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al vaciar lista de deseos' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setWishlistLoading(false);
    }
  };

  // Verificar si un producto está en la wishlist
  const isInWishlist = (productId) => {
    const found = wishlistItems.some(item => {
      const itemProductId = item.productId?._id || item.productId || item.product?._id || item._id;
      return itemProductId === productId || 
             itemProductId?.toString() === productId?.toString();
    });
    
    return found;
  };

  // Obtener cantidad total de items en la wishlist
  const getWishlistItemCount = () => {
    return wishlistItems.length;
  };

  // Mover productos de wishlist al carrito
  const moveToCart = async (productId, quantity = 1) => {
    // Esta función requeriría acceso al CartContext
    // Por ahora, solo removemos de wishlist y retornamos el productId
    // El componente que use esta función puede manejar agregar al carrito
    try {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        return { success: true, productId, quantity, message: 'Producto movido al carrito' };
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Error al mover producto' };
    }
  };

  // Cargar wishlist cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated()) {
      loadWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [isAuthenticated()]);

  const value = {
    wishlistItems,
    wishlistLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    loadWishlist,
    isInWishlist,
    getWishlistItemCount,
    moveToCart,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook personalizado para usar el contexto de wishlist
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist debe ser usado dentro de WishlistProvider');
  }
  return context;
};

export default WishlistContext;
