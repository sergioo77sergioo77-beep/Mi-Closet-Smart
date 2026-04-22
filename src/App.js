import React, { useMemo, useState } from "react";
import "./App.css";

const CATEGORIAS = {
  "👕 Parte superior": [
    "Polera / Camiseta",
    "Camisa",
    "Blusa",
    "Polo",
    "Crop top",
    "Tank top (sin mangas)",
    "Sweater / Suéter",
    "Polerón (hoodie)",
    "Chaqueta",
    "Abrigo",
    "Parka",
    "Blazer"
  ],
  "👖 Parte inferior": [
    "Pantalón",
    "Jeans",
    "Pantalón de vestir",
    "Jogger",
    "Short / Pantalón corto",
    "Falda",
    "Falda larga",
    "Falda corta",
    "Calzas / Leggings"
  ],
  "👗 Prendas completas": ["Vestido", "Enterito / Mono", "Overol", "Conjunto deportivo", "Traje (formal)"],
  "🧥 Ropa exterior": ["Cortaviento", "Gabardina", "Chaqueta de cuero", "Chaqueta de mezclilla (jean)", "Polar"],
  "👟 Calzado": ["Zapatillas", "Zapatos formales", "Botas", "Botines", "Sandalias", "Chalas"],
  "🧢 Accesorios": ["Gorro", "Gorro de lana", "Sombrero", "Bufanda", "Guantes", "Cinturón", "Lentes de sol"]
};

const LOOKS_BASE = [
  {
    nombre: "Look urbano",
    regla: ["👕 Parte superior", "👖 Parte inferior", "👟 Calzado", "🧢 Accesorios"]
  },
  {
    nombre: "Look formal",
    regla: ["👕 Parte superior", "👖 Parte inferior", "🧥 Ropa exterior", "👟 Calzado"]
  },
  {
    nombre: "Look relax",
    regla: ["👗 Prendas completas", "👟 Calzado", "🧢 Accesorios"]
  }
];

const CLIMA_REGLAS = {
  calor: {
    etiqueta: "Caluroso ☀️",
    prioridad: ["Tank top (sin mangas)", "Short / Pantalón corto", "Sandalias", "Lentes de sol"]
  },
  templado: {
    etiqueta: "Templado 🌤️",
    prioridad: ["Polera / Camiseta", "Jeans", "Zapatillas"]
  },
  frio: {
    etiqueta: "Frío ❄️",
    prioridad: ["Sweater / Suéter", "Abrigo", "Botas", "Bufanda"]
  },
  lluvia: {
    etiqueta: "Lluvioso 🌧️",
    prioridad: ["Cortaviento", "Parka", "Botines"]
  }
};

const crearUrlImagen = (archivo) => URL.createObjectURL(archivo);

