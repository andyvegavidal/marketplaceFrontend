import React, { createContext, useState, useContext } from 'react';
import jsPDF from 'jspdf';

const PaymentContext = createContext(null);

export const PaymentProvider = ({ children }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);

  // Funciones básicas sin dependencias externas complejas
  const processCheckout = async (checkoutData) => {
    setPaymentLoading(true);
    
    try {
      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Validar si la tarjeta debería fallar
      const cardNumber = checkoutData.paymentInfo?.cardNumber?.replace(/\s/g, '') || '';
      const lastFourDigits = cardNumber.slice(-4);
      
      // Tarjetas que simulan errores específicos
      if (lastFourDigits === '0002') {
        throw new Error('Pago rechazado por el banco. Fondos insuficientes.');
      }
      
      if (lastFourDigits === '0004') {
        throw new Error('Tarjeta expirada. Verifique la fecha de vencimiento.');
      }
      
      if (lastFourDigits === '0005') {
        throw new Error('Tarjeta bloqueada. Contacte a su banco.');
      }
      
      if (lastFourDigits === '0008') {
        throw new Error('Error de red. Intente nuevamente más tarde.');
      }
      
      if (lastFourDigits === '0010') {
        throw new Error('Transacción rechazada por razones de seguridad.');
      }
      
      // Obtener información del carrito del localStorage como fallback
      let cartItems = [];
      try {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          cartItems = JSON.parse(localCart);
        }
      } catch (error) {
      }
      
      if (cartItems.length === 0) {
        throw new Error('No hay productos en el carrito');
      }

      // Preparar datos para la orden
      const orderItems = cartItems.map(item => {
        // Asegurar que tenemos todos los datos necesarios
        const storeId = item.storeId || item.store;
        if (!storeId) {
          throw new Error('Producto sin información de tienda');              
        }
        
        return {
          product: item.id,
          name: item.name, // Agregar el nombre del producto
          store: storeId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        };
      });

      // Verificar que todos los items tengan store
      const itemsWithoutStore = orderItems.filter(item => !item.store);
      if (itemsWithoutStore.length > 0) {
        throw new Error('Algunos productos no tienen información de tienda válida');
      }

      // Calcular totales correctamente
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = checkoutData.shippingCost || 0;
      const tax = subtotal * 0.13; // IVA 13%
      const total = subtotal + shippingCost + tax;

      // Adaptar dirección de envío al formato esperado por el backend
      const shippingAddress = {
        alias: 'Dirección principal',
        country: 'Costa Rica',
        provincia: checkoutData.shippingAddress?.city || 'San José',
        canton: checkoutData.shippingAddress?.city || 'San José',
        distrito: checkoutData.shippingAddress?.address || '',
        numeroCasillero: '',
        codigoPostal: checkoutData.shippingAddress?.postalCode || '',
        observaciones: `${checkoutData.shippingAddress?.fullName} - ${checkoutData.shippingAddress?.phone}`
      };

      // Crear orden en la base de datos
      const orderData = {
        items: orderItems,
        shippingAddress: shippingAddress,
        paymentMethod: 'credit_card',
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total
      };


      
      // Verificar que tenemos token de autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No se encontró token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Crear la orden usando fetch directamente
      const apiUrl = `${import.meta.env.VITE_BASE_API_URL || 'http://localhost:5050/api'}/orders`;

      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });



      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const orderResult = await response.json();

      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Error al crear la orden');
      }

      // Simular datos de pago exitoso
      const paymentData = {
        transactionId: `TXN-${Date.now()}`,
        authorizationCode: `AUTH-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        cardLast4: lastFourDigits || '1111',
        cardBrand: getCardBrand(cardNumber),
        processedAt: new Date().toISOString()
      };
      
      const customerData = {
        name: checkoutData.shippingAddress?.fullName || 'Usuario',
        address: checkoutData.shippingAddress?.address || 'Dirección no especificada',
        city: checkoutData.shippingAddress?.city || 'San José',
        phone: checkoutData.shippingAddress?.phone || 'No especificado'
      };
      
      const result = {
        success: true,
        order: orderResult.data, // Usar la orden real creada en la base de datos
        payment: paymentData,
        customer: customerData,
        invoice: null // Lo generaremos al descargar
      };
      
      // Limpiar carrito después de una compra exitosa
      try {
        localStorage.removeItem('cart');
      } catch (error) {
      }
      
      setCurrentPayment(result);
      return result;
      
    } finally {
      setPaymentLoading(false);
    }
  };

  // Validar tarjeta de crédito
  const validateCard = (cardNumber, expiryDate, cvv) => {
    if (!cardNumber || cardNumber.length < 16) {
      return { isValid: false, error: 'Número de tarjeta inválido' };
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      return { isValid: false, error: 'Fecha de expiración inválida' };
    }
    
    if (!cvv || cvv.length < 3) {
      return { isValid: false, error: 'CVV inválido' };
    }
    
    return { isValid: true };
  };

  // Formatear número de tarjeta
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Detectar marca de tarjeta
  const getCardBrand = (cardNumber) => {
    if (!cardNumber) return 'visa';
    
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'american express';
    if (/^6/.test(cleanNumber)) return 'discover';
    
    return 'visa';
  };

  // Generar PDF de factura
  const generateInvoicePDF = (orderData, customerData, paymentData) => {
    const doc = new jsPDF();
    
    // Configuración de colores
    const primaryColor = [37, 99, 235]; // Blue-600
    const lightGray = [243, 244, 246]; // Gray-100
    
    // Header con color de fondo
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Logo y título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MARKETPLACE CR', 15, 17);
    
    doc.setFontSize(12);
    doc.text('Factura Electrónica', 150, 17);
    
    // Información de la empresa
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text('Marketplace CR S.A.', 15, 35);
    doc.text('Cédula Jurídica: 3-101-123456', 15, 42);
    doc.text('San José, Costa Rica', 15, 49);
    doc.text('Tel: +506 2234-5678', 15, 56);
    doc.text('Email: info@marketplace-cr.com', 15, 63);
    
    // Información de la factura
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURA #: ' + orderData.orderNumber, 120, 35);
    doc.setFont('helvetica', 'normal');
    doc.text('Fecha: ' + new Date().toLocaleDateString('es-CR'), 120, 42);
    doc.text('Estado: PAGADA', 120, 49);
    doc.text('Método: Tarjeta de Crédito', 120, 56);
    doc.text('Autorización: ' + paymentData.authorizationCode, 120, 63);
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(15, 70, 195, 70);
    
    // Información del cliente
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLIENTE:', 15, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Nombre: ' + customerData.name, 15, 87);
    doc.text('Dirección: ' + customerData.address, 15, 94);
    doc.text('Teléfono: ' + customerData.phone, 15, 101);
    
    // Tabla de productos - Header
    const startY = 115;
    doc.setFillColor(...lightGray);
    doc.rect(15, startY, 180, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('PRODUCTO', 20, startY + 5);
    doc.text('CANT.', 120, startY + 5);
    doc.text('PRECIO', 140, startY + 5);
    doc.text('TOTAL', 170, startY + 5);
    
    // Productos reales de la orden
    const products = orderData.items || [];
    
    // Obtener datos del carrito local como respaldo para nombres
    let cartItems = [];
    try {
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        cartItems = JSON.parse(localCart);
      }
    } catch (error) {
      // Error silencioso
    }
    
    let currentY = startY + 15;
    doc.setFont('helvetica', 'normal');
    
    products.forEach((product, index) => {
      // La estructura real es: product.product.name
      let productName = product.product?.name || product.name || product.productName;
      
      // Si no hay nombre en product, buscar en el carrito por ID
      if (!productName && cartItems.length > 0) {
        const productId = product.product?.id || product.product?._id || product.product;
        const cartItem = cartItems.find(item => item.id === productId);
        productName = cartItem?.name;
      }
      
      // Fallback final
      if (!productName) {
        productName = `Producto ${index + 1}`;
      }
      
      const quantity = product.quantity || 1;
      const price = product.price || product.unitPrice || 0;
      const total = product.total || (price * quantity);
      
      doc.text(productName, 20, currentY);
      doc.text(quantity.toString(), 125, currentY);
      doc.text('₡' + price.toLocaleString(), 140, currentY);
      doc.text('₡' + total.toLocaleString(), 170, currentY);
      currentY += 7;
    });
    
    // Línea separadora antes de totales
    doc.line(15, currentY + 5, 195, currentY + 5);
    
    // Totales
    const totalsY = currentY + 15;
    const subtotal = orderData.subtotal || 0;
    const shipping = orderData.shippingCost || 0;
    const tax = orderData.tax || 0;
    const total = orderData.total || 0;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, totalsY);
    doc.text('₡' + subtotal.toLocaleString(), 170, totalsY);
    
    doc.text('Envío:', 140, totalsY + 7);
    doc.text(shipping === 0 ? 'GRATIS' : '₡' + shipping.toLocaleString(), 170, totalsY + 7);
    
    doc.text('IVA (13%):', 140, totalsY + 14);
    doc.text('₡' + tax.toLocaleString(), 170, totalsY + 14);
    
    // Total final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', 140, totalsY + 25);
    doc.text('₡' + total.toLocaleString(), 170, totalsY + 25);
    
    // Información de pago
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Tarjeta: **** **** **** ' + paymentData.cardLast4, 15, totalsY + 40);
    doc.text('Transacción: ' + paymentData.transactionId, 15, totalsY + 47);
    
    // Footer
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.text('Gracias por su compra en Marketplace CR', 15, 270);
    doc.text('Esta es una factura electrónica válida', 15, 277);
    
    return doc;
  };

  // Descargar factura PDF
  const downloadInvoice = (orderData, customerData, paymentData) => {
    try {
      const pdf = generateInvoicePDF(orderData, customerData, paymentData);
      pdf.save(`Factura_${orderData.orderNumber}.pdf`);
    } catch (error) {
      // Fallback a archivo de texto si hay error
      const blob = new Blob([`Factura - Orden: ${orderData.orderNumber}\nTotal: ₡${orderData.total.toLocaleString()}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Factura_${orderData.orderNumber}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const value = {
    paymentLoading,
    currentPayment,
    processCheckout,
    validateCard,
    formatCardNumber,
    getCardBrand,
    downloadInvoice,
    setCurrentPayment
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment debe ser usado dentro de PaymentProvider');
  }
  return context;
};

export default PaymentContext;
