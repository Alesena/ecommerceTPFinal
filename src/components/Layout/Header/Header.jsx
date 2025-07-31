import Navbar from './Navbar';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="top-bar">
        <p>Envíos gratis en compras superiores a $50.000</p>
      </div>
      <Navbar />
    </header>
  );
};

export default Header;