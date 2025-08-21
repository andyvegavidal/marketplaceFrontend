
import React, { useState } from 'react';
import { FlagIcon } from '@heroicons/react/24/outline';
import { FlagIcon as FlagSolidIcon } from '@heroicons/react/24/solid';
import ReportModalNew from './ReportModalNew';

const ReportButton = ({ 
  reportType, 
  reportedItemId, 
  reportedItem = null,
  className = "",
  variant = "default", // default, minimal, floating
  size = "sm", // sm, md, lg
  disabled = false,
  tooltip = "Reportar contenido"
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Clases base según la variante
  const variantClasses = {
    default: "inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200",
    minimal: "inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full transition-colors duration-200",
    floating: "fixed bottom-6 right-6 inline-flex items-center justify-center p-3 bg-white border border-gray-300 shadow-lg text-gray-700 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full transition-all duration-200 hover:shadow-xl z-40"
  };

  // Clases según el tamaño
  const sizeClasses = {
    sm: variant === "floating" ? "w-12 h-12" : "w-8 h-8",
    md: variant === "floating" ? "w-14 h-14" : "w-10 h-10", 
    lg: variant === "floating" ? "w-16 h-16" : "w-12 h-12"
  };

  // Clases para el icono según el tamaño
  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (e) => {
    // Prevenir propagación del evento para evitar que se active el click del card padre
    e.stopPropagation();
    e.preventDefault();
    
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={disabled}
          className={`
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${className}
          `}
          title={tooltip}
          aria-label={tooltip}
        >
          {variant === "default" && (
            <>
              {isHovered ? (
                <FlagSolidIcon className={`${iconSizeClasses[size]} text-red-500`} />
              ) : (
                <FlagIcon className={iconSizeClasses[size]} />
              )}
              <span className="ml-2 hidden sm:inline">Reportar</span>
            </>
          )}
          
          {(variant === "minimal" || variant === "floating") && (
            <>
              {isHovered ? (
                <FlagSolidIcon className={`${iconSizeClasses[size]} text-red-500`} />
              ) : (
                <FlagIcon className={iconSizeClasses[size]} />
              )}
            </>
          )}
        </button>

        {/* Tooltip para variantes minimal y floating */}
        {(variant === "minimal" || variant === "floating") && isHovered && (
          <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Modal de reporte */}
      <ReportModalNew
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reportType={reportType}
        reportedItemId={reportedItemId}
        reportedItem={reportedItem}
      />
    </>
  );
};

export default ReportButton;