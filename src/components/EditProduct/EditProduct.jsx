import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useCategoriesContext } from '../../context/CategoriesContext';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { categories, loading: loadingCategories, error: categoriesError } = useCategoriesContext();


  const [product, setProduct] = useState({
    sku: '',
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: ''
  });
  

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({
            sku: docSnap.data().sku || '',
            name: docSnap.data().name || '',
            price: docSnap.data().price || 0,
            description: docSnap.data().description || '',
            imageUrl: docSnap.data().imageUrl || '',
            category: docSnap.data().category || ''
          });
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        setError(`Error al cargar el producto: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loadingCategories) {
    return <div className="loading">Cargando categorías...</div>;
  }

  if (categoriesError) {
    return <div className="error">Error: {categoriesError}</div>;
  }

  if (!loadingCategories && categories.length === 0) {
    return (
      <div className="no-categories-message">
        <h2>No hay categorías disponibles</h2>
        <p>Para editar productos, primero debe crear categorías.</p>
        <button 
          onClick={() => navigate('/admin/categories')}
          className="primary-button"
        >
          Crear Categorías
        </button>
      </div>
    );
  }


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess(false);

    // Validación básica
    if (!product.name || !product.price || !product.category) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'products', id), {
        ...product,
        lastUpdated: new Date()
      });
      setUpdateSuccess(true);
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      setError(`Error al actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  if (loadingCategories) return <div className="loading">Cargando categorías...</div>;
  if (categoriesError) return <div className="error">Error: {categoriesError}</div>;
  if (loading) return <div className="loading">Cargando producto...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-product-container">
      <h1>Editar Producto</h1>
      
      {updateSuccess && (
        <div className="success-message">
          ¡Producto actualizado correctamente! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-product-form">
 
        <div className="form-group">
          <label>SKU</label>
          <input
            type="text"
            name="sku"
            value={product.sku}
            readOnly
            className="readonly-input"
          />
        </div>


        <div className="form-group">
          <label>Categoría*</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            required
            disabled={loadingCategories}
          >
            <option value="">Seleccionar categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>


        <div className="form-group">
          <label>Nombre*</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>


        <div className="form-group">
          <label>Precio*</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            disabled={loading}
          />
        </div>


        <div className="form-group">
          <label>Descripción*</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>


        <div className="image-preview-container">
          {product.imageUrl && (
            <img 
              src={product.imageUrl} 
              alt="Vista previa del producto" 
              className="current-image"
              onError={(e) => {
                e.target.src = '/placeholder-product.jpg';
              }}
            />
          )}
          <small className="image-note">
            Nota: Para cambiar la imagen, crea un nuevo producto.
          </small>
        </div>


        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="cancel-button"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading || loadingCategories}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;