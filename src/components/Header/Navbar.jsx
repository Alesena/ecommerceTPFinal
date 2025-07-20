import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase';
import { FaUserCircle, FaChevronDown, FaSignOutAlt, FaShoppingCart, FaSearch } from 'react-icons/fa';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Header.css';

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);


 useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = async (searchText) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('keywords', 'array-contains', searchText.toLowerCase())
      );

      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error buscando productos:", error);
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setShowResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      handleSearch(value);
    } else {
      setSearchResults([]);
    }
  };

  const navigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
    setSearchTerm('');
    setShowResults(false);
  };

  const navigateToAllResults = () => {
    navigate(`/search/${encodeURIComponent(searchTerm)}`);
    setSearchTerm('');
    setShowResults(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="nav-container">
      <div className="nav-brand">
        <Link to="/" className="logo">Mi Ecommerce</Link>
      </div>



       <div className="nav-links">
        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setShowResults(true)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              <FaSearch />
            </button>
          </form>
          
          {showResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 5).map(product => (
                    <div 
                      key={product.id} 
                      className="search-result-item"
                      onClick={() => navigateToProduct(product.id)}
                    >
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="search-result-image"
                      />
                      <div className="search-result-info">
                        <p className="search-result-name">{product.name}</p>
                        <p className="search-result-price">${product.price}</p>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div 
                      className="view-all-results"
                      onClick={navigateToAllResults}
                    >
                      Ver todos los resultados ({searchResults.length})
                    </div>
                  )}
                </>
              ) : searchTerm && (
                <div className="no-results">
                  No se encontraron productos
                </div>
              )}
            </div>
          )}
        </div>

        {currentUser ? (
          <>
            <Link to="/cart" className="nav-link cart-link">
              <FaShoppingCart /> Carrito
            </Link>

            <div className="user-menu-container" ref={dropdownRef}>
              <button 
                className="user-menu-button"
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
                aria-label="Menú de usuario"
              >
                <FaUserCircle className="user-icon" />
                <span className="user-name">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
                <FaChevronDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  {currentUser?.email === 'admin@admin.com' && (
                    <Link 
                      to="/admin" 
                      className="dropdown-link"
                      onClick={() => {
                        setDropdownOpen(false);
                        window.scrollTo(0, 0);
                      }}
                    >
                      Panel de Admin
                    </Link>
                  )}
                  <Link 
                    to="/perfil" 
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link 
                    to="/mis-pedidos" 
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mis Pedidos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="dropdown-link logout-link"
                  >
                    <FaSignOutAlt /> Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Iniciar sesión</Link>
            <Link to="/register" className="nav-link register-link">Registrarse</Link>
            <Link to="/cart" className="nav-link cart-link">
              <FaShoppingCart /> Carrito
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;