import React from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

const ProductGrid = ({
  products,
  loading,
  error,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  emptyMessage = 'No hay productos disponibles',
  deletingId
}) => {
  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!products.length && !loading) {
    return <div className="empty-message">{emptyMessage}</div>;
  }

  return (
    <section className="product-grid-wrapper">
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={deletingId === product.id}
          />
        ))}
      </div>

      {loading && products.length > 0 && (
        <div className="loading-more">
          <div className="loading-spinner"></div>
          <p>Cargando más productos...</p>
        </div>
      )}

      {hasMore && !loading && (
        <div className="load-more-container">
          <button
            className="load-more-button"
            onClick={onLoadMore}
            aria-label="Cargar más productos"
            disabled={deletingId} // Deshabilitar mientras se elimina
          >
            Ver más productos
          </button>
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="end-message">
          <p>Has llegado al final de nuestros productos</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;