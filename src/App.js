import React, { useEffect, useMemo, useRef, useState } from "react";
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

const cargarImagen = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

function ProbadorIA({ fotoCompleta, seleccionPrendas }) {
  const canvasRef = useRef(null);
  const [estadoIA, setEstadoIA] = useState(
    "IA visual activa: estima hombros, caderas y piernas usando análisis proporcional de cuerpo completo."
  );

  useEffect(() => {
    if (!fotoCompleta || !canvasRef.current) return;

    const dibujar = async () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      const imagenBase = await cargarImagen(fotoCompleta);
      const width = imagenBase.width;
      const height = imagenBase.height;
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(imagenBase, 0, 0, width, height);

      const zonas = {
        hombros: { x: width * 0.5, y: height * 0.22, ancho: width * 0.34 },
        caderas: { x: width * 0.5, y: height * 0.52, ancho: width * 0.3 },
        tobillosY: height * 0.93
      };

      const drawPrenda = async (prenda, tipoCapa) => {
        const garmentImage = await cargarImagen(prenda.imagen);
        const alpha = tipoCapa === "completa" ? 0.76 : 0.82;
        context.globalAlpha = alpha;

        if (tipoCapa === "superior") {
          const ancho = zonas.hombros.ancho * 1.52;
          const alto = (zonas.caderas.y - zonas.hombros.y) * 1.25;
          context.drawImage(garmentImage, zonas.hombros.x - ancho / 2, zonas.hombros.y - alto * 0.2, ancho, alto);
        }

        if (tipoCapa === "inferior") {
          const ancho = zonas.caderas.ancho * 1.58;
          const alto = (zonas.tobillosY - zonas.caderas.y) * 1.03;
          context.drawImage(garmentImage, zonas.caderas.x - ancho / 2, zonas.caderas.y - 8, ancho, alto);
        }

        if (tipoCapa === "completa") {
          const ancho = Math.max(zonas.hombros.ancho, zonas.caderas.ancho) * 1.72;
          const alto = (zonas.tobillosY - zonas.hombros.y) * 1.05;
          context.drawImage(garmentImage, zonas.hombros.x - ancho / 2, zonas.hombros.y - 18, ancho, alto);
        }

        context.globalAlpha = 1;
      };

      const fullBody = seleccionPrendas.find((p) => p.grupo === "👗 Prendas completas");
      if (fullBody) {
        await drawPrenda(fullBody, "completa");
      } else {
        const upper = seleccionPrendas.filter((p) => ["👕 Parte superior", "🧥 Ropa exterior"].includes(p.grupo));
        const lower = seleccionPrendas.filter((p) => p.grupo === "👖 Parte inferior");
        for (const prenda of upper) await drawPrenda(prenda, "superior");
        for (const prenda of lower) await drawPrenda(prenda, "inferior");
      }

      setEstadoIA("IA visual aplicada: prendas posicionadas sobre la foto de cuerpo completo.");
    };

    dibujar().catch(() => {
      setEstadoIA("No se pudo renderizar el probador. Revisa el formato de las imágenes.");
    });
  }, [fotoCompleta, seleccionPrendas]);

  return (
    <div className="ia-result">
      <small>{estadoIA}</small>
      <canvas ref={canvasRef} className="ia-canvas" />
    </div>
  );
}

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
  const [vistaPreviaImagen, setVistaPreviaImagen] = useState(null);

  const [clima, setClima] = useState("templado");
  const [fotoCompleta, setFotoCompleta] = useState(null);
  const [combinacionManual, setCombinacionManual] = useState({});
  const [lookSugerido, setLookSugerido] = useState(null);
  const grupos = Object.keys(CATEGORIAS);

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

  const prendasPorGrupo = useMemo(() => {
    return grupos.reduce((acc, grupoActual) => {
      acc[grupoActual] = prendas.filter((p) => p.grupo === grupoActual);
      return acc;
    }, {});
  }, [prendas, grupos]);

  const combinacionElegida = useMemo(() => {
    return Object.entries(combinacionManual)
      .map(([grupoActual, id]) => prendasPorGrupo[grupoActual]?.find((p) => p.id === Number(id)))
      .filter(Boolean);
  }, [combinacionManual, prendasPorGrupo]);

  const lookIA = useMemo(() => {
    if (combinacionElegida.length > 0) return combinacionElegida;
    if (lookSugerido?.length > 0) return lookSugerido;
    return looksParaFoto[0]?.prendas || [];
  }, [combinacionElegida, lookSugerido, looksParaFoto]);

  const sugerirLookParaHoy = () => {
    const prioridad = CLIMA_REGLAS[clima].prioridad;
    const seleccion = [];

    Object.keys(CATEGORIAS).forEach((grupoActual) => {
      const opciones = prendasPorGrupo[grupoActual] || [];
      if (opciones.length === 0) return;
      const recomendada = opciones.find((p) => prioridad.includes(p.tipo));
      seleccion.push(recomendada || opciones[0]);
    });

    setLookSugerido(seleccion);
  };

  const agregarPrenda = () => {
    if (!nombre || !imagen) return;

    const urlImagen = crearUrlImagen(imagen);
    const nuevaPrenda = {
      id: Date.now(),
      nombre,
      grupo,
      tipo,
      imagen: urlImagen
    };

    setPrendas((actual) => [nuevaPrenda, ...actual]);
    setNombre("");
    setImagen(null);
    setVistaPreviaImagen(null);
  };

  const cambiarGrupo = (nuevoGrupo) => {
    setGrupo(nuevoGrupo);
    setTipo(CATEGORIAS[nuevoGrupo][0]);
  };

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

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const archivo = e.target.files?.[0] || null;
                setImagen(archivo);
                setVistaPreviaImagen(archivo ? crearUrlImagen(archivo) : null);
              }}
            />
          </div>

          {vistaPreviaImagen && (
            <div className="preview-container">
              <p className="helper-text">Vista previa de la prenda:</p>
              <img className="preview-image" src={vistaPreviaImagen} alt="Vista previa de la prenda seleccionada" />
            </div>
          )}

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
          <h2>Probador con IA + foto de cuerpo completo</h2>
          <p className="helper-text">
            La IA detecta postura y adapta la posición/tamaño de las prendas para mostrar cómo se ven directamente sobre la foto.
          </p>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFotoCompleta(e.target.files?.[0] ? crearUrlImagen(e.target.files[0]) : null)}
          />

          {!fotoCompleta && <p className="hint">Tip: para mejores resultados, usa fondo claro y postura de frente.</p>}

          <div className="manual-composer">
            <h3>Arma tu combinación ideal</h3>
            <div className="form-grid">
              {grupos.map((grupoActual) => {
                const opciones = prendasPorGrupo[grupoActual] || [];
                return (
                  <select
                    key={grupoActual}
                    value={combinacionManual[grupoActual] || ""}
                    onChange={(e) =>
                      setCombinacionManual((prev) => ({
                        ...prev,
                        [grupoActual]: e.target.value
                      }))
                    }
                  >
                    <option value="">Sin elegir · {grupoActual}</option>
                    {opciones.map((prenda) => (
                      <option key={prenda.id} value={prenda.id}>
                        {prenda.nombre} · {prenda.tipo}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>
          </div>

          <div className="sugerencia-row">
            <button className="btn btn-yellow" onClick={sugerirLookParaHoy}>
              Sugerir qué ponerme hoy
            </button>
            <small>La app usa el clima actual seleccionado en la pestaña de recomendaciones: {CLIMA_REGLAS[clima].etiqueta}</small>
          </div>

          {fotoCompleta && lookIA.length > 0 && <ProbadorIA fotoCompleta={fotoCompleta} seleccionPrendas={lookIA} />}

          {fotoCompleta && lookIA.length === 0 && <p className="hint">Carga al menos una prenda para activar el probador IA.</p>}
        </section>
      )}
    </div>
  );
}

export default App;
