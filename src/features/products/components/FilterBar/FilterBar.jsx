import { useState, useEffect } from 'react';
import { useCategoriesContext } from '../../context/CategoriesContext';
import './FilterBar.css';

export default function FilterBar({ onChange, currentFilters }) {
  const { activeCategories } = useCategoriesContext();
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || 'createdAt-desc');
  const [selectedCategory, setSelectedCategory] = useState(currentFilters.categoryId || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(currentFilters.subcategoryId || '');

   const parentCategories = activeCategories.filter(c => !c.parentId);
  const currentCategory = activeCategories.find(c => c.id === selectedCategory);
  const subcategories = currentCategory 
    ? activeCategories.filter(sc => sc.parentId === currentCategory.id)
    : [];


 
  useEffect(() => {
    setSortBy(currentFilters.sortBy || 'createdAt-desc');
    setSelectedCategory(currentFilters.categoryId || '');
    setSelectedSubcategory(currentFilters.subcategoryId || '');
  }, [currentFilters]);

  useEffect(() => {
    onChange({ 
      sortBy, 
      categoryId: selectedCategory, 
      subcategoryId: selectedSubcategory 
    });
  }, [sortBy, selectedCategory, selectedSubcategory, onChange]);

 return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="sort-by">Ordenar por:</label>
        <select 
          id="sort-by"
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="createdAt-desc">Más recientes</option>
          <option value="price-asc">Precio: menor a mayor</option>
          <option value="price-desc">Precio: mayor a menor</option>
          <option value="name-asc">Nombre (A-Z)</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="category">Categoría:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
          }}
        >
          <option value="">Todas las categorías</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {currentCategory && subcategories.length > 0 && (
        <div className="filter-group">
          <label htmlFor="subcategory">Subcategoría:</label>
          <select
            id="subcategory"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
          >
            <option value="">Todas las subcategorías</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}