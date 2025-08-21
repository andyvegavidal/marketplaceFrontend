// Utilidades para manejo de autenticación

// Obtener el token desde localStorage
function getTokenFromLocalStorage() {
  const token = localStorage.getItem('token');
  return token || null;
}

// Obtener información del usuario
function getUserData() {
  const userData = localStorage.getItem('userData');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      return null;
    }
  }
  return null;
}

// Verificar si el token es válido
async function verifyToken() {
  const token = getTokenFromLocalStorage();
  if (!token) return false;

  try {
    const response = await fetch(import.meta.env.VITE_BASE_API_URL + '/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return response.ok && data.success;
  } catch (error) {
    return false;
  }
}

// Función completa para verificar autenticación
async function checkAuthentication() {
  const token = getTokenFromLocalStorage();
  const userData = getUserData();
  
  if (token && userData) {
    const isValid = await verifyToken();
    if (isValid) {
      return { authenticated: true, token, userData };
    } else {
      return { authenticated: false, token: null, userData: null };
    }
  } else {
    return { authenticated: false, token: null, userData: null };
  }
}

// Función para realizar login
async function performLogin(email, password) {
  try {
    const response = await fetch(import.meta.env.VITE_BASE_API_URL + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success && data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      
      return { success: true, token: data.data.token, user: data.data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: 'Error de conexión' };
  }
}

export { 
  getTokenFromLocalStorage, 
  getUserData, 
  verifyToken, 
  checkAuthentication, 
  performLogin 
};
