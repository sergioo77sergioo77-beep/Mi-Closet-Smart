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

const OPEN_WEATHER_CITY = "Curico,CL";
const OPEN_WEATHER_UNITS = "metric";
const OPEN_WEATHER_LANG = "es";

const crearUrlImagen = (archivo) => URL.createObjectURL(archivo);

const crearAvatarSvg = (anchoCuerpo) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 520'>
    <rect width='280' height='520' fill='transparent'/>
    <circle cx='140' cy='70' r='34' fill='#f6cfb8'/>
    <rect x='${140 - anchoCuerpo / 2}' y='115' width='${anchoCuerpo}' height='170' rx='48' fill='#b7beca'/>
    <rect x='${140 - anchoCuerpo / 2 - 32}' y='125' width='28' height='140' rx='14' fill='#b7beca'/>
    <rect x='${140 + anchoCuerpo / 2 + 4}' y='125' width='28' height='140' rx='14' fill='#b7beca'/>
    <rect x='${140 - anchoCuerpo / 2 + 12}' y='282' width='34' height='190' rx='16' fill='#98a2b3'/>
    <rect x='${140 + anchoCuerpo / 2 - 46}' y='282' width='34' height='190' rx='16' fill='#98a2b3'/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CONTEXTURAS = [
  {
    id: "delgado",
    nombre: "Delgado",
    detalle: "1.75m / 65kg",
    escala: 0.9,
    avatar: crearAvatarSvg(84)
  },
  {
    id: "normal",
    nombre: "Normal",
    detalle: "1.75m / 75kg",
    escala: 1,
    avatar: crearAvatarSvg(102)
  },
  {
    id: "robusto",
    nombre: "Robusto",
    detalle: "1.75m / 90kg",
    escala: 1.1,
    avatar: crearAvatarSvg(122)
  }
];

