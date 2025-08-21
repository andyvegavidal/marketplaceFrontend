import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, TrendingUp, Users, ShoppingCart, Store } from 'lucide-react';

const TransactionStats = ({ userType = 'buyer' }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchStats();
  }, [userType]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      const endpoint = userType === 'buyer' ? '/api/purchases/stats' : '/api/sales/stats';
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message || 'Error al cargar las estadísticas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatMonth = (monthData) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[monthData.month - 1]} ${monthData.year}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
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

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron estadísticas para mostrar.
        </p>
      </div>
    );
  }

  const monthlyChartData = stats.monthly?.map(item => ({
    month: formatMonth(item._id),
    total: userType === 'buyer' ? item.totalAmount : item.revenue,
    count: item.count,
    net: userType === 'seller' ? item.netRevenue : undefined
  })).reverse() || [];

  const statusChartData = stats.byStatus?.map(item => ({
    name: item._id,
    value: item.count,
    amount: userType === 'buyer' ? item.totalAmount || 0 : item.revenue || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              {userType === 'buyer' ? <ShoppingCart className="h-6 w-6 text-blue-600" /> : <Store className="h-6 w-6 text-blue-600" />}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total {userType === 'buyer' ? 'Compras' : 'Ventas'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {userType === 'buyer' ? stats.general.totalPurchases : stats.general.totalSales}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total {userType === 'buyer' ? 'Gastado' : 'Ingresos'}
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(userType === 'buyer' ? stats.general.totalAmount : stats.general.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        {userType === 'seller' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ganancia Neta</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.general.totalNetRevenue)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.general.totalQuantity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de tendencia mensual */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tendencia Mensual {userType === 'buyer' ? 'de Compras' : 'de Ventas'}
          </h3>
          {monthlyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'total' || name === 'net' ? formatCurrency(value) : value,
                    name === 'total' ? (userType === 'buyer' ? 'Total Gastado' : 'Ingresos') : 
                    name === 'net' ? 'Ganancia Neta' : 'Cantidad'
                  ]}
                />
                <Bar dataKey="total" fill="#8884d8" />
                {userType === 'seller' && (
                  <Bar dataKey="net" fill="#82ca9d" />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300">
              <p className="text-gray-500">No hay datos suficientes para mostrar</p>
            </div>
          )}
        </div>

        {/* Gráfico de estados */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Estado
          </h3>
          {statusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, value}) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, `${name}s`]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300">
              <p className="text-gray-500">No hay datos para mostrar</p>
            </div>
          )}
        </div>
      </div>

      {/* Productos más vendidos (solo para vendedores) */}
      {userType === 'seller' && stats.topProducts && stats.topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad Vendida
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingresos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estadísticas adicionales */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Detalladas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(userType === 'buyer' ? stats.general.avgPurchaseAmount : stats.general.avgSaleAmount)}
            </p>
            <p className="text-sm text-gray-600">
              Promedio por {userType === 'buyer' ? 'compra' : 'venta'}
            </p>
          </div>
          
          {userType === 'seller' && (
            <>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.general.totalCommission)}
                </p>
                <p className="text-sm text-gray-600">Total Comisiones</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {((stats.general.totalNetRevenue / stats.general.totalRevenue) * 100 || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Margen de Ganancia</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;
