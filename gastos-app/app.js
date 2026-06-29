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

/* Color de fondo (pastel) para el ícono de cada categoría */
const COLORES = {
  supermercado: "#e9f1ff",
  feria: "#e6f7ec",
  almacen: "#fff3e0",
  farmacia: "#ffe9ef",
  comida: "#fff0e0",
  combustible: "#fde9e9",
  transporte: "#e9f6ff",
  hogar: "#f0eefb",
  vestuario: "#fdeefb",
  servicios: "#fffbe0",
  mascotas: "#eef6e9",
  entretencion: "#eee9fb",
  otros: "#f0f0f5"
};
function colorCategoria(id) {
  return COLORES[id] || COLORES.otros;
}

/* Categorías a nivel de PRODUCTO, para catalogar cada ítem de la boleta */
const PROD_CATEGORIAS = [
  { id: "lacteos", nombre: "Lácteos", emoji: "🥛", claves: ["leche", "queso", "quesillo", "yogur", "yoghurt", "mantequilla", "crema", "manjar"] },
  { id: "carnes", nombre: "Carnes y fiambres", emoji: "🥩", claves: ["carne", "pollo", "vacuno", "cerdo", "molida", "jamon", "jamón", "longaniza", "salchicha", "vienesa", "pescado", "merluza", "pavo", "cecina", "mortadela", "costillar"] },
  { id: "fruver", nombre: "Frutas y verduras", emoji: "🥦", claves: ["manzana", "platano", "plátano", "tomate", "lechuga", "papa", "cebolla", "palta", "zanahoria", "naranja", "limon", "limón", "fruta", "verdura", "choclo", "zapallo", "pepino", "frutilla", "uva", "pera", "ajo", "betarraga"] },
  { id: "panaderia", nombre: "Panadería", emoji: "🍞", claves: ["pan", "marraqueta", "hallulla", "dobladita", "galleta", "torta", "queque", "tortilla", "completo"] },
  { id: "bebidas", nombre: "Bebidas", emoji: "🥤", claves: ["bebida", "jugo", "agua", "coca", "cola", "sprite", "fanta", "cerveza", "vino", "gaseosa", "nectar", "néctar", "pap "] },
  { id: "abarrotes", nombre: "Abarrotes", emoji: "🧺", claves: ["arroz", "fideo", "tallarin", "azucar", "azúcar", " sal", "aceite", "harina", "conserva", "atun", "atún", "salsa", "ketchup", "mayonesa", "cafe", "café", "mermelada", "poroto", "lenteja", "garbanzo", "avena", "cereal", "sopa"] },
  { id: "aseo", nombre: "Aseo y limpieza", emoji: "🧽", claves: ["detergente", "cloro", "jabon", "jabón", "shampoo", "papel", "confort", "higienico", "higiénico", "toalla", "lavaloza", "desinfectante", "esponja", "pañal", "panal", "servilleta", "cepillo", "pasta dental", "desodorante"] },
  { id: "snacks", nombre: "Snacks y dulces", emoji: "🍫", claves: ["chocolate", "dulce", "papas fritas", "snack", "helado", "ramitas", "suflitos", "caramelo", "chicle", "cabritas", "super 8"] },
  { id: "mascotas_p", nombre: "Mascotas", emoji: "🐾", claves: ["alimento perro", "alimento gato", "dog chow", "cat chow", "mascota", "cachupin"] },
  { id: "otros_prod", nombre: "Otros", emoji: "🛒", claves: [] }
];
function obtenerProdCategoria(id) {
  return PROD_CATEGORIAS.find((c) => c.id === id) || PROD_CATEGORIAS[PROD_CATEGORIAS.length - 1];
}
function clasificarProducto(nombre) {
  const l = " " + nombre.toLowerCase() + " ";
  for (const c of PROD_CATEGORIAS) {
    if (c.claves.some((k) => l.includes(k))) return c.id;
  }
  return "otros_prod";
}

const PESOS = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0
});

