import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, RefreshCw } from 'lucide-react';

const TokenDisplay = () => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkTokenAndUser();
  }, []);

  const checkTokenAndUser = () => {
    // Obtener token del localStorage
    const storedToken = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');

    setToken(storedToken);
    
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
      }
    }

    if (storedToken) {
      verifyTokenValidity(storedToken);
    }
  };

  const verifyTokenValidity = async (tokenToVerify) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      setIsValid(response.ok && data.success);
    } catch (error) {
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatToken = (token) => {
    if (!token) return 'No token found';
    if (!showToken) {
      return token.substring(0, 20) + '...***...';
    }
    return token;
  };

  const getStatusColor = () => {
    if (loading) return 'text-yellow-600';
    if (isValid === true) return 'text-green-600';
    if (isValid === false) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusText = () => {
    if (loading) return 'Verificando...';
    if (isValid === true) return 'Token válido';
    if (isValid === false) return 'Token inválido o expirado';
    return 'No verificado';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Información de Autenticación</h2>
        <button
          onClick={checkTokenAndUser}
          className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </button>
      </div>

      {/* Estado del Usuario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Datos del Usuario</h3>
          {userData ? (
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {userData.name}</p>
              <p><span className="font-medium">Email:</span> {userData.email}</p>
              <p><span className="font-medium">ID:</span> {userData._id}</p>
              {userData.role && <p><span className="font-medium">Rol:</span> {userData.role}</p>}
            </div>
          ) : (
            <p className="text-gray-500">No hay datos del usuario</p>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Estado del Token</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="font-medium mr-2">Estado:</span>
              <span className={`${getStatusColor()} font-medium`}>
                {getStatusText()}
              </span>
              {loading && <RefreshCw className="w-4 h-4 ml-2 animate-spin" />}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Presente:</span>
              <span className={token ? 'text-green-600' : 'text-red-600'}>
                {token ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Token Display */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Token de Autenticación</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowToken(!showToken)}
              className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={copyToClipboard}
              disabled={!token}
              className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border font-mono text-sm break-all">
          {token ? formatToken(token) : 'No hay token disponible'}
        </div>
        
        {copied && (
          <p className="text-green-600 text-sm mt-2">¡Token copiado al portapapeles!</p>
        )}
      </div>

      {/* Instrucciones */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instrucciones de Uso:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Usa el botón "Mostrar/Ocultar" para ver el token completo</li>
          <li>• Copia el token con el botón de copiar</li>
          <li>• Úsalo en las pruebas de API como: <code>Authorization: Bearer &lt;token&gt;</code></li>
          <li>• Si el token está inválido, necesitas iniciar sesión nuevamente</li>
        </ul>
      </div>

      {/* Botones de Acción */}
      {!token && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">No tienes un token válido. Necesitas iniciar sesión.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Ir a Login
          </button>
        </div>
      )}
    </div>
  );
};

export default TokenDisplay;
