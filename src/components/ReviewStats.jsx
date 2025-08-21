import React, { useState, useEffect } from 'react';
import { useReview } from '../context';
import StarRating from './StarRating';

function ReviewStats({ productId = null, storeId = null }) {
  const { getRatingDistribution, reviewLoading } = useReview();
  const [distribution, setDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const isProduct = productId !== null;
  const targetId = isProduct ? productId : storeId;
  const targetType = isProduct ? 'product' : 'store';

  useEffect(() => {
    const loadStats = async () => {
      if (!targetId) return;

      try {
        const dist = await getRatingDistribution(targetId, targetType);
        setDistribution(dist);

        const total = Object.values(dist).reduce((sum, count) => sum + count, 0);
        setTotalReviews(total);

        if (total > 0) {
          const weightedSum = Object.entries(dist).reduce((sum, [rating, count]) => {
            return sum + (parseInt(rating) * count);
          }, 0);
          setAverageRating(Number((weightedSum / total).toFixed(1)));
        } else {
          setAverageRating(0);
        }
      } catch (error) {
      }
    };

    loadStats();
  }, [targetId, targetType, getRatingDistribution]);

  if (reviewLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-3 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (totalReviews === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 text-3xl mb-2">⭐</div>
        <p className="text-gray-600 text-sm">
          Aún no hay calificaciones
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen de calificaciones
      </h3>
      
      {/* Rating promedio */}
      <div className="flex items-center mb-6">
        <div className="text-center mr-6">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {averageRating}
          </div>
          <StarRating rating={averageRating} size="small" />
          <p className="text-sm text-gray-600 mt-1">
            {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
          </p>
        </div>

        {/* Distribución de estrellas */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center mb-1">
                <span className="text-sm text-gray-600 w-3 mr-2">{stars}</span>
                <span className="text-yellow-400 text-sm mr-2">★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {Math.round(((distribution[5] + distribution[4]) / totalReviews) * 100) || 0}%
          </div>
          <p className="text-xs text-gray-600">Positivas</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-600">
            {Math.round((distribution[3] / totalReviews) * 100) || 0}%
          </div>
          <p className="text-xs text-gray-600">Neutrales</p>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">
            {Math.round(((distribution[2] + distribution[1]) / totalReviews) * 100) || 0}%
          </div>
          <p className="text-xs text-gray-600">Negativas</p>
        </div>
      </div>
    </div>
  );
}

export default ReviewStats;
