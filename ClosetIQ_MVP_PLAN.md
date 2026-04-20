# ClosetIQ — Plan de producto y desarrollo (MVP escalable)

## 1) Arquitectura de la app

## Objetivo de arquitectura
Construir una base **simple para lanzar en 1–2 semanas**, pero preparada para crecer hacia IA avanzada y monetización.

## Stack recomendado (MVP)
- **Frontend móvil**: Flutter (iOS + Android con una base de código).
- **Backend BaaS**: Firebase.
- **Servicios externos**:
  - Clima: OpenWeather o WeatherAPI.
  - Eliminación de fondo: remove.bg API o Clipdrop API.
- **Notificaciones push/locales**: Firebase Cloud Messaging + notificaciones locales.

## Arquitectura lógica (capas)
1. **Presentation (UI)**
   - Pantallas, componentes, navegación bottom tabs.
2. **Application (casos de uso)**
   - `registrarUsuario`, `agregarPrenda`, `generarOutfitDiario`, `detectarPrendaSinUso`.
3. **Domain (reglas de negocio)**
   - Entidades: Usuario, Prenda, Outfit, RegistroDeUso.
   - Reglas por clima y categorías.
4. **Data (repositorios y fuentes)**
   - Firebase Auth, Firestore, Storage.
   - API de clima y API de background removal.

## Modelo de datos (Firestore)
- `users/{userId}`
  - `name`, `email`, `photoUrl`, `createdAt`, `premium`.
- `users/{userId}/garments/{garmentId}`
  - `name`, `category`, `color`, `brand`, `notes`, `purchaseDate`, `createdAt`, `lastUsedAt`, `wearCount`, `imageOriginalUrl`, `imageCleanUrl`, `isArchived`.
- `users/{userId}/outfits/{outfitId}`
  - `date`, `garmentIds[]`, `weatherSnapshot`, `feedback` (like/dislike).
- `users/{userId}/notifications/{notificationId}`
  - `type`, `title`, `message`, `sentAt`, `read`.
- `admin/categories/{categoryId}` (modo admin)
  - `name`, `icon`, `active`.

## Seguridad y escalabilidad
- Reglas Firestore: acceso por `request.auth.uid == userId`.
- Imágenes en Firebase Storage por carpeta de usuario.
- Cloud Functions (fase 2+):
  - generación de recordatorios inteligentes,
  - jobs diarios de outfit sugerido.

---

## 2) Flujo completo de pantallas

## Estructura de navegación
- **Autenticación**:
  - Splash → Onboarding → Login/Registro/Recuperar contraseña/Google Login.
- **App principal** (barra inferior):
  1. Home
  2. Closet
  3. Agregar
  4. Notificaciones
  5. Perfil

## Flujo principal de usuario
1. Usuario abre la app por primera vez.
2. Ve onboarding (valor + guía rápida de fotos).
3. Se registra o entra con Google.
4. Permite ubicación (clima) y notificaciones.
5. Entra a Home con:
   - clima actual,
   - outfit diario sugerido,
   - alertas rápidas (“no usas X hace N días”).
6. En Closet ve grid de prendas, filtra y busca.
7. En Agregar sube foto, recorta fondo, categoriza, guarda metadatos.
8. En Detalle de prenda puede editar datos, marcar “usada hoy”, archivar/eliminar.
9. En Perfil configura preferencias, plan premium y logout.

## Pantallas clave (MVP)
- Splash.
- Onboarding (3 slides).
- Login/Registro/Recuperación.
- Home (outfit + clima + alertas).
- Closet (grid + filtros + orden).
- Agregar Prenda (cámara/galería + guía foto + metadatos).
- Detalle Prenda.
- Notificaciones.
- Perfil.
- Premium teaser/paywall básico.

---

## 3) Diseño UX/UI detallado

## Principios UX
- Menos fricción: máximo 2–3 taps para acciones frecuentes.
- Claridad visual: cards grandes, tipografía legible.
- “Daily habit loop”: abrir app cada mañana para ver outfit/clima.

## Sistema visual
- **Color primario**: Turquesa (`#17C3B2`).
- **Secundario/acento**: Amarillo (`#FFB703`).
- **Fondo**: Blanco (`#FFFFFF`) y gris claro (`#F5F7FA`).
- **Texto principal**: Gris oscuro (`#1F2937`).

## Componentes UI
- Botones principales de alto contraste y ancho completo.
- Tarjetas de prenda con foto limpia + etiqueta de categoría.
- Chips de filtros (categoría, color, “no usada”).
- FAB en “Agregar” para carga rápida.
- Estados vacíos útiles (“Sube tu primera prenda”).

## Microinteracciones
- Confirmación visual al guardar prenda.
- Skeleton loading en home y closet.
- Tooltip contextual para guía de fotografías.

## Guía de fotografías (dentro de la app)
### Prenda (correcto/incorrecto)
- Correcto: luz natural, fondo limpio, prenda completa, toma frontal, sin sombras fuertes.
- Incorrecto: recorte incompleto, fondo desordenado, luz baja.

