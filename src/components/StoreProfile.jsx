import React, { useState } from 'react';
import { useAuth } from '../context';

function StoreProfile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [products, setProducts] = useState(user.products || []);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    country: user.country || '',
    address: user.address || '',
    description: user.description || '',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
    physicalLocation: '',
    averageShippingTime: '',
    shippingCost: '',
    featured: false
  });

  const handleSave = () => {
    updateUser({
      ...formData,
      products
    });
    setIsEditing(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    
    const product = {
      id: Date.now(),
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      shippingCost: parseFloat(newProduct.shippingCost),
      publishDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      active: true
    };
    
    setProducts([...products, product]);
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      images: [],
      physicalLocation: '',
      averageShippingTime: '',
      shippingCost: '',
      featured: false
    });
    setShowAddProduct(false);
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const removeProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const toggleProductStatus = (id) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, active: !product.active } : product
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Panel de Tienda</h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-4 py-2 rounded-lg ${
            isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isEditing ? 'Guardar' : 'Editar Perfil'}
        </button>
      </div>

      {/* Información de la Tienda */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Información de la Tienda</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la Tienda</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">País</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg"
            rows="2"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Descripción de la Tienda</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border rounded-lg"
            rows="3"
            placeholder="Describe tu tienda, productos que vendes, etc."
          />
        </div>
      </div>

      {/* Gestión de Productos */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Mis Productos</h3>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + Agregar Producto
          </button>
        </div>

        {/* Formulario para agregar producto */}
        {showAddProduct && (
          <div className="bg-white border rounded-lg p-4 mb-4">
            <h4 className="text-md font-semibold mb-3">Nuevo Producto</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {(user.categories || []).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio (USD) *</label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación Física</label>
                <input
                  type="text"
                  value={newProduct.physicalLocation}
                  onChange={(e) => setNewProduct({...newProduct, physicalLocation: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: Almacén A, Estante 2B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tiempo de Envío</label>
                <input
                  type="text"
                  value={newProduct.averageShippingTime}
                  onChange={(e) => setNewProduct({...newProduct, averageShippingTime: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ej: 2-3 días hábiles"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Costo de Envío (USD)</label>
                <input
                  type="number"
                  value={newProduct.shippingCost}
                  onChange={(e) => setNewProduct({...newProduct, shippingCost: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URLs de Imágenes</label>
                <textarea
                  value={newProduct.images.join('\n')}
                  onChange={(e) => setNewProduct({...newProduct, images: e.target.value.split('\n').filter(url => url.trim())})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Una URL por línea"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Descripción *</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
                required
              />
            </div>
            <div className="mt-4 flex gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newProduct.featured}
                  onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                  className="mr-2"
                />
                Producto destacado
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddProduct}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Agregar
              </button>
              <button
                onClick={() => setShowAddProduct(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de productos */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes productos registrados aún.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 bg-white">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Imágenes del producto */}
                  {product.images && product.images.length > 0 && (
                    <div className="lg:w-32 lg:h-32">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {product.images.length > 1 && (
                        <p className="text-xs text-gray-500 mt-1">+{product.images.length - 1} más</p>
                      )}
                    </div>
                  )}
                  
                  {/* Información del producto */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{product.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.active ? 'Activo' : 'Inactivo'}
                      </span>
                      {product.featured && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          Destacado
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                      <div><strong>Categoría:</strong> {product.category}</div>
                      <div><strong>Precio:</strong> ${product.price}</div>
                      <div><strong>Stock:</strong> {product.stock} unidades</div>
                      <div><strong>Ubicación:</strong> {product.physicalLocation || 'No especificada'}</div>
                      <div><strong>Envío:</strong> {product.averageShippingTime || 'No especificado'}</div>
                      <div><strong>Costo envío:</strong> ${product.shippingCost || '0.00'}</div>
                      <div><strong>Publicado:</strong> {product.publishDate || 'Hoy'}</div>
                    </div>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => toggleProductStatus(product.id)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        product.active 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {product.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-700">Productos Activos</h4>
          <p className="text-2xl font-bold text-blue-900">
            {products.filter(p => p.active).length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-700">Productos Destacados</h4>
          <p className="text-2xl font-bold text-green-900">
            {products.filter(p => p.featured).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-700">Total de Productos</h4>
          <p className="text-2xl font-bold text-yellow-900">
            {products.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default StoreProfile;
