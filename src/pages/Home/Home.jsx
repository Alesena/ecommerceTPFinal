import { useEffect, useState } from 'react';
import { 
  collection, 
  getDocs, 
  limit, 
  query, 
  startAfter, 
  orderBy, 
  deleteDoc, 
  doc,
  where
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { useCategoriesContext } from '../../context/CategoriesContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import { FaEdit, FaTrash, FaHome } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { isAdmin } = useAuth();
  const { searchTerm, categoryId, subcategoryId } = useParams();
  const { categories } = useCategoriesContext();

  const pageSize = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let productsQuery;
        const productsRef = collection(db, 'products');

        if (searchTerm) {
          
          productsQuery = query(
            productsRef,
            where('keywords', 'array-contains', searchTerm.toLowerCase()),
            orderBy('createdAt', 'desc')
          );
          setHasMore(false);
        } else if (subcategoryId) {
          
          productsQuery = query(
            productsRef,
            where('subcategoryId', '==', subcategoryId),
            orderBy('createdAt', 'desc')
          );
          setHasMore(false);
        } else if (categoryId) {
          
          productsQuery = query(
            productsRef,
            where('categoryId', '==', categoryId),
            orderBy('createdAt', 'desc')
          );
          setHasMore(false);
        } else if (lastVisible) {
       
          productsQuery = query(
            productsRef,
            orderBy('createdAt', 'desc'),
            startAfter(lastVisible),
            limit(pageSize)
          );
        } else {
          
          productsQuery = query(
            productsRef,
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
        }

        const querySnapshot = await getDocs(productsQuery);

        if (querySnapshot.empty) {
          setHasMore(false);
          return;
        }

        const newProducts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (lastVisible && !searchTerm && !categoryId && !subcategoryId) {
          setProducts(prev => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        if (!searchTerm && !categoryId && !subcategoryId) {
          setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [lastVisible, searchTerm, categoryId, subcategoryId]);

 
  const generateBreadcrumbs = () => {
    const crumbs = [{ name: 'Inicio', path: '/' }];
    
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        crumbs.push({
          name: category.name,
          path: `/category/${category.id}`
        });
        
        if (subcategoryId) {
          const subcategory = categories.find(c => c.id === subcategoryId);
          if (subcategory) {
            crumbs.push({
              name: subcategory.name,
              path: `/category/${category.id}/subcategory/${subcategory.id}`
            });
          }
        }
      }
    }
    
    return crumbs;
  };

  const breadcrumbs = generateBreadcrumbs();


  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        setProducts(products.filter(product => product.id !== productId));
      } catch (error) {
        console.error("Error eliminando producto:", error);
        setError('Error al eliminar el producto');
      }
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const loadMoreProducts = () => {
    if (hasMore && !loading) {
      setLoading(true);
    }
  };

  const getCurrentTitle = () => {
    if (searchTerm) return `Resultados para: "${decodeURIComponent(searchTerm)}"`;
    if (subcategoryId) {
      const subcategory = categories.find(c => c.id === subcategoryId);
      return subcategory?.name || 'Subcategoría';
    }
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      return category?.name || 'Categoría';
    }
    return 'Productos Destacados';
  };

  if (loading && products.length === 0) {
    return <div className="loading-message">Cargando productos...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && <span className="separator"> / </span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="current-crumb">{crumb.name}</span>
            ) : (
              <Link to={crumb.path} className="crumb-link">
                {index === 0 ? <FaHome /> : crumb.name}
              </Link>
            )}
          </span>
        ))}
      </div>

      {/* Listado de subcategorías si estamos en una categoría */}
      {categoryId && !subcategoryId && (
        <div className="subcategories-section">
          <h2>Subcategorías</h2>
          <div className="subcategories-grid">
            {categories
              .filter(cat => cat.parentId === categoryId)
              .map(subcategory => (
                <Link
                  key={subcategory.id}
                  to={`/category/${categoryId}/subcategory/${subcategory.id}`}
                  className="subcategory-card"
                >
                  {subcategory.imageUrl && (
                    <img src={subcategory.imageUrl} alt={subcategory.name} />
                  )}
                  <h3>{subcategory.name}</h3>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Título de la sección */}
      <h1 className="page-title">{getCurrentTitle()}</h1>

      {/* Listado de productos */}
      {products.length === 0 && !loading ? (
        <div className="no-products">
          No hay productos disponibles en esta categoría
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-wrapper">
                <ProductCard product={product} />
                {isAdmin && (
                  <div className="admin-actions">
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="edit-button"
                      aria-label="Editar producto"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="delete-button"
                      aria-label="Eliminar producto"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación solo para la página principal */}
          {!searchTerm && !categoryId && !subcategoryId && (
            <>
              {loading && products.length > 0 && (
                <div className="loading-more">Cargando más productos...</div>
              )}

              {hasMore && !loading && (
                <div className="load-more-container">
                  <button
                    onClick={loadMoreProducts}
                    className="load-more-button"
                    disabled={loading}
                  >
                    Ver más
                  </button>
                </div>
              )}

              {!hasMore && products.length > 0 && (
                <div className="no-more-products">No hay más productos para mostrar</div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;