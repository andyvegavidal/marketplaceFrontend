import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useStore, useProduct } from '../context';

function Tiendas() {
  const { publicStores } = useStore();
  const { getAllProducts } = useProduct();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  // Cargar productos para poder contar los productos por tienda
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getAllProducts();
        setAllProducts(products || []);
      } catch (error) {
        setAllProducts([]);
      }
    };

    loadProducts();
  }, [getAllProducts]);

  // Efecto para controlar el estado de carga
  useEffect(() => {
    if (publicStores && publicStores.length >= 0 && allProducts.length >= 0) {
      setLoading(false);
      setError(null);
    } else {
      // Si después de un tiempo no hay tiendas, mostrar un mensaje
      const timeout = setTimeout(() => {
        if (!publicStores || publicStores.length === 0) {
          setError('No se pudieron cargar las tiendas. Verifica tu conexión a internet.');
          setLoading(false);
        }
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [publicStores, allProducts]);

  // Función para contar productos por tienda
  const getProductCountForStore = (storeId) => {
    const count = allProducts.filter(product => product.storeId === storeId && product.active).length;
    return count;
  };

  // Obtener todas las categorías únicas
  const allCategories = [...new Set(
    publicStores.flatMap(store => store.categories || [])
  )].sort();

  // Filtrar tiendas por búsqueda
  const filteredStores = publicStores.filter(store =>
    store.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar tiendas
  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.fullName.localeCompare(b.fullName);
      case 'rating':
        return b.rating - a.rating;
      case 'sales':
        return b.totalSales - a.totalSales;
      case 'products':
        return getProductCountForStore(b.id) - getProductCountForStore(a.id);
      default:
        return 0;
    }
  });

  const handleStoreClick = (storeId) => {
    navigate(`/tienda/${storeId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuestras Tiendas</h1>
        <p className="text-gray-600">
          Explora {publicStores.length} tiendas locales con productos únicos
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar tiendas
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, descripción o ubicación..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
              <option value="rating">Mejor calificación</option>
              <option value="sales">Más ventas</option>
              <option value="products">Más productos</option>
            </select>
          </div>
        </div>

        {/* Resumen de filtros */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {sortedStores.length} de {publicStores.length} tiendas
          {searchTerm && ` que coinciden con "${searchTerm}"`}
        </div>
      </div>

      {/* Grid de tiendas */}
      {sortedStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStores.map(store => (
            <div
              key={store.id}
              onClick={() => handleStoreClick(store.id)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer transform hover:scale-105"
            >
              {/* Header de la tienda */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 mb-1">{store.fullName}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {store.address}
                  </p>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold text-gray-900">{store.rating}</span>
                </div>
              </div>

              {/* Descripción */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                {store.description}
              </p>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">
                    {getProductCountForStore(store.id)}
                  </div>
                  <div className="text-xs text-gray-600">Productos</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{store.totalSales}</div>
                  <div className="text-xs text-gray-600">Ventas</div>
                </div>
              </div>

              {/* Categorías */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Categorías</h4>
                <div className="flex flex-wrap gap-1">
                  {store.categories.slice(0, 4).map(category => (
                    <span key={category} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                  {store.categories.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">+{store.categories.length - 4}</span>
                  )}
                </div>
              </div>

              {/* Información adicional */}
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                <span>Miembro desde {new Date(store.joinDate).getFullYear()}</span>
                <span className="text-blue-600 font-medium">Ver tienda →</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0H3m0 0h2M9 7h6m-6 4h6m-6 4h6m-6 4h6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron tiendas</h3>
          <p className="mt-1 text-sm text-gray-500">
            Intenta ajustar los términos de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}

export default Tiendas;
