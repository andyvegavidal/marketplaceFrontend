import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
  const { user } = useAuth(); // Get user data to access store ID
  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener todos los productos
  const getAllProducts = useCallback(async () => {
    try {
      setProductLoading(true);
      
      let allCollectedProducts = [];
      let currentPage = 1;
      let hasMoreProducts = true;
      
      // Estrategia 1: Paginación para obtener todos los productos
      while (hasMoreProducts && currentPage <= 10) { // Límite de seguridad de 10 páginas
        
        const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/products/?page=${currentPage}&limit=50`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.products) {
          const pageProducts = result.data.products;
          
          if (pageProducts.length > 0) {
            allCollectedProducts = [...allCollectedProducts, ...pageProducts];
            currentPage++;
            
            // Si obtenemos menos productos que el límite, es la última página
            if (pageProducts.length < 50) {
              hasMoreProducts = false;
            }
          } else {
            hasMoreProducts = false;
          }
        } else {
          hasMoreProducts = false;
        }
      }
            
      // Si no obtuvimos productos con paginación, intentar endpoint simple
      if (allCollectedProducts.length === 0) {
        const simpleResponse = await fetch(import.meta.env.VITE_BASE_API_URL + '/products/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        const simpleResult = await simpleResponse.json();
        
        if (simpleResult.success && simpleResult.data && simpleResult.data.products) {
          allCollectedProducts = simpleResult.data.products;
        }
      }
      
      // Procesar todos los productos recolectados
      if (allCollectedProducts.length > 0) {
        
        const products = allCollectedProducts.map(product => {
          const storeInfo = product.storeId || {};
          
          // Extraer el ID de la tienda correctamente
          let extractedStoreId = null;
          if (typeof product.storeId === 'object' && product.storeId._id) {
            extractedStoreId = product.storeId._id;
          } else if (typeof product.storeId === 'string') {
            extractedStoreId = product.storeId;
          }
          
          return {
            id: product._id,
            name: product.name || 'Producto sin nombre',
            description: product.description || '',
            price: product.price || 0,
            images: product.images || [],
            category: product.category || 'Sin categoría',
            stock: product.stock || 0,
            featured: product.featured || false,
            active: product.isActive !== false,
            sales: product.salesCount || 0,
            storeId: extractedStoreId,
            storeName: storeInfo.userId?.fullName || 'Tienda desconocida',
            storeRating: storeInfo.rating || 0,
            averageShippingTime: product.averageShippingTime || '2-3 días hábiles',
            physicalLocation: product.physicalLocation || 'Almacén principal',
            shippingCost: product.shippingCost || 0
          };
        });
        
        const filteredProducts = products.filter(product => product.active);
        
        setAllProducts(filteredProducts);
        return filteredProducts;
      } else {
        setAllProducts([]);
        return [];
      }
    } catch (error) {
      setAllProducts([]);
      return [];
    } finally {
      setProductLoading(false);
    }
  }, []); 

  // Obtener productos destacados
  const getFeaturedProducts = async (limit = 8) => {
    try {
      setProductLoading(true);
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      const featured = products.filter(product => product.featured).slice(0, limit);
      setFeaturedProducts(featured);
      return featured;
    } catch (error) {
      return [];
    } finally {
      setProductLoading(false);
    }
  };

  // Obtener productos más vendidos
  const getBestSellingProducts = async (limit = 6) => {
    try {
      setProductLoading(true);
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      const bestSelling = products
        .sort((a, b) => (b.sales || 0) - (a.sales || 0))
        .slice(0, limit);
      
      setBestSellingProducts(bestSelling);
      return bestSelling;
    } catch (error) {
      return [];
    } finally {
      setProductLoading(false);
    }
  };

  // Buscar productos
  const searchProducts = async (searchTerm = '', category = '', store = '') => {
    try {
      setProductLoading(true);
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      const filteredProducts = products.filter(product => {
        // Filtro por término de búsqueda (nombre y descripción)
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filtro por categoría
        const matchesCategory = !category || product.category === category;
        
        // Filtro por tienda
        const matchesStore = !store || product.storeName === store;
        
        return matchesSearch && matchesCategory && matchesStore;
      });
      
      return filteredProducts;
    } catch (error) {
      return [];
    } finally {
      setProductLoading(false);
    }
  };

  // Obtener producto por ID
  const getProductById = async (productId) => {
    try {
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      if (!products || products.length === 0) {
        return null;
      }
      
      // Normalizar productId para comparación
      const searchId = productId.toString();
      
      const product = products.find(p => {
        const productIdStr = p.id.toString();
        return productIdStr === searchId;
      });
      
      return product || null;
    } catch (error) {
      return null;
    }
  };

  // Obtener categorías únicas de productos
  const getProductCategories = async () => {
    try {
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      const categories = [...new Set(products.map(product => product.category))];
      setProductCategories(categories);
      return categories;
    } catch (error) {
      return [];
    }
  };

  // Obtener productos por categoría
  const getProductsByCategory = async (category) => {
    try {
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      return products.filter(product => product.category === category);
    } catch (error) {
      return [];
    }
  };

  // Obtener productos por tienda
  const getProductsByStore = useCallback(async (storeId) => {
    try {
      const allProducts = await getAllProducts();
      return allProducts.filter(product => {
        const productStoreId = product.storeId;
        return productStoreId === storeId && product.active;
      });
    } catch (error) {
      return [];
    }
  }, [getAllProducts]);

  // Obtener productos relacionados (misma categoría, excluyendo el actual)
  const getRelatedProducts = async (productId, limit = 4) => {
    try {
      const currentProduct = await getProductById(productId);
      if (!currentProduct) return [];
      
      let products = allProducts;
      
      // Si no hay productos cargados, cargarlos primero
      if (products.length === 0) {
        products = await getAllProducts();
      }
      
      return products
        .filter(product => 
          product.category === currentProduct.category && 
          product.id !== productId
        )
        .slice(0, limit);
    } catch (error) {
      return [];
    }
  };

  // Recargar todos los productos
  const refreshProducts = async () => {
    setAllProducts([]);
    setFeaturedProducts([]);
    setBestSellingProducts([]);
    return await getAllProducts();
  };

  // Agregar nuevo producto
  const addProduct = async (productData) => {
    try {
      setProductLoading(true);
      
      // Get the store ID from the authenticated user
      const storeId = user?.store?._id;
      
      if (!storeId) {
        throw new Error('No se encontró información de la tienda del usuario');
      }
      
      const productPayload = {
        storeId: storeId, // Required field according to the model
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        category: productData.category,
        stock: productData.stock || 0,
        physicalLocation: productData.physicalLocation || 'Almacén principal',
        averageShippingTime: productData.averageShippingTime || '2-3 días hábiles',
        images: productData.images || [],
        specifications: productData.specifications || {},
        featured: false,
        tags: []
      };

      // Enviar al API
      const response = await fetch(import.meta.env.VITE_BASE_API_URL + '/products/createproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(productPayload)
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Crear el producto normalizado para el estado local
        const newProduct = {
          id: result.data.product._id,
          name: result.data.product.name,
          description: result.data.product.description || '',
          price: result.data.product.price,
          images: result.data.product.images || [],
          category: result.data.product.category,
          stock: result.data.product.stock || 0,
          featured: result.data.product.featured || false,
          active: result.data.product.isActive !== false,
          sales: result.data.product.salesCount || 0,
          storeId: result.data.product.storeId,
          storeName: result.data.storeName, // Esto se puede mejorar obteniendo el nombre real
          storeRating: 0,
          createdAt: result.data.product.createdAt || new Date().toISOString()
        };

        // Agregar al estado local
        setAllProducts(prevProducts => [...prevProducts, newProduct]);
        
        return newProduct;
      } else {
        // Manejo específico de errores del backend
        if (result.message && result.message.includes('tienda')) {
          throw new Error('Tu cuenta no está configurada como tienda. Contacta al administrador.');
        }
        throw new Error(result.message || 'Error al crear el producto');
      }
    } catch (error) {
      
      // Como fallback, agregar localmente si falla el API
      const newId = Date.now().toString();
      const fallbackProduct = {
        id: newId,
        name: productData.name,
        description: productData.description || '',
        price: productData.price,
        images: productData.images || [],
        category: productData.category,
        stock: productData.stock || 0,
        featured: false,
        active: true,
        sales: 0,
        storeId: productData.storeId,
        storeName: 'Mi Tienda',
        storeRating: 0,
        createdAt: new Date().toISOString(),
        isLocal: true // Marcar como producto local
      };

      // Guardar en localStorage como fallback
      const savedProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      savedProducts.push(fallbackProduct);
      localStorage.setItem('localProducts', JSON.stringify(savedProducts));
      
      // Agregar al estado local
      setAllProducts(prevProducts => [...prevProducts, fallbackProduct]);
      
      throw error; // Re-lanzar el error para que el componente lo maneje
    } finally {
      setProductLoading(false);
    }
  };

  // Actualizar producto existente
  const updateProduct = async (productId, productData) => {
    try {
      setProductLoading(true);
      
      // Intentar actualizar en el API
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      let updatedProduct = null;

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          updatedProduct = {
            id: result.data._id,
            name: result.data.name,
            description: result.data.description || '',
            price: result.data.price,
            images: result.data.images || [],
            category: result.data.category,
            stock: result.data.stock || 0,
            featured: result.data.featured || false,
            active: result.data.isActive !== false,
            sales: result.data.salesCount || 0,
            storeId: result.data.storeId,
            storeName: productData.storeName || 'Mi Tienda',
            storeRating: 0,
            createdAt: result.data.createdAt || new Date().toISOString()
          };
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar producto');
      }

      if (!updatedProduct) {
        // Fallback: actualizar localmente
        updatedProduct = {
          id: productId,
          ...productData,
          updatedAt: new Date().toISOString()
        };
      }

      // Actualizar en el estado local
      setAllProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? { ...product, ...updatedProduct } : product
        )
      );

      // Actualizar en localStorage si es un producto local
      const savedProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const updatedLocalProducts = savedProducts.map(product => 
        product.id === productId ? { ...product, ...updatedProduct } : product
      );
      localStorage.setItem('localProducts', JSON.stringify(updatedLocalProducts));

      return updatedProduct;
    } catch (error) {
      throw error;
    } finally {
      setProductLoading(false);
    }
  };

  // Eliminar producto
  const deleteProduct = async (productId) => {
    try {
      setProductLoading(true);
      
      // Intentar eliminar en el API
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        credentials: 'include'
      });

      // Independientemente del resultado del API, remover localmente
      setAllProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );

      // Remover de localStorage también
      const savedProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
      const filteredLocalProducts = savedProducts.filter(product => product.id !== productId);
      localStorage.setItem('localProducts', JSON.stringify(filteredLocalProducts));

      return true;
    } catch (error) {
      throw error;
    } finally {
      setProductLoading(false);
    }
  };

  // Cargar productos al inicializar
  useEffect(() => {
    // Cargar productos del localStorage primero
    const loadLocalProducts = () => {
      try {
        const savedProducts = JSON.parse(localStorage.getItem('localProducts') || '[]');
        if (savedProducts.length > 0) {
          setAllProducts(prevProducts => [...prevProducts, ...savedProducts]);
        }
      } catch (error) {
      }
    };

    loadLocalProducts();

    getAllProducts()
      .then(products => {
        if (products && products.length > 0) {
          // Calcular featuredProducts y bestSellingProducts basado en datos reales
          setFeaturedProducts(products.filter(p => p.featured));
          setBestSellingProducts([...products].sort((a, b) => (b.sales || 0) - (a.sales || 0)));
          
          // Extraer categorías únicas
          const categories = [...new Set(products.map(p => p.category))];
          setProductCategories(categories);
        }
      })
      .catch(error => {
      });
  }, []);

  const value = {
    allProducts,
    featuredProducts,
    bestSellingProducts,
    productCategories,
    productLoading,
    getAllProducts,
    getFeaturedProducts,
    getBestSellingProducts,
    searchProducts,
    getProductById,
    getProductCategories,
    getProductsByCategory,
    getProductsByStore,
    getStoreProducts: getProductsByStore, // Alias for backward compatibility
    getRelatedProducts,
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Hook personalizado para usar el contexto de productos
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct debe ser usado dentro de ProductProvider');
  }
  return context;
};

export default ProductContext;
