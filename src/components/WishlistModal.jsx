import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useWishlist, useCart, useNotification } from '../context';
import ProductCard from './ProductCard';

function WishlistModal({ isOpen, onClose }) {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAddToCart = (product) => {
    const productId = product._id || product.id;
    addToCart(productId, 1, product);
    showToast(`${product.name} agregado al carrito!`, 'success');
  };

  const handleClearWishlist = async () => {
    try {
      const result = await clearWishlist();
      if (result.success) {
        showToast(result.message || 'Lista de deseos vaciada', 'success');
      } else {
        showToast(result.message || 'Error al vaciar lista de deseos', 'error');
      }
    } catch (error) {
      showToast('Error al vaciar lista de deseos', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Mi Lista de Deseos ({wishlistItems.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Tu lista de deseos está vacía</h3>
            <p className="mt-1 text-gray-500">
              Agrega productos que te gusten para encontrarlos fácilmente después
            </p>
            <button
              onClick={() => {
                onClose();
                navigate('/productos');
              }}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Explorar Productos
            </button>
          </div>
        ) : (
          <>
            {/* Acciones */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleClearWishlist}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Limpiar lista
              </button>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-96 overflow-y-auto">
              {wishlistItems.map(item => {
                // Extraer los datos del producto correctamente
                const product = item.productId || item.product || item;
                const productId = item.productId?._id || item.productId || item.product?._id || item._id;
                
                return (
                  <div key={productId} className="relative">
                    <ProductCard 
                      product={product} 
                      onAddToCart={() => handleAddToCart(product)}
                      showStoreName={true}
                    />
                    {/* Botón para remover de wishlist */}
                    <button
                      onClick={() => removeFromWishlist(productId)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      title="Eliminar de lista de deseos"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishlistModal;
