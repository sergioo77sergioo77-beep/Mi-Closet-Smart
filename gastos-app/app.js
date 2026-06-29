/* =========================================================
   Mis Gastos — control de gastos con boletas (foto u OCR)
   - OCR en el navegador con Tesseract.js (gratis, sin claves)
   - Guardado local en el dispositivo (localStorage)
   ========================================================= */

const STORAGE_KEY = "mis-gastos-v1";

/* Categorías con emoji y palabras clave para autodetección.
   El orden importa: la primera coincidencia gana. */
const CATEGORIAS = [
  {
    id: "supermercado",
    nombre: "Supermercado",
    emoji: "🛒",
    claves: ["jumbo", "lider", "líder", "santa isabel", "tottus", "unimarc", "acuenta", "a cuenta", "ekono", "mayorista", "supermercado", "super "]
  },
  {
    id: "feria",
    nombre: "Feria / Verdulería",
    emoji: "🥬",
    claves: ["feria", "verduler", "verdura", "fruta", "vega", "fruteria", "frutería"]
  },
  {
    id: "almacen",
    nombre: "Almacén / Botillería",
    emoji: "🏪",
    claves: ["almacen", "almacén", "botiller", "minimarket", "mini market", "kiosco"]
  },
  {
    id: "farmacia",
    nombre: "Farmacia / Salud",
    emoji: "💊",
    claves: ["farmacia", "cruz verde", "salcobrand", "ahumada", "dr simi", "simi", "clinica", "clínica", "consulta", "medic"]
  },
  {
    id: "comida",
    nombre: "Comida / Restaurante",
    emoji: "🍔",
    claves: ["restaur", "cafe", "café", "mcdonald", "kfc", "doggis", "pizza", "sushi", "completos", "burger", "bar ", "fuente", "comida", "delivery", "pedidosya", "uber eats", "rappi"]
  },
  {
    id: "combustible",
    nombre: "Bencina / Auto",
    emoji: "⛽",
    claves: ["copec", "shell", "petrobras", "aramco", "bencina", "combustible", "petroleo", "petróleo", "lubricant", "automotr", "neumatic", "neumátic"]
  },
  {
    id: "transporte",
    nombre: "Transporte",
    emoji: "🚌",
    claves: ["uber", "cabify", "didi", "metro", "micro", "bip", "taxi", "pasaje", "peaje", "estacionamiento", "parking"]
  },
  {
    id: "hogar",
    nombre: "Hogar / Ferretería",
    emoji: "🔧",
    claves: ["sodimac", "easy", "construmart", "ferreter", "homecenter", "imperial", "mts"]
  },
  {
    id: "vestuario",
    nombre: "Ropa / Tiendas",
    emoji: "👕",
    claves: ["falabella", "paris", "ripley", "h&m", "zara", "hites", "tricot", "corona", "vestuario", "calzado", "zapateria", "zapatería"]
  },
  {
    id: "servicios",
    nombre: "Cuentas / Servicios",
    emoji: "💡",
    claves: ["enel", "cge", "aguas", " gas", "metrogas", "lipigas", "abastible", "vtr", "entel", "movistar", "claro", "wom", "internet", "luz", "electric", "boleta de", "cuenta"]
  },
  {
    id: "mascotas",
    nombre: "Mascotas",
    emoji: "🐾",
    claves: ["veterinar", "mascota", "petline", " pet", "alimento perro", "alimento gato"]
  },
  {
    id: "entretencion",
    nombre: "Entretención",
    emoji: "🎬",
    claves: ["cine", "netflix", "spotify", "disney", "hbo", "juego", "entrada", "evento"]
  },
  {
    id: "otros",
    nombre: "Otros",
    emoji: "🧾",
    claves: []
  }
];

const PESOS = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

/* ---------- Estado ---------- */
let gastos = cargarGastos();
let borradorImagen = null; // dataURL de la boleta actual (no se persiste la imagen para ahorrar espacio)

/* ---------- Referencias DOM ---------- */
const $ = (sel) => document.querySelector(sel);

const inputFoto = $("#input-foto");
const ocrEstado = $("#ocr-estado");
const ocrProgreso = $("#ocr-progreso");
const formPanel = $("#form-panel");
const formTitulo = $("#form-titulo");
const previewWrap = $("#preview-wrap");
const previewImg = $("#preview-img");

const campoComercio = $("#campo-comercio");
const campoMonto = $("#campo-monto");
const campoCategoria = $("#campo-categoria");
const campoFecha = $("#campo-fecha");
const campoNota = $("#campo-nota");

const filtroMes = $("#filtro-mes");
const filtroCategoria = $("#filtro-categoria");

