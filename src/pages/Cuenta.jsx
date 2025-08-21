import React, { useState, useEffect } from 'react';
import { useAuth, useProduct, useStore } from '../context';
import { useNavigate } from 'react-router-dom';

function Cuenta() {
  const { user, isAuthenticated, isStore } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-300 h-16 w-16"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-40"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUserStore = isStore();

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: '�' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">
                  {isUserStore ? '🏪' : '👤'}
                </span>
              </div>
              <h3 className="font-semibold">
                {user?.fullName || 
                 (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '') ||
                 user?.name ||
                 user?.email || 
                 'Usuario'}
              </h3>
              <p className="text-sm text-gray-600">
                {isUserStore ? 'Tienda' : 'Comprador'}
              </p>
            </div>
            
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'orders' && !isUserStore && <OrderHistory />}
            {activeTab === 'analytics' && isUserStore && <StoreAnalytics />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de perfil de usuario
function UserProfile() {
  const { user, isStore } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Inicializa el formulario con los datos del usuario
  const [formData, setFormData] = useState({
    fullName: user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '') || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || user?.phoneNumber || '',
    address: user?.address || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Aquí podrías llamar a una función para actualizar el perfil
    setIsEditing(false);
    // Aquí podrías mostrar un mensaje de error
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Editar
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">
              {user?.fullName || 
               (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '') ||
               user?.name || 
               'No especificado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{user?.email || 'No especificado'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">
              {user?.phone || user?.phoneNumber || 'No especificado'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de cuenta
          </label>
          <p className="text-gray-900">
            {isStore() ? 'Tienda' : 'Comprador'}
          </p>
        </div>

        {!isStore() && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            {isEditing ? (
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{user?.address || 'No especificado'}</p>
            )}
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la cuenta</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID de usuario
            </label>
            <p className="text-gray-900">{user?.id || user?._id || 'No disponible'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de registro
            </label>
            <p className="text-gray-900">{user?.createdAt || 'No disponible'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cuenta;
