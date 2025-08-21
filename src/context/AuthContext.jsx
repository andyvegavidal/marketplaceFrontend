import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_BASE_API_URL || '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  const getUserToken = () => {
    return localStorage.getItem('token');
  };

  // Función auxiliar para extraer el usuario real de la estructura anidada
  // Extrae el usuario real de la estructura anidada (soporta {user: {...}} y {...})
  const extractUser = (userData) => {
    if (!userData) return null;
    if (userData.user && !userData.id && !userData._id) {
      return userData.user;
    }
    return userData;
  };

  const isAuthenticated = () => {
    // Verificar directamente en localStorage para respuesta inmediata
    const token = getUserToken();
    const savedUserData = localStorage.getItem('userData');
    
    if (!token || !savedUserData) {
      return false;
    }
    
    try {
      const userData = JSON.parse(savedUserData);
      const actualUser = extractUser(userData);
      return !!(actualUser && (actualUser._id || actualUser.id));
    } catch (error) {
      return false;
    }
  };

  const getXToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/x-token`, {
        method: "POST",
        credentials: 'include'
      });
      const data = await response.json();
      return data.xToken;
    } catch (err) {
      return null;
    }
  };

  const apiRequest = async (endpoint, options = {}) => {
    const token = getUserToken();
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        await logout();
        throw new Error('Token expirado. Por favor, inicia sesión nuevamente.');
      }

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      if (!email || !password) {
        return { 
          success: false, 
          message: 'Email y contraseña son requeridos' 
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.message || 'Credenciales inválidas' 
        };
      }

      if (data.success && data.data && data.data.user && data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        setUserToken(data.data.token);
        setUser(data.data.user);
        
        return { 
          success: true, 
          user: data.data.user,
          message: 'Inicio de sesión exitoso'
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Error en la autenticación' 
        };
      }
      
    } catch (error) {
      return { 
        success: false, 
        message: 'Error de conexión. Verifica tu internet.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        
        setUserToken(data.data.token);
        setUser(data.data.user);
        
        return { success: true, user: data.data.user };
      } else {
        return { success: false, message: data.message || 'Error al registrarse' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      const token = getUserToken();
      if (token) {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
        } catch (logoutError) {
          // Ignorar errores del logout del backend
        }
      }
    } catch (error) {
      // Ignorar errores
    } finally {
      // Limpiar estado local
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setUser(null);
      setUserToken(null);
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = getUserToken();
      
      if (!token) {
        // No hay token, limpiar estado
        setUser(null);
        setUserToken(null);
        setLoading(false);
        return;
      }

      // Establecer token inmediatamente
      setUserToken(token);
      
      // Recuperar datos del usuario desde localStorage
      let hasValidLocalData = false;
      try {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          const userData = JSON.parse(savedUserData);
          const actualUser = extractUser(userData);
          if (actualUser && (actualUser.id || actualUser._id)) {
            setUser(actualUser);
            hasValidLocalData = true;
            // Si los datos estaban anidados, guardar la versión desanidada
            if (userData.user && !userData.id && !userData._id) {
              localStorage.setItem('userData', JSON.stringify(actualUser));
            }
          }
        }
      } catch (parseError) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem('userData');
      }
      
      // Intentar obtener datos actualizados del servidor
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const serverUserData = await response.json();
          if (serverUserData.success && serverUserData.data) {
            const actualServerUser = extractUser(serverUserData.data);
            setUser(actualServerUser);
            localStorage.setItem('userData', JSON.stringify(actualServerUser));
          }
        } else if (response.status === 401) {
          // Token inválido - solo limpiar si no tenemos datos locales válidos
          if (!hasValidLocalData) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            setUser(null);
            setUserToken(null);
          }
        }
      } catch (meError) {
        // Error de servidor - mantener datos locales si existen
      }
      
    } catch (error) {
      // Solo limpiar si realmente no hay datos válidos
      const hasToken = getUserToken();
      const hasUserData = localStorage.getItem('userData');
      
      if (!hasToken || !hasUserData) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setUser(null);
        setUserToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, message: errorData.message || 'Error al actualizar perfil' };
      }
    } catch (error) {
      return { success: false, message: 'Error de conexión' };
    }
  };

  const loadUserData = async () => {
    if (!isAuthenticated()) return;

    try {
      // Esta función puede ser usada por otros contextos
    } catch (error) {
      // Error silencioso
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const isStore = () => {
    // Verificar directamente en localStorage para respuesta inmediata
    if (!isAuthenticated()) {
      return false;
    }
    
    const savedUserData = localStorage.getItem('userData');
    if (!savedUserData) {
      return false;
    }
    
    try {
      const userData = JSON.parse(savedUserData);
      const actualUser = extractUser(userData);
      
      if (!actualUser) {
        return false;
      }
      
      // Verificar si el usuario es una tienda basado en userType
      const userType = actualUser.userType?.toLowerCase();
      return userType === 'store' || userType === 'tienda' || userType === 'seller';
    } catch {
      return false;
    }
  };

  const value = {
    user,
    loading,
    userToken,
    isAuthenticated,
    isStore,
    login,
    register,
    logout,
    updateUserProfile,
    apiRequest,
    getUserToken,
    getXToken,
    loadUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export default AuthContext;