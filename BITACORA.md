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

## Día 2 · 2026-10-02 · Modelos de datos en Mongoose

**Commits:** `ea70282` feat: modelos Producto, Color, Ajustes y Admin

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
