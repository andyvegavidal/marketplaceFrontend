import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useProduct, useCart, useStore } from '../context';

function ProductoDetalleSimple() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById } = useProduct();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const productData = await getProductById(id);
        
        if (productData) {
          setProduct(productData);
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{error || 'Error desconocido'}</h2>
        <button 
          onClick={() => navigate('/productos')} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Volver a Productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/productos')} 
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Volver a productos
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-2xl font-bold text-blue-600 mb-4">{product.price}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="text-gray-500" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
              Sin imagen disponible
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Descripción</h3>
              <p className="text-gray-700">{product.description || 'Sin descripción disponible'}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Categoría</h3>
              <p className="text-gray-700">{product.category}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Stock</h3>
              <p className="text-gray-700">{product.stock} unidades disponibles</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Tienda</h3>
              <p className="text-gray-700">{product.storeName}</p>
            </div>

            <div className="pt-4">
              <button 
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // Funcionalidad de carrito no disponible en versión simple
                }}
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalleSimple;
