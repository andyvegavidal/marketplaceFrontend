import React from 'react';

function CartButton({ onClick, count }) {
  return (
    <button
      onClick={onClick}
      className="relative ml-2 p-2 rounded-full bg-white hover:bg-yellow-200 transition-colors"
      aria-label="Ver carrito"
    >
      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
          {count}
        </span>
      )}
    </button>
  );
}

export default CartButton;
