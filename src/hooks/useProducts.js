// hooks/useProducts.js
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
import { db } from '../firebase';

export default function useProducts({
  categoryId,
  subcategoryId,
  searchTerm,
  sortBy = 'createdAt-desc',
  pageSize = 12,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [updating, setUpdating] = useState(false); // Para operaciones de actualización/eliminación

    // Función para eliminar producto
  const deleteProduct = async (productId) => {
    try {
      setUpdating(true);
      await deleteDoc(doc(db, 'products', productId));
      // Actualizar el estado local eliminando el producto
      setProducts(prev => prev.filter(p => p.id !== productId));
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
  }, [categoryId, subcategoryId, searchTerm, sortBy]); // eslint-disable-line

  const loadMore = () => fetch(true);

  return { products, loading, error, hasMore, loadMore, reset,deleteProduct, updating };
}