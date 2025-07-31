import { Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header/Header';
import Home from './features/products/pages/Home/Home';
import Login from './features/auth/pages/Login/Login';
import Register from './features/auth/pages/Register/Register';
import ProductDetail from './features/products/pages/ProductDetail/ProductDetail';
import AdminPanel from './features/admin/pages/AdminPanel/AdminPanel';
import PrivateRoute from './components/Layout/PrivateRoute/PrivateRoute';
import AdminRoute from './components/Layout/AdminRoute/AdminRoute';
import EditProduct from './features/products/components/EditProduct/EditProduct';
import CreateCategory from './features/products/components/CreateCategory/CreateCategory';
import { CategoriesProvider } from './features/products/context/CategoriesContext';
import UserProfile from './features/admin/pages/users/pages/UserProfile/UserProfile';
import UserDashboard from './features/admin/pages/users/pages/UserDashboard/UserDashboard';
import Footer from './components/Layout/Footer/Footer';
import Cart from './features/cart/pages/Cart/Cart';
import UserRequest from './features/admin/pages/users/pages/UserRequest/UserRequest';

function App() {
  return (
    <CategoriesProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categoryId" element={<Home />} />
            <Route path="/category/:categoryId/subcategory/:subcategoryId" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/admin/categories" element={<CreateCategory />} />
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="/mi-cuenta" element={<UserDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/mis-pedidos" element={<UserRequest />} />
            <Route path="/admin" element={
              <PrivateRoute>
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              </PrivateRoute>
            } />

            <Route path="/edit-product/:id" element={
              <PrivateRoute>
                <AdminRoute>
                  <EditProduct />
                </AdminRoute>
              </PrivateRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </CategoriesProvider>
  );
}

export default App;