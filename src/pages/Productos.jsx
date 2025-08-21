import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth, useProduct, useCart, useStore, useNotification } from '../context';
import ProductCard from '../components/ProductCard';

function Productos() {
  const { addToCart } = useCart();
  const { getAllProducts, searchProducts, productCategories } = useProduct();
  const { publicStores } = useStore();
  const { showToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leer parámetros de URL al cargar
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const filterParam = searchParams.get('filter');
    const storeParam = searchParams.get('store');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    if (storeParam) {
      setSelectedStore(storeParam);
    }
    
    if (filterParam === 'featured') {
      setSortBy('featured');
    } else if (filterParam === 'bestselling') {
      setSortBy('bestselling');
    } else if (filterParam === 'recent') {
      setSortBy('name');
    }
  }, [searchParams]);

  // Cargar todos los productos al inicializar
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        // Cargar productos de la API
        const apiProducts = await getAllProducts();
        
        // Cargar productos locales
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        
        // Combinar productos evitando duplicados
        const allUniqueProducts = [];
        const seenIds = new Set();
        
        // Agregar productos de API
        (apiProducts || []).forEach(product => {
          if (!seenIds.has(product.id)) {
            allUniqueProducts.push(product);
            seenIds.add(product.id);
          }
        });
        
        // Agregar productos locales
        localProducts.forEach(product => {
          if (!seenIds.has(product.id)) {
            allUniqueProducts.push(product);
            seenIds.add(product.id);
          }
        });

        setAllProducts(allUniqueProducts);
      } catch (error) {
        // Cargar solo productos locales como fallback
        const localProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        setAllProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [getAllProducts]);

  // Filtrar productos cuando cambien los criterios
  useEffect(() => {
    if (allProducts.length > 0) {
      const filtered = allProducts.filter(product => {
        // Filtro por término de búsqueda
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro por categoría
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        
        // Filtro por tienda
        const matchesStore = !selectedStore || product.storeName === selectedStore;
        
        return matchesSearch && matchesCategory && matchesStore;
      });
      
      setFilteredProducts(filtered);
    }
  }, [allProducts, searchTerm, selectedCategory, selectedStore]);

  // Aplicar filtros adicionales de URL
  const finalFilteredProducts = filteredProducts.filter(product => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'featured' && !product.featured) return false;
    if (filterParam === 'bestselling' && (!product.sales || product.sales < 30)) return false;
    return true;
  });

  // Ordenar productos
  const sortedProducts = [...finalFilteredProducts].sort((a, b) => {
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
    const result = addToCart(product.id, 1, product);
    if (result.success) {
      showToast(`${product.name} agregado al carrito!`, 'success');
    } else {
      showToast(result.message || 'Error al agregar al carrito', 'error');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Actualizar URL
    const newParams = new URLSearchParams(searchParams);
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.delete('filter'); // Limpiar filtro al cambiar categoría
    setSearchParams(newParams);
  };

  const handleStoreChange = (store) => {
    setSelectedStore(store);
    // Actualizar URL
    const newParams = new URLSearchParams(searchParams);
    if (store) {
      newParams.set('store', store);
    } else {
      newParams.delete('store');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedStore('');
    setSearchTerm('');
    setSearchParams({}); // Limpiar todos los parámetros de URL
  };

  // Obtener todas las categorías únicas (del contexto y calculadas localmente)
  const localCategories = [...new Set(allProducts.map(product => product.category).filter(Boolean))];
  const contextCategories = productCategories || [];
  const allCategories = [...new Set([...contextCategories, ...localCategories])].sort();
  
  const storeNames = publicStores.map(store => store.fullName);

  // Mostrar loading mientras se cargan los productos
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
        <p className="text-gray-600">
          Explora {allProducts.length} productos de {publicStores.length} tiendas locales
        </p>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                placeholder="Buscar por nombre, descripción..."
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
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías ({allCategories.length} disponibles)</option>
              {allCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Filtro por tienda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tienda
            </label>
            <select
              value={selectedStore}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las tiendas</option>
              {storeNames.map(storeName => (
                <option key={storeName} value={storeName}>{storeName}</option>
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
            Mostrando {sortedProducts.length} de {allProducts.length} productos
            {selectedCategory && ` en la categoría "${selectedCategory}"`}
            {selectedStore && ` de "${selectedStore}"`}
            {searchTerm && ` que coinciden con "${searchTerm}"`}
            {searchParams.get('filter') === 'featured' && ' destacados'}
            {searchParams.get('filter') === 'bestselling' && ' más vendidos'}
          </span>
          {(selectedCategory || selectedStore || searchTerm || searchParams.get('filter')) && (
            <button
              onClick={handleClearFilters}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid de productos */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedProducts.map(product => (
            <ProductCard 
              key={`${product.storeId}-${product.id}`}
              product={product} 
              onAddToCart={handleAddToCart}
              showStoreName={true}
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
              : 'No hay productos disponibles en este momento'
            }
          </p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Total productos cargados: {allProducts.length}</p>
            <p>Productos filtrados: {finalFilteredProducts.length}</p>
            <p>Categorías disponibles: {allCategories.length}</p>
          </div>
        </div>
      )}

      {/* Categorías rápidas */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Explorar por categoría</h3>
        <div className="flex flex-wrap gap-2">
          {allCategories.map(category => {
            const count = allProducts.filter(p => p.category === category).length;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category === selectedCategory ? '' : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Productos;
