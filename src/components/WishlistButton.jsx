import React from 'react';
import { useAuth, useWishlist, useNotification } from '../context';

function WishlistButton({ 
  productId, 
  productName, 
  onClick, 
  size = 'md',
  variant = 'icon', // 'icon', 'button', 'compact'
  className = '' 
}) {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, wishlistLoading } = useWishlist();
  const { showToast } = useNotification();

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      showToast('Debes iniciar sesión para agregar productos a tu lista de deseos', 'error');
      return;
    }

    try {
      const isCurrentlyInWishlist = isInWishlist(productId);
      
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(productId, productName);
      } else {
        await addToWishlist(productId, productName);
      }
    } catch (error) {
      showToast('Error al gestionar lista de deseos', 'error');
    }

    if (onClick) {
      onClick();
    }
  };

  const isInList = isInWishlist(productId);
  
  // Diferentes tamaños de iconos
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={wishlistLoading}
        className={`relative p-2 text-gray-600 hover:text-red-600 transition-colors ${
          wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        title={isInList ? 'Remover de lista de deseos' : 'Agregar a lista de deseos'}
      >
        {wishlistLoading ? (
          <svg className={`${iconSize} animate-spin`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : (
          <svg 
            className={iconSize} 
            fill={isInList ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )}
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        onClick={handleClick}
        disabled={wishlistLoading}
        className={`inline-flex items-center justify-center px-4 py-2 border rounded-md font-medium transition-all ${
          isInList 
            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        {wishlistLoading ? (
          <>
            <svg className={`${iconSize} animate-spin mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Cargando...
          </>
        ) : (
          <>
            <svg 
              className={`${iconSize} mr-2`} 
              fill={isInList ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {isInList ? 'En lista de deseos' : 'Agregar a deseos'}
          </>
        )}
      </button>
    );
  }

  // variant === 'compact'
  return (
    <button
      onClick={handleClick}
      disabled={wishlistLoading}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-all ${
        isInList 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-red-500'
      } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-110'} ${className}`}
      title={isInList ? 'Remover de lista de deseos' : 'Agregar a lista de deseos'}
    >
      {wishlistLoading ? (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ) : (
        <svg 
          className={iconSize} 
          fill={isInList ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
}

export default WishlistButton;
