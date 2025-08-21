import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const OrderProvider = ({ children }) => {
  const { isAuthenticated, apiRequest } = useAuth();
  const [orders, setOrders] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]); // Órdenes de la tienda del usuario
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  // Cargar órdenes del usuario
  const loadUserOrders = async () => {
    if (!isAuthenticated()) return;

    try {
      setOrderLoading(true);
      const response = await apiRequest('orders/my-orders');
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setOrderHistory(data.orders || []);
      }
    } catch (error) {
    } finally {
      setOrderLoading(false);
    }
  };

  // Cargar órdenes de la tienda del usuario
  const loadStoreOrders = async () => {
    if (!isAuthenticated()) return;

    try {
      setOrderLoading(true);
      const response = await apiRequest('orders/store-orders');
      
      if (response.ok) {
        const data = await response.json();
        setStoreOrders(data.orders || []);
      }
    } catch (error) {
    } finally {
      setOrderLoading(false);
    }
  };

  // Crear nueva orden
  const createOrder = async (orderData) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para crear una orden');
    }

    try {
      setOrderLoading(true);
      const response = await apiRequest('orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => [data.data, ...prev]);
        setOrderHistory(prev => [data.data, ...prev]);
        
        return { success: true, order: data.data, message: 'Orden creada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al crear orden' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setOrderLoading(false);
    }
  };

  // Obtener detalles de una orden específica
  const getOrderById = async (orderId) => {
    if (!isAuthenticated()) return null;

    try {
      setOrderLoading(true);
      const response = await apiRequest(`orders/${orderId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.order;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    } finally {
      setOrderLoading(false);
    }
  };

  // Actualizar estado de una orden (para tiendas)
  const updateOrderStatus = async (orderId, status, notes = '') => {
    if (!isAuthenticated()) return;

    try {
      setOrderLoading(true);
      const response = await apiRequest(`orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar en órdenes de la tienda
        setStoreOrders(prev => 
          prev.map(order => 
            order._id === orderId ? data.order : order
          )
        );
        
        return { success: true, order: data.order, message: 'Estado de orden actualizado' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al actualizar estado' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setOrderLoading(false);
    }
  };

  // Cancelar orden
  const cancelOrder = async (orderId, reason = '') => {
    if (!isAuthenticated()) return;

    try {
      setOrderLoading(true);
      const response = await apiRequest(`orders/${orderId}/cancel`, {
        method: 'PUT',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar en órdenes del usuario
        setOrders(prev => 
          prev.map(order => 
            order._id === orderId ? data.order : order
          )
        );
        
        return { success: true, order: data.order, message: 'Orden cancelada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al cancelar orden' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setOrderLoading(false);
    }
  };

  // Obtener órdenes por estado
  const getOrdersByStatus = (status, isStore = false) => {
    const targetOrders = isStore ? storeOrders : orders;
    return targetOrders.filter(order => order.status === status);
  };

  // Obtener órdenes pendientes
  const getPendingOrders = (isStore = false) => {
    return getOrdersByStatus('pending', isStore);
  };

  // Obtener órdenes completadas
  const getCompletedOrders = (isStore = false) => {
    return getOrdersByStatus('completed', isStore);
  };

  // Obtener órdenes canceladas
  const getCancelledOrders = (isStore = false) => {
    return getOrdersByStatus('cancelled', isStore);
  };

  // Calcular estadísticas de órdenes
  const getOrderStats = (isStore = false) => {
    const targetOrders = isStore ? storeOrders : orders;
    
    const stats = {
      total: targetOrders.length,
      pending: targetOrders.filter(order => order.status === 'pending').length,
      processing: targetOrders.filter(order => order.status === 'processing').length,
      shipped: targetOrders.filter(order => order.status === 'shipped').length,
      delivered: targetOrders.filter(order => order.status === 'delivered').length,
      completed: targetOrders.filter(order => order.status === 'completed').length,
      cancelled: targetOrders.filter(order => order.status === 'cancelled').length,
      totalRevenue: targetOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0)
    };
    
    return stats;
  };

  // Obtener órdenes recientes (últimos 30 días)
  const getRecentOrders = (isStore = false, days = 30) => {
    const targetOrders = isStore ? storeOrders : orders;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return targetOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= cutoffDate;
    });
  };

  // Buscar órdenes
  const searchOrders = (query, isStore = false) => {
    const targetOrders = isStore ? storeOrders : orders;
    const lowercaseQuery = query.toLowerCase();
    
    return targetOrders.filter(order => 
      order._id.toLowerCase().includes(lowercaseQuery) ||
      order.customerName?.toLowerCase().includes(lowercaseQuery) ||
      order.status.toLowerCase().includes(lowercaseQuery) ||
      order.items?.some(item => 
        item.productName?.toLowerCase().includes(lowercaseQuery)
      )
    );
  };

  // Reordenar (crear nueva orden basada en una anterior)
  const reorder = async (orderId) => {
    if (!isAuthenticated()) return;

    try {
      setOrderLoading(true);
      const response = await apiRequest(`orders/${orderId}/reorder`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(prev => [data.order, ...prev]);
        
        return { success: true, order: data.order, message: 'Orden recreada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al reordenar' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setOrderLoading(false);
    }
  };

  // Cargar órdenes cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated()) {
      loadUserOrders();
      loadStoreOrders(); // También cargar órdenes de tienda si es aplicable
    } else {
      setOrders([]);
      setStoreOrders([]);
      setOrderHistory([]);
    }
  }, [isAuthenticated()]);

  const value = {
    orders,
    storeOrders,
    orderHistory,
    orderLoading,
    loadUserOrders,
    loadStoreOrders,
    createOrder,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrdersByStatus,
    getPendingOrders,
    getCompletedOrders,
    getCancelledOrders,
    getOrderStats,
    getRecentOrders,
    searchOrders,
    reorder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Hook personalizado para usar el contexto de órdenes
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder debe ser usado dentro de OrderProvider');
  }
  return context;
};

export default OrderContext;
