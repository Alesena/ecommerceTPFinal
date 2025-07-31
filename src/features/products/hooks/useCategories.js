import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const useCategories = () => {
  const [state, setState] = useState({
    categories: [],
    loading: true,
    error: null
  });

   const refreshCategories = async () => {
    try {
      setState(prev => ({...prev, loading: true}));
      const q = query(collection(db, 'categories'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setState({
        categories: categoriesData,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        categories: [],
        loading: false,
        error: error.message
      });
    }
  };

  useEffect(() => {
    refreshCategories();
  }, []);

  return { ...state, refreshCategories };
};