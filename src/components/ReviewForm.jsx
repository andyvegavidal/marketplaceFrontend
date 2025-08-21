import React, { useState, useEffect } from 'react';
import { useAuth, useReview } from '../context';
import StarRating from './StarRating';

function ReviewForm({ productId, onReviewSubmitted, userHasReviewed = false }) {
  const { user, isAuthenticated } = useAuth();
  const { addProductReview, reviewLoading } = useReview();
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    pros: '',
    cons: ''
  });
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Debes seleccionar una calificación';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'El comentario es obligatorio';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userHasReviewed) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const reviewData = {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        pros: formData.pros.trim() ? [formData.pros.trim()] : [],
        cons: formData.cons.trim() ? [formData.cons.trim()] : []
      };

      const result = await addProductReview(productId, reviewData);
      
      if (result && result.success) {
        // Reset form
        setFormData({
          rating: 0,
          title: '',
          comment: '',
          pros: '',
          cons: ''
        });
        setErrors({});
        
        // Show success message
        setSuccessMessage(result.message || '¡Reseña enviada exitosamente!');
        setShowSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
        
        // Callback to parent component
        if (onReviewSubmitted) {
          onReviewSubmitted(result.review);
        }
      } else {
        setErrors({ submit: result?.message || 'Error al enviar la reseña' });
      }
    } catch (error) {
      setErrors({ submit: 'Error al enviar la reseña: ' + error.message });
    }
  };

  const handleReset = () => {
    setFormData({
      rating: 0,
      title: '',
      comment: '',
      pros: '',
      cons: ''
    });
    setErrors({});
  };

  // Always show the form, but with different messaging
  const showDemoMessage = !isAuthenticated();

  if (userHasReviewed) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-blue-600 text-xl mr-2">✓</div>
          <p className="text-blue-800 font-medium">
            Ya has escrito una reseña para este producto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Escribe una reseña
      </h3>

      {showDemoMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-yellow-800 text-sm">
            <span className="font-medium">Modo Demo:</span> Puedes escribir una reseña de prueba. Para funcionalidad completa, inicia sesión.
          </p>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-2">✓</div>
            <p className="text-green-800 font-medium">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-2">✗</div>
            <p className="text-red-800 font-medium">
              {errors.submit}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación *
          </label>
          <div className="flex items-center space-x-2">
            <StarRating
              rating={formData.rating}
              onRatingChange={handleRatingChange}
              interactive={true}
              size="lg"
            />
            <span className="text-sm text-gray-500">
              ({formData.rating}/5)
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la reseña *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Resumen de tu experiencia con el producto"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.title.length}/100
            </p>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario detallado *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            placeholder="Describe tu experiencia con el producto, su calidad, funcionalidad, etc."
            rows={4}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.comment ? 'border-red-300' : 'border-gray-300'
            }`}
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.comment.length}/1000
            </p>
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspectos positivos
            </label>
            <textarea
              value={formData.pros}
              onChange={(e) => handleInputChange('pros', e.target.value)}
              placeholder="¿Qué te gustó del producto?"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.pros.length}/500
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aspectos a mejorar
            </label>
            <textarea
              value={formData.cons}
              onChange={(e) => handleInputChange('cons', e.target.value)}
              placeholder="¿Qué podría mejorar?"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.cons.length}/500
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Limpiar formulario
          </button>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={reviewLoading || formData.rating === 0 || !formData.title.trim() || !formData.comment.trim()}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {reviewLoading ? 'Enviando...' : 'Enviar reseña'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;
