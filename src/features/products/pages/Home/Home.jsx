import useProducts from '../../hooks/useProducts';
import FilterBar from '../../components/FilterBar/FilterBar';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import Slider from '../../../../components/Slider/Slider';
import { useState, useEffect } from 'react';
import { useCategoriesContext } from '../../context/CategoriesContext';
import { useAuth } from '../../../../features/auth/context/AuthContext';
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
    bestSellers,
    loading,
    loadingBestSellers,
    error,
    hasMore,
    loadMore,
    deleteProduct,
  } = useProducts({
    categoryId: filters.categoryId,
    subcategoryId: filters.subcategoryId,
    sortBy: filters.sortBy,
  });


  const handleEditProduct = (product) => {
    navigate(`/edit-product/${product.id}`);
  };


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
      <div>
        <img className="home-banner" src="/images/banner.png" alt="Banner de la Tienda" />
      </div>
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
          bestSellers={bestSellers} 
          loading={loading}
          loadingBestSellers={loadingBestSellers}
          error={error}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onEdit={isAdmin ? handleEditProduct : null}
          onDelete={isAdmin ? handleDeleteProduct : null}
          deletingId={deletingId}
        />
        <Slider
          items={bestSellers}
          title="Los Más Vendidos"
          autoPlay={true}
          interval={3000}
          showSalesCount={true}
        />
      </div>
    </main>
  );
}