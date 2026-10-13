import cors from "cors";
import { env } from "../config/env.js";

/**
 * Configuración dinámica de CORS.
 * En desarrollo permite localhost y herramientas de prueba.
 * En producción restringe las solicitudes a los dominios autorizados en FRONTEND_URL.
 */
export function configurarCors() {
  const dominiosPermitidos = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(",").map((url) => url.trim().toLowerCase())
    : [];

  return cors({
    origin: (origin, callback) => {
      // Peticiones sin origen (ej. curl, postman, servidor a servidor o pruebas internas)
      if (!origin) {
        return callback(null, true);
      }

      const origenNormalizado = origin.toLowerCase();

      // En desarrollo permitir orígenes locales comunes
      if (!env.isProd && (origenNormalizado.includes("localhost") || origenNormalizado.includes("127.0.0.1"))) {
        return callback(null, true);
      }

      // Si no se configuraron dominios específicos en producción, permitir con advertencia o restringir
      if (dominiosPermitidos.length === 0) {
        return callback(null, true);
      }

      if (dominiosPermitidos.includes(origenNormalizado)) {
        return callback(null, true);
      }

      callback(new Error(`Acceso bloqueado por política CORS: origen ${origin} no autorizado`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  });
}
