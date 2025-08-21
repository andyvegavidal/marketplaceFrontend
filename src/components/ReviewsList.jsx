import React, { useState, useEffect } from 'react';
import { useAuth, useReview } from '../context';
import StarRating from './StarRating';
import { toast } from 'react-hot-toast';

// Helper function to get user display name from review object
const getUserDisplayName = (review) => {
  if (!review) return 'Usuario Anónimo';
  
  // Try different possible property names for user info
  let name = null;
  
  if (review.userName && typeof review.userName === 'string') name = review.userName;
  else if (review.userId?.fullName && typeof review.userId.fullName === 'string') name = review.userId.fullName;
  else if (review.userId?.name && typeof review.userId.name === 'string') name = review.userId.name;
  else if (review.userFullName && typeof review.userFullName === 'string') name = review.userFullName;
  else if (review.user?.fullName && typeof review.user.fullName === 'string') name = review.user.fullName;
  else if (review.user?.name && typeof review.user.name === 'string') name = review.user.name;
  
  return name && name.trim() ? name.trim() : 'Usuario Anónimo';
};

function ReviewsList({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const { 
    getProductReviews, 
    reportContent, 
    markReviewHelpful,
    reviewLoading,
    reviews: contextReviews
  } = useReview();
  
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [reportingReview, setReportingReview] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Get reviews for this product from context
  const reviews = contextReviews[`product_${productId}`] || [];

  // Cargar reseñas al montar el componente
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        await getProductReviews(productId);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadReviews();
    }
  }, [productId, getProductReviews]);

  // Filtrar y ordenar reseñas
  const filteredAndSortedReviews = React.useMemo(() => {
    let filtered = [...reviews];

    // Filtrar por calificación
    if (filterBy !== 'all') {
      const rating = parseInt(filterBy);
      filtered = filtered.filter(review => review.rating === rating);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, sortBy, filterBy]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para marcar como útil');
      return;
    }

    try {
      const result = await markReviewHelpful(reviewId);
      if (result.success) {
        // Actualizar el estado local
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
            : review
        ));
        toast.success('Marcado como útil exitosamente');
      } else {
        toast.error(result.message || 'Error al marcar como útil');
      }
    } catch (error) {
      toast.error('Error al marcar como útil');
    }
  };

  const handleReport = async (review) => {
    if (!reportReason.trim()) {
      toast.error('Por favor selecciona una razón para el reporte');
      return;
    }

    try {
      const result = await reportContent(review._id, 'review', reportReason);
      if (result.success) {
        toast.success('Reseña reportada exitosamente');
      } else {
        toast.error(result.message || 'Error al reportar reseña');
      }
    } catch (error) {
      toast.error('Error al reportar reseña');
    }

    setReportingReview(null);
    setReportReason('');
  };

  const getRatingCounts = () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      counts[review.rating] = (counts[review.rating] || 0) + 1;
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();

  if (loading || reviewLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando reseñas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Reseñas ({reviews.length})
        </h3>
      </div>

      {/* Filtros y ordenamiento */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap gap-4">
            {/* Filtro por calificación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por:
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas las reseñas</option>
                <option value="5">5 estrellas ({ratingCounts[5]})</option>
                <option value="4">4 estrellas ({ratingCounts[4]})</option>
                <option value="3">3 estrellas ({ratingCounts[3]})</option>
                <option value="2">2 estrellas ({ratingCounts[2]})</option>
                <option value="1">1 estrella ({ratingCounts[1]})</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Más recientes</option>
                <option value="oldest">Más antiguas</option>
                <option value="highest">Mejor calificadas</option>
                <option value="lowest">Peor calificadas</option>
                <option value="helpful">Más útiles</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            Mostrando {filteredAndSortedReviews.length} de {reviews.length} reseñas
          </p>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {filteredAndSortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">⭐</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {reviews.length === 0 ? 'Aún no hay reseñas' : 'No hay reseñas que coincidan con los filtros'}
            </h4>
            <p className="text-gray-600">
              {reviews.length === 0 
                ? '¡Sé el primero en escribir una reseña!'
                : 'Prueba con otros filtros para ver más reseñas'
              }
            </p>
          </div>
        ) : (
          filteredAndSortedReviews.map((review) => (
            <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Header de la reseña */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {(() => {
                      const name = getUserDisplayName(review);
                      return (name && typeof name === 'string' && name.length > 0) 
                        ? name.charAt(0).toUpperCase() 
                        : '?';
                    })()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{getUserDisplayName(review) || 'Usuario Anónimo'}</h4>
                    <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-600">({review.rating}/5)</span>
                </div>
              </div>

              {/* Título de la reseña */}
              {review.title && (
                <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
              )}

              {/* Comentario */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

              {/* Pros y Cons */}
              {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {review.pros && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h6 className="text-sm font-medium text-green-800 mb-1 flex items-center">
                        <span className="text-green-600 mr-1">✓</span>
                        Aspectos positivos
                      </h6>
                      <p className="text-sm text-green-700">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h6 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                        <span className="text-red-600 mr-1">⚠</span>
                        Aspectos a mejorar
                      </h6>
                      <p className="text-sm text-red-700">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    disabled={!isAuthenticated()}
                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 disabled:hover:text-gray-500"
                  >
                    <span>👍</span>
                    <span>Útil ({review.helpfulCount || 0})</span>
                  </button>
                  
                  <button
                    onClick={() => setReportingReview(review._id)}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    ⚠️ Reportar
                  </button>
                </div>

                {review.verified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    ✓ Compra verificada
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de reporte */}
      {reportingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Reportar reseña</h3>
            <div className="space-y-3 mb-4">
              {['Contenido inapropiado', 'Información falsa', 'Spam', 'Lenguaje ofensivo', 'Conflicto de interés', 'Otro'].map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mr-2"
                  />
                  {reason}
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleReport(reviews.find(r => r._id === reportingReview))}
                disabled={!reportReason}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Enviar reporte
              </button>
              <button
                onClick={() => {
                  setReportingReview(null);
                  setReportReason('');
                }}
                className="flex-1 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewsList;
