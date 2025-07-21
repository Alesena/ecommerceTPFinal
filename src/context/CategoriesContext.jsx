import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const CategoriesContext = createContext();

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const createCategory = async (categoryData) => {
    let tempId = `temp-${Date.now()}`; // Definimos tempId aquí para que esté disponible en el catch
    
    try {
      setLoading(true);
      // Actualización optimista
      setCategories(prev => [...prev, {
        id: tempId,
        ...categoryData,
        isActive: true,
        createdAt: new Date().toISOString()
      }]);
      
      const docRef = await addDoc(collection(db, 'categories'), {
        ...categoryData,
        createdAt: serverTimestamp(),
        isActive: true
      });
      
      // Reemplazar el temporal con el real
      setCategories(prev => prev.map(cat => 
        cat.id === tempId ? { ...cat, id: docRef.id } : cat
      ));
      
      return docRef.id;
    } catch (err) {
      // Revertir en caso de error
      setCategories(prev => prev.filter(cat => cat.id !== tempId));
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
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateCategory = async (id) => {
    try {
      setLoading(true);
      await updateDoc(doc(db, 'categories', id), {
        isActive: false,
        deletedAt: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategoryPermanently = async (id) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'categories', id));
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

  return (
    <CategoriesContext.Provider value={{
      categories,
      activeCategories: categories.filter(cat => cat.isActive !== false),
      loading,
      error,
      createCategory,
      updateCategory,
      deactivateCategory,
      deleteCategoryPermanently,
      getCategoryById
    }}>
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