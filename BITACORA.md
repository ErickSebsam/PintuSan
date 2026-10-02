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