/* ---------- Estado ---------- */
let gastos = cargarGastos();
// Adjunto en edición: { nombre, tipo, dataURL }. La imagen/archivo se guarda
// en IndexedDB (no en localStorage) para no llenar el almacenamiento.
let borradorAdjunto = null;
let borradorItems = []; // productos en edición: [{ nombre, precio }]
let filtroDia = null; // 'YYYY-MM-DD' cuando se filtra por un día del calendario
let vista = "gastos"; // 'gastos' | 'dashboard'

/* ---------- IndexedDB para adjuntos ---------- */
const DB_NOMBRE = "mis-gastos-adjuntos";
const DB_STORE = "adjuntos";
let _dbPromise = null;
function abrirDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) return reject(new Error("sin IndexedDB"));
    const req = indexedDB.open(DB_NOMBRE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}
async function guardarAdjunto(id, adjunto) {
  try {
    const db = await abrirDB();
    await new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(adjunto, id);
      tx.oncomplete = res;
      tx.onerror = () => rej(tx.error);
    });
  } catch (e) {
    console.error("No se pudo guardar el adjunto:", e);
  }
}
async function obtenerAdjunto(id) {
  try {
    const db = await abrirDB();
    return await new Promise((res, rej) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const r = tx.objectStore(DB_STORE).get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => rej(r.error);
    });
  } catch {
    return null;
  }
}
async function borrarAdjunto(id) {
  try {
    const db = await abrirDB();
    await new Promise((res) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(id);
      tx.oncomplete = res;
      tx.onerror = res;
    });
  } catch {}
}
async function borrarTodosAdjuntos() {
  try {
    const db = await abrirDB();
    await new Promise((res) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).clear();
      tx.oncomplete = res;
      tx.onerror = res;
    });
  } catch {}
}

/* ---------- Referencias DOM ---------- */
const $ = (sel) => document.querySelector(sel);

const inputFoto = $("#input-foto");
const inputArchivo = $("#input-archivo");
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
  $("#btn-archivo").addEventListener("click", () => inputArchivo.click());
  $("#btn-manual").addEventListener("click", abrirFormularioManual);
  inputFoto.addEventListener("change", manejarFoto);
  inputArchivo.addEventListener("change", manejarArchivo);
  $("#btn-guardar").addEventListener("click", guardarGasto);
  $("#btn-cancelar").addEventListener("click", cerrarFormulario);
  $("#btn-mes-actual").addEventListener("click", () => {
    filtroMes.value = mesActualISO();
    filtroDia = null;
    render();
  });
  filtroMes.addEventListener("change", () => { filtroDia = null; render(); });
  filtroCategoria.addEventListener("change", render);
  $("#btn-export").addEventListener("click", exportarCSV);
  $("#dia-filtro-clear").addEventListener("click", () => { filtroDia = null; render(); });
  $("#btn-borrar-todo").addEventListener("click", borrarTodo);
  $("#btn-add-item").addEventListener("click", agregarItemVacio);

  // Navegación inferior
  $("#nav-gastos").addEventListener("click", () => cambiarVista("gastos"));
  $("#nav-dashboard").addEventListener("click", () => cambiarVista("dashboard"));

  // Modal de productos
  $("#items-modal-cerrar").addEventListener("click", cerrarModalItems);
  $("#items-modal").addEventListener("click", (e) => { if (e.target.id === "items-modal") cerrarModalItems(); });

  render();
}

