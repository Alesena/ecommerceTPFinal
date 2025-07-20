import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useCategoriesContext } from '../../context/CategoriesContext';
import { FaTrash, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import './AdminPanel.css';

const AdminPanel = () => {
  const [product, setProduct] = useState({
    sku: '',
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    subcategory: '',
    keywords: [] // Nuevo campo para keywords
  });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [subcategories, setSubcategories] = useState([]);

  const navigate = useNavigate();
  const {
    categories,
    loading: loadingCategories,
    error: categoriesError,
    deleteCategoryPermanently,
    refreshCategories
  } = useCategoriesContext();

  const categorySelectRef = useRef(null);
  const subcategorySelectRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categorySelectRef.current && !categorySelectRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (subcategorySelectRef.current && !subcategorySelectRef.current.contains(event.target)) {
        setShowSubcategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (product.category) {
      const category = categories.find(c => c.name === product.category);
      if (category) {
        const subs = categories.filter(c => c.parentId === category.id);
        setSubcategories(subs);
        setProduct(prev => ({ ...prev, subcategory: '' })); // Resetear subcategoría al cambiar categoría
      }
    } else {
      setSubcategories([]);
      setProduct(prev => ({ ...prev, subcategory: '' }));
    }
  }, [product.category, categories]);

  const generateKeywords = (name) => {
    const nameKeywords = name.toLowerCase().split(' ');
    const commonSuffixes = ['', 's', 'es']; // Para plurales

    const generatedKeywords = new Set();

    // Generar variaciones de cada palabra
    nameKeywords.forEach(word => {
      commonSuffixes.forEach(suffix => {
        generatedKeywords.add(word + suffix);
      });
    });

    // Añadir el nombre completo y versiones sin espacios
    generatedKeywords.add(name.toLowerCase());
    generatedKeywords.add(name.toLowerCase().replace(/\s+/g, ''));

    return Array.from(generatedKeywords);
  };

  const getCategoryPrefix = (categoryName) => {
    if (!categoryName) return 'GEN';
    const category = categories.find(c => c.name === categoryName);
    return category ? category.name.slice(0, 3).toUpperCase() : 'GEN';
  };

  const isSkuUnique = async (sku) => {
    if (!sku) return false;
    const q = query(collection(db, 'products'), where('sku', '==', sku.toUpperCase()));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const generateUniqueSku = async () => {
    const prefix = getCategoryPrefix(product.category);
    let attempts = 0;
    const maxAttempts = 10;
    let sku;

    do {
      sku = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      attempts++;

      if (attempts >= maxAttempts) {
        throw new Error('No se pudo generar un SKU único. Intente nuevamente.');
      }
    } while (!(await isSkuUnique(sku)));

    return sku;
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('https://api.imgbb.com/1/upload?key=87eefd2fbf71bff4113f7217b32dfd3c', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir la imagen');

      const data = await response.json();
      setProduct(prev => ({ ...prev, imageUrl: data.data.url }));
      setMessage({ text: 'Imagen subida correctamente', type: 'success' });
    } catch (error) {
      console.error("Error uploading image:", error);
      setMessage({ text: error.message || 'Error al subir la imagen', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateSku = async () => {
    if (!product.category) {
      setMessage({ text: 'Selecciona una categoría primero', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      const newSku = await generateUniqueSku();
      setProduct(prev => ({ ...prev, sku: newSku }));
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCategory = async (categoryId, isSubcategory = false) => {
    try {
      setUploading(true);
      await deleteCategoryPermanently(categoryId);
      setMessage({
        text: `${isSubcategory ? 'Subcategoría' : 'Categoría'} eliminada exitosamente`,
        type: 'success'
      });

      // Resetear si la categoría/subcategoría eliminada estaba seleccionada
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        if (product.category === category.name) {
          setProduct(prev => ({ ...prev, category: '', subcategory: '', sku: '' }));
        } else if (product.subcategory === category.name) {
          setProduct(prev => ({ ...prev, subcategory: '' }));
        }
      }

      await refreshCategories();
    } catch (error) {
      setMessage({ text: error.message || 'Error al eliminar', type: 'error' });
    } finally {
      setUploading(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!product.imageUrl) {
      setMessage({ text: 'Debes subir una imagen', type: 'error' });
      return;
    }

    if (!product.sku) {
      setMessage({ text: 'El SKU es obligatorio', type: 'error' });
      return;
    }

    if (!product.category) {
      setMessage({ text: 'Debes seleccionar una categoría', type: 'error' });
      return;
    }

    try {
      if (!(await isSkuUnique(product.sku))) {
        throw new Error('El SKU ya existe. Genera uno nuevo.');
      }

      const category = categories.find(c => c.name === product.category);
      const subcategory = product.subcategory
        ? categories.find(c => c.name === product.subcategory)
        : null;

      // Generar keywords automáticamente
      const keywords = generateKeywords(product.name);

      await addDoc(collection(db, 'products'), {
        sku: product.sku.trim().toUpperCase(),
        name: product.name.trim(),
        price: Number(product.price),
        description: product.description.trim(),
        imageUrl: product.imageUrl,
        categoryId: category?.id || '',
        subcategoryId: subcategory?.id || '',
        keywords: keywords, // Añadir las keywords
        createdAt: serverTimestamp()
      });

      // Resetear formulario
      setProduct({
        sku: '',
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        subcategory: '',
        keywords: []
      });

      setMessage({ text: 'Producto creado exitosamente!', type: 'success' });
    } catch (error) {
      setMessage({
        text: error.message || 'Error al crear el producto',
        type: 'error'
      });
    }
  };

  if (loadingCategories) return <div className="loading">Cargando categorías...</div>;
  if (categoriesError) return <div className="error">Error: {categoriesError}</div>;

  return (
    <div className="admin-container">
      <h1>Panel de Administración</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <FaExclamationTriangle className="warning-icon" />
            <h3>¿Eliminar categoría permanentemente?</h3>
            <p>Esta acción no se puede deshacer. ¿Estás seguro?</p>
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCategoryToDelete(null);
                }}
                className="cancel-button"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCategory(categoryToDelete.id, categoryToDelete.isSubcategory)}
                className="delete-button"
                disabled={uploading}
              >
                {uploading ? 'Eliminando...' : 'Eliminar'}
              </button>

            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Campo de Categoría */}
        <div className="form-group">
          <div className="category-header">
            <label>Categoría*</label>
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="add-category-btn"
            >
              <FaPlus /> Administrar Categorías
            </button>
          </div>

          <div className="custom-select" ref={categorySelectRef}>
            <div
              className={`select-header ${!product.category ? 'placeholder' : ''}`}
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              {product.category || 'Seleccionar categoría'}
              <span className="arrow">{showCategoryDropdown ? '▲' : '▼'}</span>
            </div>

            {showCategoryDropdown && (
              <div className="select-options">
                {categories
                  .filter(cat => !cat.parentId) // Solo categorías principales
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="option-item"
                      onClick={async () => {
                        setProduct(prev => ({
                          ...prev,
                          category: cat.name,
                          subcategory: '' // Resetear subcategoría
                        }));
                        try {
                          const newSku = await generateUniqueSku();
                          setProduct(prev => ({ ...prev, sku: newSku }));
                        } catch (error) {
                          setMessage({ text: error.message, type: 'error' });
                        }
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <span>{cat.name}</span>
                      <button
                        type="button"
                        className="delete-category-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete({ id: cat.id, isSubcategory: false });
                          setShowDeleteModal(true);
                        }}
                        title="Eliminar categoría"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        {/* Campo de Subcategoría (solo si hay categoría seleccionada) */}
        {product.category && subcategories.length > 0 && (
          <div className="form-group">
            <label>Subcategoría (Opcional)</label>
            <div className="custom-select" ref={subcategorySelectRef}>
              <div
                className={`select-header ${!product.subcategory ? 'placeholder' : ''}`}
                onClick={() => setShowSubcategoryDropdown(!showSubcategoryDropdown)}
              >
                {product.subcategory || 'Seleccionar subcategoría'}
                <span className="arrow">{showSubcategoryDropdown ? '▲' : '▼'}</span>
              </div>

              {showSubcategoryDropdown && (
                <div className="select-options">
                  <div
                    className="option-item"
                    onClick={() => {
                      setProduct(prev => ({ ...prev, subcategory: '' }));
                      setShowSubcategoryDropdown(false);
                    }}
                  >
                    <span>Ninguna</span>
                  </div>
                  {subcategories.map((subcat) => (
                    <div
                      key={subcat.id}
                      className="option-item"
                      onClick={() => {
                        setProduct(prev => ({ ...prev, subcategory: subcat.name }));
                        setShowSubcategoryDropdown(false);
                      }}
                    >
                      <span>{subcat.name}</span>
                      <button
                        type="button"
                        className="delete-category-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryToDelete({ id: subcat.id, isSubcategory: true });
                          setShowDeleteModal(true);
                        }}
                        title="Eliminar subcategoría"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>SKU*</label>
          <div className="sku-input-group">
            <input
              type="text"
              name="sku"
              value={product.sku}
              onChange={handleInputChange}
              placeholder={`Ej: ${getCategoryPrefix(product.category)}-1001`}
              required
            />
            <button
              type="button"
              onClick={handleGenerateSku}
              className="generate-sku-btn"
              disabled={!product.category || uploading}
            >
              {uploading ? 'Generando...' : 'Generar SKU'}
            </button>
          </div>
          <small className="hint">
            {product.category
              ? `Formato SKU: ${getCategoryPrefix(product.category)}-XXXX`
              : 'Selecciona una categoría primero'}
          </small>
        </div>

        <div className="form-group">
          <label>Nombre del Producto*</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Precio*</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción*</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Imagen del Producto*</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={uploading}
            required
          />
          {uploading && <p>Subiendo imagen...</p>}
          {product.imageUrl && (
            <div className="image-preview">
              <img
                src={product.imageUrl}
                alt="Vista previa"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={uploading}
        >
          {uploading ? 'Guardando...' : 'Guardar Producto'}
        </button>
      </form>
    </div>
  );
};

export default AdminPanel;