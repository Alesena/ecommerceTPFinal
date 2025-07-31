import './Footer.css';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Mi Tienda</h3>
          <p>La mejor selección de productos online</p>
        </div>
        
        <div className="footer-section">
          <h4>Contacto</h4>
          <p>jandroalesena@gmail.com</p>
        </div>
        
        <div className="footer-copyright">
          <p>Desarrollado por: <b>Alejandro Sena</b> </p>
          <p>© {new Date().getFullYear()} Todos los derechos reservados</p>
            
        </div>
      </div>
    </footer>
  );
}