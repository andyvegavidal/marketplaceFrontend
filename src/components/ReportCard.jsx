
import React from 'react';
import {
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  BuildingStorefrontIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ReportCard = ({ report, onViewDetails }) => {
  // Obtener icono según el tipo de reporte
  const getReportTypeIcon = (type) => {
    const icons = {
      product: <FlagIcon className="w-5 h-5" />,
      store: <BuildingStorefrontIcon className="w-5 h-5" />,
      user: <UserIcon className="w-5 h-5" />,
      comment: <ChatBubbleLeftIcon className="w-5 h-5" />,
      review: <StarIcon className="w-5 h-5" />
    };
    return icons[type] || <FlagIcon className="w-5 h-5" />;
  };

  // Obtener color según el tipo de reporte
  const getReportTypeColor = (type) => {
    const colors = {
      product: 'text-blue-600 bg-blue-100',
      store: 'text-green-600 bg-green-100',
      user: 'text-purple-600 bg-purple-100',
      comment: 'text-orange-600 bg-orange-100',
      review: 'text-yellow-600 bg-yellow-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  // Obtener icono de estado
  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockIcon className="w-4 h-4 text-yellow-500" />,
      under_review: <ExclamationCircleIcon className="w-4 h-4 text-blue-500" />,
      resolved: <CheckCircleIcon className="w-4 h-4 text-green-500" />,
      rejected: <XCircleIcon className="w-4 h-4 text-red-500" />,
      escalated: <ExclamationCircleIcon className="w-4 h-4 text-purple-500" />
    };
    return icons[status] || <ClockIcon className="w-4 h-4 text-gray-500" />;
  };

  // Obtener texto de estado
  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      under_review: 'En revisión',
      resolved: 'Resuelto',
      rejected: 'Rechazado',
      escalated: 'Escalado'
    };
    return texts[status] || 'Desconocido';
  };

  // Obtener color de estado
  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-700 bg-yellow-100',
      under_review: 'text-blue-700 bg-blue-100',
      resolved: 'text-green-700 bg-green-100',
      rejected: 'text-red-700 bg-red-100',
      escalated: 'text-purple-700 bg-purple-100'
    };
    return colors[status] || 'text-gray-700 bg-gray-100';
  };

  // Obtener texto de categoría
  const getCategoryText = (category) => {
    const categories = {
      inappropriate_content: 'Contenido inapropiado',
      spam: 'Spam',
      fake_product: 'Producto falso',
      copyright_violation: 'Violación de derechos de autor',
      harassment: 'Acoso',
      scam: 'Estafa',
      violence: 'Violencia',
      hate_speech: 'Discurso de odio',
      adult_content: 'Contenido para adultos',
      misleading_information: 'Información engañosa',
      other: 'Otro'
    };
    return categories[category] || category;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener nombre del elemento reportado
  const getReportedItemName = () => {
    if (!report.reportedItemId) return 'Elemento eliminado';
    
    if (typeof report.reportedItemId === 'object') {
      return report.reportedItemId.name || 
             report.reportedItemId.title || 
             report.reportedItemId.fullName || 
             `${report.reportType} reportado`;
    }
    
    return `${report.reportType} reportado`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getReportTypeColor(report.reportType)}`}>
            {getReportTypeIcon(report.reportType)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getReportedItemName()}
            </h3>
            <p className="text-sm text-gray-500 capitalize">
              Reporte de {report.reportType === 'product' ? 'producto' :
                        report.reportType === 'store' ? 'tienda' :
                        report.reportType === 'user' ? 'usuario' :
                        report.reportType === 'comment' ? 'comentario' :
                        report.reportType === 'review' ? 'reseña' : report.reportType}
            </p>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
          {getStatusIcon(report.status)}
          <span>{getStatusText(report.status)}</span>
        </div>
      </div>

      {/* Categoría */}
      <div className="mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {getCategoryText(report.category)}
        </span>
      </div>

      {/* Descripción */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {report.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>Creado: {formatDate(report.createdAt)}</span>
          {report.priority && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              report.priority === 'high' ? 'bg-red-100 text-red-700' :
              report.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              Prioridad {report.priority === 'high' ? 'Alta' : 
                        report.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          )}
        </div>
        
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(report)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            <EyeIcon className="w-4 h-4" />
            <span>Ver detalles</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
