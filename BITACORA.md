# Bitácora del backend

Una entrada por jornada de trabajo (puede incluir varios commits). Lo más nuevo va arriba. Qué se hizo lo dice `git log`; aquí se anota **por qué** se decidió así y cómo verificarlo.

Plantilla:

```
## Día N · AAAA-MM-DD · título
Commits: `hash` mensaje
Qué se hizo:
Decisiones y por qué:
Cómo verificar:
Pendiente / siguiente:
```

---

## Día 4 · 2026-10-13 · Autenticación admin, seguridad HTTP y control de acceso

**Commits:** `por asignar` feat: autenticación admin (JWT, rate limit, helmet, CORS)

**Qué se hizo:**
- Dependencias de seguridad: `jsonwebtoken`, `helmet`, `express-rate-limit`.
- `src/config/env.js`: Soporte y validación de `JWT_SECRET`, `JWT_EXPIRES_IN` y `FRONTEND_URL`. En producción exige clave obligatoria para arrancar el servidor.
- `src/utils/jwt.js`: Utilidades para firmar tokens JWT con expiración configurable (7 días por defecto) y verificar firmas.
- `src/middlewares/auth.js`:
  - `requireAuth`: Extrae el token `Bearer` de la cabecera `Authorization`, valida su integridad/expiración, busca al administrador en MongoDB, comprueba que la cuenta esté activa (`activo: true`) y adjunta la instancia a `req.admin`.
  - `requireRol`: Control de acceso basado en roles (`superadmin`, `admin`) para endpoints restringidos.
- `src/middlewares/rateLimiter.js`:
  - `authLimiter`: Límite estricto de 10 peticiones cada 15 minutos en `/api/v1/auth/login` para prevenir ataques de fuerza bruta.
  - `apiLimiter`: Limitador general de 300 peticiones cada 15 minutos por IP para proteger la API de sobrecarga.
- `src/middlewares/corsConfig.js`: Configuración dinámica de CORS que permite orígenes locales en desarrollo y restringe estrictamente a los dominios configurados en `FRONTEND_URL` en producción.
- `src/controllers/authController.js` y `src/routes/authRoutes.js`:
  - `POST /api/v1/auth/login`: Autenticación con email/contraseña, verificación con bcrypt, registro de `ultimoAcceso` y retorno de JWT y datos del usuario (sin exponer password).
  - `GET /api/v1/auth/perfil`: Consulta de sesión protegida para el administrador actual.
  - `PUT /api/v1/auth/cambiar-password`: Cambio seguro de contraseña validando la contraseña actual y hasheando la nueva con salt.
- `src/app.js`: Integración de Helmet para cabeceras HTTP seguras (`X-Content-Type-Options: nosniff`, etc.), CORS restrictivo y limitador general de peticiones.
- `scripts/seed-admin.js`: Script idempotente (`npm run seed:admin`) para inicializar el superadministrador por defecto (`admin@pintusan.com`) si no existe en la base de datos.
- `scripts/test-dia4.js`: Suite automatizada (`npm run test:dia4`) con 12 pruebas que validan headers de seguridad, intentos fallidos (400, 401), login exitoso, protección de rutas sin token/con token falso, cambio de contraseña y bloqueo de cuentas inactivas (403).

**Decisiones y por qué:**
- La contraseña en `Admin.js` permanece protegida con `select: false` y solo se solicita explícitamente mediante `.select("+password")` dentro del controlador de login y cambio de contraseña, imposibilitando fugas accidentales en serializaciones JSON.
- Se implementó un rate limiter exclusivo para el login además del limitador general, porque la autenticación es el vector más vulnerable a ataques de fuerza bruta y diccionarios de contraseñas.
- Se diseñó `requireRol` como middleware componible para que en el Día 5 sea trivial proteger endpoints exclusivos de superadministrador.
- El script de seed es idempotente, permitiendo ejecutarlo en pipelines CI/CD o en despliegues sin riesgo de duplicar cuentas ni alterar contraseñas existentes.

**Cómo verificar:**
- Ejecutar `npm run test:dia4` para correr las 12 pruebas automatizadas.
- Probar el script de inicialización con `npm run seed:admin`.
- Probar `npm run test:dia3` para asegurar cero regresiones en la API pública.

**Pendiente / siguiente:** Día 5, CRUD admin de catálogo (crear, editar, borrar productos y fracciones) y subida de imágenes con Cloudinary.

