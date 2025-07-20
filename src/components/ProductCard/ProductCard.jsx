import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="image-container">
        <img 
          src={product.imageUrl || product.image} 
          alt={product.name || product.title} 
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
          }}
        />
      </div>
      <div className="product-content">
        <h3 className="product-name">{product.name || product.title}</h3>
        <p className="product-price">${product.price?.toFixed(2) || '0.00'}</p>
        <Link to={`/product/${product.id}`} className="product-button">
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;