import useProducts from '../../hooks/useProducts';
import FilterBar from '../../components/FilterBar/FilterBar';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import { useState, useEffect } from 'react';
import { useCategoriesContext } from '../../context/CategoriesContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
  const { activeCategories, loading: categoriesLoading } = useCategoriesContext();
  const [filters, setFilters] = useState({
    categoryId: '',
    subcategoryId: '',
    sortBy: 'createdAt-desc',
  });
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    deleteProduct,
  } = useProducts({
    categoryId: filters.categoryId,
    subcategoryId: filters.subcategoryId,
    sortBy: filters.sortBy,
  });

  // Función para editar producto
  const handleEditProduct = (product) => {
    navigate(`/edit-product/${product.id}`);
  };

  // Función para eliminar producto
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto permanentemente?')) {
      try {
        setDeletingId(productId);
        await deleteProduct(productId);
      } catch (error) {
        console.error("Error al eliminar producto:", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Verificaciones de categorías (se mantienen igual)
  useEffect(() => {
    if (filters.categoryId && !categoriesLoading) {
      const categoryExists = activeCategories.some(cat => cat.id === filters.categoryId);
      if (!categoryExists) {
        setFilters(prev => ({ ...prev, categoryId: '', subcategoryId: '' }));
      }
    }
  }, [activeCategories, filters.categoryId, categoriesLoading]);

  useEffect(() => {
    if (filters.subcategoryId && !categoriesLoading) {
      const subcategoryExists = activeCategories.some(cat => cat.id === filters.subcategoryId);
      if (!subcategoryExists) {
        setFilters(prev => ({ ...prev, subcategoryId: '' }));
      }
    }
  }, [activeCategories, filters.subcategoryId, categoriesLoading]);

  return (
    <main className="home-page">
      <div className="home-container">
        <h1 className="home-title">Nuestros Productos</h1>
        {categoriesLoading ? (
          <div className="loading-categories">Cargando categorías...</div>
        ) : (
          <FilterBar
            onChange={setFilters}
            currentFilters={filters}
          />
        )}
        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onEdit={isAdmin ? handleEditProduct : null}
          onDelete={isAdmin ? handleDeleteProduct : null}
          deletingId={deletingId}
        />
      </div>
    </main>
  );
}