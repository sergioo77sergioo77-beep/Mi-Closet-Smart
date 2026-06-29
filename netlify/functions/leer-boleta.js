// Función serverless: lee una boleta (imagen o PDF) con IA de visión (Claude)
// y devuelve los datos estructurados. La API key vive en el servidor (Netlify),
// nunca en el teléfono. Si algo no le queda claro, devuelve "preguntas".
const Anthropic = require("@anthropic-ai/sdk");

// Debe coincidir con las categorías de la app (gastos-app/app.js)
const CATEGORIAS = [
  "supermercado", "feria", "almacen", "farmacia", "comida", "combustible",
  "transporte", "hogar", "vestuario", "servicios", "mascotas", "entretencion", "otros"
];
const PROD_CATEGORIAS = [
  "lacteos", "carnes", "fruver", "panaderia", "bebidas", "abarrotes",
  "aseo", "snacks", "mascotas_p", "otros_prod"
];

const MODELO = process.env.MODELO_IA || "claude-haiku-4-5";

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    comercio: { type: "string" },
    monto: { type: "integer" },
    fecha: { type: "string" }, // "YYYY-MM-DD" o ""
    categoriaId: { type: "string", enum: CATEGORIAS },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          nombre: { type: "string" },
          precio: { type: "integer" },
          prodCat: { type: "string", enum: PROD_CATEGORIAS }
        },
        required: ["nombre", "precio", "prodCat"]
      }
    },
    preguntas: { type: "array", items: { type: "string" } },
    confianza: { type: "string", enum: ["alta", "media", "baja"] }
  },
  required: ["comercio", "monto", "fecha", "categoriaId", "items", "preguntas", "confianza"]
};

const PROMPT = `Eres un asistente que lee BOLETAS de compra chilenas desde una imagen o PDF y extrae la información para una app de control de gastos.

Devuelve los datos de la boleta:
- "comercio": nombre del comercio/tienda (ej: "Líder", "Feria de Curicó", "Farmacia Cruz Verde").
- "monto": el TOTAL pagado, en pesos chilenos, como número entero SIN puntos ni símbolos (ej: 12990). Usa el TOTAL final, no el subtotal.
- "fecha": la fecha de la boleta en formato "YYYY-MM-DD". Si no se ve, usa "".
- "categoriaId": la categoría general del gasto, eligiendo SOLO una de esta lista:
  supermercado, feria (verdulería/frutas), almacen (botillería/minimarket), farmacia (salud), comida (restaurante/delivery), combustible (bencina/auto), transporte, hogar (ferretería), vestuario (ropa/tiendas), servicios (cuentas: luz/agua/gas/internet/teléfono), mascotas, entretencion (cine/streaming), otros.
- "items": la lista de PRODUCTOS comprados. Para cada uno: "nombre" (corto), "precio" (entero en pesos), y "prodCat" (tipo de producto, SOLO uno de):
  lacteos, carnes (carnes y fiambres), fruver (frutas y verduras), panaderia, bebidas, abarrotes, aseo (limpieza/higiene), snacks (snacks y dulces), mascotas_p, otros_prod.
  Si la boleta no detalla productos (ej: una cuenta de servicios), devuelve items como lista vacía.
- "preguntas": si algo NO se lee con claridad o tienes dudas (monto borroso, no se distingue un producto, no estás seguro de la categoría), agrega preguntas concretas en español para que el usuario confirme (ej: "No leí bien el total, ¿es $12.990 o $13.990?"). Si todo está claro, devuelve lista vacía.
- "confianza": "alta", "media" o "baja" según qué tan seguro estás de la lectura.

Responde SOLO con el objeto de datos. No inventes productos ni montos: si no estás seguro, pregunta.`;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "method-not-allowed" });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    // La app caerá automáticamente al lector gratuito (OCR) cuando vea esto.
    return json(503, { error: "sin-clave" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "json-invalido" });
  }

  const { dataURL, mediaType } = body;
  if (!dataURL) return json(400, { error: "falta-imagen" });

  // dataURL -> base64 puro y tipo de medio
  const coma = dataURL.indexOf(",");
  const base64 = coma >= 0 ? dataURL.slice(coma + 1) : dataURL;
  const tipo = mediaType || (dataURL.slice(5, dataURL.indexOf(";")) || "image/jpeg");

  const esPDF = tipo === "application/pdf";
  const bloqueArchivo = esPDF
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image", source: { type: "base64", media_type: tipo, data: base64 } };

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const respuesta = await client.messages.create({
      model: MODELO,
      max_tokens: 2000,
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        { role: "user", content: [bloqueArchivo, { type: "text", text: PROMPT }] }
      ]
    });

    const texto = (respuesta.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let datos;
    try {
      datos = JSON.parse(texto);
    } catch {
      return json(502, { error: "respuesta-no-json" });
    }

    return json(200, datos);
  } catch (err) {
    console.error("Error IA:", err && err.message ? err.message : err);
    const status = (err && err.status) || 500;
    return json(status >= 400 && status < 600 ? status : 500, { error: "ia-fallo" });
  }
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(obj)
  };
}
