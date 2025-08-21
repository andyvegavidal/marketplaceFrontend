import React from 'react';

const CreditCardDisplay = ({ 
  cardNumber = '', 
  cardHolder = '', 
  expiryDate = '', 
  cvv = '',
  focused = '',
  brand = 'visa'
}) => {
  // Formatear número de tarjeta para mostrar
  const formatCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, '');
    const placeholder = '#### #### #### ####';
    
    if (!cleaned) return placeholder;
    
    let formatted = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += cleaned[i] || '#';
    }
    
    return formatted;
  };
  
  // Obtener colores según la marca
  const getBrandColors = (brand) => {
    if (!brand) return { primary: 'from-blue-600 to-blue-800', secondary: 'text-blue-100' };
    
    switch (brand.toLowerCase()) {
      case 'visa':
        return { primary: 'from-blue-600 to-blue-800', secondary: 'text-blue-100' };
      case 'mastercard':
        return { primary: 'from-red-600 to-orange-600', secondary: 'text-red-100' };
      case 'american express':
        return { primary: 'from-green-600 to-green-800', secondary: 'text-green-100' };
      default:
        return { primary: 'from-blue-600 to-blue-800', secondary: 'text-blue-100' };
    }
  };
  
  const colors = getBrandColors(brand);
  
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Frente de la tarjeta */}
      <div className={`relative w-full h-56 rounded-xl bg-gradient-to-br ${colors.primary} shadow-2xl transform-gpu transition-transform duration-300 hover:scale-105`}>
        {/* Chip */}
        <div className="absolute top-6 left-6 w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md"></div>
        
        {/* Logo de la marca */}
        <div className="absolute top-6 right-6">
          <div className={`text-2xl font-bold ${colors.secondary}`}>
            {brand ? (brand.charAt(0).toUpperCase() + brand.slice(1)) : 'Visa'}
          </div>
        </div>
        
        {/* Número de tarjeta */}
        <div className="absolute top-20 left-6 right-6">
          <div className={`text-xl font-mono tracking-widest ${colors.secondary} ${focused === 'number' ? 'text-white' : ''}`}>
            {formatCardNumber(cardNumber)}
          </div>
        </div>
        
        {/* Nombre del titular */}
        <div className="absolute bottom-16 left-6 right-6">
          <div className={`text-xs uppercase tracking-wider ${colors.secondary} opacity-75`}>
            Card Holder
          </div>
          <div className={`text-lg uppercase tracking-wide ${colors.secondary} truncate ${focused === 'name' ? 'text-white' : ''}`}>
            {cardHolder || 'NOMBRE APELLIDO'}
          </div>
        </div>
        
        {/* Fecha de expiración */}
        <div className="absolute bottom-6 left-6">
          <div className={`text-xs uppercase tracking-wider ${colors.secondary} opacity-75`}>
            Expires
          </div>
          <div className={`text-lg font-mono ${colors.secondary} ${focused === 'expiry' ? 'text-white' : ''}`}>
            {expiryDate || 'MM/YY'}
          </div>
        </div>
        
        {/* Decoración */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-20 rounded-xl"></div>
      </div>
      
      {/* Parte trasera (cuando se enfoca el CVV) */}
      {focused === 'cvc' && (
        <div className={`relative w-full h-56 rounded-xl bg-gradient-to-br ${colors.primary} shadow-2xl mt-4 transform-gpu`}>
          {/* Banda magnética */}
          <div className="absolute top-8 left-0 right-0 h-12 bg-black"></div>
          
          {/* CVV */}
          <div className="absolute top-28 right-6 left-6">
            <div className="bg-white h-8 rounded flex items-center justify-end px-2">
              <span className="font-mono text-black font-bold tracking-wider">
                {cvv || '***'}
              </span>
            </div>
          </div>
          
          {/* Texto informativo */}
          <div className={`absolute bottom-6 left-6 right-6 text-xs ${colors.secondary} opacity-75`}>
            Código de seguridad de 3 dígitos
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardDisplay;
