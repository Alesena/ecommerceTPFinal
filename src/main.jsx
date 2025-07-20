import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/main.css';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { CategoriesProvider } from './context/CategoriesContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CategoriesProvider>
        <App />
        </CategoriesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);