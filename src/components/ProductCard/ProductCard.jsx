import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.title} 
        className="product-image"
      />
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
        <Link to={`/product/${product.id}`} className="product-button">
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;