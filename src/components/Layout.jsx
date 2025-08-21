import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from './ToastContainer';

function Layout({ children, onCartClick }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <Header onCartClick={onCartClick} />
      <main className="flex-1 flex justify-center items-center w-full p-0 md:p-6">
        <div className="bg-white/80 rounded-xl shadow-lg p-6 min-h-[60vh] w-full max-w-5xl m-0">
          {children}
        </div>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default Layout;
