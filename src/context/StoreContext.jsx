import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const StoreContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const StoreProvider = ({ children }) => {
  const { isAuthenticated, apiRequest } = useAuth();
  const [publicStores, setPublicStores] = useState([]);
  const [subscribedStores, setSubscribedStores] = useState([]);
  const [userStore, setUserStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(false);

  // Cargar todas las tiendas públicas
  const loadPublicStores = async () => {
    try {
      setStoreLoading(true);
      const response = await fetch(`${API_BASE_URL}/stores/`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.stores) {
          const stores = data.data.stores.map(store => ({
            id: store._id,
            fullName: store.userId.fullName || 'Usuario desconocido',
            email: store.userId.email || 'hola@ejemplo.com',
            address: store.userId.address || '',
            phone: store.userId.phone || '',
            rating: store.rating || 0,
            description: store.description || '',
            categories: store.categories || [],
            totalSales: store.salesCount || 0,
            products: store.products || [],
            active: store.isActive !== false,
            joinDate: store.createdAt || store.joinDate || store.registerDate,
            userId: store.userId?._id || store.userId
          }));
          const activeStores = stores.filter(store => store.active);
          setPublicStores(activeStores);
        } else {
          setPublicStores([]);
        }
      } else {
        setPublicStores([]);
      }
    } catch (error) {
    } finally {
      setStoreLoading(false);
    }
  };

  // Cargar tiendas suscritas (requiere autenticación)
  const loadSubscribedStores = async () => {
    if (!isAuthenticated()) return;

    try {
      setStoreLoading(true);
      const response = await apiRequest('stores/subscribed');
      
      if (response.ok) {
        const data = await response.json();
        setSubscribedStores(data.stores || []);
      }
    } catch (error) {
    } finally {
      setStoreLoading(false);
    }
  };

  // Cargar la tienda del usuario (si tiene una)
  const loadUserStore = async () => {
    if (!isAuthenticated()) return;

    try {
      setStoreLoading(true);
      const response = await apiRequest('stores/my-store');
      
      if (response.ok) {
        const data = await response.json();
        setUserStore(data.store);
      } else if (response.status === 404) {
        setUserStore(null); // Usuario no tiene tienda
      }
    } catch (error) {
    } finally {
      setStoreLoading(false);
    }
  };

  // Crear nueva tienda
  const createStore = async (storeData) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para crear una tienda');
    }

    try {
      setStoreLoading(true);
      const response = await apiRequest('stores/create', {
        method: 'POST',
        body: JSON.stringify(storeData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserStore(data.store);
        return { success: true, store: data.store, message: 'Tienda creada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al crear tienda' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Actualizar tienda del usuario
  const updateStore = async (storeData) => {
    if (!isAuthenticated() || !userStore) return;

    try {
      setStoreLoading(true);
      const response = await apiRequest(`stores/${userStore._id}`, {
        method: 'PUT',
        body: JSON.stringify(storeData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserStore(data.store);
        return { success: true, store: data.store, message: 'Tienda actualizada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al actualizar tienda' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Suscribirse a una tienda
  const subscribeToStore = async (storeId) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para suscribirte a una tienda');
    }

    try {
      setStoreLoading(true);
      const response = await apiRequest(`stores/${storeId}/subscribe`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSubscribedStores(prev => [...prev, data.store]);
        return { success: true, message: 'Suscrito a la tienda exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al suscribirse' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Desuscribirse de una tienda
  const unsubscribeFromStore = async (storeId) => {
    if (!isAuthenticated()) return;

    try {
      setStoreLoading(true);
      const response = await apiRequest(`stores/${storeId}/unsubscribe`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSubscribedStores(prev => prev.filter(store => store._id !== storeId));
        return { success: true, message: 'Desuscrito de la tienda exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al desuscribirse' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Obtener detalles de una tienda específica
  const getStoreById = async (storeId) => {
    try {
      setStoreLoading(true);
      const response = await fetch(`${API_BASE_URL}/stores/${storeId}`);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, store: data.store };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Tienda no encontrada' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Verificar si el usuario está suscrito a una tienda
  const isSubscribedToStore = (storeId) => {
    return subscribedStores.some(store => store._id === storeId);
  };

  // Verificar si el usuario es dueño de una tienda
  const isStoreOwner = () => {
    return !!userStore;
  };

  // Buscar tiendas
  const searchStores = async (query) => {
    try {
      setStoreLoading(true);
      const response = await fetch(`${API_BASE_URL}/stores/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, stores: data.stores };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error en la búsqueda' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setStoreLoading(false);
    }
  };

  // Cargar datos cuando el componente se monta o cuando cambia la autenticación
  useEffect(() => {
    loadPublicStores();
    if (isAuthenticated()) {
      loadSubscribedStores();
      loadUserStore();
    } else {
      setSubscribedStores([]);
      setUserStore(null);
    }
  }, [isAuthenticated()]);

  const value = {
    publicStores,
    subscribedStores,
    userStore,
    storeLoading,
    loadPublicStores,
    loadSubscribedStores,
    loadUserStore,
    createStore,
    updateStore,
    subscribeToStore,
    unsubscribeFromStore,
    getStoreById,
    isSubscribedToStore,
    isStoreOwner,
    searchStores,
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado para usar el contexto de tiendas
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore debe ser usado dentro de StoreProvider');
  }
  return context;
};

export default StoreContext;