---

## Día 3 · 2026-10-13 · API pública de lectura, catálogo, colores, ajustes y calculadora

**Commits:** `02aeb42` feat: API pública de lectura, catálogo, colores, ajustes y calculadora

**Qué se hizo:**
- `src/middlewares/cacheControl.js`: Middleware configurable para encabezados HTTP `Cache-Control` (`public, max-age, s-maxage, stale-while-revalidate`) que habilita el Edge Cache de Vercel y acelera tiempos de respuesta (< 2s, RNF-01).
- `src/utils/escapeRegex.js`: Utilidad para escapar metacaracteres en expresiones regulares, protegiendo las búsquedas contra errores de sintaxis y ataques ReDoS.
- `src/controllers/productoController.js` y `src/routes/productoRoutes.js`:
  - `GET /api/v1/productos`: Catálogo general paginado con filtros dinámicos (categoría RF-03, marca propia RF-01, línea RF-10, medida fraccionada RF-02, preparación RF-05, destacados) y buscador en tiempo real (`q`, RF-04).
  - `GET /api/v1/productos/destacados`: Productos destacados para el Home / Hero.
  - `GET /api/v1/productos/categorias`: Agrupación de categorías activas con total de productos disponibles.
  - `GET /api/v1/productos/:slug`: Detalle individual por slug limpio o fallback por `_id`.
- `src/controllers/colorController.js` y `src/routes/colorRoutes.js`:
  - `GET /api/v1/colores`: Catálogo interactivo de colores para "Color a la Medida" (RF-05, RF-06) con filtros por colección, tipo de pintura (vinilo, esmalte) y popularidad.
  - `GET /api/v1/colores/colecciones`: Agrupación de colecciones/cartas de color con su total de tonos.
  - `GET /api/v1/colores/:codigo`: Búsqueda de color por código normalizado (soporta con o sin `#`) o por `_id`.
- `src/controllers/ajustesController.js` y `src/routes/ajustesRoutes.js`:
  - `GET /api/v1/ajustes`: Exposición de datos públicos de WhatsApp (RF-08, RF-14), medios de pago Nequi/Daviplata/Bancolombia con QR y política de anticipo del 50% (RF-12, RF-13), advertencia de varianza en pantalla (RF-07), aviso de domicilio variable (RF-15) y datos institucionales (RF-20, RF-21).
- `src/services/calculadoraService.js`, `src/controllers/calculadoraController.js` y `src/routes/calculadoraRoutes.js`:
  - `GET /api/v1/calculadora`: Parámetros base de rendimiento (m²/galón) por línea y guía técnica de dilución (RF-10, RF-11).
  - `GET / POST /api/v1/calculadora/calcular`: Cálculo autónomo sin compromiso de compra (RF-09), con cálculo de galones/litros y algoritmo inteligente de recomendación de envases comerciales (desde cuñetes de 5 galones hasta tarros de compota de 1/32 de galón).
- `scripts/test-dia3.js`: Runner con 13 pruebas automatizadas para verificar códigos HTTP, serialización, cabeceras de caché, consultas por slug/código y búsquedas seguras con caracteres especiales.

**Decisiones y por qué:**
- Rutas específicas (`/destacados`, `/categorias`, `/colecciones`) se declaran antes de las rutas con parámetros dinámicos (`/:slug`, `/:codigo`) en Express para evitar colisiones de captura.
- Las consultas de texto utilizan `escapeRegex` antes de pasar a MongoDB `$regex` con opción `i`, permitiendo coincidencias parciales case-insensitive sin riesgo de error sintáctico ante caracteres especiales como paréntesis o corchetes.
- La calculadora soporta tanto `POST` (con payload JSON) como `GET` (con query params), facilitando la integración desde formularios o enlaces directos compartibles en la interfaz de usuario.
- `Cache-Control` con `stale-while-revalidate` entrega respuestas inmediatas desde el Edge CDN de Vercel mientras actualiza en segundo plano cuando sea necesario.

**Cómo verificar:**
- Ejecutar `npm run test:dia3` para correr la batería de 13 pruebas automatizadas contra MongoDB Atlas.
- Iniciar el servidor con `npm run dev` y consultar `http://localhost:4500/api/v1/productos`, `http://localhost:4500/api/v1/colores`, `http://localhost:4500/api/v1/ajustes` o `http://localhost:4500/api/v1/calculadora/calcular?m2=90&manos=2`.

