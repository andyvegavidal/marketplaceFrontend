import React, { useState, useEffect } from 'react';
import { 
  FlagIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useReport } from '../context/ReportContext';
import ReportCard from '../components/ReportCard';

const MyReports = () => {
  const { 
    reports,
    myReports, 
    loading, 
    error, 
    pagination,
    getReports,
    getMyReports, 
    reportCategories 
  } = useReport();
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    page: 1
  });
  
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    getReports({ page: filters.page });
  }, [filters.page]);

  // Función para refrescar la lista de reportes
  const refreshReports = () => {
    getReports({ page: filters.page, ...filters });
  };

  // Aplicar filtros
  const applyFilters = () => {
    const queryParams = {
      page: 1,
      ...filters
    };
    
    // Limpiar parámetros vacíos
    Object.keys(queryParams).forEach(key => {
      if (!queryParams[key]) delete queryParams[key];
    });
    
    getReports(queryParams);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  // Obtener icono de estado
  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockIcon className="w-5 h-5 text-yellow-500" />,
      under_review: <ExclamationCircleIcon className="w-5 h-5 text-blue-500" />,
      resolved: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      rejected: <XCircleIcon className="w-5 h-5 text-red-500" />,
      escalated: <ExclamationCircleIcon className="w-5 h-5 text-purple-500" />
    };
    return icons[status] || <ClockIcon className="w-5 h-5 text-gray-500" />;
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
      pending: 'bg-yellow-100 text-yellow-800',
      under_review: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      escalated: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Obtener nombre de categoría
  const getCategoryName = (categoryValue) => {
    const category = reportCategories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
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

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <FlagIcon className="w-8 h-8 text-red-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Reportes
            </h1>
          </div>
          <p className="text-gray-600">
            Gestiona y da seguimiento a los reportes que has enviado.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="under_review">En revisión</option>
                <option value="resolved">Resuelto</option>
                <option value="rejected">Rechazado</option>
                <option value="escalated">Escalado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todas las categorías</option>
                {reportCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FlagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes reportes
              </h3>
              <p className="text-gray-600">
                Cuando reportes contenido inapropiado, aparecerá aquí.
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <ReportCard
                key={report._id}
                report={report}
                onViewDetails={setSelectedReport}
              />
            ))
          )}
        </div>

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pagination.page === i + 1
                      ? 'bg-red-600 text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}

        {/* Modal de detalles del reporte */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Detalles del Reporte
                  </h2>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    {getStatusIcon(selectedReport.status)}
                    <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {getStatusText(selectedReport.status)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Categoría</h3>
                    <p className="text-gray-600">{getCategoryName(selectedReport.category)}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
                    <p className="text-gray-600">{selectedReport.description}</p>
                  </div>
                  
                  {selectedReport.moderatorActions?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Acciones del Moderador</h3>
                      <div className="space-y-2">
                        {selectedReport.moderatorActions.map((action, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-sm text-gray-900">
                                {action.action}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(action.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.resolution && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Resolución</h3>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Resultado: {selectedReport.resolution.outcome}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedReport.resolution.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Resuelto el {formatDate(selectedReport.resolution.resolvedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
