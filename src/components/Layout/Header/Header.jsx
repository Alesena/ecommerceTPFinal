import TopBar from './TopBar';
import Navbar from './Navbar';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <TopBar />
      <Navbar />
    </header>
  );
};

export default Header;