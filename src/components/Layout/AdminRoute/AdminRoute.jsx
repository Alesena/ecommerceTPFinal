import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
      
        setIsAdmin(user.email === import.meta.env.VITE_USERADMIN);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Verificando permisos...</div>;
  
  return isAdmin ? children : <Navigate to="/" state={{ from: location }} replace />;
};

export default AdminRoute;