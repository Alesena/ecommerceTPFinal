import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../config/firebase';
import { useCategoriesContext } from '../../context/CategoriesContext';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const { categories, loading: loadingCategories, error: categoriesError } = useCategoriesContext();

  const [product, setProduct] = useState({
    sku: '',
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    categoryId: '',
    subcategoryId: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);


  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/unauthorized');
    }
  }, [authLoading, isAdmin, navigate]);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();
          setProduct({
            sku: productData.sku || '',
            name: productData.name || '',
            price: productData.price || 0,
            description: productData.description || '',
            imageUrl: productData.imageUrl || '',
            categoryId: productData.categoryId || '',
            subcategoryId: productData.subcategoryId || ''
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

    if (isAdmin) {
      fetchProduct();
    }
  }, [id, isAdmin]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
      ...(name === 'categoryId' && { subcategoryId: '' }) 
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdateSuccess(false);


    if (!product.name || !product.price || !product.categoryId) {
      setError('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await updateDoc(doc(db, 'products', id), {
        ...product,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUser.uid
      });
      setUpdateSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setError(`Error al actualizar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  const parentCategories = categories.filter(c => !c.parentId);


  const subcategories = product.categoryId 
    ? categories.filter(c => c.parentId === product.categoryId)
    : [];


  if (authLoading || loadingCategories) return <div className="loading">Cargando...</div>;
  if (!isAdmin) return null;
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
          <label>Categoría Principal*</label>
          <select
            name="categoryId"
            value={product.categoryId}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Seleccionar categoría</option>
            {parentCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {product.categoryId && (
          <div className="form-group">
            <label>Subcategoría</label>
            <select
              name="subcategoryId"
              value={product.subcategoryId}
              onChange={handleChange}
              disabled={loading || subcategories.length === 0}
            >
              <option value="">Ninguna</option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        )}

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
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="cancel-button"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;