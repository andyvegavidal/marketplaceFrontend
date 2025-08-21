import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ReviewContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const ReviewProvider = ({ children }) => {
  const { isAuthenticated, apiRequest } = useAuth();
  const [reviews, setReviews] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [userReviews, setUserReviews] = useState([]);

  // Obtener reviews de un producto
  const getProductReviews = async (productId) => {
    try {
      setReviewLoading(true);
      
      // Verificar si ya tenemos las reviews en caché
      if (reviews[`product_${productId}`]) {
        return reviews[`product_${productId}`];
      }

      const response = await fetch(`${API_BASE_URL}/reviews/product/${productId}`);
      
      if (response.ok) {
        const data = await response.json();
        const productReviews = data.reviews || [];
        
        // Guardar en caché
        setReviews(prev => ({
          ...prev,
          [`product_${productId}`]: productReviews
        }));
        
        return productReviews;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    } finally {
      setReviewLoading(false);
    }
  };

  // Obtener reviews de una tienda
  const getStoreReviews = async (storeId) => {
    try {
      setReviewLoading(true);
      
      // Verificar si ya tenemos las reviews en caché
      if (reviews[`store_${storeId}`]) {
        return reviews[`store_${storeId}`];
      }

      const response = await fetch(`${API_BASE_URL}/reviews/store/${storeId}`);
      
      if (response.ok) {
        const data = await response.json();
        const storeReviews = data.reviews || [];
        
        // Guardar en caché
        setReviews(prev => ({
          ...prev,
          [`store_${storeId}`]: storeReviews
        }));
        
        return storeReviews;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    } finally {
      setReviewLoading(false);
    }
  };

  // Agregar review a un producto
  const addProductReview = async (productId, reviewData) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para agregar una reseña');
    }

    try {
      setReviewLoading(true);
      const response = await apiRequest(`reviews/product/${productId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar caché de reviews del producto
        const currentReviews = reviews[`product_${productId}`] || [];
        setReviews(prev => ({
          ...prev,
          [`product_${productId}`]: [data.review, ...currentReviews]
        }));

        // Actualizar reviews del usuario
        setUserReviews(prev => [data.review, ...prev]);

        return { success: true, review: data.review, message: 'Reseña agregada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al agregar reseña' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setReviewLoading(false);
    }
  };

  // Agregar review a una tienda
  const addStoreReview = async (storeId, reviewData) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para agregar una reseña');
    }

    try {
      setReviewLoading(true);
      const response = await apiRequest(`reviews/store/${storeId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar caché de reviews de la tienda
        const currentReviews = reviews[`store_${storeId}`] || [];
        setReviews(prev => ({
          ...prev,
          [`store_${storeId}`]: [data.review, ...currentReviews]
        }));

        // Actualizar reviews del usuario
        setUserReviews(prev => [data.review, ...prev]);

        return { success: true, review: data.review, message: 'Reseña agregada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al agregar reseña' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setReviewLoading(false);
    }
  };

  // Actualizar una review
  const updateReview = async (reviewId, reviewData) => {
    if (!isAuthenticated()) return;

    try {
      setReviewLoading(true);
      const response = await apiRequest(`reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify(reviewData),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar en todas las ubicaciones donde aparezca la review
        setReviews(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key] = updated[key].map(review => 
              review._id === reviewId ? data.review : review
            );
          });
          return updated;
        });

        // Actualizar en reviews del usuario
        setUserReviews(prev => 
          prev.map(review => review._id === reviewId ? data.review : review)
        );

        return { success: true, review: data.review, message: 'Reseña actualizada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al actualizar reseña' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setReviewLoading(false);
    }
  };

  // Eliminar una review
  const deleteReview = async (reviewId) => {
    if (!isAuthenticated()) return;

    try {
      setReviewLoading(true);
      const response = await apiRequest(`reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remover de todas las ubicaciones donde aparezca la review
        setReviews(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key] = updated[key].filter(review => review._id !== reviewId);
          });
          return updated;
        });

        // Remover de reviews del usuario
        setUserReviews(prev => prev.filter(review => review._id !== reviewId));

        return { success: true, message: 'Reseña eliminada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al eliminar reseña' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setReviewLoading(false);
    }
  };

  // Obtener promedio de calificaciones de un producto
  const getProductAverageRating = async (productId) => {
    try {
      const productReviews = await getProductReviews(productId);
      if (productReviews.length === 0) return 0;

      const totalRating = productReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return Number((totalRating / productReviews.length).toFixed(1));
    } catch (error) {
      return 0;
    }
  };

  // Obtener promedio de calificaciones de una tienda
  const getStoreAverageRating = async (storeId) => {
    try {
      const storeReviews = await getStoreReviews(storeId);
      if (storeReviews.length === 0) return 0;

      const totalRating = storeReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
      return Number((totalRating / storeReviews.length).toFixed(1));
    } catch (error) {
      return 0;
    }
  };

  // Obtener reviews del usuario actual
  const getUserReviews = async () => {
    if (!isAuthenticated()) return [];

    try {
      setReviewLoading(true);
      const response = await apiRequest('reviews/my-reviews');
      
      if (response.ok) {
        const data = await response.json();
        setUserReviews(data.reviews || []);
        return data.reviews || [];
      } else {
        return [];
      }
    } catch (error) {
      return [];
    } finally {
      setReviewLoading(false);
    }
  };

  // Reportar una review
  const reportReview = async (reviewId, reason) => {
    if (!isAuthenticated()) {
      throw new Error('Debes iniciar sesión para reportar contenido');
    }

    try {
      setReviewLoading(true);
      const response = await apiRequest(`reviews/${reviewId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        return { success: true, message: 'Reseña reportada exitosamente' };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al reportar reseña' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setReviewLoading(false);
    }
  };

  // Verificar si el usuario ya ha reseñado un producto/tienda
  const hasUserReviewed = (targetId, targetType = 'product') => {
    return userReviews.some(review => 
      review.targetId === targetId && review.targetType === targetType
    );
  };

  // Obtener distribución de calificaciones (para gráficos)
  const getRatingDistribution = async (targetId, targetType = 'product') => {
    try {
      const targetReviews = targetType === 'product' 
        ? await getProductReviews(targetId)
        : await getStoreReviews(targetId);

      const distribution = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
      };

      targetReviews.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          distribution[review.rating]++;
        }
      });

      return distribution;
    } catch (error) {
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  };

  // Limpiar caché de reviews
  const clearReviewsCache = () => {
    setReviews({});
  };

  // Cargar reviews del usuario al autenticarse
  useEffect(() => {
    if (isAuthenticated()) {
      getUserReviews();
    } else {
      setUserReviews([]);
      setReviews({});
    }
  }, [isAuthenticated()]);

  const value = {
    reviews,
    userReviews,
    reviewLoading,
    getProductReviews,
    getStoreReviews,
    addProductReview,
    addStoreReview,
    updateReview,
    deleteReview,
    getProductAverageRating,
    getStoreAverageRating,
    getUserReviews,
    reportReview,
    hasUserReviewed,
    getRatingDistribution,
    clearReviewsCache,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

// Hook personalizado para usar el contexto de reviews
export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview debe ser usado dentro de ReviewProvider');
  }
  return context;
};

export default ReviewContext;
