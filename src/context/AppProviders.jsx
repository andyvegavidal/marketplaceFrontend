import React from 'react';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { WishlistProvider } from './WishlistContext';
import { StoreProvider } from './StoreContext';
import { ProductProvider } from './ProductContext';
import { ReviewProvider } from './ReviewContext';
import { NotificationProvider } from './NotificationContext';
import { OrderProvider } from './OrderContext';
import { PaymentProvider } from './PaymentContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ProductProvider>
        <StoreProvider>
          <ReviewProvider>
            <NotificationProvider>
              <OrderProvider>
                <CartProvider>
                  <PaymentProvider>
                    <WishlistProvider>
                      {children}
                    </WishlistProvider>
                  </PaymentProvider>
                </CartProvider>
              </OrderProvider>
            </NotificationProvider>
          </ReviewProvider>
        </StoreProvider>
      </ProductProvider>
    </AuthProvider>
  );
};

export default AppProviders;
