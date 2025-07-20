import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import AdminPanel from './pages/Admin/AdminPanel';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import EditProduct from './components/EditProduct/EditProduct';
import CreateCategory from './components/CreateCategory/CreateCategory';
import { CategoriesProvider } from './context/CategoriesContext';
import UserProfile from './components/UserProfile/UserProfile';
import UserDashboard from './components/UserDashboard/UserDashboard';

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
      </div>
    </CategoriesProvider>
  );
}

export default App;