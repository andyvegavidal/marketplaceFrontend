import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useProduct, useCart, useStore, useNotification } from '../context';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import ProductComments from '../components/ProductComments';
import { toast } from 'react-hot-toast';

function ProductoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest } = useAuth();
  const { addToCart } = useCart(); 
  const { getAllProducts } = useProduct();
  const { publicStores } = useStore();
  const { showToast } = useNotification();
  
  // Estados del componente
  const [product, setProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details'); // details, reviews, comments
  const [productReviews, setProductReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // Cargar datos del producto
  useEffect(() => {
    const loadProductData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Verificar que tenemos el ID del producto
        if (!id) {
          throw new Error('ID de producto no válido');
        }
        
        // Obtener todos los productos y buscar el específico
        const allProducts = await getAllProducts();
        
        if (!allProducts || !Array.isArray(allProducts)) {
          throw new Error('No se pudieron cargar los productos');
        }
        
        const foundProduct = allProducts.find(p => p.id === id);
        
        if (!foundProduct) {
          throw new Error('Producto no encontrado');
        }
        
        setProduct(foundProduct);
        
        // Buscar la tienda correspondiente
        if (!publicStores || publicStores.length === 0) {
          throw new Error('No se pudieron cargar las tiendas');
        }
        
        const foundStore = publicStores.find(s => s.id === foundProduct.storeId);
        
        if (!foundStore) {
          throw new Error('Tienda no encontrada para este producto');
        }
        
        setStore(foundStore);
        
        // Cargar reseñas (simuladas por ahora)
        await loadProductReviews(id);
        
      } catch (error) {
        setError(error.message || 'Error desconocido al cargar el producto');
        setProduct(null);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && publicStores.length > 0) {
      loadProductData();
    } else if (id && publicStores.length === 0) {
      // Si no hay tiendas cargadas aún, esperar un poco más
      const timeout = setTimeout(() => {
        if (publicStores.length === 0) {
          setError('No se pudieron cargar las tiendas. Verifica tu conexión a internet.');
          setLoading(false);
        }
      }, 5000); // Esperar 5 segundos antes de mostrar error

      return () => clearTimeout(timeout);
    }
  }, [id, getAllProducts, publicStores]); // getAllProducts ahora es estable

  // Función para reintentar la carga
  const retryLoadProduct = async () => {
    setError(null);
    setLoading(true);
    
    // Disparar el useEffect nuevamente
    try {
      const allProducts = await getAllProducts();
      
      if (!allProducts || !Array.isArray(allProducts)) {
        throw new Error('No se pudieron cargar los productos');
      }
      
      const foundProduct = allProducts.find(p => p.id === id);
      
      if (!foundProduct) {
        throw new Error('Producto no encontrado');
      }
      
      setProduct(foundProduct);
      
      if (!publicStores || publicStores.length === 0) {
        throw new Error('No se pudieron cargar las tiendas');
      }
      
      const foundStore = publicStores.find(s => s.id === foundProduct.storeId);
      
      if (!foundStore) {
        throw new Error('Tienda no encontrada para este producto');
      }
      
      setStore(foundStore);
      await loadProductReviews(id);
      
    } catch (error) {
      setError(error.message || 'Error desconocido al cargar el producto');
      setProduct(null);
      setStore(null);
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar reseñas del producto (simulada)
  const loadProductReviews = async (productId) => {
    try {
      // Por ahora simulamos las reseñas, más tarde se puede conectar a una API real
      const mockReviews = [
        {
          id: 1,
          userName: "Juan Pérez",
          rating: 5,
          comment: "Excelente producto, muy recomendado!",
          date: new Date('2024-01-15')
        },
        {
          id: 2,
          userName: "María González",
          rating: 4,
          comment: "Buena calidad, llegó rápido.",
          date: new Date('2024-01-10')
        }
      ];
      
      setProductReviews(mockReviews);
      
      // Calcular rating promedio
      if (mockReviews.length > 0) {
        const avg = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
        setAverageRating(avg);
      }
    } catch (error) {
      setProductReviews([]);
      setAverageRating(0);
    }
  };

  // Funciones auxiliares
  const getProductAverageRating = () => averageRating;
  const getProductReviews = () => productReviews;
  const reportContent = (productId, type, reason) => {
    toast.success(`Reporte enviado: ${reason}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Si hay un error, mostrar pantalla de error con botón de reintentar
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al cargar el producto</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
          
          <div className="space-y-4">
            <button
              onClick={retryLoadProduct}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Volver a intentar
                </>
              )}
            </button>
            
            <div className="text-sm text-gray-500">
              <button
                onClick={() => navigate('/productos')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Volver a la lista de productos
              </button>
            </div>
          </div>
          
          {/* Información adicional de ayuda */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
            <h3 className="text-sm font-medium text-gray-900 mb-2">¿Necesitas ayuda?</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Verifica tu conexión a internet</p>
              <p>• Intenta recargar la página</p>
              <p>• Si el problema persiste, contacta al soporte</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product || !store) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando producto...</p>
      </div>
    );
  }

  // Mostrar error
  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Producto no encontrado'}
        </h2>
        <p className="text-gray-600 mb-6">
          {error === 'Producto no encontrado' 
            ? 'El producto que buscas no existe o ha sido eliminado.'
            : 'Ocurrió un error al cargar el producto. Por favor, intenta de nuevo.'
          }
        </p>
        <button
          onClick={() => navigate('/productos')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ver todos los productos
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    try {
      addToCart(product.id, quantity, product);
      showToast(`${quantity} unidad(es) de ${product.name} agregado(s) al carrito!`, 'success');
    } catch (error) {
      showToast('Error al agregar el producto al carrito', 'error');
    }
  };

  const getStockStatus = () => {
    if (product.stock === 0) return { text: 'Agotado', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (product.stock <= 5) return { text: `Solo quedan ${product.stock}`, color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (product.stock <= 10) return { text: `Pocas unidades: ${product.stock}`, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { text: 'En stock', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors">Inicio</button>
        <span className="text-gray-400">›</span>
        <button onClick={() => navigate('/productos')} className="hover:text-blue-600 transition-colors">Productos</button>
        <span className="text-gray-400">›</span>
        <button onClick={() => navigate(`/productos?category=${product.category}`)} className="hover:text-blue-600 transition-colors">
          {product.category}
        </button>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Galería de imágenes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:border-blue-300 ${
                    index === selectedImageIndex ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto - Layout más compacto */}
        <div className="lg:col-span-4 space-y-4">
          {/* Etiquetas */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">{product.category}</span>
            {product.featured && (
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs px-3 py-1 rounded-full font-medium">⭐ Destacado</span>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {/* Calificación y reseñas */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <StarRating rating={parseFloat(getProductAverageRating())} />
              <span className="text-sm font-medium text-blue-600">
                {parseFloat(getProductAverageRating()).toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({getProductReviews().length} reseñas)
            </span>
          </div>

          {/* Descripción */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acerca de este producto</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Información de envío compacta */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-md font-semibold text-gray-900 mb-2">📦 Información de envío</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Costo:</span>
                <span className="font-bold text-green-500">GRATIS!</span>
              </div>
              <div className="flex justify-between">
                <span>Tiempo:</span>
                <p className="text-gray-700 font-medium">{product.averageShippingTime} días hábiles</p>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                📍 Desde: {product.physicalLocation}
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral de compra - Como Amazon */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg sticky top-6">
            {/* Precio destacado */}
            <div className="text-3xl font-bold text-red-600 mb-1">₡{product.price}</div>
            <p className="text-sm text-gray-600 mb-4">Precio incluye impuestos</p>
            
            {/* Estado del stock - Más visible */}
            <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold mb-4 ${stockStatus.color} ${stockStatus.bgColor}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${stockStatus.color.replace('text-', 'bg-')}`}></div>
              {stockStatus.text}
            </div>

            {/* Información de envío destacada */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-green-800 mb-1">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium">✅ Envío disponible</span>
              </div>
              <div className="text-xs text-gray-600">
                🚚 Llegará en {product.averageShippingTime}
              </div>
            </div>

            {/* Selector de cantidad y botón de compra */}
            {product.active && product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad</label>
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-lg font-bold"
                    >
                      −
                    </button>
                    <span className="text-lg font-semibold w-12 text-center bg-gray-50 py-2 rounded">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">Máximo: {product.stock} unidades</div>
                </div>
                
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 py-3 px-6 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  🛒 Agregar al carrito
                </button>
                
                <div className="text-center pt-2">
                  <div className="text-sm text-gray-600">Total: <span className="font-bold text-lg text-green-600">₡{(product.price * quantity).toLocaleString()}</span></div>
                </div>
              </div>
            )}

            {(!product.active || product.stock === 0) && (
              <div className="text-center py-6">
                <div className="text-gray-500 mb-3 text-lg">
                  {!product.active ? '❌ No disponible' : '📦 Agotado'}
                </div>
                <p className="text-sm text-gray-400">
                  {!product.active 
                    ? 'Este producto ya no está disponible' 
                    : 'Te notificaremos cuando esté disponible'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del vendedor */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Información del vendedor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.fullName}</h3>
            <p className="text-gray-600 mb-4">{store.description}</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{store.email}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{store.phone}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{store.address}</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Calificación: {store.rating} estrellas</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-2">Categorías de productos</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {store.categories?.map(category => (
                <span
                  key={category}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <button
                onClick={() => navigate(`/tienda/${store.id}`)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver tienda completa →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de detalles, reseñas y comentarios */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalles del producto
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Reseñas ({getProductReviews().length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preguntas y respuestas
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información del producto
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                <h4 className="font-medium text-gray-900 mb-2">Categoría</h4>
                <p className="text-gray-700 mb-4">{product.category}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Información de envío</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>⏰ Tiempo promedio: {product.averageShippingTime} días hábiles</p>
                  <p>💰 Costo de envío: GRATIS!</p>
                  <p>📍 Ubicación física: {product.physicalLocation}</p>
                  <p>📅 Fecha de publicación: {new Date(product.publishDate).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <StarRating rating={parseFloat(getProductAverageRating(parseInt(id)))} />
                  <span className="text-sm text-gray-600">
                    ({getProductReviews(parseInt(id)).length} reseñas)
                  </span>
                </div>

                {/* Botón de reporte */}
                <button
                  onClick={() => {
                    const reason = prompt('¿Por qué quieres reportar este producto?\n\n1. Contenido inapropiado\n2. Información falsa\n3. Producto prohibido\n4. Otro\n\nEscribe el número o describe la razón:');
                    if (reason) {
                      reportContent(id, 'product', reason);
                    }
                  }}
                  className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                >
                  ⚠️ Reportar este producto
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Calificaciones y reseñas
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <StarRating rating={parseFloat(getProductAverageRating())} />
                  <span className="text-sm text-gray-600">
                    Basado en {getProductReviews().length} reseñas
                  </span>
                </div>
              </div>
            </div>
            
            <ReviewForm 
              productId={id} 
              onReviewAdded={() => {
                // Refresh reviews when a new one is added
                loadProductReviews(id);
                setActiveTab('reviews');
              }}
            />
            
            <ReviewsList productId={id} reviews={productReviews} />
          </div>
        )}

        {activeTab === 'comments' && (
          <ProductComments productId={id} />
        )}
      </div>

      {/* Productos relacionados */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {store.products
            ?.filter(p => p.active && p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map(relatedProduct => (
              <div
                key={relatedProduct.id}
                onClick={() => navigate(`/producto/${relatedProduct.id}`)}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <img
                  src={relatedProduct.images[0]}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{relatedProduct.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">${relatedProduct.price}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductoDetalle;
