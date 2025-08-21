import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useStore, useCart, useProduct, useNotification } from '../context';
import ProductCard from '../components/ProductCard';

function Home() {
  const { publicStores } = useStore();
  const { addToCart } = useCart();
  const { 
    allProducts,
    featuredProducts, 
    bestSellingProducts, 
    productLoading,
    getBestSellingProducts, 
    getAllProducts, 
    getFeaturedProducts 
  } = useProduct();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Función para contar productos por tienda
  const getProductCountForStore = (storeId) => {
    return (allProducts || []).filter(product => product.storeId === storeId && product.active).length;
  };
  
  useEffect(() => {
    // Solo establecer loading como false una vez que tengamos datos o después de un timeout
    const checkData = () => {
      if (allProducts && allProducts.length > 0) {
        setLoading(false);
      } else {
        // Timeout de seguridad para evitar loading infinito
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };

    checkData();
  }, [allProducts, featuredProducts, bestSellingProducts]);
  
  // Asegurar que publicStores esté definido antes de ordenar
  const sortedStores = (publicStores || []).length > 0 
    ? [...publicStores].sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''))
    : [];
  
  const handleAddToCart = (product) => {
    try {
      addToCart(product.id, 1, product);
      showToast(`${product.name} agregado al carrito!`, 'success');
    } catch (error) {
      showToast('Error al agregar el producto al carrito', 'error');
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/productos?category=${encodeURIComponent(category)}`);
  };

  const handleViewAllProducts = (filter = '') => {
    navigate(`/productos${filter ? `?filter=${filter}` : ''}`);
  };

  const handleExploreProducts = () => {
    navigate('/productos');
  };

  const handleStoreClick = (storeId) => {
    navigate(`/tienda/${storeId}`);
  };

  // Obtener todas las categorías únicas con verificación de seguridad
  const allCategories = [...new Set((allProducts || []).map(product => product.category).filter(Boolean))];

  if (loading || productLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Bienvenido a MarketplaceCR
        </h1>
        <p className="text-xl mb-6">
          Descubre los mejores productos de {(publicStores || []).length} tiendas locales
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleExploreProducts}
            className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
          >
            Explorar Productos
          </button>
          <button 
            onClick={() => navigate('/tiendas')}
            className="bg-white/20 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors"
          >
            Ver Tiendas
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{(publicStores || []).length}</div>
          <div className="text-gray-600">Tiendas registradas</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600">{allProducts.length}</div>
          <div className="text-gray-600">Productos disponibles</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">{allCategories.length}</div>
          <div className="text-gray-600">Categorías</div>
        </div>
      </div>

      {/* Productos Más Vendidos */}
      {bestSellingProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Productos Más Vendidos</h2>
            <button 
              onClick={() => handleViewAllProducts('/bestselling')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {bestSellingProducts.slice(0, 12).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                showStoreName={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Tiendas Destacadas */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Nuestras Tiendas</h2>
          <button 
            onClick={() => navigate('/tiendas')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sortedStores.slice(0, 6).map(store => (
            <div 
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{store.fullName || 'Tienda sin nombre'}</h3>
                  <p className="text-sm text-gray-600">{store.address || 'Dirección no disponible'}</p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-700">{store.rating || '0.0'}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description || 'Sin descripción disponible'}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{getProductCountForStore(store.id)} productos</span>
                <span>{store.totalSales || 0} ventas</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(store.categories || []).slice(0, 3).map(category => (
                  <span key={category} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {category}
                  </span>
                ))}
                {(store.categories || []).length > 3 && (
                  <span className="text-xs text-gray-500">+{(store.categories || []).length - 3} más</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Productos Destacados */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Productos Destacados</h2>
            <button 
              onClick={() => handleViewAllProducts('featured')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 12).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
                showStoreName={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* Categorías Populares */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Explorar por Categoría</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {allCategories.map(category => {
            const categoryProducts = (allProducts || []).filter(p => p.category === category);
            return (
              <div 
                key={category} 
                onClick={() => handleCategoryClick(category)}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
              >
                <div className="text-3xl mb-2">
                  {category === 'Electrónicos' && '📱'}
                  {category === 'Computadoras' && '💻'}
                  {category === 'Accesorios' && '🎮'}
                  {category === 'Gaming' && '🕹️'}
                  {category === 'Audio' && '🎧'}
                  {category === 'Móviles' && '📞'}
                  {category === 'Ropa' && '👕'}
                  {category === 'Calzado' && '👟'}
                  {category === 'Bolsos' && '👜'}
                  {category === 'Smart Home' && '🏠'}
                  {category === 'Cámaras' && '📸'}
                  {!['Electrónicos', 'Computadoras', 'Accesorios', 'Gaming', 'Audio', 'Móviles', 'Ropa', 'Calzado', 'Bolsos', 'Smart Home', 'Cámaras'].includes(category) && '🛍️'}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{category}</h3>
                <p className="text-xs text-gray-500">{categoryProducts.length} productos</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Banner Promocional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🚚 Envío gratis en compras mayores a ₡50,000
        </h3>
        <p className="text-gray-700">
          Aprovecha nuestros envíos gratuitos en toda Costa Rica
        </p>
      </div>
    </div>
  );
}

export default Home;