function cambiarVista(v) {
  vista = v;
  $("#vista-gastos").hidden = v !== "gastos";
  $("#vista-dashboard").hidden = v !== "dashboard";
  $("#nav-gastos").classList.toggle("activo", v === "gastos");
  $("#nav-dashboard").classList.toggle("activo", v === "dashboard");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- Manejo de la foto + OCR ---------- */
async function manejarFoto(event) {
  const archivo = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!archivo) return;

  // Reducimos la imagen para guardarla como adjunto sin ocupar tanto espacio.
  const dataURL = await reducirImagen(archivo);
  borradorAdjunto = { nombre: archivo.name || "boleta.jpg", tipo: "image/jpeg", dataURL };

  // Si el lector OCR no cargó (sin internet o CDN bloqueado), no nos quedamos
  // pegados: pasamos directo a la carga manual con la foto de referencia.
  if (typeof Tesseract === "undefined" || !Tesseract.recognize) {
    abrirFormulario({
      titulo: "Cargar boleta",
      ayuda: "No se pudo cargar el lector automático (revisa tu conexión). Completa los datos a mano; la foto queda adjunta.",
      comercio: "",
      monto: "",
      categoriaId: "otros"
    });
    return;
  }

  ocrEstado.hidden = false;
  formPanel.hidden = true;
  ocrProgreso.textContent = "Preparando lector…";

  let texto = "";
  try {
    // Timeout de seguridad: si tarda demasiado, no dejamos la app colgada.
    const reconocer = Tesseract.recognize(dataURL, "spa", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          ocrProgreso.textContent = `Leyendo texto… ${Math.round(m.progress * 100)}%`;
        } else if (m.status) {
          ocrProgreso.textContent = traducirEstado(m.status);
        }
      }
    });
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
    const resultado = await Promise.race([reconocer, timeout]);
    texto = (resultado && resultado.data && resultado.data.text) || "";
  } catch (err) {
    console.error("Error OCR:", err);
    // Si el OCR falla o se pasa de tiempo, igual abrimos el formulario manual.
  }

  ocrEstado.hidden = true;

  const datos = analizarBoleta(texto);
  borradorItems = datos.items || [];
  abrirFormulario({
    titulo: "Revisar boleta",
    ayuda: texto
      ? "Detecté estos datos desde la foto. Revisa y corrige lo que haga falta antes de guardar."
      : "No pude leer bien la boleta 😕. Completa los datos a mano (la foto queda adjunta).",
    comercio: datos.comercio,
    monto: datos.monto,
    categoriaId: datos.categoriaId
  });
}

/* ---------- Subir archivo de cualquier formato ---------- */
async function manejarArchivo(event) {
  const archivo = event.target.files && event.target.files[0];
  event.target.value = "";
  if (!archivo) return;

  const esImagen = (archivo.type || "").startsWith("image/");

  // Si es imagen, la reducimos y le pasamos el OCR igual que a una foto.
  if (esImagen) {
    const dataURL = await reducirImagen(archivo);
    borradorAdjunto = { nombre: archivo.name || "imagen.jpg", tipo: "image/jpeg", dataURL };

    if (typeof Tesseract !== "undefined" && Tesseract.recognize) {
      ocrEstado.hidden = false;
      formPanel.hidden = true;
      ocrProgreso.textContent = "Leyendo imagen…";
      let texto = "";
      try {
        const reconocer = Tesseract.recognize(dataURL, "spa", {
          logger: (m) => {
            if (m.status === "recognizing text") ocrProgreso.textContent = `Leyendo texto… ${Math.round(m.progress * 100)}%`;
          }
        });
        const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 60000));
        const r = await Promise.race([reconocer, timeout]);
        texto = (r && r.data && r.data.text) || "";
      } catch (e) { console.error("OCR:", e); }
      ocrEstado.hidden = true;
      const datos = analizarBoleta(texto);
      borradorItems = datos.items || [];
      abrirFormulario({
        titulo: "Revisar archivo",
        ayuda: texto ? "Detecté estos datos. Revisa y corrige lo necesario." : "Completa los datos a mano (el archivo queda adjunto).",
        comercio: datos.comercio, monto: datos.monto, categoriaId: datos.categoriaId
      });
      return;
    }
  }

  // Archivo no-imagen (PDF, etc.): se guarda como adjunto y se completa a mano.
  if (archivo.size > 8 * 1024 * 1024) {
    alert("El archivo es muy grande (máx. 8 MB). Elige uno más liviano.");
    return;
  }
  const dataURL = await leerArchivoComoDataURL(archivo);
  borradorAdjunto = { nombre: archivo.name || "archivo", tipo: archivo.type || "application/octet-stream", dataURL };
  borradorItems = [];
  abrirFormulario({
    titulo: "Cargar gasto con archivo",
    ayuda: "El archivo quedó adjunto. Completa el monto y los datos del gasto.",
    comercio: "", monto: "", categoriaId: "otros"
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
    categoriaId: detectarCategoria(textoLower),
    items: detectarItems(lineas)
  };
}

