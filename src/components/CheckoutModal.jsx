import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePayment } from '../context/PaymentContext';
import CreditCardDisplay from './CreditCardDisplay';

function CheckoutModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { processCheckout, paymentLoading, formatCardNumber, getCardBrand, validateCard, downloadInvoice } = usePayment();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Pago, 3: Confirmación
  const [loading, setLoading] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState(null);
  const [focusedField, setFocusedField] = useState('');

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.fullName || '',
    address: '',
    city: '',
    postalCode: '',
    phone: user?.phone || ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: user?.fullName || ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const subtotal = getCartTotal();
  const shipping = subtotal > 50000 ? 0 : 2500; // Envío gratis sobre ₡50,000
  const tax = (subtotal + shipping) * 0.13; // IVA 13%
  const total = subtotal + shipping + tax;

  // Validar información de envío
  const validateShipping = () => {
    const newErrors = {};
    
    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Nombre completo es requerido';
    }
    
    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Dirección es requerida';
    }
    
    if (!shippingInfo.city.trim()) {
      newErrors.city = 'Ciudad es requerida';
    }
    
    if (!shippingInfo.postalCode.trim()) {
      newErrors.postalCode = 'Código postal es requerido';
    }
    
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Teléfono es requerido';
    } else if (!/^\d{8}$/.test(shippingInfo.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Formato de teléfono inválido (8 dígitos)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar información de pago
  const validatePayment = () => {
    const newErrors = {};
    
    // Validar tarjeta
    const cardValidation = validateCard(paymentInfo.cardNumber, paymentInfo.expiryDate, paymentInfo.cvv);
    if (!cardValidation.isValid) {
      newErrors.card = cardValidation.error;
    }
    
    if (!paymentInfo.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Nombre del titular es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePayment()) return;
    
    setLoading(true);

    try {
      const checkoutData = {
        shippingAddress: shippingInfo,
        paymentInfo,
        shippingCost: shipping,
        total: total
      };
      
      const result = await processCheckout(checkoutData);
      setPurchaseResult(result);
      setStep(3);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentInfo(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setPaymentInfo(prev => ({ ...prev, expiryDate: value }));
  };

  const handleClose = () => {
    if (step === 3) {
      // Reset todo cuando se cierre después de una compra exitosa
      setStep(1);
      setPurchaseResult(null);
      setShippingInfo({
        fullName: user?.fullName || '',
        address: '',
        city: '',
        postalCode: '',
        phone: user?.phone || ''
      });
      setPaymentInfo({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardHolderName: user?.fullName || ''
      });
      setErrors({});
      // Asegurar que el carrito esté limpio después de una compra exitosa
      clearCart();
    }
    onClose();
  };

  const handleDownloadInvoice = () => {
    if (purchaseResult) {
      downloadInvoice(purchaseResult.order, purchaseResult.customer, purchaseResult.payment);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900">
              {step === 1 && 'Información de Envío'}
              {step === 2 && 'Información de Pago'}
              {step === 3 && '¡Compra Exitosa!'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 flex items-center">
            <div className={`flex items-center text-sm ${step >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2">Envío</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-all duration-300`}></div>
            <div className={`flex items-center text-sm ${step >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>
              <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2">Pago</span>
            </div>
            <div className={`flex-1 h-1 mx-4 ${step >= 3 ? 'bg-green-600' : 'bg-gray-300'} transition-all duration-300`}></div>
            <div className={`flex items-center text-sm ${step >= 3 ? 'text-green-600' : 'text-gray-500'}`}>
              <div className={`rounded-full transition duration-500 ease-in-out h-8 w-8 flex items-center justify-center border-2 ${step >= 3 ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'}`}>
                ✓
              </div>
              <span className="ml-2">Confirmación</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Paso 1: Información de Envío */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de envío */}
              <div>
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                      placeholder="Ej: Juan Pérez Morales"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                      placeholder="Ej: Avenida Central, Casa 123"
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        placeholder="San José"
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, postalCode: e.target.value }))}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.postalCode ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                        placeholder="10101"
                      />
                      {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                      placeholder="8888-8888"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Continuar al Pago
                  </button>
                </form>
              </div>

              {/* Resumen del pedido */}
              <div>
                <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h4>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-gray-500 text-xs">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium">₡{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₡{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Envío:</span>
                      <span>{shipping === 0 ? 'Gratis' : `₡${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (13%):</span>
                      <span>₡{tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₡{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Información de Pago */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de pago */}
              <div>
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Tarjeta *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={handleCardNumberChange}
                      onFocus={() => setFocusedField('number')}
                      onBlur={() => setFocusedField('')}
                      maxLength="19"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Titular *
                    </label>
                    <input
                      type="text"
                      value={paymentInfo.cardHolderName}
                      onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardHolderName: e.target.value }))}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.cardHolderName ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                      placeholder="Nombre como aparece en la tarjeta"
                    />
                    {errors.cardHolderName && <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Expiración *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={handleExpiryChange}
                        onFocus={() => setFocusedField('expiry')}
                        onBlur={() => setFocusedField('')}
                        maxLength="5"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                        onFocus={() => setFocusedField('cvc')}
                        onBlur={() => setFocusedField('')}
                        maxLength="4"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  {errors.card && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{errors.card}</p>
                    </div>
                  )}

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      disabled={loading || paymentLoading}
                      className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors font-medium flex items-center justify-center"
                    >
                      {loading || paymentLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Procesando...
                        </>
                      ) : (
                        `Pagar ₡${total.toLocaleString()}`
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Vista previa de la tarjeta */}
              <div>
                <div className="sticky top-24">
                  <CreditCardDisplay
                    cardNumber={paymentInfo.cardNumber}
                    cardHolder={paymentInfo.cardHolderName}
                    expiryDate={paymentInfo.expiryDate}
                    cvv={paymentInfo.cvv}
                    focused={focusedField}
                    brand={getCardBrand(paymentInfo.cardNumber)}
                  />
                  
                  {/* Resumen final */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Resumen Final</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total a pagar:</span>
                        <span className="font-bold text-lg">₡{total.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Se enviará a: {shippingInfo.fullName}, {shippingInfo.address}, {shippingInfo.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step === 3 && purchaseResult && (
            <div className="text-center max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Compra Exitosa!</h2>
                <p className="text-gray-600">Tu orden ha sido procesada correctamente</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4">Detalles de la Compra</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Número de Orden:</span>
                    <p className="font-mono font-bold">{purchaseResult.order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Pagado:</span>
                    <p className="font-bold">₡{purchaseResult.order.total.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Método de Pago:</span>
                    <p>**** **** **** {purchaseResult.payment.cardLast4}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ID de Transacción:</span>
                    <p className="font-mono text-xs">{purchaseResult.payment.transactionId}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Factura PDF
                </button>
                
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Continuar Comprando
                </button>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                <p>Recibirás un email de confirmación en tu correo electrónico.</p>
                <p>Puedes revisar el estado de tu pedido en tu cuenta.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
