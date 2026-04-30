import React, { useMemo, useRef, useState } from "react";
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
const REMOVEBG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

const crearUrlImagen = (archivo) => URL.createObjectURL(archivo);

const crearAvatarSvg = (anchoCuerpo, opciones = {}) => {
  const {
    tonoPielClaro = "#ffd9c4",
    tonoPielOscuro = "#dca786",
    colorCabello = "#2f3748",
    colorRemeraClaro = "#d5dbe7",
    colorRemeraOscuro = "#aab4c5",
    colorPantalonClaro = "#95a3ba",
    colorPantalonOscuro = "#707f98",
    colorLabios = "#b66b60",
    colorZapatos = "#475569"
  } = opciones;
  const centroX = 140;
  const mitadCuerpo = anchoCuerpo / 2;
  const anchoCaderas = anchoCuerpo * 0.96;
  const mitadCaderas = anchoCaderas / 2;
  const anchoHombros = anchoCuerpo * 1.16;
  const mitadHombros = anchoHombros / 2;
  const anchoBrazo = Math.max(20, anchoCuerpo * 0.2);
  const separacionBrazo = Math.max(10, anchoCuerpo * 0.08);
  const anchoPierna = Math.max(28, anchoCuerpo * 0.31);
  const separacionPiernas = Math.max(10, anchoCuerpo * 0.12);

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 520'>
    <defs>
      <linearGradient id='piel' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${tonoPielClaro}'/>
        <stop offset='100%' stop-color='${tonoPielOscuro}'/>
      </linearGradient>
      <radialGradient id='pielLuz' cx='35%' cy='30%' r='65%'>
        <stop offset='0%' stop-color='#fff4ec' stop-opacity='0.9'/>
        <stop offset='100%' stop-color='${tonoPielClaro}' stop-opacity='0'/>
      </radialGradient>
      <linearGradient id='camiseta' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${colorRemeraClaro}'/>
        <stop offset='100%' stop-color='${colorRemeraOscuro}'/>
      </linearGradient>
      <linearGradient id='pantalon' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='${colorPantalonClaro}'/>
        <stop offset='100%' stop-color='${colorPantalonOscuro}'/>
      </linearGradient>
      <linearGradient id='sombraCabeza' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='#000' stop-opacity='0.05'/>
        <stop offset='100%' stop-color='#000' stop-opacity='0.22'/>
      </linearGradient>
      <linearGradient id='sombraCuerpo' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0%' stop-color='#fff' stop-opacity='0.2'/>
        <stop offset='100%' stop-color='#000' stop-opacity='0.2'/>
      </linearGradient>
    </defs>

    <rect width='280' height='520' fill='transparent'/>

    <ellipse cx='140' cy='261' rx='92' ry='210' fill='#0f172a' opacity='0.05'/>
    <path d='M104 51 C108 22, 122 11, 141 11 C160 11, 172 20, 178 47 C179 70, 166 88, 140 88 C114 88, 101 70, 104 51 Z' fill='${colorCabello}'/>
    <ellipse cx='106' cy='76' rx='7' ry='9' fill='url(#piel)'/>
    <ellipse cx='174' cy='76' rx='7' ry='9' fill='url(#piel)'/>
    <ellipse cx='140' cy='74' rx='32' ry='35' fill='url(#piel)'/>
    <ellipse cx='140' cy='74' rx='31' ry='34' fill='url(#pielLuz)'/>
    <ellipse cx='140' cy='75' rx='32' ry='35' fill='url(#sombraCabeza)'/>
    <path d='M136 77 Q140 72 144 77' stroke='#9a6a55' stroke-width='1.8' fill='none' stroke-linecap='round'/>
    <circle cx='128' cy='71' r='2.2' fill='#2c2c32'/>
    <circle cx='152' cy='71' r='2.2' fill='#2c2c32'/>
    <circle cx='127.3' cy='70.3' r='0.8' fill='#f8fafc' opacity='0.8'/>
    <circle cx='151.3' cy='70.3' r='0.8' fill='#f8fafc' opacity='0.8'/>
    <path d='M128 87 Q140 96 152 87' stroke='${colorLabios}' stroke-width='2.8' fill='none' stroke-linecap='round'/>
    <path d='M123 64 Q128 60 133 64' stroke='#7a4a41' stroke-width='2' fill='none' stroke-linecap='round'/>
    <path d='M147 64 Q152 60 157 64' stroke='#7a4a41' stroke-width='2' fill='none' stroke-linecap='round'/>
    <ellipse cx='140' cy='86' rx='4.2' ry='2.2' fill='#e2ab92' opacity='0.55'/>
    <rect x='133' y='103' width='14' height='24' rx='7' fill='url(#piel)'/>
    <rect x='133' y='103' width='14' height='24' rx='7' fill='url(#sombraCabeza)' opacity='0.22'/>

    <path d='M${centroX - mitadHombros} 135
      C${centroX - mitadCuerpo} 113, ${centroX + mitadCuerpo} 113, ${centroX + mitadHombros} 135
      L${centroX + mitadCaderas} 284
      C${centroX + mitadCaderas - 8} 305, ${centroX - mitadCaderas + 8} 305, ${centroX - mitadCaderas} 284 Z'
      fill='url(#camiseta)'/>
    <path d='M${centroX - mitadHombros} 135
      C${centroX - mitadCuerpo} 113, ${centroX + mitadCuerpo} 113, ${centroX + mitadHombros} 135
      L${centroX + mitadCaderas} 284
      C${centroX + mitadCaderas - 8} 305, ${centroX - mitadCaderas + 8} 305, ${centroX - mitadCaderas} 284 Z'
      fill='url(#sombraCuerpo)'/>
    <path d='M${centroX - mitadCuerpo} 123 Q${centroX} 143 ${centroX + mitadCuerpo} 123' stroke='#ffffff' stroke-opacity='0.28' stroke-width='4' fill='none'/>

    <rect x='${centroX - mitadHombros - separacionBrazo - anchoBrazo}' y='146' width='${anchoBrazo}' height='132' rx='${anchoBrazo / 2}' fill='url(#camiseta)'/>
    <rect x='${centroX + mitadHombros + separacionBrazo}' y='146' width='${anchoBrazo}' height='132' rx='${anchoBrazo / 2}' fill='url(#camiseta)'/>
    <rect x='${centroX - mitadHombros - separacionBrazo - anchoBrazo + 2}' y='255' width='${anchoBrazo - 4}' height='48' rx='${(anchoBrazo - 4) / 2}' fill='url(#piel)'/>
    <rect x='${centroX + mitadHombros + separacionBrazo + 2}' y='255' width='${anchoBrazo - 4}' height='48' rx='${(anchoBrazo - 4) / 2}' fill='url(#piel)'/>

    <path d='M${centroX - mitadCaderas} 286 Q${centroX} 306 ${centroX + mitadCaderas} 286 L${centroX + mitadCaderas} 312 Q${centroX} 330 ${centroX - mitadCaderas} 312 Z' fill='url(#pantalon)'/>
    <rect x='${centroX - separacionPiernas / 2 - anchoPierna}' y='306' width='${anchoPierna}' height='168' rx='16' fill='url(#pantalon)'/>
    <rect x='${centroX + separacionPiernas / 2}' y='306' width='${anchoPierna}' height='168' rx='16' fill='url(#pantalon)'/>
    <ellipse cx='${centroX - separacionPiernas / 2 - anchoPierna / 2}' cy='478' rx='${anchoPierna * 0.6}' ry='12' fill='${colorZapatos}'/>
    <ellipse cx='${centroX + separacionPiernas / 2 + anchoPierna / 2}' cy='478' rx='${anchoPierna * 0.6}' ry='12' fill='${colorZapatos}'/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const CONTEXTURAS = [
  {
    id: "delgado",
    nombre: "Persona delgada",
    detalle: "Contextura delgada",
    escala: 0.9,
    avatar: crearAvatarSvg(84, {
      tonoPielClaro: "#ffd9c2",
      tonoPielOscuro: "#c89273",
      colorCabello: "#2b1e19",
      colorRemeraClaro: "#d9e2ef",
      colorRemeraOscuro: "#a7b5c7",
      colorPantalonClaro: "#8fa2bf",
      colorPantalonOscuro: "#617496",
      colorLabios: "#b46b63",
      colorZapatos: "#334155"
    })
  },
  {
    id: "normal",
    nombre: "Persona normal",
    detalle: "Contextura normal",
    escala: 1,
    avatar: crearAvatarSvg(102, {
      tonoPielClaro: "#f4c8a6",
      tonoPielOscuro: "#be8a67",
      colorCabello: "#1f2937",
      colorRemeraClaro: "#cfd9e8",
      colorRemeraOscuro: "#9daac0",
      colorPantalonClaro: "#8f9eb3",
      colorPantalonOscuro: "#637185",
      colorLabios: "#ab6054",
      colorZapatos: "#475569"
    })
  },
  {
    id: "robusto",
    nombre: "Persona robusto",
    detalle: "Contextura robusto",
    escala: 1.1,
    avatar: crearAvatarSvg(122, {
      tonoPielClaro: "#d9af8f",
      tonoPielOscuro: "#a26f52",
      colorCabello: "#14191f",
      colorRemeraClaro: "#d7deeb",
      colorRemeraOscuro: "#a2adbe",
      colorPantalonClaro: "#8799b2",
      colorPantalonOscuro: "#586882",
      colorLabios: "#91564d",
      colorZapatos: "#1e293b"
    })
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
  const [pantalla, setPantalla] = useState("home");
  const [darkMode, setDarkMode] = useState(false);
  const [filtroGrupo, setFiltroGrupo] = useState("Todas");
  const [filtroTipo, setFiltroTipo] = useState("Todos");

  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState(Object.keys(CATEGORIAS)[0]);
  const [tipo, setTipo] = useState(CATEGORIAS[Object.keys(CATEGORIAS)[0]][0]);
  const [imagen, setImagen] = useState(null);
  const [vistaPreviaImagen, setVistaPreviaImagen] = useState(null);
  const [estadoRemoveBg, setEstadoRemoveBg] = useState({ loading: false, error: "" });
  const inputCamaraRef = useRef(null);
  const inputArchivoRef = useRef(null);

  const [clima, setClima] = useState("templado");
  const [resumenClima, setResumenClima] = useState(null);
  const [estadoClimaApi, setEstadoClimaApi] = useState({ loading: false, error: "" });
  const [combinacionManual, setCombinacionManual] = useState({});
  const [lookSugerido, setLookSugerido] = useState(null);
  const [contextura, setContextura] = useState("normal");
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
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
    } catch {
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

  const procesarImagenConRemoveBg = async (archivoOriginal) => {
    const apiKey = process.env.REACT_APP_REMOVEBG_API_KEY;
    if (!apiKey) {
      setEstadoRemoveBg({
        loading: false,
        error: "Falta configurar REACT_APP_REMOVEBG_API_KEY en el archivo .env"
      });
      setImagen(null);
      setVistaPreviaImagen(null);
      return;
    }

    try {
      setEstadoRemoveBg({ loading: true, error: "" });
      const formData = new FormData();
      formData.append("image_file", archivoOriginal);
      formData.append("size", "auto");

      const response = await fetch(REMOVEBG_ENDPOINT, {
        method: "POST",
        headers: {
          "X-Api-Key": apiKey
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`remove.bg respondió con estado ${response.status}`);
      }

      const imagenSinFondoBlob = await response.blob();
      if (!imagenSinFondoBlob || imagenSinFondoBlob.size === 0) {
        throw new Error("remove.bg devolvió una imagen vacía");
      }

      const nombreBase = (archivoOriginal.name || "prenda").replace(/\.[^/.]+$/, "");
      const imagenProcesada = new File([imagenSinFondoBlob], `${nombreBase}-sin-fondo.png`, { type: "image/png" });
      setImagen(imagenProcesada);
      setVistaPreviaImagen(URL.createObjectURL(imagenSinFondoBlob));
      setEstadoRemoveBg({ loading: false, error: "" });
    } catch {
      setEstadoRemoveBg({
        loading: false,
        error: "No se pudo procesar la imagen en remove.bg. Intenta nuevamente."
      });
      setImagen(null);
      setVistaPreviaImagen(null);
    }
  };

  const manejarSeleccionImagen = async (event) => {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    await procesarImagenConRemoveBg(archivo);
  };

  const cambiarGrupo = (nuevoGrupo) => {
    setGrupo(nuevoGrupo);
    setTipo(CATEGORIAS[nuevoGrupo][0]);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header className="header">
        <div className="brand-block">
          <span className="eyebrow">MI CLOSET SMART</span>
          <h1>Tu ropa, tu estilo, tu mejor versión</h1>
          <p>Organiza · Recomienda · Transforma</p>
        </div>
        <button className="btn btn-yellow" onClick={() => setDarkMode((prev) => !prev)}>
          {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
        </button>
      </header>

      {pantalla === "home" && (
        <section className="panel">
          <h2>Inicio</h2>
          <p className="helper-text">Resumen rápido de tu clóset inteligente.</p>
          <section className="stats-grid">
            <article className="stat-card">
              <span>Total prendas</span>
              <i>👕</i>
              <strong>{prendas.length}</strong>
            </article>
            <article className="stat-card">
              <span>Resultados filtrados</span>
              <i>🔎</i>
              <strong>{prendasFiltradas.length}</strong>
            </article>
            <article className="stat-card">
              <span>Looks disponibles</span>
              <i>⭐</i>
              <strong>{looksParaFoto.length}</strong>
            </article>
          </section>
        </section>
      )}

      {pantalla === "galeria" && (
        <section className="panel">
          <h2>Tu Closet Digital</h2>
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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn" type="button" onClick={() => inputCamaraRef.current?.click()}>
                Tomar foto
              </button>
              <button className="btn" type="button" onClick={() => inputArchivoRef.current?.click()}>
                Subir archivo
              </button>
            </div>

            <input
              ref={inputCamaraRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={manejarSeleccionImagen}
            />
            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={manejarSeleccionImagen}
            />
          </div>
          <small className="helper-text">Configura tu key en <code>.env</code>: <strong>REACT_APP_REMOVEBG_API_KEY=tu_api_key</strong></small>
          {estadoRemoveBg.loading && <p className="helper-text">Procesando imagen y quitando fondo...</p>}
          {estadoRemoveBg.error && <p className="error-text">{estadoRemoveBg.error}</p>}

          {vistaPreviaImagen && (
            <div className="preview-container">
              <p className="helper-text">Vista previa (sin fondo):</p>
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
                <img src={p.imagen} alt={p.nombre} onClick={() => setImagenAmpliada(p.imagen)} />
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
                <img src={p.imagen} alt={p.nombre} onClick={() => setImagenAmpliada(p.imagen)} />
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
          <h2>Probador con modelos humanos reales</h2>
          <p className="helper-text">
            Elige entre avatar de persona delgada, normal o robusta y visualiza tus prendas sobre una base humana realista.
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
              Generar combinación
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


      {imagenAmpliada && (
        <div className="imagen-modal-overlay" onClick={() => setImagenAmpliada(null)}>
          <button className="imagen-modal-cerrar" onClick={() => setImagenAmpliada(null)}>
            ✕
          </button>
          <img
            className="imagen-modal-contenido"
            src={imagenAmpliada}
            alt="Imagen ampliada de la prenda"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <nav className="bottom-nav" aria-label="Navegación principal">
        <button onClick={() => setPantalla("home")} className={pantalla === "home" ? "active" : ""}>
          <span>🏠</span>
          Hogar
        </button>
        <button onClick={() => setPantalla("galeria")} className={pantalla === "galeria" ? "active" : ""}>
          <span>🧺</span>
          Closet
        </button>
        <button onClick={() => setPantalla("recomendaciones")} className={pantalla === "recomendaciones" ? "active" : ""}>
          <span>⭐</span>
          Recomendaciones
        </button>
        <button onClick={() => setPantalla("probador")} className={pantalla === "probador" ? "active" : ""}>
          <span>🪞</span>
          Probador
        </button>
      </nav>
    </div>
  );
}

export default App;
