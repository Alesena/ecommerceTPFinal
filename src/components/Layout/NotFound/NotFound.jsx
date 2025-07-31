import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-illustration">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="var(--color-primary)" d="M40,-74.3C52.3,-69.2,63,-59.1,69.8,-46.3C76.6,-33.5,79.5,-18,79.5,-1.8C79.5,14.4,76.6,28.8,68.8,41.7C61,54.6,48.4,66,34.2,72.5C20,79,4.2,80.6,-10.8,76.5C-25.8,72.4,-39.9,62.6,-51.7,50.7C-63.5,38.8,-73,24.8,-76.7,9.1C-80.4,-6.6,-78.3,-24,-69.7,-38.1C-61.1,-52.2,-46,-63.1,-31.9,-67.6C-17.8,-72.1,-4.7,-70.3,8.7,-66.6C22.1,-63,44.2,-57.6,40,-74.3Z" transform="translate(100 100)" />
          </svg>
          <h1 className="not-found-title">404</h1>
        </div>
        <h2 className="not-found-subtitle">¡Ups! Página no encontrada</h2>
        <p className="not-found-text">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link to="/" className="not-found-button">
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;