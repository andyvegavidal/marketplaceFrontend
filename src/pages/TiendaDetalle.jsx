import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useStore, useCart, useProduct, useNotification } from '../context';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import ReviewsList from '../components/ReviewsList';
import { toast } from 'react-hot-toast';

function TiendaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiRequest, isAuthenticated } = useAuth();
  const { publicStores, subscribedStores } = useStore();
  const { addToCart } = useCart();
  const { getAllProducts, getProductsByStore } = useProduct();
  const { showToast } = useNotification();

  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [activeTab, setActiveTab] = useState('products'); // products, reviews
  const [storeReviews, setStoreReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar la tienda en publicStores
        const foundStore = publicStores.find(s => s.id === id);

        if (!foundStore) {
          throw new Error('Tienda no encontrada');
        }

        setStore(foundStore);

        // Obtener productos de la tienda específica
        const storeProducts = await getProductsByStore(id);
        setProducts(storeProducts);

        // Cargar reseñas de la tienda (simuladas por ahora)
        await loadStoreReviews(id);

      } catch (error) {
        setError(error.message || 'Error desconocido al cargar la tienda');
      } finally {
        setLoading(false);
      }
    };

    if (id && publicStores.length > 0) {
      loadStoreData();
    }
  }, [id, publicStores, getProductsByStore]);

  // Función para cargar reseñas de la tienda (simuladas)
  const loadStoreReviews = async (storeId) => {
    try {
      // Por ahora simulamos las reseñas, más tarde se puede conectar a una API real***
      const mockReviews = [
        {
          id: 1,
          userName: "Carlos Mendez",
          rating: 5,
          comment: "Excelente tienda, productos de calidad y buen servicio!",
          date: new Date('2024-01-20')
        },
        {
          id: 2,
          userName: "Ana Rodriguez",
          rating: 4,
          comment: "Buena variedad de productos, envío rápido.",
          date: new Date('2024-01-15')
        }
      ];

      setStoreReviews(mockReviews);

      // Calcular rating promedio
      if (mockReviews.length > 0) {
        const avg = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;
        setAverageRating(avg);
      }
    } catch (error) {
      setStoreReviews([]);
      setAverageRating(0);
    }
  };

  // Función para reintentar la carga
  const retryLoadStore = () => {
    setError(null);
    setLoading(true);

    const foundStore = publicStores.find(s => s.id === id);

    if (foundStore) {
      setStore(foundStore);
      getAllProducts().then(allProducts => {
        const storeProducts = allProducts.filter(p => p.storeId === id && p.active);
        setProducts(storeProducts);
        loadStoreReviews(id);
        setLoading(false);
      }).catch(error => {
        setError(error.message || 'Error cargando productos');
        setLoading(false);
      });
    } else {
      setError('Tienda no encontrada');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 mb-6">
            <svg className="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al cargar la tienda</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">{error}</p>

          <div className="space-y-4">
            <button
              onClick={retryLoadStore}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Volver a intentar
            </button>

            <div className="text-sm text-gray-500">
              <button
                onClick={() => navigate('/tiendas')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Volver a la lista de tiendas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar si está suscrito a la tienda
  const isSubscribed = subscribedStores.some(storeId => storeId === id);

  // Filtrar productos de la tienda
const filteredProducts = products.filter(product => {
  const matchesSearch = !searchTerm ||
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesCategory = !selectedCategory || product.category === selectedCategory;
  return matchesSearch && matchesCategory;
});

// Ordenar productos
const sortedProducts = [...filteredProducts].sort((a, b) => {
  switch (sortBy) {
    case 'price-low':
      return a.price - b.price;
    case 'price-high':
      return b.price - a.price;
    case 'name':
      return a.name.localeCompare(b.name);
    case 'featured':
      return b.featured - a.featured;
    case 'bestselling':
      return (b.sales || 0) - (a.sales || 0);
    default:
      return 0;
  }
});

const handleAddToCart = (product) => {
  try {
    addToCart(product.id, 1, product);
    showToast(`${product.name} agregado al carrito!`, 'success');
  } catch (error) {
    showToast('Error al agregar el producto al carrito', 'error');
  }
};

const handleSubscriptionToggle = async () => {
  try {
    if (isSubscribed) {
      // Lógica para desuscribirse (simulada)
      showToast(`Te has desuscrito de ${store.fullName}`, 'info');
    } else {
      // Lógica para suscribirse (simulada)
      showToast(`Te has suscrito a ${store.fullName}`, 'success');
    }
  } catch (error) {
    showToast('Error al procesar la suscripción', 'error');
  }
};

const reportStore = () => {
  const reason = prompt('¿Por qué quieres reportar esta tienda?\n\n1. Contenido inapropiado\n2. Productos prohibidos\n3. Prácticas fraudulentas\n4. Otro\n\nEscribe el número o describe la razón:');
  if (reason) {
    toast.success(`Reporte enviado: ${reason}`);
  }
};

// Obtener categorías únicas de los productos de la tienda
const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

return (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* Breadcrumb */}
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      <button onClick={() => navigate('/')} className="hover:text-blue-600">Inicio</button>
      <span>›</span>
      <button onClick={() => navigate('/tiendas')} className="hover:text-blue-600">Tiendas</button>
      <span>›</span>
      <span className="text-gray-900">{store.fullName}</span>
    </nav>

    {/* Header de la tienda */}
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.fullName}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <StarRating rating={parseFloat(averageRating)} />
            <span className="text-sm text-gray-600">
              ({storeReviews.length} reseñas)
            </span>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{store.description}</p>

          {/* Información de contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{store.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{store.address}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Miembro desde {new Date(store.joinDate).getMonth() + 1}/{new Date(store.joinDate).getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
            {/* Botón de suscripción */}
            <button
              onClick={handleSubscriptionToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${isSubscribed
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {isSubscribed ? (
                <>
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Desuscribirse
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Suscribirse
                </>
              )}
            </button>
          </div>

          {/* Mensaje de suscripción */}
          {isSubscribed && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✓ Estás suscrito a esta tienda. Recibirás notificaciones sobre nuevos productos.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-sm text-gray-600">Productos activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{store.totalSales || 0}</div>
              <div className="text-sm text-gray-600">Total de ventas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
          </div>

          {/* Categorías */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-2">Categorías</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <span
                  key={category}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          {/* Botón de reporte */}
          <div className="mt-6 text-center">
            <button
              onClick={reportStore}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              ⚠️ Reportar esta tienda
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Tabs para productos y reseñas */}
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Productos ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Reseñas de la tienda ({storeReviews.length})
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Filtros y búsqueda */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Búsqueda */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar productos
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar en esta tienda..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                {/* Filtro por categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Ordenar */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="name">Nombre A-Z</option>
                    <option value="featured">Destacados primero</option>
                    <option value="bestselling">Más vendidos</option>
                    <option value="price-low">Precio: Menor a Mayor</option>
                    <option value="price-high">Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {/* Resumen de filtros */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>
                  Mostrando {sortedProducts.length} de {products.length} productos
                  {selectedCategory && ` en la categoría "${selectedCategory}"`}
                  {searchTerm && ` que coinciden con "${searchTerm}"`}
                </span>
                {(selectedCategory || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSearchTerm('');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Filtros rápidos por categoría */}
              {!selectedCategory && categories.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros rápidos:</h4>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => {
                      const count = products.filter(p => p.category === category).length;
                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                          {category} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Grid de productos */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {sortedProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    showStoreName={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v.01M6 8v.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedCategory
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Esta tienda no tiene productos disponibles en este momento'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Reseñas de {store.fullName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <StarRating rating={parseFloat(averageRating)} />
                  <span className="text-sm text-gray-600">
                    Basado en {storeReviews.length} reseñas
                  </span>
                </div>
              </div>
            </div>

            <ReviewForm
              storeId={id}
              onReviewAdded={() => {
                // Refresh reviews when a new one is added
                loadStoreReviews(id);
                setActiveTab('reviews');
              }}
            />

            <ReviewsList storeId={id} reviews={storeReviews} />
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default TiendaDetalle;