function ProbadorAvatar({ seleccionPrendas, contextura, onCambiarContextura }) {
  const configContextura = CONTEXTURAS.find((c) => c.id === contextura) || CONTEXTURAS[1];
  const prendaCompleta = seleccionPrendas.find((p) => p.grupo === "👗 Prendas completas");
  const capaSuperior = seleccionPrendas.filter((p) => ["👕 Parte superior", "🧥 Ropa exterior"].includes(p.grupo));
  const capaInferior = seleccionPrendas.filter((p) => p.grupo === "👖 Parte inferior");

  const estiloCapa = (tipo, index = 0) => {
    const base = {
      position: "absolute",
      left: "50%",
      objectFit: "contain",
      transform: `translateX(-50%) scale(${configContextura.escala})`,
      transformOrigin: "center top",
      pointerEvents: "none"
    };

    if (tipo === "completa") {
      return {
        ...base,
        top: "95px",
        width: "65%",
        zIndex: 4
      };
    }

    if (tipo === "superior") {
      return {
        ...base,
        top: `${112 + index * 6}px`,
        width: "52%",
        zIndex: 5 + index
      };
    }

    return {
      ...base,
      top: `${270 + index * 6}px`,
      width: "47%",
      zIndex: 4
    };
  };

  return (
    <div>
      <div className="clima-row" style={{ marginBottom: 16 }}>
        {CONTEXTURAS.map((opcion) => {
          const activa = opcion.id === contextura;
          return (
            <button
              key={opcion.id}
              className="btn"
              onClick={() => onCambiarContextura(opcion.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: activa ? "2px solid #facc15" : "2px solid transparent",
                background: activa ? "rgba(250, 204, 21, 0.14)" : undefined
              }}
            >
              <img src={opcion.avatar} alt={`Avatar ${opcion.nombre}`} style={{ width: 38, height: 64, objectFit: "contain" }} />
              <span style={{ textAlign: "left" }}>
                <strong>{opcion.nombre}</strong>
                <br />
                <small>{opcion.detalle}</small>
              </span>
            </button>
          );
        })}
      </div>

      <small className="helper-text">Usa imágenes PNG sin fondo para una superposición más realista de las prendas.</small>

      <div
        style={{
          marginTop: 14,
          width: 320,
          maxWidth: "100%",
          height: 560,
          borderRadius: 16,
          border: "1px solid rgba(148,163,184,.35)",
          background: "linear-gradient(180deg, rgba(148,163,184,.12), rgba(148,163,184,.03))",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <img
          src={configContextura.avatar}
          alt={`Avatar base ${configContextura.nombre}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 1 }}
        />

        {prendaCompleta ? (
          <img src={prendaCompleta.imagen} alt={prendaCompleta.nombre} style={estiloCapa("completa")} />
        ) : (
          <>
            {capaSuperior.map((prenda, idx) => (
              <img key={`${prenda.id}-sup`} src={prenda.imagen} alt={prenda.nombre} style={estiloCapa("superior", idx)} />
            ))}
            {capaInferior.map((prenda, idx) => (
              <img key={`${prenda.id}-inf`} src={prenda.imagen} alt={prenda.nombre} style={estiloCapa("inferior", idx)} />
            ))}
          </>
        )}
      </div>
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
  const [resumenClima, setResumenClima] = useState(null);
  const [estadoClimaApi, setEstadoClimaApi] = useState({ loading: false, error: "" });
  const [combinacionManual, setCombinacionManual] = useState({});
  const [lookSugerido, setLookSugerido] = useState(null);
  const [contextura, setContextura] = useState("normal");
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

  const clasificarClimaPorAPI = (temperatura, condicion) => {
    const descripcion = (condicion || "").toLowerCase();
    if (descripcion.includes("rain") || descripcion.includes("drizzle") || descripcion.includes("thunderstorm")) {
      return "lluvia";
    }
    if (temperatura >= 28) return "calor";
    if (temperatura <= 14) return "frio";
    return "templado";
  };

  const consultarClimaActual = async () => {
    const apiKey = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!apiKey) {
      setEstadoClimaApi({
        loading: false,
        error: "Falta configurar REACT_APP_OPENWEATHER_API_KEY en el archivo .env"
      });
      return;
    }

    try {
      setEstadoClimaApi({ loading: true, error: "" });
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${OPEN_WEATHER_CITY}&appid=${apiKey}&units=${OPEN_WEATHER_UNITS}&lang=${OPEN_WEATHER_LANG}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`No se pudo obtener el clima (${response.status})`);
      }

      const data = await response.json();
      const temperatura = Math.round(data.main?.temp);
      const condicionPrincipal = data.weather?.[0]?.main || "";
      const descripcion = data.weather?.[0]?.description || "Sin descripción";
      const climaCalculado = clasificarClimaPorAPI(temperatura, condicionPrincipal);

      setResumenClima({
        ciudad: data.name || "Curicó",
        temperatura,
        descripcion
      });
      setClima(climaCalculado);
      setEstadoClimaApi({ loading: false, error: "" });
    } catch (error) {
      setEstadoClimaApi({
        loading: false,
        error: "No se pudo consultar OpenWeather. Revisa tu API key y conexión."
      });
    }
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
          <p className="helper-text">Consulta el clima de Curicó en OpenWeather o selecciónalo manualmente.</p>

          <div className="weather-api-row">
            <button className="btn btn-yellow" onClick={consultarClimaActual} disabled={estadoClimaApi.loading}>
              {estadoClimaApi.loading ? "Consultando clima..." : "Consultar clima en Curicó"}
            </button>
            {resumenClima && !estadoClimaApi.error && (
              <small>
                {resumenClima.ciudad}: {resumenClima.temperatura}°C · {resumenClima.descripcion}
              </small>
            )}
          </div>
          {estadoClimaApi.error && <p className="error-text">{estadoClimaApi.error}</p>}

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
          <h2>Probador con avatar</h2>
          <p className="helper-text">
            Selecciona una contextura corporal y visualiza tus prendas subidas sobre un avatar base.
          </p>

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
            <small>La app usa el clima actual seleccionado en recomendaciones: {CLIMA_REGLAS[clima].etiqueta}</small>
          </div>

          {lookIA.length > 0 ? (
            <ProbadorAvatar seleccionPrendas={lookIA} contextura={contextura} onCambiarContextura={setContextura} />
          ) : (
            <p className="hint">Carga al menos una prenda y elige una combinación para activar el probador.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
