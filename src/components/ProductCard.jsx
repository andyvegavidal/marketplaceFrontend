import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';

function ProductCard({ product, onAddToCart, showStoreName = false }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const nextImage = (e) => {
    e.stopPropagation(); 
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation(); 
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const handleCardClick = () => {
    navigate(`/producto/${product.id}`);
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation(); 
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Agotado', color: 'text-red-600' };
    if (product.stock <= 5) return { text: `Solo quedan ${product.stock}`, color: 'text-orange-600' };
    if (product.stock <= 10) return { text: `Pocas unidades: ${product.stock}`, color: 'text-yellow-600' };
    return { text: 'En stock', color: 'text-green-600' };
  };

  // Verificar si el producto está activo
  const isProductActive = () => {
    return product.isActive !== false && product.active !== false;
  };

  const stockStatus = getStockStatus();

  return (
    <div 
      onClick={handleCardClick}
      className="product-card bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      <div className="relative aspect-square bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <>
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute top-2 right-2">
              <WishlistButton 
                productId={product.id}
                productName={product.name}
                variant="compact"
                size="sm"
                className="shadow-sm"
              />
            </div>

            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        index === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Etiquetas */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-lg">
              ⭐ Destacado
            </span>
          )}
          {!isProductActive() && (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
              No disponible
            </span>
          )}
        </div>
      </div>

      {/* Información del producto */}
      <div className="p-4 space-y-3">
        {/* Categoría */}
        <div>
          <span className="inline-flex items-center text-xs text-blue-700 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
            {product.category}
          </span>
        </div>
        
        {/* Nombre del producto */}
        <div>
          <h3 className="font-bold text-gray-900 line-clamp-2 text-base leading-snug mb-1 min-h-[3rem]">
            {product.name}
          </h3>
        </div>
        
        {/* Tienda (si se muestra) */}
        {showStoreName && product.storeName && (
          <div>
            <span className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full font-medium border border-gray-200">
              🏪 {product.storeName}
            </span>
          </div>
        )}
        
        {/* Precio destacado */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
          <div>
            <span className="text-2xl font-black text-green-700">₡{product.price?.toLocaleString()}</span>
            <p className="text-xs text-green-600 font-medium">Precio final</p>
          </div>
        </div>
        
        {/* Stock por separado */}
        <div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
            stockStatus.color === 'text-red-600' ? 'bg-red-100 text-red-700 border border-red-200' :
            stockStatus.color === 'text-orange-600' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
            stockStatus.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            'bg-green-100 text-green-700 border border-green-200'
          }`}>
            {stockStatus.text}
          </span>
        </div>
        
        {/* Información de envío mejorada */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  {product.shippingCost ? `₡${product.shippingCost}` : 'Gratis'}
                </p>
                <p className="text-xs text-gray-500">Envío</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-purple-100 p-1.5 rounded-full">
                <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  {product.averageShippingTime ? `${product.averageShippingTime}d` : 'N/D'}
                </p>
                <p className="text-xs text-gray-500">Entrega</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Botón de agregar al carrito */}
        <button
          onClick={handleAddToCartClick}
          disabled={!isProductActive() || product.stock === 0}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            !isProductActive() || product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100'
              : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 shadow-md hover:shadow-lg'
          }`}
        >
          {!isProductActive() ? 'No disponible' : 
           product.stock === 0 ? 'Agotado' : 
           'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
