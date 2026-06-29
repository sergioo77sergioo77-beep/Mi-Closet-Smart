# Mis Gastos 📒

App **independiente** para llevar el control de tus gastos. No depende del clóset.

## ¿Qué hace?

- 📷 **Subir boleta por foto** → lee el texto con OCR en el navegador (gratis, sin claves ni servidor) y detecta automáticamente el **comercio**, el **monto total** y la **categoría**.
- ✍️ **Cargar a mano** → para la feria u otros gastos sin boleta.
- 📊 **Resumen del mes** → total gastado y desglose por categoría.
- 📈 **Gráfico de últimos meses** → barras para comparar cuánto gastaste; toca una barra para ver ese mes.
- ⬇️ **Exportar a CSV** → descarga los gastos del mes para abrirlos en Excel / Google Sheets.
- 🗂️ Filtra por mes y por categoría.
- 💾 Tus datos se guardan **solo en tu dispositivo** (localStorage). Sin login.

> La detección automática es una ayuda: siempre puedes revisar y corregir
> el comercio, el monto y la categoría antes de guardar.

## Cómo usarla

Es una app web estática, no necesita compilar nada.

### Opción rápida (en tu computador)

Desde la carpeta del proyecto:

```bash
cd gastos-app
python3 -m http.server 8080
```

Luego abre `http://localhost:8080` en el navegador.

> Se recomienda servirla por `http://` (no abrir el archivo con `file://`)
> para que la cámara y el OCR funcionen sin problemas.

### En el celular (GitHub Pages)

El repositorio incluye un workflow (`.github/workflows/deploy-gastos.yml`) que
publica automáticamente la carpeta `gastos-app/` en GitHub Pages.

Para activarlo (una sola vez):

1. En GitHub, ve a **Settings → Pages**.
2. En **Source**, elige **GitHub Actions**.
3. Haz merge de esta rama a `main` (o ejecuta el workflow manualmente desde la
   pestaña **Actions → Desplegar app de Gastos → Run workflow**).
4. Al terminar, GitHub te dará la URL pública (algo como
   `https://TU_USUARIO.github.io/Mi-Closet-Smart/`). Ábrela en el celular y usa
   **"Agregar a pantalla de inicio"** para tenerla como app (PWA).

## Categorías que detecta

Supermercado, Feria/Verdulería, Almacén/Botillería, Farmacia/Salud,
Comida/Restaurante, Bencina/Auto, Transporte, Hogar/Ferretería, Ropa/Tiendas,
Cuentas/Servicios, Mascotas, Entretención y Otros.

Los comercios y montos se detectan con heurísticas pensadas para boletas
chilenas (formato de pesos `$12.990`, líneas con "TOTAL", etc.).

## 🤖 Lectura inteligente con IA (opcional)

La app puede leer la boleta **sola** (comercio, monto, fecha, categoría y cada
producto) usando IA de visión, y solo te pregunta cuando tiene dudas. Para eso
hay una función serverless en `netlify/functions/leer-boleta.js` que llama a la
API de Claude. La clave queda **en el servidor (Netlify), nunca en el teléfono**.

Para activarla, configura la API key en Netlify (una sola vez):

1. Crea una API key en la consola de Anthropic: <https://console.anthropic.com> →
   **API Keys** → **Create Key** (cópiala, empieza con `sk-ant-...`).
2. En Netlify: **Site settings → Environment variables → Add a variable**.
   - Key: `ANTHROPIC_API_KEY`
   - Value: tu clave `sk-ant-...`
3. (Opcional) `MODELO_IA` para elegir el modelo. Por defecto usa
   `claude-haiku-4-5` (el más económico para esta tarea).
4. Vuelve a desplegar el sitio (o haz un push) para que tome la variable.

Costo aproximado: una fracción de centavo de dólar por boleta con el modelo
económico. Si la variable **no** está configurada, la app sigue funcionando con
el lector gratuito (OCR) automáticamente, sin romperse.

## Privacidad

- El OCR ocurre **dentro de tu navegador**: la foto no se sube a ningún servidor.
- La imagen de la boleta se usa solo como referencia mientras revisas; **no se
  guarda** junto al gasto para no ocupar espacio.
