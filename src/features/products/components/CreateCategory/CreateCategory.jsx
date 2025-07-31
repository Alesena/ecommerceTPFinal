import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { useCategoriesContext } from '../../context/CategoriesContext';
import './CreateCategory.css';

const CreateCategory = () => {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const {
    categories,
    loading: categoriesLoading,
    createCategory
  } = useCategoriesContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: null,
    isSubcategory: false
  });

  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState(null);

  const [successData, setSuccessData] = useState({
    show: false,
    name: '',
    isSubcategory: false
  });

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
      setSubmitLoading(true);
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

      const categoryId = await createCategory(categoryData);

   
      setSuccessData({
        show: true,
        name: formData.name.trim(),
        isSubcategory: formData.isSubcategory
      });

 
      setFormData({
        name: '',
        description: '',
        parentId: null,
        isSubcategory: false
      });

      setNewCategoryId(categoryId);
    } catch (err) {
      setError(`Error al crear categoría: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    successData.show = setShowSuccessModal(false);
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
              disabled={submitLoading || categoriesLoading}
              className="checkbox-input"
            />
            <span className="checkbox-custom"></span>
            ¿Es una subcategoría?
          </label>
        </div>

        {formData.isSubcategory && (
          <div className="form-group">
            <label>Categoría Padre*</label>
            {categoriesLoading ? (
              <div className="loading">Cargando categorías...</div>
            ) : categories.filter(c => !c.parentId).length === 0 ? (
              <p className="no-categories">No hay categorías principales disponibles</p>
            ) : (
              <select
                name="parentId"
                value={formData.parentId || ''}
                onChange={handleChange}
                required
                disabled={submitLoading || categoriesLoading}
                className="select-input"
              >
                <option value="">Selecciona una categoría</option>
                {categories
                  .filter(c => !c.parentId)
                  .map(category => (
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
            disabled={submitLoading}
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
            disabled={submitLoading}
            placeholder="Descripción de la categoría (opcional)"
            className="textarea-input"
          />
        </div>

        <div className="button-group">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="cancel-button"
            disabled={submitLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={submitLoading || categoriesLoading}
          >
            {submitLoading ? 'Creando...' : 'Crear Categoría'}
          </button>
        </div>
      </form>

      {successData.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>✅ {successData.isSubcategory ? 'Subcategoría' : 'Categoría'} creada exitosamente</h2>
            <p>La {successData.isSubcategory ? 'subcategoría' : 'categoría'} "{successData.name}" ha sido registrada correctamente.</p>
            <div className="modal-actions">
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