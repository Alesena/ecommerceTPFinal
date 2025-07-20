import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCategories = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategories(categoriesData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      await refreshCategories();
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, updatedData) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'categories', id), {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      await refreshCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Soft delete (marcar como inactiva)
  const deactivateCategory = async (id) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'categories', id), {
        isActive: false,
        deletedAt: new Date().toISOString()
      });
      await refreshCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminación permanente
  const deleteCategoryPermanently = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'categories', id));
      await refreshCategories();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id) || null;
  };

  const activeCategories = categories.filter(cat => cat.isActive !== false);

  const value = {
    categories,
    activeCategories,
    loading,
    error,
    refreshCategories,
    createCategory,
    updateCategory,
    deactivateCategory, // Renombrado para mayor claridad
    deleteCategoryPermanently, // Nueva función
    getCategoryById
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategoriesContext debe usarse dentro de un CategoriesProvider');
  }
  return context;
};