/* Detecta los productos de la boleta: líneas con un nombre + un precio al final.
   Es "mejor esfuerzo": el usuario revisa y corrige la lista antes de guardar. */
const PALABRAS_NO_ITEM = /(sub\s*total|total|rut|boleta|factura|fecha|hora|vuelto|efectivo|cambio|cliente|direccion|dirección|tel[eé]fono|caja|cajero|gracias|iva|neto|propina|descuento|ahorro|puntos|tarjeta|monto|saldo|n[°º]\s*\d|folio|sii|timbre)/i;
function detectarItems(lineas) {
  const items = [];
  for (const linea of lineas) {
    if (PALABRAS_NO_ITEM.test(linea)) continue;

    // Precio = último número con pinta de monto en la línea
    const precios = extraerMontosDeTexto(linea);
    if (precios.length === 0) continue;
    const precio = precios[precios.length - 1];
    if (precio < 100) continue;

    // Nombre = texto sin números/símbolos; debe tener letras suficientes
    let nombre = linea
      .replace(/\$?\s?\d{1,3}(?:\.\d{3})+|\d+/g, " ")
      .replace(/[^a-záéíóúñ0-9 ]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    const letras = (nombre.match(/[a-záéíóúñ]/gi) || []).length;
    if (letras < 3 || nombre.length < 3) continue;

    items.push({ nombre: capitalizar(nombre).slice(0, 40), precio });
    if (items.length >= 60) break; // tope de seguridad
  }
  return items;
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
  borradorAdjunto = null;
  borradorItems = [];
  abrirFormulario({
    titulo: "Cargar gasto a mano",
    ayuda: "Ideal para la feria u otros gastos sin boleta. Completa los datos.",
    comercio: "",
    monto: "",
    categoriaId: "otros"
  });
}

function abrirFormulario({ titulo, ayuda, comercio, monto, categoriaId }) {
  formTitulo.textContent = titulo;
  $("#form-ayuda").textContent = ayuda;
  campoComercio.value = comercio || "";
  campoMonto.value = monto || "";
  campoCategoria.value = categoriaId || "otros";
  campoFecha.value = hoyISO();
  campoNota.value = "";

  // Vista previa del adjunto: imagen si lo es, o un "chip" con el nombre del archivo.
  const chip = $("#archivo-chip");
  if (borradorAdjunto && (borradorAdjunto.tipo || "").startsWith("image/")) {
    previewImg.src = borradorAdjunto.dataURL;
    previewImg.hidden = false;
    chip.hidden = true;
    previewWrap.hidden = false;
  } else if (borradorAdjunto) {
    previewImg.hidden = true;
    $("#archivo-nombre").textContent = borradorAdjunto.nombre;
    chip.hidden = false;
    previewWrap.hidden = false;
  } else {
    previewWrap.hidden = true;
  }

  renderItemsForm();

  formPanel.hidden = false;
  formPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  if (!comercio) campoComercio.focus();
}

/* Lista editable de productos dentro del formulario */
function renderItemsForm() {
  const cont = $("#items-lista");
  cont.innerHTML = "";

  if (borradorItems.length === 0) {
    cont.innerHTML = `<p class="items-vacio">No se detectaron productos. Puedes agregarlos con “+ Agregar”.</p>`;
  } else {
    borradorItems.forEach((it, idx) => {
      const fila = document.createElement("div");
      fila.className = "item-fila";
      fila.innerHTML = `
        <input class="item-nombre" type="text" value="${escaparAttr(it.nombre)}" placeholder="Producto" />
        <input class="item-precio" type="number" inputmode="numeric" value="${it.precio || ""}" placeholder="0" min="0" />
        <button class="item-quitar" type="button" title="Quitar">✕</button>
      `;
      fila.querySelector(".item-nombre").addEventListener("input", (e) => { borradorItems[idx].nombre = e.target.value; });
      fila.querySelector(".item-precio").addEventListener("input", (e) => {
        borradorItems[idx].precio = parseInt(e.target.value, 10) || 0;
        actualizarItemsTotal();
      });
      fila.querySelector(".item-quitar").addEventListener("click", () => {
        borradorItems.splice(idx, 1);
        renderItemsForm();
      });
      cont.appendChild(fila);
    });
  }
  actualizarItemsTotal();
}

function actualizarItemsTotal() {
  const total = borradorItems.reduce((acc, it) => acc + (it.precio || 0), 0);
  $("#items-total").textContent = borradorItems.length
    ? `${borradorItems.length} producto(s) · suma ${PESOS.format(total)}`
    : "";
}

function agregarItemVacio() {
  borradorItems.push({ nombre: "", precio: 0 });
  renderItemsForm();
  // Enfocar el último nombre agregado
  const filas = $("#items-lista").querySelectorAll(".item-nombre");
  if (filas.length) filas[filas.length - 1].focus();
}

function cerrarFormulario() {
  formPanel.hidden = true;
  borradorAdjunto = null;
  borradorItems = [];
}

async function guardarGasto() {
  const monto = parseInt(campoMonto.value, 10);
  if (!monto || monto <= 0) {
    alert("Ingresa un monto válido en pesos.");
    campoMonto.focus();
    return;
  }

  const comercio = campoComercio.value.trim() || nombreCategoria(campoCategoria.value);
  const id = Date.now();
  const adjunto = borradorAdjunto; // capturamos antes de limpiar

  // Productos: descartamos filas sin nombre y catalogamos cada uno
  const items = borradorItems
    .filter((it) => (it.nombre || "").trim())
    .map((it) => ({
      nombre: it.nombre.trim(),
      precio: it.precio || 0,
      prodCat: clasificarProducto(it.nombre)
    }));

  const gasto = {
    id,
    comercio,
    monto,
    categoriaId: campoCategoria.value,
    fecha: campoFecha.value || hoyISO(),
    nota: campoNota.value.trim()
  };
  if (items.length) gasto.items = items;
  if (adjunto) {
    gasto.adjuntoNombre = adjunto.nombre;
    gasto.adjuntoTipo = adjunto.tipo;
  }
  gastos.push(gasto);

  if (adjunto) await guardarAdjunto(id, adjunto);

  guardarGastos();
  cerrarFormulario();
  // Mostrar el mes del gasto recién agregado
  filtroMes.value = (gasto.fecha).slice(0, 7);
  filtroDia = null;
  render();
}

function eliminarGasto(id) {
  if (!confirm("¿Eliminar este gasto?")) return;
  const g = gastos.find((x) => x.id === id);
  if (g && g.adjuntoNombre) borrarAdjunto(id);
  gastos = gastos.filter((x) => x.id !== id);
  guardarGastos();
  render();
}

function borrarTodo() {
  if (!confirm("Esto borrará TODOS tus gastos guardados en este dispositivo. ¿Continuar?")) return;
  gastos = [];
  filtroDia = null;
  borrarTodosAdjuntos();
  guardarGastos();
  render();
}

/* Abre/descarga el adjunto guardado de un gasto */
async function abrirAdjunto(id) {
  const adjunto = await obtenerAdjunto(id);
  if (!adjunto) {
    alert("No se encontró el archivo adjunto.");
    return;
  }
  // dataURL -> Blob para abrir/descargar de forma fiable en móviles
  const res = await fetch(adjunto.dataURL);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const esImagen = (adjunto.tipo || "").startsWith("image/");
  if (esImagen) {
    a.target = "_blank";
  } else {
    a.download = adjunto.nombre || "adjunto";
  }
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
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
  renderCalendario(mes, delMes);
  renderLista(delMes);
  renderDashboard(mes, delMes, total);
}

/* ---------- Dashboard ---------- */
function renderDashboard(mes, delMes, total) {
  // KPIs: total, comparación con mes anterior, promedio diario, gasto más alto
  const mesAnterior = ultimosMeses(2, mes)[0];
  const totalAnterior = gastos
    .filter((g) => g.fecha.slice(0, 7) === mesAnterior)
    .reduce((acc, g) => acc + g.monto, 0);

  let comparativa = "Sin datos del mes anterior";
  let claseComp = "";
  if (totalAnterior > 0) {
    const diff = total - totalAnterior;
    const pct = Math.round((diff / totalAnterior) * 100);
    if (diff > 0) { comparativa = `▲ ${pct}% más que el mes pasado`; claseComp = "sube"; }
    else if (diff < 0) { comparativa = `▼ ${Math.abs(pct)}% menos que el mes pasado`; claseComp = "baja"; }
    else { comparativa = "Igual que el mes pasado"; }
  }

  const diasMes = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0).getDate();
  const promedio = total > 0 ? Math.round(total / diasMes) : 0;
  const mayor = delMes.reduce((max, g) => (g.monto > max.monto ? g : max), { monto: 0, comercio: "—" });

  $("#dash-kpis").innerHTML = `
    <div class="kpi">
      <div class="kpi-label">Total del mes</div>
      <div class="kpi-valor">${PESOS.format(total)}</div>
      <div class="kpi-extra ${claseComp}">${comparativa}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Promedio por día</div>
      <div class="kpi-valor">${PESOS.format(promedio)}</div>
      <div class="kpi-extra">${delMes.length} gasto(s) en el mes</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Mes anterior</div>
      <div class="kpi-valor">${PESOS.format(totalAnterior)}</div>
      <div class="kpi-extra">${NOMBRES_MES_LARGO[Number(mesAnterior.slice(5, 7)) - 1]}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Gasto más alto</div>
      <div class="kpi-valor">${PESOS.format(mayor.monto)}</div>
      <div class="kpi-extra">${escapar(mayor.comercio)}</div>
    </div>
  `;

  renderRankingComercios(delMes);
  renderRankingProductos(delMes);
}

