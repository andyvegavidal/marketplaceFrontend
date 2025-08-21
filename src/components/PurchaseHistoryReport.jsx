import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Iconos SVG simples
const Calendar = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const Package = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="m21 16-4 2-4-2-4 2-4-2v-6l4-2 4 2 4-2 4 2z"></path>
    <path d="m7 12 4-2 4 2 4-2v6l-4 2-4-2-4 2z"></path>
  </svg>
);

const TrendingUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17"></polyline>
    <polyline points="16,7 22,7 22,13"></polyline>
  </svg>
);

const ShoppingCart = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="m1 1 4 0 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const Store = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
    <path d="M2 7h20l-2 5H4l-2-5Z"></path>
  </svg>
);

const Eye = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const Filter = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
  </svg>
);

const ChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9"></polyline>
  </svg>
);

const ChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="18,15 12,9 6,15"></polyline>
  </svg>
);

const PurchaseHistoryReport = () => {
  const { user, isAuthenticated, isStore } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('buyer'); // 'buyer' o 'store'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    storeId: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Determinar tipo de usuario al cargar
  useEffect(() => {
    if (isAuthenticated() && user) {
      setUserType(isStore() ? 'store' : 'buyer');
    }
  }, [user, isAuthenticated, isStore]);

  useEffect(() => {
    fetchPurchaseHistory();
  }, [filters, userType]);

  const fetchPurchaseHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación');
      }

      const queryParams = new URLSearchParams();
      
      // Agregar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'storeId') queryParams.append(key, value);
      });

      let endpoint;
      
      if (userType === 'store') {
        // Para tiendas, necesitamos el storeId del usuario
        if (!user.storeId) {
          throw new Error('Usuario de tienda sin ID de tienda asociado');
        }
        endpoint = `${import.meta.env.VITE_BASE_API_URL}/orders/store/${user.storeId}`;
      } else {
        // Para compradores, usar my-orders
        endpoint = `${import.meta.env.VITE_BASE_API_URL}/orders/my-orders`;
      }

      if (queryParams.toString()) {
        endpoint += `?${queryParams}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Procesar datos según el tipo de usuario
        const processedData = processOrderData(result.data, userType);
        setData(processedData);
      } else {
        throw new Error(result.message || 'Error desconocido del servidor');
      }
    } catch (err) {
      setError(`No se pudieron cargar los datos. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar datos de órdenes según el tipo de usuario
  const processOrderData = (apiData, userType) => {
    if (!apiData || !apiData.orders || !Array.isArray(apiData.orders)) {

      return null;
    }

    const orders = apiData.orders;

    // Calcular estadísticas generales
    let totalSpent = 0;
    let totalOrders = orders.length;
    let totalItems = 0;
    let categoryBreakdown = {};
    let monthlyTrends = {};

    orders.forEach(order => {
      let orderTotal = 0;
      let orderItems = 0;

      if (userType === 'store') {
        // Para tiendas, solo contar los items de productos de su tienda
        const storeItems = order.items?.filter(item => 
          item.store && (item.store._id?.toString() === user?.storeId || item.store.toString() === user?.storeId)
        ) || [];
        
        orderTotal = storeItems.reduce((sum, item) => sum + (item.total || (item.price * item.quantity)), 0);
        orderItems = storeItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
        
        // Solo procesar categorías para items de esta tienda
        storeItems.forEach(item => {
          if (item.product && item.product.category) {
            const category = item.product.category;
            if (!categoryBreakdown[category]) {
              categoryBreakdown[category] = { totalAmount: 0, totalOrders: 0 };
            }
            categoryBreakdown[category].totalAmount += item.total || (item.price * item.quantity);
            categoryBreakdown[category].totalOrders += 1;
          }
        });
      } else {
        // Para compradores, contar todo
        orderTotal = order.total || 0;
        orderItems = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        
        // Procesar todas las categorías
        order.items?.forEach(item => {
          if (item.product && item.product.category) {
            const category = item.product.category;
            if (!categoryBreakdown[category]) {
              categoryBreakdown[category] = { totalAmount: 0, totalOrders: 0 };
            }
            categoryBreakdown[category].totalAmount += item.total || (item.price * item.quantity);
            categoryBreakdown[category].totalOrders += 1;
          }
        });
      }

      totalSpent += orderTotal;
      totalItems += orderItems;

      // Agrupar por mes
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
      if (!monthlyTrends[monthKey]) {
        monthlyTrends[monthKey] = {
          _id: { year: orderDate.getFullYear(), month: orderDate.getMonth() + 1 },
          totalAmount: 0,
          totalOrders: 0
        };
      }
      
      monthlyTrends[monthKey].totalAmount += orderTotal;
      if (orderTotal > 0) { // Solo contar órdenes que tienen items relevantes
        monthlyTrends[monthKey].totalOrders += 1;
      }
    });

    const result = {
      statistics: {
        totalSpent,
        totalOrders,
        totalItems,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0
      },
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
        _id: category,
        ...data
      })),
      monthlyTrends: Object.values(monthlyTrends).sort((a, b) => {
        if (a._id.year !== b._id.year) return a._id.year - b._id.year;
        return a._id.month - b._id.month;
      }),
      history: orders.map(order => {
        let filteredItems = order.items;
        
        if (userType === 'store') {
          // Para tiendas, filtrar solo items de su tienda
          filteredItems = order.items?.filter(item => 
            item.store && (item.store._id?.toString() === user?.storeId || item.store.toString() === user?.storeId)
          ) || [];
        }
        
        return {
          ...order,
          orderDate: order.createdAt,
          items: filteredItems,
          displayTotal: userType === 'store' 
            ? filteredItems.reduce((sum, item) => sum + (item.total || (item.price * item.quantity)), 0)
            : order.total
        };
      }).filter(order => order.items.length > 0), // Solo mostrar órdenes con items relevantes
      pagination: apiData.pagination || {
        currentPage: 1,
        totalPages: 1,
        total: totalOrders,
        limit: totalOrders
      }
    };


    return result;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filtering
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: '',
      storeId: '',
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      delivered: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      delivered: 'Entregado',
      shipped: 'Enviado',
      processing: 'Procesando',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      pending: 'Pendiente'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">
          {userType === 'store' 
            ? 'No se encontraron datos de ventas'
            : 'No se encontraron datos de compras'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {userType === 'store' ? 'Historial de Ventas' : 'Historial de Compras'}
            </h1>
            <p className="text-gray-600">
              {userType === 'store' 
                ? 'Analiza tus ventas, ingresos y productos más vendidos'
                : 'Analiza tus compras, gastos y productos favoritos'
              }
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Filter />
            Filtros
            {showFilters ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las categorías</option>
                  {data.categoryBreakdown && data.categoryBreakdown.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat._id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tienda</label>
                <input
                  type="text"
                  placeholder="ID de tienda"
                  value={filters.storeId}
                  onChange={(e) => handleFilterChange('storeId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {userType === 'store' ? 'Total Ingresos' : 'Total Gastado'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.statistics?.totalSpent || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {userType === 'store' ? 'Total Ventas' : 'Total Órdenes'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {userType === 'store' ? 'Productos Vendidos' : 'Total Productos'}
              </p>
              <p className="text-2xl font-bold text-gray-900">{data.statistics?.totalItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Store className="text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {userType === 'store' ? 'Promedio por Venta' : 'Promedio por Orden'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.statistics?.averageOrderValue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown por Categoría */}
      {data.categoryBreakdown && data.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {userType === 'store' ? 'Ingresos por Categoría' : 'Gastos por Categoría'}
          </h2>
          <div className="space-y-3">
            {data.categoryBreakdown.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{category._id}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(category.totalAmount)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({category.totalOrders} {userType === 'store' ? 'ventas' : 'órdenes'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendencias Mensuales */}
      {data.monthlyTrends && data.monthlyTrends.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tendencias Mensuales</h2>
          <div className="space-y-3">
            {data.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {trend._id.month}/{trend._id.year}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(trend.totalAmount)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({trend.totalOrders} {userType === 'store' ? 'ventas' : 'órdenes'})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Compras/Ventas */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {userType === 'store' ? 'Historial de Ventas' : 'Historial de Compras'}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {data.history && data.history.length > 0 ? (
            data.history.map((order) => (
              <div key={order._id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Orden #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.displayTotal || order.total)}
                    </p>
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <Eye className="mr-1" />
                      Ver detalles
                    </button>
                  </div>
                </div>

                {expandedOrder === order._id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      {order.items && order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.product?.name || item.productName || 'Producto sin nombre'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total || (item.price * item.quantity))}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(item.price)} c/u
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {userType === 'store' 
                  ? 'No se encontraron ventas en este período'
                  : 'No se encontraron compras en este período'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Paginación */}
      {data.pagination && (
        <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow-sm">
          <div className="text-sm text-gray-700">
            Mostrando {((data.pagination.currentPage - 1) * data.pagination.limit) + 1} a{' '}
            {Math.min(data.pagination.currentPage * data.pagination.limit, data.pagination.total)} de{' '}
            {data.pagination.total} resultados
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
              disabled={data.pagination.currentPage <= 1}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
              {data.pagination.currentPage} de {data.pagination.totalPages}
            </span>
            <button
              onClick={() => handleFilterChange('page', Math.min(data.pagination.totalPages, filters.page + 1))}
              disabled={data.pagination.currentPage >= data.pagination.totalPages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryReport;
