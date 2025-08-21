import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, apiRequest } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Función para mostrar toast (local, no requiere API)
  const showToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toISOString()
    };

    setToasts(prev => [...prev, toast]);

    // Remover toast automáticamente después del duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  };

  // Función para remover toast manualmente
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cargar notificaciones del usuario
  const loadNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      setNotificationLoading(true);
      const response = await apiRequest('notifications');
      
      if (response.ok) {
        const data = await response.json();
        const userNotifications = data.notifications || [];
        setNotifications(userNotifications);
        
        // Contar notificaciones no leídas
        const unread = userNotifications.filter(notification => !notification.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
    } finally {
      setNotificationLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiRequest(`notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Actualizar contador de no leídas
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al marcar como leída' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = async () => {
    if (!isAuthenticated()) return;

    try {
      setNotificationLoading(true);
      const response = await apiRequest('notifications/read-all', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        
        return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al marcar todas como leídas' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setNotificationLoading(false);
    }
  };

  // Eliminar notificación
  const deleteNotification = async (notificationId) => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiRequest(`notifications/${notificationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => {
          const notification = prev.find(n => n._id === notificationId);
          if (notification && !notification.read) {
            setUnreadCount(prevCount => Math.max(0, prevCount - 1));
          }
          return prev.filter(n => n._id !== notificationId);
        });
        
        return { success: true, message: 'Notificación eliminada' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al eliminar notificación' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Crear notificación (para testing o notificaciones locales)
  const createNotification = async (notificationData) => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiRequest('notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => [data.notification, ...prev]);
        
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1);
        }
        
        return { success: true, notification: data.notification };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al crear notificación' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Obtener notificaciones por tipo
  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  // Obtener notificaciones no leídas
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Obtener notificaciones recientes (últimas 24 horas)
  const getRecentNotifications = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return notifications.filter(notification => {
      const notificationDate = new Date(notification.createdAt);
      return notificationDate >= yesterday;
    });
  };

  // Limpiar todas las notificaciones leídas
  const clearReadNotifications = async () => {
    if (!isAuthenticated()) return;

    try {
      setNotificationLoading(true);
      const response = await apiRequest('notifications/clear-read', {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => !notification.read));
        return { success: true, message: 'Notificaciones leídas eliminadas' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al limpiar notificaciones' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setNotificationLoading(false);
    }
  };

  // Configurar preferencias de notificaciones
  const updateNotificationPreferences = async (preferences) => {
    if (!isAuthenticated()) return;

    try {
      const response = await apiRequest('notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, preferences: data.preferences };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al actualizar preferencias' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  // Polling para nuevas notificaciones (opcional)
  const startNotificationPolling = (interval = 30000) => {
    const pollInterval = setInterval(() => {
      if (isAuthenticated()) {
        loadNotifications();
      }
    }, interval);

    return () => clearInterval(pollInterval);
  };

  // Cargar notificaciones cuando el usuario se autentique
  useEffect(() => {
    if (isAuthenticated()) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated()]);

  const value = {
    notifications,
    unreadCount,
    notificationLoading,
    toasts,
    showToast,
    removeToast,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
    clearReadNotifications,
    updateNotificationPreferences,
    startNotificationPolling,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto de notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider');
  }
  return context;
};

export default NotificationContext;
