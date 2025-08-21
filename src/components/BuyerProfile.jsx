import React, { useState } from 'react';
import { useAuth } from '../context';

function BuyerProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [paymentMethods, setPaymentMethods] = useState(user.paymentMethods || []);

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    country: user.country || '',
  });

  const handleSave = () => {
    updateUser({
      ...formData,
      addresses,
      paymentMethods
    });
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    const newAddress = {
      id: Date.now(),
      country: '',
      province: '',
      postalCode: '',
      address: '',
      observations: '',
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, newAddress]);
  };

  const handleAddPaymentMethod = () => {
    const newPayment = {
      id: Date.now(),
      cardholderName: '',
      cardNumber: '',
      cvv: '',
      expiryDate: '',
      balance: 0,
      isDefault: paymentMethods.length === 0
    };
    setPaymentMethods([...paymentMethods, newPayment]);
  };

  const updateAddress = (id, field, value) => {
    setAddresses(addresses.map(addr => 
      addr.id === id ? { ...addr, [field]: value } : addr
    ));
  };

  const updatePaymentMethod = (id, field, value) => {
    setPaymentMethods(paymentMethods.map(payment => 
      payment.id === id ? { ...payment, [field]: value } : payment
    ));
  };

  const removeAddress = (id) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const removePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.filter(payment => payment.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mi Perfil</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-4 py-2 rounded-lg ${
            isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      {/* Información Personal */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">País</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Direcciones de Envío */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Direcciones de Envío</h3>
          {isEditing && (
            <button
              onClick={handleAddAddress}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
            >
              + Agregar Dirección
            </button>
          )}
        </div>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">País</label>
                  <input
                    type="text"
                    value={address.country}
                    onChange={(e) => updateAddress(address.id, 'country', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Provincia</label>
                  <input
                    type="text"
                    value={address.province}
                    onChange={(e) => updateAddress(address.id, 'province', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => updateAddress(address.id, 'postalCode', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <input
                    type="text"
                    value={address.address}
                    onChange={(e) => updateAddress(address.id, 'address', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Observaciones</label>
                <textarea
                  value={address.observations}
                  onChange={(e) => updateAddress(address.id, 'observations', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                />
              </div>
              {isEditing && (
                <div className="mt-4 flex justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={address.isDefault}
                      onChange={(e) => updateAddress(address.id, 'isDefault', e.target.checked)}
                      className="mr-2"
                    />
                    Dirección por defecto
                  </label>
                  <button
                    onClick={() => removeAddress(address.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Métodos de Pago */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Métodos de Pago</h3>
          {isEditing && (
            <button
              onClick={handleAddPaymentMethod}
              className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
            >
              + Agregar Tarjeta
            </button>
          )}
        </div>
        <div className="space-y-4">
          {paymentMethods.map((payment) => (
            <div key={payment.id} className="border rounded-lg p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre del Titular</label>
                  <input
                    type="text"
                    value={payment.cardholderName}
                    onChange={(e) => updatePaymentMethod(payment.id, 'cardholderName', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    value={payment.cardNumber}
                    onChange={(e) => updatePaymentMethod(payment.id, 'cardNumber', e.target.value)}
                    disabled={!isEditing}
                    placeholder="**** **** **** ****"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="password"
                    value={payment.cvv}
                    onChange={(e) => updatePaymentMethod(payment.id, 'cvv', e.target.value)}
                    disabled={!isEditing}
                    maxLength="4"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha de Vencimiento</label>
                  <input
                    type="month"
                    value={payment.expiryDate}
                    onChange={(e) => updatePaymentMethod(payment.id, 'expiryDate', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Saldo (USD)</label>
                  <input
                    type="number"
                    value={payment.balance}
                    onChange={(e) => updatePaymentMethod(payment.id, 'balance', parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border rounded-lg"
                    step="0.01"
                  />
                </div>
              </div>
              {isEditing && (
                <div className="mt-4 flex justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={payment.isDefault}
                      onChange={(e) => updatePaymentMethod(payment.id, 'isDefault', e.target.checked)}
                      className="mr-2"
                    />
                    Método por defecto
                  </label>
                  <button
                    onClick={() => removePaymentMethod(payment.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BuyerProfile;
