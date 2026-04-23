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

const cargarScriptExterno = (src) =>
  new Promise((resolve, reject) => {
    const scriptActual = document.querySelector(`script[data-sdk="${src}"]`);
    if (scriptActual) {
      if (scriptActual.getAttribute("data-ready") === "true") resolve();
      else scriptActual.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.sdk = src;
    script.addEventListener(
      "load",
      () => {
        script.setAttribute("data-ready", "true");
        resolve();
      },
      { once: true }
    );
    script.addEventListener("error", () => reject(new Error(`No se pudo cargar ${src}`)), { once: true });
    document.body.appendChild(script);
  });

const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const puntoMedio = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const triangulosRect = [
  [0, 1, 2],
  [2, 1, 3]
];

const warpTriangle = (context, imagen, src, dst) => {
  context.save();
  context.beginPath();
  context.moveTo(dst[0].x, dst[0].y);
  context.lineTo(dst[1].x, dst[1].y);
  context.lineTo(dst[2].x, dst[2].y);
  context.closePath();
  context.clip();

  const delta = src[0].x * (src[1].y - src[2].y) + src[1].x * (src[2].y - src[0].y) + src[2].x * (src[0].y - src[1].y);
  if (Math.abs(delta) < 1e-5) {
    context.restore();
    return;
  }

  const m11 =
    (dst[0].x * (src[1].y - src[2].y) + dst[1].x * (src[2].y - src[0].y) + dst[2].x * (src[0].y - src[1].y)) / delta;
  const m12 =
    (dst[0].x * (src[2].x - src[1].x) + dst[1].x * (src[0].x - src[2].x) + dst[2].x * (src[1].x - src[0].x)) / delta;
  const m21 =
    (dst[0].y * (src[1].y - src[2].y) + dst[1].y * (src[2].y - src[0].y) + dst[2].y * (src[0].y - src[1].y)) / delta;
  const m22 =
    (dst[0].y * (src[2].x - src[1].x) + dst[1].y * (src[0].x - src[2].x) + dst[2].y * (src[1].x - src[0].x)) / delta;
  const dx =
    (dst[0].x * (src[1].x * src[2].y - src[2].x * src[1].y) +
      dst[1].x * (src[2].x * src[0].y - src[0].x * src[2].y) +
      dst[2].x * (src[0].x * src[1].y - src[1].x * src[0].y)) /
    delta;
  const dy =
    (dst[0].y * (src[1].x * src[2].y - src[2].x * src[1].y) +
      dst[1].y * (src[2].x * src[0].y - src[0].x * src[2].y) +
      dst[2].y * (src[0].x * src[1].y - src[1].x * src[0].y)) /
    delta;

  context.setTransform(m11, m21, m12, m22, dx, dy);
  context.drawImage(imagen, 0, 0);
  context.restore();
};

const warpRectangulo = (context, imagen, destino, opacidad = 0.72) => {
  const source = [
    { x: 0, y: 0 },
    { x: imagen.width, y: 0 },
    { x: 0, y: imagen.height },
    { x: imagen.width, y: imagen.height }
  ];
  context.save();
  context.globalAlpha = opacidad;
  context.globalCompositeOperation = "multiply";
  triangulosRect.forEach(([a, b, c]) => {
    warpTriangle(context, imagen, [source[a], source[b], source[c]], [destino[a], destino[b], destino[c]]);
  });
  context.restore();
};

const crearPoseFallback = (width, height) => {
  const crear = (x, y, visibility = 0.3) => ({ x, y, visibility });
  const land = [];
  land[11] = crear(0.38, 0.22);
  land[12] = crear(0.62, 0.22);
  land[13] = crear(0.33, 0.36);
  land[14] = crear(0.67, 0.36);
  land[15] = crear(0.3, 0.52);
  land[16] = crear(0.7, 0.52);
  land[23] = crear(0.42, 0.52);
  land[24] = crear(0.58, 0.52);
  land[25] = crear(0.44, 0.7);
  land[26] = crear(0.56, 0.7);
  land[27] = crear(0.44, 0.92);
  land[28] = crear(0.56, 0.92);
  land[0] = crear(0.5, 0.1);

  return land.map((p) => (p ? { ...p, x: p.x * width, y: p.y * height } : null));
};

function ProbadorIA({ fotoCompleta, seleccionPrendas }) {
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const modelStateRef = useRef("idle");
  const [estadoIA, setEstadoIA] = useState(
    "IA Virtual Try-On lista: detecta pose y ajusta la prenda con deformación."
  );

  useEffect(() => {
    let mounted = true;
    const inicializarPose = async () => {
      try {
        if (poseLandmarkerRef.current || modelStateRef.current === "loading") return;
        modelStateRef.current = "loading";
        await cargarScriptExterno("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.js");
        const sdk = window.vision;
        if (!sdk) throw new Error("SDK de vision no disponible");
        const vision = await sdk.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const poseLandmarker = await sdk.PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
          },
          runningMode: "IMAGE",
          numPoses: 1,
          minPoseDetectionConfidence: 0.55,
          minPosePresenceConfidence: 0.55,
          minTrackingConfidence: 0.55
        });
        if (!mounted) return;
        poseLandmarkerRef.current = poseLandmarker;
        modelStateRef.current = "ready";
      } catch (error) {
        modelStateRef.current = "error";
        if (mounted) {
          setEstadoIA("No se pudo cargar MediaPipe. Se usará modo proporcional de respaldo.");
        }
      }
    };
    inicializarPose();
    return () => {
      mounted = false;
    };
  }, []);

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

      const resultadosPose =
        poseLandmarkerRef.current && modelStateRef.current === "ready"
          ? poseLandmarkerRef.current.detect(imagenBase)
          : null;

      const landmarksRaw =
        resultadosPose?.landmarks?.[0]?.map((point) => ({
          ...point,
          x: point.x * width,
          y: point.y * height
        })) || crearPoseFallback(width, height);

      const punto = (indice, respaldo) => {
        const candidado = landmarksRaw[indice];
        if (candidado && (candidado.visibility ?? 0.4) > 0.2) return candidado;
        return respaldo;
      };
      const leftShoulder = punto(11, { x: width * 0.38, y: height * 0.22 });
      const rightShoulder = punto(12, { x: width * 0.62, y: height * 0.22 });
      const leftHip = punto(23, { x: width * 0.43, y: height * 0.52 });
      const rightHip = punto(24, { x: width * 0.57, y: height * 0.52 });
      const leftKnee = punto(25, { x: width * 0.44, y: height * 0.72 });
      const rightKnee = punto(26, { x: width * 0.56, y: height * 0.72 });
      const leftAnkle = punto(27, { x: width * 0.44, y: height * 0.92 });
      const rightAnkle = punto(28, { x: width * 0.56, y: height * 0.92 });

      const drawPrenda = async (prenda, tipoCapa) => {
        const garmentImage = await cargarImagen(prenda.imagen);
        const hombrosCentro = puntoMedio(leftShoulder, rightShoulder);
        const caderasCentro = puntoMedio(leftHip, rightHip);
        const anchoHombros = Math.max(distancia(leftShoulder, rightShoulder), width * 0.18);
        const anchoCadera = Math.max(distancia(leftHip, rightHip), width * 0.15);
        const alturaTorso = Math.max(distancia(hombrosCentro, caderasCentro), height * 0.2);
        const alpha = tipoCapa === "completa" ? 0.68 : 0.7;

        if (tipoCapa === "superior") {
          const ajusteTorso = [
            { x: leftShoulder.x - anchoHombros * 0.18, y: leftShoulder.y - alturaTorso * 0.15 },
            { x: rightShoulder.x + anchoHombros * 0.18, y: rightShoulder.y - alturaTorso * 0.15 },
            { x: leftHip.x - anchoCadera * 0.2, y: leftHip.y + alturaTorso * 0.2 },
            { x: rightHip.x + anchoCadera * 0.2, y: rightHip.y + alturaTorso * 0.2 }
          ];
          warpRectangulo(context, garmentImage, ajusteTorso, alpha);
        }

        if (tipoCapa === "inferior") {
          const anchoRodillas = Math.max(distancia(leftKnee, rightKnee), anchoCadera * 0.75);
          const ajustePiernas = [
            { x: leftHip.x - anchoCadera * 0.25, y: leftHip.y - alturaTorso * 0.08 },
            { x: rightHip.x + anchoCadera * 0.25, y: rightHip.y - alturaTorso * 0.08 },
            { x: leftAnkle.x - anchoRodillas * 0.22, y: leftAnkle.y + 6 },
            { x: rightAnkle.x + anchoRodillas * 0.22, y: rightAnkle.y + 6 }
          ];
          warpRectangulo(context, garmentImage, ajustePiernas, alpha);
        }

        if (tipoCapa === "completa") {
          const ajusteCompleto = [
            { x: leftShoulder.x - anchoHombros * 0.22, y: leftShoulder.y - alturaTorso * 0.14 },
            { x: rightShoulder.x + anchoHombros * 0.22, y: rightShoulder.y - alturaTorso * 0.14 },
            { x: leftAnkle.x - anchoCadera * 0.32, y: leftAnkle.y + 8 },
            { x: rightAnkle.x + anchoCadera * 0.32, y: rightAnkle.y + 8 }
          ];
          warpRectangulo(context, garmentImage, ajusteCompleto, 0.66);
        }
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

      const conPoseReal = Boolean(resultadosPose?.landmarks?.[0]);
      setEstadoIA(
        conPoseReal
          ? "Probador IA activo: pose detectada (hombros, torso, brazos/piernas) y prenda deformada con warp."
          : "Probador IA en respaldo proporcional: no se detectó pose completa en la foto."
      );
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