function renderRankingComercios(delMes) {
  const cont = $("#comercios-ranking");
  const vacia = $("#comercios-vacia");
  cont.innerHTML = "";
  if (delMes.length === 0) { vacia.hidden = false; return; }
  vacia.hidden = true;

  const porComercio = {};
  delMes.forEach((g) => { porComercio[g.comercio] = (porComercio[g.comercio] || 0) + g.monto; });
  const orden = Object.entries(porComercio).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maximo = orden[0][1];

  orden.forEach(([comercio, monto]) => {
    const pct = Math.round((monto / maximo) * 100);
    const row = document.createElement("div");
    row.className = "rank-row";
    row.innerHTML = `
      <div class="rank-top"><strong>${escapar(comercio)}</strong><span class="rank-valor">${PESOS.format(monto)}</span></div>
      <div class="rank-bar"><span style="width:${pct}%"></span></div>
    `;
    cont.appendChild(row);
  });
}

function renderRankingProductos(delMes) {
  const cont = $("#productos-ranking");
  const vacia = $("#productos-vacia");
  cont.innerHTML = "";

  const porProd = {};
  delMes.forEach((g) => {
    (g.items || []).forEach((it) => {
      porProd[it.prodCat] = (porProd[it.prodCat] || 0) + (it.precio || 0);
    });
  });

  const entradas = Object.entries(porProd).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (entradas.length === 0) { vacia.hidden = false; return; }
  vacia.hidden = true;

  const total = entradas.reduce((acc, [, v]) => acc + v, 0);
  entradas.forEach(([catId, monto]) => {
    const cat = obtenerProdCategoria(catId);
    const pct = total > 0 ? Math.round((monto / total) * 100) : 0;
    const row = document.createElement("div");
    row.className = "cat-row";
    row.innerHTML = `
      <div class="cat-top">
        <span class="cat-nombre"><span class="cat-chip" style="background:#f0eefb">${cat.emoji}</span>${cat.nombre}</span>
        <span class="cat-valor">${PESOS.format(monto)} · ${pct}%</span>
      </div>
      <div class="cat-bar"><span style="width:${pct}%"></span></div>
    `;
    cont.appendChild(row);
  });
}

