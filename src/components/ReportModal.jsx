
import React, { useState } from 'react';
import { 
  XMarkIcon,
  FlagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useReport } from '../context/ReportContext';

const ReportModal = ({ 
  isOpen, 
  onClose, 
  reportType, 
  reportedItemId, 
  reportedItem = null 
}) => {
  const { createReport, reportCategories, loading } = useReport();
  
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    evidence: [],
    tags: [],
    isAnonymous: false
  });
  
  const [errors, setErrors] = useState({});

  // Resetear formulario cuando se abre/cierra el modal
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        category: '',
        description: '',
        evidence: [],
        tags: [],
        isAnonymous: false
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'La descripción no puede exceder 1000 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const reportData = {
        reportType,
        reportedItemId,
        category: formData.category,
        description: formData.description.trim(),
        evidence: formData.evidence,
        tags: formData.tags,
        isAnonymous: formData.isAnonymous
      };

      await createReport(reportData);
      
      // Llamar callback para actualizar la lista si se proporciona
      if (onClose) {
        onClose(true); // true indica que se creó un reporte exitosamente
      }
    } catch (error) {
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getReportTypeLabel = () => {
    const labels = {
      product: 'producto',
      store: 'tienda',
      user: 'usuario',
      comment: 'comentario',
      review: 'reseña'
    };
    return labels[reportType] || 'contenido';
  };

  const getItemDisplayName = () => {
    if (!reportedItem) return '';
    
    switch (reportType) {
      case 'product':
        return reportedItem.name || '';
      case 'store':
        return reportedItem.storeName || reportedItem.name || '';
      case 'user':
        return reportedItem.fullName || reportedItem.name || '';
      case 'comment':
      case 'review':
        return reportedItem.content ? 
          `"${reportedItem.content.substring(0, 50)}..."` : '';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FlagIcon className="w-6 h-6 text-red-500 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">
                Reportar {getReportTypeLabel()}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Info del elemento reportado */}
          {getItemDisplayName() && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">
                Reportando:
              </h3>
              <p className="text-gray-600">{getItemDisplayName()}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría del reporte *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                {reportCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del problema *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe detalladamente el problema que encontraste. Proporciona toda la información relevante que ayude a nuestro equipo a entender la situación."
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-sm text-red-600">{errors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Mínimo 10 caracteres, máximo 1000
                  </p>
                )}
                <span className="text-sm text-gray-500">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            {/* Reporte anónimo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
              />
              <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                Enviar reporte de forma anónima
              </label>
            </div>

            {/* Advertencia */}
            <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Importante:</p>
                <p>
                  Los reportes falsos o maliciosos pueden resultar en la suspensión de tu cuenta. 
                  Asegúrate de que tu reporte sea legítimo y esté basado en hechos reales.
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Reporte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;