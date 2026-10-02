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

## Plan de la semana (backend)

- [x] **Día 1:** Cimientos (scripts, env, conexión a Mongo, errores, `/health`)
- [ ] **Día 2:** Modelos (`Producto` con variantes por fracción, `Color`, `Ajustes`, `Admin`)
- [ ] **Día 3:** API pública de lectura (catálogo, filtros, colores, caché)
- [ ] **Día 4:** Autenticación admin (JWT, rate limit, helmet, CORS)
- [ ] **Día 5:** CRUD admin e imágenes (Cloudinary con subida firmada)
- [ ] **Día 6:** Pedidos (total recalculado en servidor) y rendimiento de pintura
- [ ] **Día 7:** Pruebas, datos reales (seed) y despliegue en Vercel

El detalle de cada avance, con sus decisiones, está en [BITACORA.md](./BITACORA.md).

## Convención de commits

`feat:` funcionalidad nueva · `fix:` corrección · `docs:` documentación · `refactor:` cambio interno sin cambiar comportamiento · `chore:` configuración y mantenimiento.