/* ---------- Inicialización ---------- */
function init() {
  // Poblar selector de categorías
  CATEGORIAS.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.emoji} ${cat.nombre}`;
    campoCategoria.appendChild(opt);
  });

  // Filtro de categorías (lista)
  const optTodas = document.createElement("option");
  optTodas.value = "todas";
  optTodas.textContent = "Todas las categorías";
  filtroCategoria.appendChild(optTodas);
  CATEGORIAS.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = `${cat.emoji} ${cat.nombre}`;
    filtroCategoria.appendChild(opt);
  });

  filtroMes.value = mesActualISO();

  // Eventos
  $("#btn-foto").addEventListener("click", () => inputFoto.click());
  $("#btn-manual").addEventListener("click", abrirFormularioManual);
  inputFoto.addEventListener("change", manejarFoto);
  $("#btn-guardar").addEventListener("click", guardarGasto);
  $("#btn-cancelar").addEventListener("click", cerrarFormulario);
  $("#btn-mes-actual").addEventListener("click", () => {
    filtroMes.value = mesActualISO();
    render();
  });
  filtroMes.addEventListener("change", render);
  filtroCategoria.addEventListener("change", render);
  $("#btn-export").addEventListener("click", exportarCSV);
  $("#btn-borrar-todo").addEventListener("click", borrarTodo);

  render();
}

/* ---------- Manejo de la foto + OCR ---------- */
async function manejarFoto(event) {
  const archivo = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!archivo) return;

  borradorImagen = await leerArchivoComoDataURL(archivo);

  ocrEstado.hidden = false;
  formPanel.hidden = true;
  ocrProgreso.textContent = "Preparando lector…";

  let texto = "";
  try {
    const resultado = await Tesseract.recognize(borradorImagen, "spa", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          ocrProgreso.textContent = `Leyendo texto… ${Math.round(m.progress * 100)}%`;
        } else if (m.status) {
          ocrProgreso.textContent = traducirEstado(m.status);
        }
      }
    });
    texto = resultado.data.text || "";
  } catch (err) {
    console.error("Error OCR:", err);
    // Si el OCR falla, igual abrimos el formulario para carga manual
  }

  ocrEstado.hidden = true;

  const datos = analizarBoleta(texto);
  abrirFormulario({
    titulo: "Revisar boleta",
    ayuda: texto
      ? "Detecté estos datos desde la foto. Revisa y corrige lo que haga falta antes de guardar."
      : "No pude leer bien la boleta 😕. Completa los datos a mano (la foto igual queda como referencia).",
    comercio: datos.comercio,
    monto: datos.monto,
    categoriaId: datos.categoriaId,
    conImagen: true
  });
}

/* ---------- Análisis de la boleta (heurísticas para Chile) ---------- */
function analizarBoleta(texto) {
  const lineas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const textoLower = texto.toLowerCase();

  return {
    comercio: detectarComercio(lineas),
    monto: detectarMonto(lineas, texto),
    categoriaId: detectarCategoria(textoLower)
  };
}

/* Comercio: primera línea "con letras" razonable de la parte superior */
function detectarComercio(lineas) {
  for (const linea of lineas.slice(0, 8)) {
    const limpia = linea.replace(/[^a-záéíóúñ0-9&\s.]/gi, "").trim();
    const letras = (limpia.match(/[a-záéíóúñ]/gi) || []).length;
    // Evitar líneas tipo "RUT", "BOLETA", direcciones con muchos números
    if (letras >= 4 && limpia.length >= 4 && limpia.length <= 32 && !/^(rut|boleta|factura|fecha|hora|n[°º]?)/i.test(limpia)) {
      return capitalizar(limpia);
    }
  }
  return "";
}

/* Monto: busca líneas con "TOTAL" (no SUBTOTAL); si no, el número más grande */
function detectarMonto(lineas, texto) {
  const candidatos = [];

  lineas.forEach((linea) => {
    const lower = linea.toLowerCase();
    const numeros = extraerMontosDeTexto(linea);
    if (numeros.length === 0) return;

    let prioridad = 0;
    if (/\btotal\b/.test(lower) && !/sub\s*total/.test(lower)) prioridad = 3;
    else if (/total/.test(lower)) prioridad = 2;
    else if (/(pagar|efectivo|debito|débito|credito|crédito|monto)/.test(lower)) prioridad = 1;

    const valor = Math.max(...numeros);
    candidatos.push({ valor, prioridad });
  });

  if (candidatos.length === 0) return "";

  // Mejor prioridad; a igualdad, el monto más alto (suele ser el total)
  candidatos.sort((a, b) => b.prioridad - a.prioridad || b.valor - a.valor);
  return candidatos[0].valor || "";
}

/* Extrae montos en formato chileno: $12.990 / 12.990 / 12990 */
function extraerMontosDeTexto(texto) {
  const montos = [];
  const regex = /\$?\s?\d{1,3}(?:\.\d{3})+|\$\s?\d{3,7}|\b\d{3,7}\b/g;
  const coincidencias = texto.match(regex) || [];
  coincidencias.forEach((m) => {
    const limpio = m.replace(/[$.\s]/g, "");
    const num = parseInt(limpio, 10);
    if (!isNaN(num) && num >= 100 && num <= 5000000) {
      montos.push(num);
    }
  });
  return montos;
}

function detectarCategoria(textoLower) {
  for (const cat of CATEGORIAS) {
    if (cat.claves.some((clave) => textoLower.includes(clave))) {
      return cat.id;
    }
  }
  return "otros";
}

/* ---------- Formulario ---------- */
function abrirFormularioManual() {
  borradorImagen = null;
  abrirFormulario({
    titulo: "Cargar gasto a mano",
    ayuda: "Ideal para la feria u otros gastos sin boleta. Completa los datos.",
    comercio: "",
    monto: "",
    categoriaId: "otros",
    conImagen: false
  });
}

function abrirFormulario({ titulo, ayuda, comercio, monto, categoriaId, conImagen }) {
  formTitulo.textContent = titulo;
  $("#form-ayuda").textContent = ayuda;
  campoComercio.value = comercio || "";
  campoMonto.value = monto || "";
  campoCategoria.value = categoriaId || "otros";
  campoFecha.value = hoyISO();
  campoNota.value = "";

  if (conImagen && borradorImagen) {
    previewImg.src = borradorImagen;
    previewWrap.hidden = false;
  } else {
    previewWrap.hidden = true;
  }

  formPanel.hidden = false;
  formPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  if (!comercio) campoComercio.focus();
}

function cerrarFormulario() {
  formPanel.hidden = true;
  borradorImagen = null;
}

function guardarGasto() {
  const monto = parseInt(campoMonto.value, 10);
  if (!monto || monto <= 0) {
    alert("Ingresa un monto válido en pesos.");
    campoMonto.focus();
    return;
  }

  const comercio = campoComercio.value.trim() || nombreCategoria(campoCategoria.value);

  gastos.push({
    id: Date.now(),
    comercio,
    monto,
    categoriaId: campoCategoria.value,
    fecha: campoFecha.value || hoyISO(),
    nota: campoNota.value.trim()
  });

  guardarGastos();
  cerrarFormulario();
  // Mostrar el mes del gasto recién agregado
  filtroMes.value = (campoFecha.value || hoyISO()).slice(0, 7);
  render();
}

function eliminarGasto(id) {
  if (!confirm("¿Eliminar este gasto?")) return;
  gastos = gastos.filter((g) => g.id !== id);
  guardarGastos();
  render();
}

function borrarTodo() {
  if (!confirm("Esto borrará TODOS tus gastos guardados en este dispositivo. ¿Continuar?")) return;
  gastos = [];
  guardarGastos();
  render();
}

/* ---------- Render ---------- */
function render() {
  const mes = filtroMes.value || mesActualISO();
  const delMes = gastos
    .filter((g) => g.fecha.slice(0, 7) === mes)
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);

  // Resumen total
  const total = delMes.reduce((acc, g) => acc + g.monto, 0);
  $("#resumen-monto").textContent = PESOS.format(total);
  $("#resumen-cantidad").textContent = `${delMes.length} ${delMes.length === 1 ? "gasto" : "gastos"}`;

  renderResumenCategorias(delMes, total);
  renderTendencia(mes);
  renderLista(delMes);
}

/* Gráfico de barras: total gastado en los últimos 6 meses */
function renderTendencia(mesSeleccionado) {
  const panel = $("#panel-tendencia");
  const cont = $("#grafico-meses");

  if (gastos.length === 0) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;

  const meses = ultimosMeses(6, mesSeleccionado);
  const totales = meses.map((m) =>
    gastos.filter((g) => g.fecha.slice(0, 7) === m).reduce((acc, g) => acc + g.monto, 0)
  );
  const maximo = Math.max(...totales, 1);

  cont.innerHTML = "";
  meses.forEach((m, i) => {
    const altura = Math.round((totales[i] / maximo) * 100);
    const col = document.createElement("button");
    col.type = "button";
    col.className = "grafico-col" + (m === mesSeleccionado ? " activo" : "");
    col.innerHTML = `
      <span class="grafico-monto">${totales[i] > 0 ? PESOS.format(totales[i]) : "—"}</span>
      <span class="grafico-track"><span class="grafico-bar" style="height:${totales[i] > 0 ? Math.max(altura, 3) : 0}%"></span></span>
      <span class="grafico-mes">${etiquetaMesCorta(m)}</span>
    `;
    col.addEventListener("click", () => {
      filtroMes.value = m;
      render();
    });
    cont.appendChild(col);
  });
}

function renderResumenCategorias(delMes, total) {
  const cont = $("#resumen-categorias");
  cont.innerHTML = "";
  if (delMes.length === 0) return;

  const porCategoria = {};
  delMes.forEach((g) => {
    porCategoria[g.categoriaId] = (porCategoria[g.categoriaId] || 0) + g.monto;
  });

  Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .forEach(([catId, monto]) => {
      const cat = obtenerCategoria(catId);
      const pct = total > 0 ? Math.round((monto / total) * 100) : 0;
      const row = document.createElement("div");
      row.className = "cat-row";
      row.innerHTML = `
        <div class="cat-top">
          <strong>${cat.emoji} ${cat.nombre}</strong>
          <span>${PESOS.format(monto)} · ${pct}%</span>
        </div>
        <div class="cat-bar"><span style="width:${pct}%"></span></div>
      `;
      cont.appendChild(row);
    });
}

function renderLista(delMes) {
  const lista = $("#lista-gastos");
  const vacia = $("#lista-vacia");
  const filtroCat = filtroCategoria.value;

  const visibles = filtroCat === "todas" ? delMes : delMes.filter((g) => g.categoriaId === filtroCat);

  lista.innerHTML = "";
  if (visibles.length === 0) {
    vacia.hidden = false;
    vacia.textContent = delMes.length === 0
      ? "Aún no hay gastos en este mes. ¡Sube tu primera boleta!"
      : "No hay gastos en esta categoría para el mes seleccionado.";
    return;
  }
  vacia.hidden = true;

  visibles.forEach((g) => {
    const cat = obtenerCategoria(g.categoriaId);
    const item = document.createElement("div");
    item.className = "gasto-item";
    item.innerHTML = `
      <div class="gasto-emoji">${cat.emoji}</div>
      <div class="gasto-info">
        <strong>${escapar(g.comercio)}</strong>
        <small>${cat.nombre} · ${formatearFecha(g.fecha)}${g.nota ? " · " + escapar(g.nota) : ""}</small>
      </div>
      <div class="gasto-monto">${PESOS.format(g.monto)}</div>
      <button class="gasto-borrar" title="Eliminar" aria-label="Eliminar">🗑️</button>
    `;
    item.querySelector(".gasto-borrar").addEventListener("click", () => eliminarGasto(g.id));
    lista.appendChild(item);
  });
}

/* ---------- Persistencia ---------- */
function cargarGastos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function guardarGastos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
  } catch (e) {
    console.error("No se pudo guardar:", e);
  }
}

/* ---------- Exportar CSV (para Excel / Google Sheets) ---------- */
function exportarCSV() {
  const mes = filtroMes.value || mesActualISO();
  const delMes = gastos
    .filter((g) => g.fecha.slice(0, 7) === mes)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);

  if (delMes.length === 0) {
    alert("No hay gastos en este mes para exportar.");
    return;
  }

  // Separador ';' y BOM UTF-8: abre correctamente en Excel en español.
  const escaparCSV = (valor) => {
    const t = String(valor ?? "");
    return /[";\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
  };

  const filas = [["Fecha", "Comercio", "Categoria", "Monto", "Nota"]];
  let total = 0;
  delMes.forEach((g) => {
    total += g.monto;
    filas.push([formatearFecha(g.fecha), g.comercio, nombreCategoria(g.categoriaId), g.monto, g.nota || ""]);
  });
  filas.push([]);
  filas.push(["", "", "TOTAL", total, ""]);

  const csv = "﻿" + filas.map((f) => f.map(escaparCSV).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gastos-${mes}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ---------- Utilidades ---------- */
function obtenerCategoria(id) {
  return CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];
}
function nombreCategoria(id) {
  return obtenerCategoria(id).nombre;
}
function leerArchivoComoDataURL(archivo) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(archivo);
  });
}
function hoyISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}
function mesActualISO() {
  return hoyISO().slice(0, 7);
}
function formatearFecha(iso) {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}
/* Lista de los últimos N meses (YYYY-MM) terminando en el mes de referencia */
function ultimosMeses(n, mesRef) {
  const [a, m] = (mesRef || mesActualISO()).split("-").map(Number);
  const base = new Date(a, m - 1, 1);
  const meses = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return meses;
}
const NOMBRES_MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
function etiquetaMesCorta(iso) {
  const [a, m] = iso.split("-").map(Number);
  return `${NOMBRES_MES[m - 1]} ${String(a).slice(2)}`;
}
function capitalizar(texto) {
  return texto
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
function traducirEstado(status) {
  const mapa = {
    "loading tesseract core": "Cargando lector…",
    "initializing tesseract": "Inicializando…",
    "loading language traineddata": "Cargando idioma español…",
    "initializing api": "Inicializando…",
    "recognizing text": "Leyendo texto…"
  };
  return mapa[status] || "Procesando…";
}
function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", init);
