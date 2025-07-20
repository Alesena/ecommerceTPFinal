import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import './CreateCategory.css';

const CreateCategory = () => {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
    isSubcategory: false
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const q = query(
          collection(db, 'categories'),
          where('parentId', '==', null), 
          orderBy('name', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesData);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError('Error al cargar categorías');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);


  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      navigate('/unauthorized');
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleSubcategory = (e) => {
    setFormData(prev => ({
      ...prev,
      isSubcategory: e.target.checked,
      parentId: e.target.checked ? '' : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (formData.isSubcategory && !formData.parentId) {
      setError('Debes seleccionar una categoría padre');
      return;
    }

    try {
      setLoading(true);


      const slug = formData.name.toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: true,
        parentId: formData.isSubcategory ? formData.parentId : null,
        slug,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
        order: 0
      };

      const docRef = await addDoc(collection(db, 'categories'), categoryData);

      setNewCategoryId(docRef.id);
      setShowSuccessModal(true);
      setFormData({
        name: '',
        description: '',
        parentId: null,
        isSubcategory: false
      });
    } catch (err) {
      setError(`Error al crear categoría: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/admin/categories');
  };

  if (authLoading) return <div className="loading">Verificando permisos...</div>;
  if (!currentUser || !isAdmin) return null;

  return (
    <div className="create-category-container">
      <h1>Crear Nueva Categoría</h1>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isSubcategory"
              checked={formData.isSubcategory}
              onChange={handleToggleSubcategory}
              disabled={loading}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            ¿Es una subcategoría?
          </label>
        </div>

        {formData.isSubcategory && (
          <div className="form-group">
            <label>Categoría Padre*</label>
            {loadingCategories ? (
              <div className="loading">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <p className="no-categories">No hay categorías principales disponibles</p>
            ) : (
              <select
                name="parentId"
                value={formData.parentId || ''}
                onChange={handleChange}
                required
                disabled={loading}
                className="select-input"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="form-group">
          <label>Nombre*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Ej: Vestidos, Jeans, Zapatos"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            disabled={loading}
            placeholder="Descripción de la categoría (opcional)"
            className="textarea-input"
          />
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
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Categoría'}
          </button>
        </div>
      </form>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>✅ {formData.isSubcategory ? 'Subcategoría' : 'Categoría'} creada exitosamente</h2>
            <p>La {formData.isSubcategory ? 'subcategoría' : 'categoría'} "{formData.name}" ha sido registrada correctamente.</p>
            <div className="modal-actions">
              <button
                onClick={() => navigate(`/admin/categories/edit/${newCategoryId}`)}
                className="edit-button"
              >
                Editar {formData.isSubcategory ? 'Subcategoría' : 'Categoría'}
              </button>
              <button
                onClick={handleCloseModal}
                className="confirm-button"
              >
                Volver al listado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCategory;