import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import PurchaseHistory from '../components/PurchaseHistory';
import SalesHistory from '../components/SalesHistory';
import TransactionStats from '../components/TransactionStats';
import { ShoppingBag, Store, BarChart3 } from 'lucide-react';

const TransactionDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('purchases');

  const tabs = [
    {
      id: 'purchases',
      label: 'Mis Compras',
      icon: ShoppingBag,
      component: PurchaseHistory
    },
    {
      id: 'sales',
      label: 'Mis Ventas',
      icon: Store,
      component: SalesHistory
    },
    {
      id: 'purchase-stats',
      label: 'Estadísticas de Compras',
      icon: BarChart3,
      component: () => <TransactionStats userType="buyer" />
    },
    {
      id: 'sales-stats',
      label: 'Estadísticas de Ventas',
      icon: BarChart3,
      component: () => <TransactionStats userType="seller" />
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PurchaseHistory;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Transacciones</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra y visualiza tus compras y ventas
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="sm:hidden">
            {/* Mobile dropdown */}
            <label htmlFor="tabs" className="sr-only">
              Selecciona una pestaña
            </label>
            <select
              id="tabs"
              name="tabs"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Desktop tabs */}
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          -ml-0.5 mr-2 h-5 w-5 transition-colors
                          ${activeTab === tab.id
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                          }
                        `}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm min-h-96">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default TransactionDashboard;
