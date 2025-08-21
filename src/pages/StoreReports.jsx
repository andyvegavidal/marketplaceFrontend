/**
 * PÁGINA DE REPORTES DE TIENDA
 * 
 * Muestra a las tiendas los productos vendidos en un rango de fechas con 
 * subtotales por producto, total de ingresos y gráficos visuales.
 * 
 * @page StoreReports
 * @author Marketplace CR Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context';
import SalesReportByProduct from '../components/SalesReportByProduct';

function StoreReports() {
  const { user, isStore } = useAuth();
  const [storeInfo, setStoreInfo] = useState(null);

  // Verificar que el usuario es una tienda
  useEffect(() => {
    if (!isStore()) {
      return;
    }

    // Cargar información real de la tienda desde el contexto de usuario
    setStoreInfo({
      id: user.storeId || user._id, // Usar el storeId real del usuario
      name: user.storeName || user.fullName || 'Mi Tienda',
      description: user.description || 'Tienda en Marketplace CR'
    });
  }, [user, isStore]);

  if (!isStore()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-red-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">Esta página es exclusiva para tiendas registradas.</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Reportes de Ventas
                </h1>
                <p className="text-gray-600 text-lg">
                  <span className="font-medium text-blue-600">{storeInfo?.name}</span>
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Productos vendidos con subtotales por producto, total de ingresos y gráficos visuales
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reporte de Ventas por Producto */}
        <SalesReportByProduct storeId={storeInfo?.id} />
      </div>
    </div>
  );
}

export default StoreReports;
