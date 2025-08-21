import React, { useState, useEffect } from 'react';
import { useAuth, useStore, useProduct, useNotification } from '../context';

function StoreAnalytics() {
  const { user, isStore } = useAuth();
  const { subscribedStores, userStore } = useStore();
  const { products, addProduct, updateProduct, deleteProduct, getStoreProducts } = useProduct();
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState('products');
  const [storeProducts, setStoreProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '0',
    physicalLocation: 'Almacén principal',
    averageShippingTime: '2-3 días hábiles',
    images: [''],
    condition: 'Nuevo',
    brand: '',
    model: ''
  });

  useEffect(() => {
    
    const fetchStoreProducts = async () => {
      // Usar user.store directamente si userStore no está disponible
      const storeInfo = userStore || user?.store;
      
      if (isStore() && user && storeInfo) {
        setIsLoadingProducts(true);
        try {
          // Usar el ID de la tienda
          const storeId = storeInfo._id || storeInfo.id;
          const userProducts = await getStoreProducts(storeId);
          setStoreProducts(userProducts || []);
        } catch (error) {
          setStoreProducts([]);
        } finally {
          setIsLoadingProducts(false);
        }
      } else {
        setIsLoadingProducts(false);
      }
    };

    fetchStoreProducts();
  }, [isStore, user, userStore, getStoreProducts]);

  // Helper function to refresh products list
  const refreshStoreProducts = async () => {
    const storeInfo = userStore || user?.store;
    
    if (user && storeInfo && (storeInfo._id || storeInfo.id)) {
      try {
        const storeId = storeInfo._id || storeInfo.id;
        const updatedProducts = await getStoreProducts(storeId);
        setStoreProducts(updatedProducts || []);
      } catch (error) {
        setStoreProducts([]);
      }
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    // Obtener ID tienda
    const storeInfo = userStore || user?.store;
    const storeId = storeInfo?._id || storeInfo?.id;
    
    if (!storeId) {
      showToast('Error: No se pudo identificar la tienda', 'error');
      return;
    }
    
    const specifications = {};
    if (productForm.condition) specifications.condition = productForm.condition;
    if (productForm.brand) specifications.brand = productForm.brand;
    if (productForm.model) specifications.model = productForm.model;
    
    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stock: parseInt(productForm.stock) || 0,
      physicalLocation: productForm.physicalLocation || 'Almacén principal',
      averageShippingTime: productForm.averageShippingTime || '2-3 días hábiles',
      images: productForm.images.filter(img => img && img.trim() !== ''),
      specifications: specifications,
      isActive: true
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showToast('Producto actualizado exitosamente', 'success');
      } else {
        await addProduct(productData);
        showToast('Producto agregado exitosamente', 'success');
      }
      
      await refreshStoreProducts();
      
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (error) {
      showToast(`Error al guardar el producto: ${error.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        deleteProduct(productId);
        showToast('Producto eliminado exitosamente', 'success');
        
        // Refresh products list
        await refreshStoreProducts();
      } catch (error) {
        showToast('Error al eliminar el producto', 'error');
      }
    }
  };

  const handleToggleProductStatus = async (product) => {
    try {
      updateProduct(product.id, { ...product, active: !product.active });
      showToast(`Producto ${product.active ? 'desactivado' : 'activado'} exitosamente`, 'success');
      
      // Refresh products list
      await refreshStoreProducts();
    } catch (error) {
      showToast('Error al cambiar el estado del producto', 'error');
    }
  };

  if (!isStore()) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
        <p className="text-gray-600">Esta página es solo para tiendas registradas.</p>
      </div>
    );
  }

  if (isLoadingProducts) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-4">Cargando...</h2>
          <p className="text-gray-600">Obteniendo los productos de tu tienda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Análisis de Tienda</h1>
        <p className="text-gray-600">
          Estadísticas y análisis de tu tienda: {user.fullName}
        </p>
        <div className="mt-4 flex items-center space-x-6">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-blue-700">
              Productos Activos: {Array.isArray(storeProducts) ? storeProducts.filter(p => p.active).length : 0}
            </span>
          </div>
          <div className="bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-sm font-medium text-green-700">
              Total Productos: {Array.isArray(storeProducts) ? storeProducts.length : 3}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Productos ({Array.isArray(storeProducts) ? storeProducts.length : 0})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscribers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Suscriptores ({subscribedStores.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wishlist'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Lista de Deseos
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Resumen General
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Products Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Gestión de Productos ({Array.isArray(storeProducts) ? storeProducts.length : 0})
            </h2>
            <button
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  stock: '0',
                  physicalLocation: 'Almacén principal',
                  averageShippingTime: '2-3 días hábiles',
                  images: [''],
                  condition: 'Nuevo',
                  brand: '',
                  model: ''
                });
                setShowProductForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Agregar Producto</span>
            </button>
          </div>

          {/* Products Grid */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            {!Array.isArray(storeProducts) || storeProducts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes productos aún</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza agregando tu primer producto para vender
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(storeProducts) && storeProducts.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 relative">
                    {/* Product Status Badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>

                    <img
                      src={product.images[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-medium text-gray-900 mb-2 pr-16">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-600">₡{product.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            name: product.name,
                            description: product.description,
                            price: product.price.toString(),
                            category: product.category,
                            stock: (product.stock || 0).toString(),
                            physicalLocation: product.physicalLocation || 'Almacén principal',
                            averageShippingTime: product.averageShippingTime || '2-3 días hábiles',
                            images: product.images,
                            condition: product.specifications?.condition || 'Nuevo',
                            brand: product.specifications?.brand || '',
                            model: product.specifications?.model || ''
                          });
                          setShowProductForm(true);
                        }}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleProductStatus(product)}
                        className={`flex-1 px-3 py-1.5 rounded text-sm ${
                          product.active
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {product.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Form Modal */}
          {showProductForm && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                  <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <form onSubmit={handleSubmitProduct}>
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
                        </h3>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Producto
                          </label>
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <textarea
                            value={productForm.description}
                            onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio (₡)
                            </label>
                            <input
                              type="number"
                              value={productForm.price}
                              onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoría
                            </label>
                            <select
                              value={productForm.category}
                              onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="">Seleccionar...</option>
                              <option value="Tecnología">Tecnología</option>
                              <option value="Ropa">Ropa</option>
                              <option value="Hogar">Hogar</option>
                              <option value="Deportes">Deportes</option>
                              <option value="Libros">Libros</option>
                              <option value="Otros">Otros</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Condición
                            </label>
                            <select
                              value={productForm.condition || 'Nuevo'}
                              onChange={(e) => setProductForm({...productForm, condition: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="Nuevo">Nuevo</option>
                              <option value="Usado - Como nuevo">Usado - Como nuevo</option>
                              <option value="Usado - Buen estado">Usado - Buen estado</option>
                              <option value="Usado - Regular">Usado - Regular</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Stock
                            </label>
                            <input
                              type="number"
                              value={productForm.stock}
                              onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tiempo de Envío
                            </label>
                            <select
                              value={productForm.averageShippingTime}
                              onChange={(e) => setProductForm({...productForm, averageShippingTime: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="1-2 días hábiles">1-2 días hábiles</option>
                              <option value="2-3 días hábiles">2-3 días hábiles</option>
                              <option value="3-5 días hábiles">3-5 días hábiles</option>
                              <option value="1 semana">1 semana</option>
                              <option value="2-3 semanas">2-3 semanas</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Marca (Opcional)
                            </label>
                            <input
                              type="text"
                              value={productForm.brand || ''}
                              onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: Apple, Samsung, Nike"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Modelo (Opcional)
                            </label>
                            <input
                              type="text"
                              value={productForm.model || ''}
                              onChange={(e) => setProductForm({...productForm, model: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ej: iPhone 15, Galaxy S24"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ubicación Física
                          </label>
                          <input
                            type="text"
                            value={productForm.physicalLocation}
                            onChange={(e) => setProductForm({...productForm, physicalLocation: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Almacén principal, Sucursal San José"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            URL de Imagen
                          </label>
                          <input
                            type="url"
                            value={productForm.images[0] || ''}
                            onChange={(e) => setProductForm({...productForm, images: [e.target.value]})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        {editingProduct ? 'Actualizar' : 'Agregar'} Producto
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowProductForm(false)}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Usuarios Suscritos ({subscribedStores.length})
            </h2>
            
            {subscribedStores.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes suscriptores aún</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Los usuarios pueden suscribirse a tu tienda para recibir notificaciones
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha de Suscripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compras Totales
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Compra
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribedStores.map((subscriber) => (
                      <tr key={subscriber.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {subscriber.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscriber.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(subscriber.subscribedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscriber.totalPurchases}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscriber.lastPurchase 
                            ? new Date(subscriber.lastPurchase).toLocaleDateString()
                            : 'Nunca'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Productos en Listas de Deseos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.isArray(storeProducts) && storeProducts.filter(p => p.active).map((product) => {
                // Simular conteo de wishlist (en producción vendría del backend)
                const wishlistCount = Math.floor(Math.random() * 10);
                
                return (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>En {wishlistCount} listas de deseos</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{wishlistCount}</span>
                      </div>
                    </div>
                    {wishlistCount > 5 && (
                      <div className="mt-2 text-xs text-green-600">
                        ¡Producto popular! Considera promocionarlo.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Suscriptores
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {subscribedStores.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Productos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(storeProducts) ? storeProducts.length : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      En Listas de Deseos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(storeProducts) ? storeProducts.filter(p => p.active).reduce((acc, product) => 
                        acc + Math.floor(Math.random() * 10), 0
                      ) : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Calificación
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {user.rating || 0}/5.0
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="ml-3 text-gray-600">
                  Nuevo suscriptor: maria_rodriguez se suscribió a tu tienda
                </span>
                <span className="ml-auto text-gray-400">Hace 2 horas</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="ml-3 text-gray-600">
                  iPhone 15 Pro Max fue agregado a 3 listas de deseos
                </span>
                <span className="ml-auto text-gray-400">Hace 4 horas</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="ml-3 text-gray-600">
                  Nueva venta: PlayStation 5 vendida por ₡254,949
                </span>
                <span className="ml-auto text-gray-400">Hace 6 horas</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreAnalytics;
