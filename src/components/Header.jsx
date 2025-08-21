import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CartButton from './CartButton';
import WishlistModal from './WishlistModal';
import NotificationSystem from './NotificationSystem';
import { useAuth, useCart, useWishlist } from '../context';

function Header({ onCartClick }) {
  const { user, logout, isStore, isAuthenticated, loading } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlistItems } = useWishlist();
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCartItemsCount();
  
  const navLinks = [
    { to: "/", label: "Inicio", icon: "🏠" },
    { to: "/productos", label: "Productos", icon: "📦" },
    { to: "/tiendas", label: "Tiendas", icon: "🏪" },
    ...(isStore() ? [{ to: "/vender", label: "Vender", icon: "💼" }] : []),
    ...(isStore() ? [{ to: "/analytics", label: "Análisis", icon: "📊" }] : []),
    ...(isStore() ? [{ to: "/reportes", label: "Reportes", icon: "📈" }] : []),
    ...(!isStore() && user ? [{ to: "/historial-compras", label: "Mis Compras", icon: "🛍️" }] : []),
    { to: "/cuenta", label: "Mi cuenta", icon: "👤" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 text-white hover:scale-105 transition-transform duration-200"
            onClick={closeMobileMenu}
          >
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
              Marketplace<span className="text-yellow-300">CR</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.to
                    ? "bg-white text-blue-700 shadow-md"
                    : "text-white hover:bg-blue-700/70 hover:text-yellow-200"
                }`}
              >
                <span className="hidden xl:inline">{link.label}</span>
                <span className="xl:hidden">{link.icon}</span>
              </Link>
            ))}
          </nav>

          {/* Action Buttons - Always visible */}
          <div className="flex items-center space-x-2">
            {isAuthenticated() && (
              <div className="hidden sm:block">
                <NotificationSystem />
              </div>
            )}
            {/* Wishlist Button */}
            <button
              onClick={() => setShowWishlistModal(true)}
              className="relative p-2 text-gray-600 hover:text-red-600 transition-colors"
              title="Lista de deseos"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </button>
            <CartButton onClick={onCartClick} count={cartCount} />
            
            {/* User Actions */}
            {loading ? (
              <div className="hidden md:block">
                <div className="px-3 py-2 rounded-md text-sm font-medium bg-gray-400 text-white">
                  Cargando...
                </div>
              </div>
            ) : isAuthenticated() ? (
              <div className="hidden md:block">
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-white text-blue-700 hover:bg-blue-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors"
                >
                  Registro
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-blue-700/70 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700/90 rounded-lg mt-2 mb-2">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                    location.pathname === link.to
                      ? "bg-white text-blue-700"
                      : "text-white hover:bg-blue-600/70"
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </span>
                </Link>
              ))}
              
              {/* Mobile Notifications */}
              {isAuthenticated() && (
                <div className="px-3 py-2 sm:hidden">
                  <NotificationSystem />
                </div>
              )}
              
              {/* Mobile Wishlist and Cart */}
              <div className="flex items-center space-x-4 px-3 py-2 border-t border-blue-600 lg:hidden">
                <button
                  onClick={() => {
                    setShowWishlistModal(true);
                    closeMobileMenu();
                  }}
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Lista de deseos ({wishlistItems.length})</span>
                </button>
                
                <button
                  onClick={() => {
                    onCartClick();
                    closeMobileMenu();
                  }}
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8.5M14 18a2 2 0 110 4 2 2 0 010-4zm-5 0a2 2 0 110 4 2 2 0 010-4z" />
                  </svg>
                  <span>Carrito ({cartCount})</span>
                </button>
              </div>
              
              {/* Mobile User Actions */}
              <div className="border-t border-blue-600 pt-3 md:hidden">
                {loading ? (
                  <div className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-gray-400 text-white">
                    Cargando...
                  </div>
                ) : isAuthenticated() ? (
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                      closeMobileMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-white text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-400 text-blue-900 hover:bg-yellow-300 transition-colors"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <WishlistModal 
          isOpen={showWishlistModal} 
          onClose={() => setShowWishlistModal(false)} 
        />
      )}
    </header>
  );
}

export default Header;
