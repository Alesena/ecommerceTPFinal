import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../../config/firebase';

export default function useProducts({
  categoryId,
  subcategoryId,
  searchTerm,
  sortBy = 'createdAt-desc',
  pageSize = 12,
}) {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingBestSellers, setLoadingBestSellers] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [updating, setUpdating] = useState(false);

  const deleteProduct = async (productId) => {
    try {
      setUpdating(true);
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));

      setBestSellers(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const reset = useCallback(() => {
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
  }, []);

  const fetchBestSellers = useCallback(async () => {
    try {
      setLoadingBestSellers(true);
      const q = query(
        collection(db, 'products'),
        orderBy('salesCount', 'desc'),
        limit(10) 
      );
      
      const snap = await getDocs(q);
      const bestSellersData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBestSellers(bestSellersData);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
      setError("No se pudieron cargar los productos más vendidos");
    } finally {
      setLoadingBestSellers(false);
    }
  }, []);

  const fetch = useCallback(
    async (append = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const [field, dir] = sortBy.split('-');
        let q = query(
          collection(db, 'products'),
          orderBy(field, dir),
          limit(pageSize)
        );

        if (searchTerm) {
          q = query(
            collection(db, 'products'),
            where('keywords', 'array-contains', searchTerm.toLowerCase()),
            orderBy(field, dir),
            limit(pageSize)
          );
        } else if (subcategoryId) {
          q = query(
            collection(db, 'products'),
            where('subcategoryId', '==', subcategoryId),
            orderBy(field, dir),
            limit(pageSize)
          );
        } else if (categoryId) {
          q = query(
            collection(db, 'products'),
            where('categoryId', '==', categoryId),
            orderBy(field, dir),
            limit(pageSize)
          );
        }

        if (append && lastVisible) {
          q = query(q, startAfter(lastVisible));
        }

        const snap = await getDocs(q);

        const newItems = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts((prev) => (append ? [...prev, ...newItems] : newItems));
        setLastVisible(snap.docs[snap.docs.length - 1] ?? null);
        setHasMore(newItems.length === pageSize);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, subcategoryId, searchTerm, sortBy, pageSize, lastVisible]
  );

  useEffect(() => {
    reset();
    fetch();
    fetchBestSellers(); 
  }, [categoryId, subcategoryId, searchTerm, sortBy]); 

  const loadMore = () => fetch(true);

  return { 
    products, 
    bestSellers, 
    loading, 
    loadingBestSellers,
    error, 
    hasMore, 
    loadMore, 
    reset,
    deleteProduct, 
    updating 
  };
}