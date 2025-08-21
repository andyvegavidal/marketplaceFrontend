import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import './App.css';

// Páginas
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import ProductoDetalle from "./pages/ProductoDetalle";
import Tiendas from "./pages/Tiendas";
import TiendaDetalle from "./pages/TiendaDetalle";
import Vender from "./pages/Vender";
import Cuenta from "./pages/Cuenta";
import StoreAnalytics from "./pages/StoreAnalytics";
import StoreReports from "./pages/StoreReports";
import ProductoDetalleSimple from "./pages/ProductoDetalleSimple";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage";

// Componentes
import Layout from './components/Layout';
import CartModal from './components/CartModal';
import Login from './components/Login';
import Register from './components/Register';
import { AppProviders, useAuth } from './context';

// Componente interno que puede usar los contextos
const AppContent = () => {
  // Estado del modal del carrito
  const [cartOpen, setCartOpen] = useState(false);

  // Componente para proteger rutas (ahora puede usar useAuth)
  const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <>
      <CartModal open={cartOpen} onClose={() => setCartOpen(false)} />
      <Router>
        <Layout onCartClick={() => setCartOpen(true)}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/tiendas" element={<Tiendas />} />
            <Route path="/tienda/:id" element={<TiendaDetalle />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/vender" 
              element={
                <ProtectedRoute>
                  <Vender />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cuenta" 
              element={
                <ProtectedRoute>
                  <Cuenta />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <StoreAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reportes" 
              element={
                <ProtectedRoute>
                  <StoreReports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/producto-simple/:id" 
              element={
                <ProtectedRoute>
                  <ProductoDetalleSimple />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/historial-compras" 
              element={
                <ProtectedRoute>
                  <PurchaseHistoryPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Layout>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
