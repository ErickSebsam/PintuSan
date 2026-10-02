import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({ error: { message: "Ruta no encontrada" } });
}

// Express 5 envía aquí los errores de funciones async sin librerías extra.
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      // En producción no filtramos detalles internos al cliente
      message: status >= 500 && env.isProd ? "Error interno del servidor" : err.message,
    },
  });
}
