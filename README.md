# PintuSan API

Backend de la plataforma web de PintuSan: catálogo con venta fraccionada, color a la medida, pedidos por WhatsApp y panel admin.

**Stack:** Node 20+ · Express 5 · Mongoose 9 · MongoDB Atlas · despliegue en Vercel.

## Arranque rápido

```bash
npm install
cp .env.example .env     # y pon tu MONGODB_URI real
npm run dev
```

Prueba: `http://localhost:4500/api/v1/health` debe responder `"db": "conectada"`.

## Variables de entorno

| Variable | Para qué sirve | Obligatoria |
|---|---|---|
| `MONGODB_URI` | Cadena de conexión de Atlas | Sí |
| `PORT` | Puerto local (por defecto 4500) | No |
| `NODE_ENV` | `development` o `production` | No |

El `.env` real nunca se sube a Git.

## Estructura

```
src/
  config/        env.js (valida .env) y db.js (conexión cacheada)
  controllers/   lógica de cada endpoint
  middlewares/   errores, auth, validación
  models/        esquemas de Mongoose
  routes/        rutas, todas bajo /api/v1
  services/      reglas de negocio (precios, pedidos)
  utils/         AppError y helpers
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/health` | Estado de la API y de la base de datos |
| GET | `/api/v1/productos` | Catálogo con filtros (`categoria`, `marca`, `linea`, `medida`, `destacado`), buscador (`q`), orden y paginación |
| GET | `/api/v1/productos/destacados` | Productos destacados para el Home / Hero |
| GET | `/api/v1/productos/categorias` | Lista de categorías con conteo de productos disponibles |
| GET | `/api/v1/productos/:slug` | Detalle completo de un producto y sus fracciones/precios |
| GET | `/api/v1/colores` | Catálogo de colores para "Color a la Medida" con filtros (`coleccion`, `tipo`, `popular`), buscador y paginación |
| GET | `/api/v1/colores/colecciones` | Colecciones y cartas de color disponibles con conteo |
| GET | `/api/v1/colores/:codigo` | Detalle de color por código (ej. `#A45`) o ID |
| GET | `/api/v1/ajustes` | Ajustes públicos del negocio (WhatsApp, medios de pago QR, avisos de varianza, dilución e institucionales) |
| GET | `/api/v1/calculadora` | Parámetros de rendimiento por línea de pintura y guía técnica de dilución |
| GET / POST | `/api/v1/calculadora/calcular` | Cálculo libre de pintura requerida y envases recomendados según m² y número de manos |

## Plan de la semana (backend)

- [x] **Día 1:** Cimientos (scripts, env, conexión a Mongo, errores, `/health`)
- [x] **Día 2:** Modelos (`Producto` con variantes por fracción, `Color`, `Ajustes`, `Admin`)
- [x] **Día 3:** API pública de lectura (catálogo, filtros, colores, calculadora, caché)
- [ ] **Día 4:** Autenticación admin (JWT, rate limit, helmet, CORS)
- [ ] **Día 5:** CRUD admin e imágenes (Cloudinary con subida firmada)
- [ ] **Día 6:** Pedidos (total recalculado en servidor) y rendimiento de pintura
- [ ] **Día 7:** Pruebas, datos reales (seed) y despliegue en Vercel

El detalle de cada avance, con sus decisiones, está en [BITACORA.md](./BITACORA.md).

## Convención de commits

`feat:` funcionalidad nueva · `fix:` corrección · `docs:` documentación · `refactor:` cambio interno sin cambiar comportamiento · `chore:` configuración y mantenimiento.
