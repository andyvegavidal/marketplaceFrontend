import React from 'react';

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-inner mt-auto">
      <div className="max-w-5xl mx-auto py-4 px-6 flex flex-col md:flex-row justify-between items-center text-white text-sm gap-2">
        <span>© 2025 MarketplaceCR</span>
        <span>Hecho con <span className="text-red-300">❤️</span> en Costa Rica</span>
      </div>
    </footer>
  );
}

export default Footer;
