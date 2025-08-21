import React, { useState, useEffect } from 'react';
import { Calendar, Package, CreditCard, Truck, Check, X, Eye, Edit, DollarSign } from 'lucide-react';

const SalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    completed: <Check className="w-4 h-4" />,
    cancelled: <X className="w-4 h-4" />,
    refunded: <CreditCard className="w-4 h-4" />
  };

  useEffect(() => {
    fetchSales();
  }, [currentPage, selectedStatus]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No estás autenticado');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(selectedStatus && { status: selectedStatus })
      });

      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/sales/my-sales?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSales(data.data.sales);
        setTotalPages(data.data.pagination.pages);
      } else {
        setError(data.message || 'Error al cargar las ventas');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchSaleDetails = async (saleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/sales/${saleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedSale(data.data);
        setShowModal(true);
      } else {
        setError(data.message || 'Error al cargar los detalles');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Historial de Ventas</h2>
        
        {/* Filtro por estado */}
        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="refunded">Reembolsada</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {sales.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStatus ? 'No se encontraron ventas con el estado seleccionado.' : 'Aún no has realizado ninguna venta.'}
          </p>
        </div>
      ) : (
        <>
          {/* Lista de ventas */}
          <div className="space-y-4">
            {sales.map((sale) => (
              <div key={sale._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {sale.product.images && sale.product.images.length > 0 && (
                      <img
                        src={sale.product.images[0]}
                        alt={sale.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{sale.product.name}</h3>
                      <p className="text-sm text-gray-600">Cliente: {sale.buyer.name}</p>
                      <p className="text-sm text-gray-500">
                        Orden: {sale.order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vendido el: {formatDate(sale.saleDate)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
                        {statusIcons[sale.status]}
                        <span className="ml-1 capitalize">{sale.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cantidad: {sale.quantity}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(sale.totalAmount)}
                    </p>
                    <p className="text-sm text-green-600">
                      Ganancia: {formatCurrency(sale.netAmount)}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      <button
                        onClick={() => fetchSaleDetails(sale._id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === index + 1
                        ? 'text-white bg-blue-600'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Modal de detalles */}
      {showModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Detalles de la Venta</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedSale.product.images && selectedSale.product.images.length > 0 && (
                    <img
                      src={selectedSale.product.images[0]}
                      alt={selectedSale.product.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-xl">{selectedSale.product.name}</h4>
                    <p className="text-gray-600">{selectedSale.product.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Información de la venta</p>
                    <p className="text-sm text-gray-600">Orden: {selectedSale.order.orderNumber}</p>
                    <p className="text-sm text-gray-600">Fecha: {formatDate(selectedSale.saleDate)}</p>
                    <p className="text-sm text-gray-600">Cantidad: {selectedSale.quantity}</p>
                    <p className="text-sm text-gray-600">Precio unitario: {formatCurrency(selectedSale.unitPrice)}</p>
                    <p className="text-sm font-semibold">Total: {formatCurrency(selectedSale.totalAmount)}</p>
                    <p className="text-sm text-green-600 font-semibold">Ganancia neta: {formatCurrency(selectedSale.netAmount)}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">Información del cliente</p>
                    <p className="text-sm text-gray-600">Nombre: {selectedSale.buyer.name}</p>
                    <p className="text-sm text-gray-600">Email: {selectedSale.buyer.email}</p>
                    {selectedSale.buyer.phone && (
                      <p className="text-sm text-gray-600">Teléfono: {selectedSale.buyer.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center pt-4 border-t">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedSale.status]}`}>
                    {statusIcons[selectedSale.status]}
                    <span className="ml-2 capitalize">{selectedSale.status}</span>
                  </span>
                </div>

                {selectedSale.notes && (
                  <div className="pt-2 border-t">
                    <p className="font-medium text-gray-900">Notas</p>
                    <p className="text-sm text-gray-600">{selectedSale.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
