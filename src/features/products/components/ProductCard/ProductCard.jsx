import { Link } from 'react-router-dom';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product, onEdit, onDelete, isDeleting }) => {
  const { isAdmin } = useAuth();

  return (
    <article 
      className={`product-card ${isDeleting ? 'deleting' : ''}`} 
      aria-labelledby={`product-${product.id}-title`}
    >
      {isAdmin && (
        <div className="admin-actions">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(product);
            }}
            className="edit-button"
            aria-label={`Editar ${product.name || product.title}`}
            disabled={isDeleting}
          >
            <FiEdit size={16} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(product.id);
            }}
            className="delete-button"
            aria-label={`Eliminar ${product.name || product.title}`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="deleting-spinner"></span> 
            ) : (
              <FiTrash2 size={16} />
            )}
          </button>
        </div>
      )}

      <div className="image-container">
        <img
          src={product.imageUrl || product.image}
          alt={product.name || product.title}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Imagen+no+disponible';
            e.target.alt = 'Imagen no disponible';
          }}
        />
      </div>
      <div className="product-content">
        <h3 id={`product-${product.id}-title`} className="product-name">
          {product.name || product.title}
        </h3>
        <p className="product-price">
          ${product.price?.toLocaleString('es-ES', { minimumFractionDigits: 2 }) || '0.00'}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="product-button"
          aria-label={`Ver detalles de ${product.name || product.title}`}
        >
          Ver Detalles
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;