**Pendiente / siguiente:** Día 4, Autenticación admin (JWT, rate limit, helmet, CORS restringido).

---

## Día 2 · 2026-10-02 · Modelos de datos en Mongoose

**Commits:** `853eed4` feat: modelos Producto, Color, Ajustes y Admin

**Qué se hizo:**
- `src/models/Producto.js`: Catálogo general, venta fraccionada (RF-02) con variantes por medida y precio, soporte para marca propia PintuSan (RF-01, RF-10), categorías (RF-03), autogeneración de slugs limpios e índices de texto para buscador en tiempo real (RF-04).
- `src/models/Color.js`: Catálogo de colores para el módulo "Color a la Medida" (RF-05, RF-06), validación de código hexadecimal con regex, colecciones/cartas y tipos de pintura compatibles (vinilo, esmalte, etc.).
- `src/models/Ajustes.js`: Patrón Singleton con `obtenerAjustes()`, datos de WhatsApp (RF-08, RF-14), medios de pago Nequi/Daviplata/Bancolombia y porcentaje de anticipo para preparados (RF-12, RF-13), advertencia de varianza en pantalla (RF-07), guía de dilución (RF-11), parámetros de calculadora de rendimiento por línea (RF-10) y datos institucionales (RF-20, RF-21).
- `src/models/Admin.js`: Modelo de administrador para el panel privado (RF-17), hash seguro de contraseñas con `bcryptjs`, método de comparación de credenciales y exclusión de contraseña en el serializador `toJSON()`.
- `src/models/index.js`: Exportación centralizada de todos los modelos.

**Decisiones y por qué:**
- Las fracciones de venta se manejan como subdocumentos embebidos (`variantes`) dentro de cada producto para permitir que un mismo producto tenga múltiples precios y stock individual según la medida (1/32, 1/16, 1/8, 1/4, Galón, Balde, Cuñete) sin duplicar registros.
- `Ajustes` implementa patrón Singleton con clave `"general"` y método estático `obtenerAjustes()`, asegurando que el backend y frontend siempre cuenten con valores por defecto aunque no se hayan configurado aún en la base de datos.
- `Admin` usa `select: false` en el campo `password` para prevenir fugas accidentales en consultas `find()`, complementado con un `toJSON()` limpio.
- Hooks adaptados a Mongoose 9 (sincrónicos y basados en Promises nativas sin parámetro `next`).

**Cómo verificar:**
- Ejecutar el runner de prueba de modelos en Node para verificar la autogeneración de slugs, validación de esquemas y métodos de hash/comparación.

**Pendiente / siguiente:** Día 3, API pública de lectura (catálogo con filtros, buscador de productos y colores, endpoints de ajustes y calculadora).

---

## Día 1 · 2026-10-02 · Cimientos del backend

**Commits:** `dcea820` feat: base del backend (config, db, errores, health)

**Qué se hizo:**
- Scripts `dev` y `start`, y `main` apuntando a `src/server.js`.
- `config/env.js`: carga `.env` y valida `MONGODB_URI`.
- `config/db.js`: conexión a MongoDB Atlas cacheada.
- Manejo central de errores con `AppError`, y rutas bajo `/api/v1`.
- Ruta `GET /api/v1/health`.
- Cluster M0 en Atlas y primer push a la rama `backend`.

**Decisiones y por qué:**
- `env.js` se importa primero y valida al arrancar: si falta una variable, el servidor cae de una vez en lugar de fallar a mitad de una petición.
- La conexión se guarda en `globalThis` porque en Vercel la función se reutiliza entre peticiones; sin eso se abren conexiones de más y se agota el límite de Atlas.
- Prefijo `/api/v1` para poder cambiar la API en el futuro sin romper el frontend.
- Express 5 envía los errores async al manejador central, así que no se necesitan librerías extra ni `try/catch` repetidos.
- Atlas con acceso `0.0.0.0/0`: Vercel no tiene IP fija. Se compensa con una clave larga de base de datos.

**Cómo verificar:** `npm run dev` y abrir `/api/v1/health`: debe mostrar `"db": "conectada"`.

**Pendiente / siguiente:** Día 2, modelo de datos (`Producto` con variantes por fracción, `Color`, `Ajustes`, `Admin`).
