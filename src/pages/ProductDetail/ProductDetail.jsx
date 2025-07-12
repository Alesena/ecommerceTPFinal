import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-message">Cargando el detalle de los productos...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!product) return <div className="not-found">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-image-wrapper">
          <img 
            src={product.image} 
            alt={product.title} 
            className="product-detail-image"
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.title}</h1>
          <p className="product-category">{product.category}</p>
          <div className="product-rating">
            Calificacion: {product.rating.rate} ({product.rating.count} comentarios:)
          </div>
          <p className="product-description">{product.description}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <button className="buy-button">Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;