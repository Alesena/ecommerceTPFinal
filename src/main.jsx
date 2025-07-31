import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/main.css';
import { AuthProvider } from './features/auth/context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { CategoriesProvider } from './features/products/context/CategoriesContext';
import { CartProvider } from './features/cart/context/CartContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CategoriesProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </CategoriesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);