/* ---------- Modal de productos de un gasto ---------- */
function abrirModalItems(id) {
  const g = gastos.find((x) => x.id === id);
  if (!g || !g.items || g.items.length === 0) return;
  $("#items-modal-titulo").textContent = `${g.comercio} · ${g.items.length} producto(s)`;
  const body = $("#items-modal-body");
  body.innerHTML = "";
  g.items.forEach((it) => {
    const cat = obtenerProdCategoria(it.prodCat);
    const row = document.createElement("div");
    row.className = "modal-item";
    row.innerHTML = `
      <span class="mi-nombre">${cat.emoji} ${escapar(it.nombre)}</span>
      <span class="mi-precio">${it.precio ? PESOS.format(it.precio) : "—"}</span>
    `;
    body.appendChild(row);
  });
  $("#items-modal").hidden = false;
}
function cerrarModalItems() {
  $("#items-modal").hidden = true;
}

/* Calendario del mes: cada día muestra el total gastado; al tocarlo, filtra ese día */
function renderCalendario(mes, delMes) {
  const card = $("#card-calendario");
  if (delMes.length === 0 && !filtroDia) {
    card.hidden = true;
    return;
  }
  card.hidden = false;

  const [anio, m] = mes.split("-").map(Number);
  $("#cal-mes-label").textContent = `${NOMBRES_MES_LARGO[m - 1]} ${anio}`;

  // Encabezado de días (Lunes a Domingo)
  const dows = $("#cal-dows");
  if (!dows.dataset.listo) {
    ["L", "M", "M", "J", "V", "S", "D"].forEach((d) => {
      const s = document.createElement("span");
      s.textContent = d;
      dows.appendChild(s);
    });
    dows.dataset.listo = "1";
  }

  // Total por día
  const porDia = {};
  delMes.forEach((g) => {
    const d = Number(g.fecha.slice(8, 10));
    porDia[d] = (porDia[d] || 0) + g.monto;
  });

  const diasEnMes = new Date(anio, m, 0).getDate();
  // getDay(): 0=domingo..6=sábado. Lo convertimos a 0=lunes..6=domingo.
  const primerDow = (new Date(anio, m - 1, 1).getDay() + 6) % 7;

  const grid = $("#cal-grid");
  grid.innerHTML = "";

  for (let i = 0; i < primerDow; i++) {
    const v = document.createElement("div");
    v.className = "cal-cell vacio";
    grid.appendChild(v);
  }

  for (let dia = 1; dia <= diasEnMes; dia++) {
    const iso = `${anio}-${String(m).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    const monto = porDia[dia] || 0;
    const cell = document.createElement(monto > 0 ? "button" : "div");
    cell.className = "cal-cell";
    if (monto > 0) cell.classList.add("con-gasto");
    if (iso === hoyISO()) cell.classList.add("hoy");
    if (iso === filtroDia) cell.classList.add("sel");
    cell.innerHTML = `<span class="cal-dia">${dia}</span>${
      monto > 0 ? `<span class="cal-monto">${montoCorto(monto)}</span>` : ""
    }`;
    if (monto > 0) {
      cell.type = "button";
      cell.addEventListener("click", () => {
        filtroDia = (filtroDia === iso) ? null : iso;
        render();
      });
    }
    grid.appendChild(cell);
  }
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
  const vacia = $("#categorias-vacia");
  cont.innerHTML = "";

  if (delMes.length === 0) {
    if (vacia) vacia.hidden = false;
    return;
  }
  if (vacia) vacia.hidden = true;

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
          <span class="cat-nombre">
            <span class="cat-chip" style="background:${colorCategoria(catId)}">${cat.emoji}</span>
            ${cat.nombre}
          </span>
          <span class="cat-valor">${PESOS.format(monto)} · ${pct}%</span>
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

  // Banner del día seleccionado en el calendario
  const banner = $("#dia-filtro");
  if (filtroDia) {
    banner.hidden = false;
    $("#dia-filtro-texto").textContent = `Mostrando ${formatearFecha(filtroDia)}`;
  } else {
    banner.hidden = true;
  }

  let visibles = filtroCat === "todas" ? delMes : delMes.filter((g) => g.categoriaId === filtroCat);
  if (filtroDia) visibles = visibles.filter((g) => g.fecha === filtroDia);

  lista.innerHTML = "";
  if (visibles.length === 0) {
    vacia.hidden = false;
    vacia.textContent = delMes.length === 0
      ? "Aún no hay gastos en este mes. ¡Sube tu primera boleta!"
      : (filtroDia ? "No hay gastos en el día seleccionado." : "No hay gastos en esta categoría para el mes seleccionado.");
    return;
  }
  vacia.hidden = true;

  visibles.forEach((g) => {
    const cat = obtenerCategoria(g.categoriaId);
    const item = document.createElement("div");
    item.className = "gasto-item";
    const tieneAdjunto = !!g.adjuntoNombre;
    const nItems = (g.items || []).length;
    item.innerHTML = `
      <div class="gasto-emoji" style="background:${colorCategoria(g.categoriaId)}">${cat.emoji}</div>
      <div class="gasto-info">
        <strong>${escapar(g.comercio)}</strong>
        <small>${cat.nombre} · ${formatearFecha(g.fecha)}${g.nota ? " · " + escapar(g.nota) : ""}</small>
        ${nItems ? `<span class="gasto-items-badge">🛒 ${nItems} producto(s)</span>` : ""}
      </div>
      <div class="gasto-monto">${PESOS.format(g.monto)}</div>
      <div class="gasto-acciones">
        ${tieneAdjunto ? `<button class="gasto-adjunto" title="Ver archivo adjunto" aria-label="Ver adjunto">📎</button>` : ""}
        <button class="gasto-borrar" title="Eliminar" aria-label="Eliminar">🗑️</button>
      </div>
    `;
    item.querySelector(".gasto-borrar").addEventListener("click", () => eliminarGasto(g.id));
    if (tieneAdjunto) {
      item.querySelector(".gasto-adjunto").addEventListener("click", () => abrirAdjunto(g.id));
    }
    if (nItems) {
      item.querySelector(".gasto-items-badge").addEventListener("click", () => abrirModalItems(g.id));
    }
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
const NOMBRES_MES_LARGO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
function etiquetaMesCorta(iso) {
  const [a, m] = iso.split("-").map(Number);
  return `${NOMBRES_MES[m - 1]} ${String(a).slice(2)}`;
}
/* Monto compacto para celdas del calendario: 12.490 -> 12k, 990 -> 990 */
function montoCorto(n) {
  if (n >= 1000) {
    const miles = n / 1000;
    return (miles >= 100 ? Math.round(miles) : Math.round(miles * 10) / 10).toString().replace(".", ",") + "k";
  }
  return String(n);
}
/* Reduce una imagen (ancho máx. 1200px, JPEG) para guardarla como adjunto liviano */
function reducirImagen(archivo, maxLado = 1200, calidad = 0.7) {
  return new Promise((resolve) => {
    const lector = new FileReader();
    lector.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxLado || height > maxLado) {
          if (width >= height) {
            height = Math.round((height * maxLado) / width);
            width = maxLado;
          } else {
            width = Math.round((width * maxLado) / height);
            height = maxLado;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/jpeg", calidad));
        } catch {
          resolve(lector.result); // fallback al original
        }
      };
      img.onerror = () => resolve(lector.result);
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
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
function escaparAttr(texto) {
  return String(texto == null ? "" : texto).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.addEventListener("DOMContentLoaded", init);
