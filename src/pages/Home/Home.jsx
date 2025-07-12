import { useEffect, useState } from 'react';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://fakestoreapi.com/products?limit=${page * 4}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
    
        if (data.length <= products.length) {
          setHasMore(false);
          return;
        }
        
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page]);

  const loadMoreProducts = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) return <div className="loading-message">Cargando productos...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="home-page">
      <h1 className="page-title">Productos</h1>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {loading && page > 1 && <div className="loading-more">Cargando más productos...</div>}
      
      {hasMore && !loading && (
        <div className="load-more-container">
          <button onClick={loadMoreProducts} className="load-more-button">
            Ver más
          </button>
        </div>
      )}
      
      {!hasMore && <div className="no-more-products">No más productos para mostrar</div>}
    </div>
  );
};

export default Home;