### Usuario cuerpo completo (prep probador virtual)
- Correcto: frente completa, pies a cabeza, fondo limpio, brazos ligeramente separados.
- Incorrecto: espejo oscuro, parte del cuerpo fuera, luz insuficiente.

---

## 4) Tecnologías recomendadas

## Opción principal (recomendada)
- **Flutter + Firebase**.

### ¿Por qué?
- Time-to-market rápido para MVP.
- Auth, base de datos, storage, push listos.
- Escala bien para fase 2 y 3.

## Librerías sugeridas (Flutter)
- Estado: Riverpod o Bloc.
- Routing: GoRouter.
- Cámara/galería: `image_picker`.
- Grid y caché: `cached_network_image`.
- Notificaciones locales: `flutter_local_notifications`.
- HTTP: `dio`.

## Alternativa válida
- React Native + Supabase si el equipo domina TypeScript.

---

## 5) Paso a paso para construir el MVP (1–2 semanas)

## Semana 1
### Día 1–2: Base del proyecto
- Setup Flutter + entornos (dev/prod).
- Config Firebase (Auth, Firestore, Storage, FCM).
- Navegación principal + tema visual base.

### Día 3–4: Auth + perfil mínimo
- Registro, login, recuperación, Google login.
- Modelo usuario y pantalla Perfil básica.

### Día 5–7: Closet CRUD
- Subir foto cámara/galería.
- Integrar API de eliminación de fondo.
- Guardar prenda con categoría/fecha/notas.
- Listado grid con filtros y búsqueda básica.

## Semana 2
### Día 8–9: Home inteligente (reglas simples)
- Integración clima por ubicación.
- Motor de reglas de outfit (sin IA avanzada).
- Mensajes tipo: “Hace frío, usa parka”.

### Día 10: Notificaciones
- “Outfit sugerido para hoy”.
- “No usas esta prenda hace X días”.

### Día 11–12: QA y analítica
- Tracking de eventos (Firebase Analytics).
- Corrección de bugs críticos.
- Optimización de rendimiento básico (imágenes).

### Día 13–14: Beta privada
- Deploy TestFlight / Internal Testing (Play).
- Pruebas con 5–10 usuarios reales.

---

## 6) Roadmap de evolución

## Fase 1 (MVP)
- Organización de closet.
- Outfit por reglas.
- Clima + notificaciones básicas.
- Validación problema/retención inicial.

## Fase 2
- Mejoras de UX (más personalización y rapidez).
- Motor de recomendaciones híbrido (reglas + señales de uso).
- Estadísticas de uso por categoría/color.
- Paywall premium mejorado.

## Fase 3
- IA avanzada para combinación de outfits.
- Probador virtual (foto de usuario + prenda segmentada).
- Recomendaciones de compra y afiliación con tiendas.
- Publicidad segmentada ética y configurable.

---

## 7) Estrategia para validar con usuarios reales

## Hipótesis críticas a validar
1. Los usuarios suben al menos 10 prendas en los primeros 3 días.
2. Consultan el outfit diario al menos 3 veces por semana.
3. Las alertas de “prendas olvidadas” impulsan uso real.

## Diseño de experimento (5–10 usuarios)
- Perfil: personas con closet mediano/grande y poco tiempo en mañanas.
- Duración: 7 días.
- Método:
  - entrevista inicial (10 min),
  - uso libre de app,
  - encuesta final + entrevista corta.

## Métricas MVP
- Activación: `% usuarios que suben >= 5 prendas en 24h`.
- Engagement: `DAU/WAU` + sesiones por semana.
- Retención D7.
- “Time to first outfit suggestion”.
- CTR de notificaciones.

## Instrumentación
- Eventos clave:
  - `sign_up_completed`
  - `garment_added`
  - `garment_marked_used`
  - `outfit_suggested`
  - `notification_opened`
  - `premium_screen_viewed`

## Criterios de éxito para avanzar a fase 2
- >= 60% de usuarios sube 10+ prendas en semana 1.
- Retención D7 >= 30% en cohorte inicial.
- >= 40% interactúa con outfit sugerido al menos 3 veces/semana.

---

## Recomendaciones prácticas de lanzamiento real
- Empezar por una ciudad/país para clima y lenguaje local.
- Limitar categorías iniciales para reducir complejidad (10–12 máximas).
- Incluir tutorial de foto extremadamente claro para mejorar segmentación.
- Usar feedback explícito en outfit (“me gustó / no me gustó”) desde MVP.
- Mantener paywall suave: primero valor, luego upsell premium.

## Riesgos y mitigaciones
- **Fricción al cargar prendas** → solución: flujo guiado y rápido, autosugerencias.
- **Calidad baja de fotos** → solución: guía visual + validación antes de subir.
- **Notificaciones molestas** → solución: frecuencia configurable y horarios.
- **Outfits poco relevantes** → solución: feedback loop desde día 1.

## Definición de “MVP usable y lanzable”
Se considera listo cuando un usuario nuevo puede:
1) registrarse,
2) cargar al menos 5 prendas con fotos limpias,
3) recibir outfit diario según clima,
4) recibir al menos 1 alerta útil de prenda sin uso,
5) usar la app durante una semana sin ayuda externa.
