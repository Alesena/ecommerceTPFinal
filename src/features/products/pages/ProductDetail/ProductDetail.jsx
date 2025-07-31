import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { useCart } from '../../../../features/cart/context/CartContext';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Producto no encontrado');
        }

        const productData = { id: docSnap.id, ...docSnap.data() };
        setProduct(productData);
        
      
        if (productData.stock > 0 && quantity > productData.stock) {
          setQuantity(productData.stock);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product, Math.min(quantity, product.stock));
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10) || 1;
    const maxQuantity = product?.stock || 1;
    setQuantity(Math.max(1, Math.min(value, maxQuantity)));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando detalles del producto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaExclamationTriangle className="error-icon" />
        <p className="error-message">{error}</p>
        <a href="/" className="back-link">Volver al inicio</a>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no está disponible.</p>
        <a href="/" className="back-link">Ver todos los productos</a>
      </div>
    );
  }

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
              e.target.className = 'product-detail-image placeholder';
            }}
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>

          {product.stock != null && (
            <div className="stock-info">
              {product.stock > 0 ? (
                <span className="in-stock">
                  {product.stock} unidades disponibles
                </span>
              ) : (
                <span className="out-of-stock">
                  Agotado
                </span>
              )}
            </div>
          )}

          <div className="quantity-selector">
            <label htmlFor="quantity">Cantidad:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={product.stock || 1}
              value={quantity}
              onChange={handleQuantityChange}
              disabled={product.stock === 0}
            />
          </div>

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

          <button
            className={`buy-button ${addedToCart ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addedToCart}
          >
            {addedToCart ? (
              <>
                <FaCheck /> ¡Agregado!
              </>
            ) : product.stock > 0 ? (
              `Agregar ${quantity} al carrito`
            ) : (
              'Producto agotado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;