import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowLeft, FaCheck } from 'react-icons/fa';
import './Cart.css';

const Cart = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart">
          <h2>Tu carrito está vacío</h2>
          <p>Parece que no has agregado ningún producto todavía</p>
          <Link to="/" className="shop-link">
            <FaArrowLeft /> Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">Tu Carrito ({totalItems} {totalItems === 1 ? 'ítem' : 'ítems'})</h1>
        <button className="clear-button" onClick={clearCart}>
          <FaTrash /> Vaciar carrito
        </button>
      </div>

      <div className="cart-container">
        <table className="cart-table">
          <thead>
            <tr>
              <th className="product-column">Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="cart-item">
                <td className="product-info">
                  <div className="product-image-container">
                    <img src={item.imageUrl} alt={item.name} className="product-image" />
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{item.name}</h3>
                    {item.size && <p className="product-size">Talle: {item.size}</p>}
                    {item.color && <p className="product-color">Color: {item.color}</p>}
                  </div>
                </td>
                <td className="product-price">${item.price.toLocaleString()}</td>
                <td className="quantity-cell">
                  <div className="quantity-control">
                    <button
                      className="quantity-btn minus"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn plus"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="product-subtotal">${(item.price * item.quantity).toLocaleString()}</td>
                <td className="remove-cell">
                  <button
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FaTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="cart-summary">
          <div className="summary-row">
            <span className="summary-label">Subtotal:</span>
            <span className="summary-value">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Envío:</span>
            <span className="summary-value">Gratis</span>
          </div>
          <div className="summary-row total-row">
            <span className="summary-label">Total:</span>
            <span className="summary-value">${totalPrice.toLocaleString()}</span>
          </div>
          
          <Link to="/">
            <button className="checkout-button" onClick={clearCart}>
              <FaCheck /> Proceder al pago
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Cart;