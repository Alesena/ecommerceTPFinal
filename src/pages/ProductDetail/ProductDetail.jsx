import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Producto no encontrado');
        }

        setProduct({ id: docSnap.id, ...docSnap.data() });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-message">Cargando detalles del producto...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!product) return <div className="not-found">Producto no encontrado</div>;

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-image-wrapper">
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="product-detail-image"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x500?text=Imagen+no+disponible';
            }}
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          {product.sku && (
            <p className="product-sku">
              SKU: <strong>{product.sku}</strong>
            </p>
          )}

          {product.category && (
            <p className="product-category">
              Categoría: {product.category}
            </p>
          )}

          {product.rating && (
            <div className="product-rating">
              Calificación: {product.rating.rate} ({product.rating.count} comentarios)
            </div>
          )}

          <p className="product-description">{product.description}</p>

          <p className="product-price">
            ${product.price?.toFixed(2) || '0.00'}
          </p>

          <button className="buy-button">Agregar al carrito</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;