function App() {
  const [prendas, setPrendas] = useState([]);
  const [pantalla, setPantalla] = useState("galeria");
  const [darkMode, setDarkMode] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState(Object.keys(CATEGORIAS)[0]);
  const [tipo, setTipo] = useState(CATEGORIAS[Object.keys(CATEGORIAS)[0]][0]);
  const [imagen, setImagen] = useState(null);

  const [clima, setClima] = useState("templado");
  const [fotoCompleta, setFotoCompleta] = useState(null);

  const prendasFiltradas = useMemo(() => {
    return prendas.filter((prenda) => {
      const cumpleGrupo = filtroGrupo === "Todas" || prenda.grupo === filtroGrupo;
      const cumpleTipo = filtroTipo === "Todos" || prenda.tipo === filtroTipo;
      return cumpleGrupo && cumpleTipo;
    });
  }, [prendas, filtroGrupo, filtroTipo]);

  const recomendacionesDia = useMemo(() => {
    const prioridad = CLIMA_REGLAS[clima].prioridad;
    const directas = prendas.filter((prenda) => prioridad.includes(prenda.tipo));
    return directas.length > 0 ? directas : prendas.slice(0, 4);
  }, [clima, prendas]);

  const looksParaFoto = useMemo(() => {
    const porGrupo = (grupoLook) => prendas.filter((p) => p.grupo === grupoLook);

    return LOOKS_BASE.map((look) => ({
      ...look,
      prendas: look.regla
        .map((grupoLook) => porGrupo(grupoLook)[0])
        .filter(Boolean)
    })).filter((look) => look.prendas.length >= 2);
  }, [prendas]);

  const agregarPrenda = () => {
    if (!nombre || !imagen) return;

    const nuevaPrenda = {
      id: Date.now(),
      nombre,
      grupo,
      tipo,
      imagen: crearUrlImagen(imagen)
    };

    setPrendas((actual) => [nuevaPrenda, ...actual]);
    setNombre("");
    setImagen(null);
  };

  const cambiarGrupo = (nuevoGrupo) => {
    setGrupo(nuevoGrupo);
    setTipo(CATEGORIAS[nuevoGrupo][0]);
  };

  const grupos = Object.keys(CATEGORIAS);

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="header">
        <div>
          <span className="eyebrow">Asistente de estilo personal</span>
          <h1>Mi Closet Smart 👗</h1>
          <p>Gestiona prendas, recibe recomendaciones diarias y prueba looks de forma visual.</p>
        </div>
        <button className="btn btn-yellow" onClick={() => setDarkMode((prev) => !prev)}>
          Modo {darkMode ? "Claro ☀️" : "Oscuro 🌙"}
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total prendas</span>
          <strong>{prendas.length}</strong>
        </article>
        <article className="stat-card">
          <span>Resultados filtrados</span>
          <strong>{prendasFiltradas.length}</strong>
        </article>
        <article className="stat-card">
          <span>Looks disponibles</span>
          <strong>{looksParaFoto.length}</strong>
        </article>
      </section>

      <nav className="tabs">
        <button onClick={() => setPantalla("galeria")} className={pantalla === "galeria" ? "active" : ""}>
          Galería
        </button>
        <button onClick={() => setPantalla("recomendaciones")} className={pantalla === "recomendaciones" ? "active" : ""}>
          Recomendaciones
        </button>
        <button onClick={() => setPantalla("probador")} className={pantalla === "probador" ? "active" : ""}>
          Probador
        </button>
      </nav>

      {pantalla === "galeria" && (
        <section className="panel">
          <h2>Agregar prenda</h2>
          <div className="form-grid">
            <input type="text" placeholder="Nombre o detalle" value={nombre} onChange={(e) => setNombre(e.target.value)} />

            <select value={grupo} onChange={(e) => cambiarGrupo(e.target.value)}>
              {grupos.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {CATEGORIAS[grupo].map((opcion) => (
                <option key={opcion}>{opcion}</option>
              ))}
            </select>

            <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files?.[0] || null)} />
          </div>

          <button className="btn btn-yellow" onClick={agregarPrenda}>
            Guardar prenda
          </button>

          <div className="filtros">
            <h3>Filtros</h3>
            <select
              value={filtroGrupo}
              onChange={(e) => {
                const nuevo = e.target.value;
                setFiltroGrupo(nuevo);
                setFiltroTipo("Todos");
              }}
            >
              <option>Todas</option>
              {grupos.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option>Todos</option>
              {(filtroGrupo === "Todas" ? grupos.flatMap((g) => CATEGORIAS[g]) : CATEGORIAS[filtroGrupo]).map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="gallery">
            {prendasFiltradas.map((p) => (
              <article key={p.id} className="card">
                <img src={p.imagen} alt={p.nombre} />
                <strong>{p.nombre}</strong>
                <span>{p.grupo}</span>
                <small>{p.tipo}</small>
              </article>
            ))}
            {prendasFiltradas.length === 0 && <p className="empty">Aún no hay prendas en este filtro.</p>}
          </div>
        </section>
      )}

      {pantalla === "recomendaciones" && (
        <section className="panel">
          <h2>¿Qué me pongo hoy?</h2>
          <p className="helper-text">Selecciona el clima y revisa ideas automáticas desde tus prendas.</p>

          <div className="clima-row">
            {Object.entries(CLIMA_REGLAS).map(([key, value]) => (
              <button key={key} className={clima === key ? "btn active" : "btn"} onClick={() => setClima(key)}>
                {value.etiqueta}
              </button>
            ))}
          </div>

          <div className="reco-grid">
            {recomendacionesDia.map((p) => (
              <article key={p.id} className="card compact">
                <img src={p.imagen} alt={p.nombre} />
                <strong>{p.nombre}</strong>
                <small>{p.tipo}</small>
              </article>
            ))}
            {recomendacionesDia.length === 0 && (
              <p className="empty">Sube prendas en tu galería para recibir recomendaciones personalizadas.</p>
            )}
          </div>
        </section>
      )}

      {pantalla === "probador" && (
        <section className="panel">
          <h2>Probador con foto de cuerpo completo</h2>
          <p className="helper-text">Sube una foto y desliza lateralmente para revisar ideas de tenidas.</p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFotoCompleta(e.target.files?.[0] ? crearUrlImagen(e.target.files[0]) : null)}
          />

          {!fotoCompleta && <p className="hint">Tip: para mejores resultados, usa fondo claro y postura de frente.</p>}

          {fotoCompleta && (
            <div className="outfit-carousel">
              {looksParaFoto.map((look) => (
                <article className="outfit-card" key={look.nombre}>
                  <img src={fotoCompleta} alt="Foto cuerpo completo" className="full-photo" />
                  <div className="overlay">
                    <h3>{look.nombre}</h3>
                    <ul>
                      {look.prendas.map((p) => (
                        <li key={p.id}>
                          {p.nombre} · {p.tipo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
              {looksParaFoto.length === 0 && <p className="hint">Necesitas al menos 2 prendas para armar combinaciones.</p>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
