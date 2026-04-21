import { useMemo, useState } from 'react';

const CATEGORIES = ['Camiseta', 'Pantalón', 'Vestido', 'Chaqueta', 'Zapatos', 'Accesorio'];
const SEASONS = ['Todo el año', 'Primavera', 'Verano', 'Otoño', 'Invierno'];

const initialGarments = [
  {
    id: 1,
    name: 'Blazer negro clásico',
    category: 'Chaqueta',
    color: 'Negro',
    season: 'Otoño',
    favorite: true
  },
  {
    id: 2,
    name: 'Jeans slim azul',
    category: 'Pantalón',
    color: 'Azul',
    season: 'Todo el año',
    favorite: false
  },
  {
    id: 3,
    name: 'Tenis blancos minimalistas',
    category: 'Zapatos',
    color: 'Blanco',
    season: 'Primavera',
    favorite: true
  }
];

function App() {
  const [garments, setGarments] = useState(initialGarments);
  const [filters, setFilters] = useState({ category: 'Todas', favoriteOnly: false });
  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    color: '',
    season: SEASONS[0]
  });

  const visibleGarments = useMemo(() => {
    return garments.filter((item) => {
      if (filters.category !== 'Todas' && item.category !== filters.category) {
        return false;
      }
      if (filters.favoriteOnly && !item.favorite) {
        return false;
      }
      return true;
    });
  }, [garments, filters]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((category) => ({
      category,
      total: garments.filter((item) => item.category === category).length
    }));
  }, [garments]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addGarment = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.color.trim()) return;

    const newGarment = {
      id: Date.now(),
      ...formData,
      favorite: false
    };

    setGarments((prev) => [newGarment, ...prev]);
    setFormData({
      name: '',
      category: CATEGORIES[0],
      color: '',
      season: SEASONS[0]
    });
  };

  const toggleFavorite = (id) => {
    setGarments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, favorite: !item.favorite } : item))
    );
  };

  const removeGarment = (id) => {
    setGarments((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Mi Closet Smart</h1>
        <p>Organiza tu armario, destaca favoritos y crea mejores looks cada día.</p>
      </header>

      <section className="panel form-panel">
        <h2>Nueva prenda</h2>
        <form onSubmit={addGarment} className="garment-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nombre de la prenda"
          />

          <select name="category" value={formData.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Color"
          />

          <select name="season" value={formData.season} onChange={handleChange}>
            {SEASONS.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>

          <button type="submit">Agregar prenda</button>
        </form>
      </section>

      <section className="panel filters-panel">
        <h2>Filtros</h2>
        <div className="filters-grid">
          <label>
            Categoría
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, category: event.target.value }))
              }
            >
              <option value="Todas">Todas</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={filters.favoriteOnly}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, favoriteOnly: event.target.checked }))
              }
            />
            Solo favoritas
          </label>
        </div>
      </section>

      <section className="panel closet-panel">
        <div className="panel-head">
          <h2>Tu closet ({visibleGarments.length})</h2>
        </div>
        {visibleGarments.length === 0 ? (
          <p className="empty">No hay prendas con los filtros actuales.</p>
        ) : (
          <ul className="garment-list">
            {visibleGarments.map((item) => (
              <li key={item.id} className="garment-item">
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category} • {item.color} • {item.season}
                  </p>
                </div>
                <div className="actions">
                  <button onClick={() => toggleFavorite(item.id)}>
                    {item.favorite ? '★ Favorita' : '☆ Marcar favorita'}
                  </button>
                  <button className="danger" onClick={() => removeGarment(item.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel stats-panel">
        <h2>Resumen por categoría</h2>
        <ul className="stats-list">
          {categoryStats.map((entry) => (
            <li key={entry.category}>
              <span>{entry.category}</span>
              <strong>{entry.total}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
