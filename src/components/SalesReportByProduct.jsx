
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SalesReportByProduct({ storeId }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Función para obtener tienda por userID
  const getStoreByUserId = async (userId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/stores/user/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.store) {
          setStoreData(data.data.store);
          return data.data.store._id;
        } else {
          throw new Error(data.message || 'No se encontró la tienda');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener la tienda');
      }
    } catch (error) {
      setError(`Error al obtener tienda: ${error.message}`);
      return null;
    }
  };

  // Cargar reporte de ventas desde la API real
  const loadSalesReport = async () => {
    if (!storeId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Si storeId es un userID, primero obtener el storeId real
      let actualStoreId = storeId;
      
      // Verificar si necesitamos obtener la tienda por userID
      // (asumimos que si storeId no es un ObjectId válido, es un userID)
      try {
        const storeIdFromUser = await getStoreByUserId(storeId);
        if (storeIdFromUser) {
          actualStoreId = storeIdFromUser;
        }
      } catch (userError) {
        // Si falla, asumir que storeId ya es el ID correcto de la tienda
      }

      const queryParams = new URLSearchParams({
        page: '1',
        limit: '1000' // Obtener todas las órdenes para el análisis
      });

      // Agregar filtros de fecha si están definidos
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      // Usar el endpoint de órdenes de la tienda que ya existe
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/orders/store/${actualStoreId}?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
            
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data && data.data.orders) {
          // Procesar los datos para crear el reporte de ventas
          const processedReport = processOrdersForSalesReport(data.data.orders, actualStoreId);
          setReportData(processedReport);
        } else {
          setError(data.message || 'No se encontraron datos de ventas');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al cargar el reporte');
      }
    } catch (error) {
      setError('Error de conexión al cargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  // Función para procesar las órdenes y crear el reporte de ventas
  const processOrdersForSalesReport = (orders, storeId) => {
    if (!orders || orders.length === 0) {
      return {
        summary: { totalRevenue: 0, totalQuantity: 0 },
        products: [],
        topProducts: [],
        chartData: { labels: [], revenue: [] }
      };
    }

    const productStats = {};
    const dailyRevenue = {};
    let totalRevenue = 0;
    let totalQuantity = 0;

    orders.forEach(order => {
      // Filtrar solo los items de esta tienda
      const storeItems = order.items?.filter(item => 
        item.store && (item.store._id?.toString() === storeId || item.store.toString() === storeId)
      ) || [];

      if (storeItems.length === 0) return;

      // Procesar cada item de la tienda
      storeItems.forEach(item => {
        const productId = item.product?._id || item.product;
        const productName = item.product?.name || 'Producto sin nombre';
        const category = item.product?.category || 'Sin categoría';
        const price = item.price || 0;
        const quantity = item.quantity || 0;
        const itemTotal = item.total || (price * quantity);

        // Actualizar estadísticas del producto
        if (!productStats[productId]) {
          productStats[productId] = {
            _id: productId,
            productName,
            category,
            productImage: item.product?.images?.[0] || '',
            totalQuantity: 0,
            totalRevenue: 0,
            averagePrice: 0,
            orders: []
          };
        }

        productStats[productId].totalQuantity += quantity;
        productStats[productId].totalRevenue += itemTotal;
        productStats[productId].orders.push(price);

        totalRevenue += itemTotal;
        totalQuantity += quantity;
      });

      // Procesar ingresos diarios
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const dayRevenue = storeItems.reduce((sum, item) => 
        sum + (item.total || (item.price * item.quantity)), 0
      );
      
      if (!dailyRevenue[orderDate]) {
        dailyRevenue[orderDate] = 0;
      }
      dailyRevenue[orderDate] += dayRevenue;
    });

    // Calcular precio promedio para cada producto
    Object.values(productStats).forEach(product => {
      if (product.orders.length > 0) {
        product.averagePrice = product.orders.reduce((a, b) => a + b, 0) / product.orders.length;
      }
      delete product.orders; // Remover array temporal
    });

    // Convertir a arrays y ordenar
    const products = Object.values(productStats).sort((a, b) => b.totalRevenue - a.totalRevenue);
    const topProducts = products.slice(0, 5);

    // Preparar datos para gráficos
    const sortedDates = Object.keys(dailyRevenue).sort();
    const chartLabels = sortedDates.map(date => new Date(date).toLocaleDateString('es-CR'));
    const chartRevenue = sortedDates.map(date => dailyRevenue[date]);

    return {
      summary: {
        totalRevenue,
        totalQuantity
      },
      products,
      topProducts,
      chartData: {
        labels: chartLabels,
        revenue: chartRevenue
      }
    };
  };

  useEffect(() => {
    if (storeId) {
      loadSalesReport();
    }
  }, [storeId, filters]);

  // Configuración del gráfico de líneas (tendencia de ventas)
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Tendencia de Ventas Diarias',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-CR', {
              style: 'currency',
              currency: 'CRC'
            }).format(value);
          }
        }
      }
    }
  };

  const lineChartData = {
    labels: reportData?.chartData?.labels || [],
    datasets: [
      {
        label: 'Ingresos Diarios',
        data: reportData?.chartData?.revenue || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
    ],
  };

  // Configuración del gráfico de barras (top productos)
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 5 Productos Más Vendidos',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-CR', {
              style: 'currency',
              currency: 'CRC'
            }).format(value);
          }
        }
      }
    }
  };

  const barChartData = {
    labels: reportData?.topProducts?.map(p => p.productName.length > 20 ? p.productName.substring(0, 20) + '...' : p.productName) || [],
    datasets: [
      {
        label: 'Ingresos por Producto',
        data: reportData?.topProducts?.map(p => p.totalRevenue) || [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(168, 85, 247)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Formatear números
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CR').format(number);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reportes de ventas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar reportes</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <ChartBarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Productos Vendidos
              </h2>
              <p className="text-gray-600 mt-1">
                Productos vendidos en un rango de fechas con subtotales por producto y total de ingresos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros de Fecha */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Rango de Fechas</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <div className="relative">
              <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Resumen de Ventas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
              <div className="flex items-center">
                <div className="p-4 bg-green-500 rounded-xl shadow-lg">
                  <CurrencyDollarIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Total de Ingresos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatCurrency(reportData.summary.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
              <div className="flex items-center">
                <div className="p-4 bg-blue-500 rounded-xl shadow-lg">
                  <ShoppingBagIcon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Productos Vendidos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {formatNumber(reportData.summary.totalQuantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos Visuales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencia de ingresos diarios */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-purple-100 rounded-lg mr-3">
                  <ChartBarIcon className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tendencia de Ingresos</h3>
              </div>
              <div className="h-64">
                <Line data={lineChartData} options={lineChartOptions} />
              </div>
            </div>

            {/* Gráfico de productos más vendidos */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <ChartBarIcon className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Productos Más Vendidos</h3>
              </div>
              <div className="h-64">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <ShoppingBagIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Productos Vendidos
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Subtotales por cada producto vendido en el período seleccionado
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad Vendida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Promedio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData?.products?.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={product.productImage || '/placeholder-product.jpg'}
                            alt={product.productName}
                            className="w-12 h-12 object-cover rounded-lg mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.productName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(product.totalQuantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {formatCurrency(product.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.averagePrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(!reportData?.products || reportData.products.length === 0) && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <ChartBarIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay ventas en este período
                  </h3>
                  <p className="text-gray-600 max-w-sm mx-auto">
                    No se encontraron productos vendidos para las fechas seleccionadas. Intenta seleccionar un rango de fechas diferente.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SalesReportByProduct;
